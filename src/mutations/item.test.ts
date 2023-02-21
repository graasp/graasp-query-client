/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  GraaspError,
  HttpMethod,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
} from '@graasp/sdk';
import { ItemRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  ITEMS,
  OK_RESPONSE,
  THUMBNAIL_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  mockMutation,
  setUpTest,
  splitEndpointByIds,
  waitForMutation,
} from '../../test/utils';
import {
  buildCopyItemRoute,
  buildCopyItemsRoute,
  buildCopyPublicItemRoute,
  buildDeleteItemRoute,
  buildDeleteItemsRoute,
  buildEditItemRoute,
  buildMoveItemRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildRecycleItemRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
  buildUploadItemThumbnailRoute,
} from '../api/routes';
import { THUMBNAIL_SIZES } from '../config/constants';
import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  buildItemChildrenKey,
  buildItemKey,
  buildItemThumbnailKey,
  getKeyForParentId,
} from '../config/keys';
import {
  deleteItemsRoutine,
  uploadFileRoutine,
  uploadItemThumbnailRoutine,
} from '../routines';
import {
  buildPath,
  getDirectParentId,
  transformIdForPath,
} from '../utils/item';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItem', () => {
    const mutation = mutations.usePostItem;
    const newItem = {
      name: 'new item',
      type: ItemType.FOLDER,
    };

    it('Post item in root', async () => {
      const route = `/${buildPostItemRoute()}`;
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS[1]]));

      const response = { ...newItem, id: 'someid', path: 'someid' };

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(newItem);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Post item in item', async () => {
      const parentItem = ITEMS.get(1)!;
      const response = {
        ...newItem,
        id: 'someid',
        path: buildPath({ prefix: parentItem.path, ids: ['someid'] }),
      };

      // set default data
      queryClient.setQueryData(
        getKeyForParentId(parentItem.id),
        List([ITEMS.get(2)!]),
      );

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route: `/${buildPostItemRoute(parentItem.id)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ ...newItem, parentId: parentItem.id });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(getKeyForParentId(parentItem.id))
          ?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized', async () => {
      const route = `/${buildPostItemRoute()}`;
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS.get(1)!]));

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(newItem);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useEditItem', () => {
    const item = ITEMS.first()!;
    const mutation = mutations.useEditItem;
    const itemKey = buildItemKey(item.id);
    const payload = { id: item.id, description: 'new description' };

    it('Edit item in root', async () => {
      // set default data
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS.get(1)!]));

      const route = `/${buildEditItemRoute(item.id)}`;
      const response = item;
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(payload);
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
      expect(
        queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Edit item in item', async () => {
      // set default data
      const parentItem = ITEMS.get(2)!;
      const parentKey = getKeyForParentId(parentItem.id);
      const editedItem = ITEMS.get(3)!;
      const editedItemKey = buildItemKey(editedItem.id);
      const editPayload = {
        id: editedItem.id,
        description: 'a new description',
      };
      queryClient.setQueryData(editedItemKey, editedItem);
      queryClient.setQueryData(parentKey, List([ITEMS.get(1)!]));

      const route = `/${buildEditItemRoute(editedItem.id)}`;
      const response = item;
      const endpoints = [
        {
          response,
          method: HttpMethod.PATCH,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(editPayload);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(editedItemKey)?.isInvalidated,
      ).toBeTruthy();
      expect(queryClient.getQueryState(parentKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized', async () => {
      const route = `/${buildEditItemRoute(item.id)}`;
      queryClient.setQueryData(itemKey, item);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.PATCH,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(payload);
        await waitForMutation();
      });

      // item key should not be changed and should be invalidated
      expect(queryClient.getQueryData(itemKey) as ItemRecord).toEqualImmutable(
        item,
      );
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useCopyItem', () => {
    const to = ITEMS.first()!.id;
    const copied = ITEMS.get(1)!;
    const copiedId = copied.id;

    const route = `/${buildCopyItemRoute(copiedId)}`;
    const mutation = mutations.useCopyItem;

    const key = getKeyForParentId(to);

    it('Copy a single item from root item to first level item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(key, List([ITEMS.get(1)!]));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedId,
        });
        await waitForMutation();
      });

      // original item path have not changed
      const itemKey = buildItemKey(copiedId);
      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.path).toEqual(
        copied.path,
      );

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to copy a single item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(key, List([ITEMS.get(1)!]));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedId,
        });
        await waitForMutation();
      });

      // original item path have not changed
      const itemKey = buildItemKey(copiedId);
      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.path).toEqual(
        copied.path,
      );

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useCopyPublicItem', () => {
    const to = ITEMS.first()!.id;
    const copied = ITEMS.get(1)!;
    const copiedId = copied.id;

    const route = `/${buildCopyPublicItemRoute(copiedId)}`;
    const mutation = mutations.useCopyPublicItem;

    const key = getKeyForParentId(to);

    it('Copy a single item from root item to first level item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(key, List([ITEMS.get(1)!]));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedId,
        });
        await waitForMutation();
      });

      // original item path have not changed
      const itemKey = buildItemKey(copiedId);
      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.path).toEqual(
        copied.path,
      );

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to copy a single item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(key, List([ITEMS.get(1)!]));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedId,
        });
        await waitForMutation();
      });

      // original item path have not changed
      const itemKey = buildItemKey(copiedId);
      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.path).toEqual(
        copied.path,
      );

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useCopyItems', () => {
    const to = ITEMS.first()!.id;

    const mutation = mutations.useCopyItems;

    const key = getKeyForParentId(to);

    it('copy multiple root items to first level item', async () => {
      const copied = ITEMS.slice(1);
      const copiedIds = copied.map((x) => x.id).toArray();

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });

      queryClient.setQueryData(key, List([ITEMS.get(1)!]));

      // we don't care about the returned value
      const response = ITEMS.map(() => OK_RESPONSE);

      const endpoints = splitEndpointByIds(
        copiedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildCopyItemsRoute(chunk)}`,
        response.toJS(),
        HttpMethod.POST,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedIds,
        });
        await waitForMutation();
      });

      // original copied items path have not changed
      copied.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
        expect(path).toEqual(item.path);
      });

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to copy multiple items', async () => {
      const nb = 2;
      const copied = ITEMS.slice(0, nb);
      const copiedIds = copied.map(({ id }) => id).toArray();
      const route = `/${buildCopyItemsRoute(copiedIds)}`;
      // set data in cache
      copied.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(key, List([copied.get(1)!]));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: copiedIds,
        });
        await waitForMutation();
      });

      // original copied items path have not changed
      copied.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
        expect(path).toEqual(item.path);
      });

      // check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useMoveItem', () => {
    const to = ITEMS.first()!.id;
    const moved = ITEMS.get(1)!.id;
    const route = `/${buildMoveItemRoute(moved)}`;

    const mutation = mutations.useMoveItem;

    it('Move a single root item to first level item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      const toItemKey = getKeyForParentId(to);
      queryClient.setQueryData(toItemKey, List(ITEMS));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: moved,
        });
        await waitForMutation();
      });

      // verify cache keys
      const itemKey = buildItemKey(moved);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data?.path).toEqual(
        `${ITEMS.first()!.path}.${ITEMS.get(1)!.path}`,
      );

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to move a single item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), ITEMS);

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to,
          id: moved,
        });
        await waitForMutation();
      });

      // verify cache keys
      const itemKey = buildItemKey(moved);
      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.path).toEqual(
        ITEMS.get(1)!.path,
      );

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(to);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useMoveItems', () => {
    const to = ITEMS.first()!;
    const toId = to.id;

    const mutation = mutations.useMoveItems;

    it('Move 2 items from root to first level item', async () => {
      const nb = 2;
      const moved = ITEMS.slice(0, nb);
      const movedIds = moved.map((x) => x.id).toArray();
      const route = `/${buildMoveItemsRoute(movedIds)}`;
      // set data in cache
      moved.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), moved);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, ITEMS);

      const response = moved.map(({ id }) => id);

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to: toId,
          ids: movedIds,
        });
        await waitForMutation();
      });

      // Check new path are corrects
      moved.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${transformIdForPath(item.id)}`);
      });

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Move many items from root to first level item', async () => {
      const moved = ITEMS;
      const movedIds = moved.map((x) => x.id).toArray();
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), ITEMS);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, ITEMS);

      const response = moved.map(({ id }) => id);

      const endpoints = splitEndpointByIds(
        movedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildMoveItemsRoute(chunk)}`,
        response.toJS(),
        HttpMethod.POST,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          to: toId,
          ids: movedIds,
        });
        await waitForMutation();
      });

      // Check new paths are corrects
      moved.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${transformIdForPath(item.id)}`);
      });

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });

    describe('Error handling', () => {
      const moved = ITEMS.slice(0, 2);
      const movedIds = moved.map((x) => x.id).toArray();
      const route = `/${buildMoveItemsRoute(movedIds)}`;

      it('Unauthorized to move multiple items', async () => {
        // set data in cache
        moved.forEach((item) => {
          const itemKey = buildItemKey(item.id);
          queryClient.setQueryData(itemKey, item);
        });
        queryClient.setQueryData(getKeyForParentId(null), moved);
        const toItemKey = getKeyForParentId(toId);
        queryClient.setQueryData(toItemKey, ITEMS);

        const response = UNAUTHORIZED_RESPONSE;

        const endpoints = [
          {
            response,
            statusCode: StatusCodes.UNAUTHORIZED,
            method: HttpMethod.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            to: toId,
            id: movedIds,
          });
          await waitForMutation();
        });

        // items path have not changed
        moved.forEach((item) => {
          const itemKey = buildItemKey(item.id);
          const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
          expect(path).toEqual(item.path);
        });

        // Check new parent is correctly invalidated
        expect(
          queryClient.getQueryState(toItemKey)?.isInvalidated,
        ).toBeTruthy();

        // Check old parent is correctly invalidated
        const fromItemKey = getKeyForParentId(null);
        expect(
          queryClient.getQueryState(fromItemKey)?.isInvalidated,
        ).toBeTruthy();
      });

      it('Unauthorized to move one of the items', async () => {
        // set data in cache
        moved.forEach((item) => {
          const itemKey = buildItemKey(item.id);
          queryClient.setQueryData(itemKey, item);
        });
        queryClient.setQueryData(getKeyForParentId(null), moved);
        const toItemKey = getKeyForParentId(toId);
        queryClient.setQueryData(toItemKey, ITEMS);

        const response: List<ItemRecord | GraaspError> = List([
          UNAUTHORIZED_RESPONSE,
          ...moved.toArray(),
        ]);

        const endpoints = [
          {
            response,
            method: HttpMethod.POST,
            route,
          },
        ];

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            to: toId,
            id: movedIds,
          });
          await waitForMutation();
        });

        // items path have not changed
        moved.forEach((item) => {
          const itemKey = buildItemKey(item.id);
          const path = queryClient.getQueryData<ItemRecord>(itemKey)?.path;
          expect(path).toEqual(item.path);
        });

        // Check new parent is correctly invalidated
        expect(
          queryClient.getQueryState(toItemKey)?.isInvalidated,
        ).toBeTruthy();

        // Check old parent is correctly invalidated
        const fromItemKey = getKeyForParentId(null);
        expect(
          queryClient.getQueryState(fromItemKey)?.isInvalidated,
        ).toBeTruthy();
      });
    });
  });

  describe('useRecycleItem', () => {
    const mutation = mutations.useRecycleItem;

    it('Recycle a root item', async () => {
      const item = ITEMS.first()!;
      const itemId = item.id;
      const route = `/${buildRecycleItemRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      const itemKey = buildItemKey(itemId);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data).toEqualImmutable(item);

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      const childrenKey = getKeyForParentId(null);
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.find(({ id }) => id === itemId),
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to recycle an item', async () => {
      const item = ITEMS.first()!;
      const itemId = item.id;
      const route = `/${buildRecycleItemRoute(itemId)}`;

      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      const childrenKey = getKeyForParentId(null);
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      const itemKey = buildItemKey(itemId);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data).toEqualImmutable(item);

      // Check parent's children key is correctly invalidated
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.find(({ id }) => id === itemId),
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useDeleteItem', () => {
    const mutation = mutations.useDeleteItem;

    it('Delete a root item', async () => {
      const item = ITEMS.first()!;
      const itemId = item.id;
      const route = `/${buildDeleteItemRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      queryClient.setQueryData(RECYCLED_ITEMS_KEY, ITEMS);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate([itemId]);
        await waitForMutation();
      });

      const itemKey = buildItemKey(itemId);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data?.toJS()).toBeFalsy();

      // Check recycled key is correctly invalidated
      // and should not contain deleted item
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(RECYCLED_ITEMS_KEY)
          ?.find(({ id }) => id === itemId),
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(RECYCLED_ITEMS_KEY)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Delete an item in item', async () => {
      const item = ITEMS.get(3)!;
      const itemId = item.id;
      const route = `/${buildDeleteItemRoute(itemId)}`;

      // set data in cache
      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate([itemId]);
        await waitForMutation();
      });

      // verify item is deleted
      const itemKey = buildItemKey(itemId);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data?.toJS()).toBeFalsy();

      // Check parent's children key is correctly invalidated
      // and should not contain deleted item
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.find(({ id }) => id === itemId),
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to delete an item', async () => {
      const item = ITEMS.first()!;
      const itemId = item.id;
      const route = `/${buildDeleteItemRoute(itemId)}`;

      ITEMS.forEach((i) => {
        const itemKey = buildItemKey(i.id);
        queryClient.setQueryData(itemKey, i);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate([itemId]);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      const itemKey = buildItemKey(itemId);
      const data = queryClient.getQueryData<ItemRecord>(itemKey);
      expect(data).toEqualImmutable(item);

      // Check parent's children key is correctly invalidated
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.find(({ id }) => id === itemId),
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useRecycleItems', () => {
    const mutation = mutations.useRecycleItems;

    it('Recycle root items', async () => {
      const items = ITEMS.slice(0, 2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);

      const response = items;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(ITEMS.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      const childrenKey = getKeyForParentId(null);
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).size,
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Recycle child items', async () => {
      const items = List([ITEMS.get(3)!, ITEMS.get(4)!, ITEMS.get(5)!]);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = getKeyForParentId(ITEMS.get(2)!.id);
      queryClient.setQueryData(childrenKey, List(ITEMS));

      const response = items;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(ITEMS.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeFalsy();
    });

    it('Unauthorized to recycle one of the items', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = getKeyForParentId(null);
      queryClient.setQueryData(childrenKey, ITEMS);

      const response: List<ItemRecord | GraaspError> = List([
        UNAUTHORIZED_RESPONSE,
        ...items.toArray(),
      ]);

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(items.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to recycle items', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = getKeyForParentId(null);
      queryClient.setQueryData(childrenKey, List(ITEMS));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(items.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useDeleteItems', () => {
    const mutation = mutations.useDeleteItems;

    it('Delete root items', async () => {
      const items = ITEMS.slice(0, 2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(RECYCLED_ITEMS_KEY, ITEMS);

      const response = [OK_RESPONSE];

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data?.toJS()).toBeFalsy();
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      const childrenKey = RECYCLED_ITEMS_KEY;
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).size,
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Delete child items', async () => {
      const items = List([ITEMS.get(3)!, ITEMS.get(4)!]);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = [OK_RESPONSE];

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify items are not available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data?.toJS()).toBeFalsy();
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Errors trigger error notification', async () => {
      const items = List([ITEMS.get(3)!, ITEMS.get(4)!]);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = [
        OK_RESPONSE,
        {
          code: 'GERR011',
          data: items.get(1)!.id,
          message: 'Too many descendants',
          name: 'GERR011',
          origin: 'core',
          statusCode: 403,
        },
      ];

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemsRoutine.FAILURE,
        payload: expect.anything(),
      });
    });

    it('Unauthorized to delete one of the items', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response: List<ItemRecord | GraaspError> = List([
        UNAUTHORIZED_RESPONSE,
        ...items.toArray(),
      ]);

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(items.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Errors trigger error notification', async () => {
      const items = List([ITEMS.get(3)!, ITEMS.get(4)!]);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = [
        OK_RESPONSE,
        {
          code: 'GERR011',
          data: items.get(1)!.id,
          message: 'Too many descendants',
          name: 'GERR011',
          origin: 'core',
          statusCode: 403,
        },
      ];

      const endpoints = [
        {
          response,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemsRoutine.FAILURE,
        payload: expect.anything(),
      });
    });

    it('Unauthorized to delete an item', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = buildItemKey(itemId);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(items.find(({ id }) => id === itemId));
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useUploadFiles', () => {
    const mutation = mutations.useUploadFiles;
    const { id } = ITEMS.first()!;

    it('Upload one item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(buildItemChildrenKey(id), ITEMS);

      const mockedMutation = await mockMutation({
        endpoints: [],
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ data: [id], id });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(buildItemChildrenKey(id));
      expect(data?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadFileRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
      });
    });

    it('Error while uploading an item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      queryClient.setQueryData(buildItemChildrenKey(id), ITEMS);

      const mockedMutation = await mockMutation({
        endpoints: [],
        mutation,
        wrapper,
      });

      const error = 'an error';

      await act(async () => {
        await mockedMutation.mutate({ id, error });
        await waitForMutation();
      });

      // check memberships invalidation
      const data = queryClient.getQueryState(buildItemChildrenKey(id));
      expect(data?.isInvalidated).toBeTruthy();

      // check notification trigger
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadFileRoutine.FAILURE,
        payload: { error },
      });
    });
  });

  describe('useRestoreItems', () => {
    const mutation = mutations.useRestoreItems;

    it('Restore items', async () => {
      const items = ITEMS.slice(0, 2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRestoreItemsRoute(itemIds)}`;

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getDirectParentId(item.path));
        queryClient.setQueryData(parentKey, List([item]));
      });
      const recycledKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(recycledKey, ITEMS);

      const response = items;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = buildItemKey(item.id);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(item);
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(recycledKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).size,
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(recycledKey)?.isInvalidated,
      ).toBeTruthy();

      // check original parent is invalidated
      for (const item of items) {
        const cKey = getKeyForParentId(getDirectParentId(item.path));
        expect(queryClient.getQueryState(cKey)?.isInvalidated).toBeTruthy();
      }
    });

    it('Restore many items', async () => {
      const items = ITEMS;
      const itemIds = items.map(({ id }) => id).toArray();

      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getDirectParentId(item.path));
        queryClient.setQueryData(parentKey, List([item]));
      });
      const recycledKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(recycledKey, ITEMS);

      const endpoints = splitEndpointByIds(
        itemIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildRestoreItemsRoute(chunk)}`,
        items.toJS(),
        HttpMethod.POST,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = buildItemKey(item.id);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(item);
      }

      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(recycledKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).size,
      ).toBeFalsy();
      expect(
        queryClient.getQueryState(recycledKey)?.isInvalidated,
      ).toBeTruthy();

      // check original parent is invalidated
      for (const item of items) {
        const cKey = getKeyForParentId(getDirectParentId(item.path));
        expect(queryClient.getQueryState(cKey)?.isInvalidated).toBeTruthy();
      }
    });

    it('Unauthorized to restore one of the items', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRestoreItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response: List<ItemRecord | GraaspError> = List([
        UNAUTHORIZED_RESPONSE,
        ...items.toArray(),
      ]);

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = buildItemKey(item.id);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(item);
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to restore items', async () => {
      const items = ITEMS.slice(2);
      const itemIds = items.map(({ id }) => id).toArray();
      const route = `/${buildRestoreItemsRoute(itemIds)}`;

      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = RECYCLED_ITEMS_KEY;
      queryClient.setQueryData(childrenKey, ITEMS);

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = buildItemKey(item.id);
        const data = queryClient.getQueryData<ItemRecord>(itemKey);
        expect(data).toEqualImmutable(item);
      }

      // Check parent's children key is correctly invalidated
      // and still contains the items
      expect(
        queryClient
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).size,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useUploadItemThumbnail', () => {
    const mutation = mutations.useUploadItemThumbnail;
    const item = ITEMS.first()!;
    const { id } = item;

    it('Upload thumbnail', async () => {
      const route = `/${buildUploadItemThumbnailRoute(id)}`;

      // set data in cache
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildItemThumbnailKey({ id, size });
        queryClient.setQueryData(key, Math.random());
      });

      const response = THUMBNAIL_BLOB_RESPONSE;

      const endpoints = [
        {
          response,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, data: [id] });
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const size of Object.values(THUMBNAIL_SIZES)) {
        const key = buildItemThumbnailKey({ id, size });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadItemThumbnailRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
      });
    });

    it('Unauthorized to upload a thumbnail', async () => {
      const route = `/${buildUploadItemThumbnailRoute(id)}`;
      // set data in cache
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildItemThumbnailKey({ id, size });
        queryClient.setQueryData(key, Math.random());
      });

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id, error: StatusCodes.UNAUTHORIZED });
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const size of Object.values(THUMBNAIL_SIZES)) {
        const key = buildItemThumbnailKey({ id, size });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadItemThumbnailRoutine.FAILURE,
        payload: { error: StatusCodes.UNAUTHORIZED },
      });
    });
  });
});
