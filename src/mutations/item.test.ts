/* eslint-disable import/no-extraneous-dependencies */
import {
  DiscriminatedItem,
  FolderItemFactory,
  HttpMethod,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  RecycledItemData,
  ThumbnailSize,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  ITEM_GEOLOCATION,
  OK_RESPONSE,
  RECYCLED_ITEM_DATA,
  THUMBNAIL_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../test/constants';
import {
  mockMutation,
  setUpTest,
  splitEndpointByIds,
  waitForMutation,
} from '../../test/utils';
import {
  buildCopyItemsRoute,
  buildDeleteItemsRoute,
  buildEditItemRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
  buildUploadItemThumbnailRoute,
} from '../api/routes';
import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_DATA_KEY,
  accessibleItemsKeys,
  buildItemChildrenKey,
  buildItemKey,
  buildItemThumbnailKey,
  getKeyForParentId,
  itemsWithGeolocationKeys,
} from '../config/keys';
import { uploadFileRoutine, uploadItemThumbnailRoutine } from '../routines';
import {
  buildPath,
  getDirectParentId,
  transformIdForPath,
} from '../utils/item';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    mockedNotifier.mockClear();
  });

  describe('usePostItem', () => {
    const mutation = mutations.usePostItem;
    const newItem = {
      name: 'new item',
      type: ItemType.FOLDER,
    };

    it('Post item in root', async () => {
      const route = `/${buildPostItemRoute()}`;
      queryClient.setQueryData(accessibleItemsKeys.all, [FolderItemFactory()]);

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
        queryClient.getQueryState(accessibleItemsKeys.all)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Post item in item', async () => {
      const parentItem = FolderItemFactory();
      const response = {
        ...newItem,
        id: 'someid',
        path: buildPath({ prefix: parentItem.path, ids: ['someid'] }),
      };

      // set default data
      queryClient.setQueryData(getKeyForParentId(parentItem.id), [
        FolderItemFactory(),
      ]);

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

    it('Post item with geoloc', async () => {
      const parentItem = FolderItemFactory();
      const singleKey = itemsWithGeolocationKeys.inBounds({
        lat1: 1,
        lat2: 2,
        lng1: 1,
        lng2: 2,
      });
      const response = {
        ...newItem,
        id: 'someid',
        path: buildPath({ prefix: parentItem.path, ids: ['someid'] }),
      };

      // set default data
      queryClient.setQueryData(getKeyForParentId(parentItem.id), [
        FolderItemFactory(),
      ]);
      queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

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
        await mockedMutation.mutate({
          ...newItem,
          parentId: parentItem.id,
          geolocation: { lat: 1, lng: 1 },
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(getKeyForParentId(parentItem.id))
          ?.isInvalidated,
      ).toBeTruthy();
      expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized', async () => {
      const route = `/${buildPostItemRoute()}`;
      queryClient.setQueryData(accessibleItemsKeys.all, [FolderItemFactory()]);

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
        queryClient.getQueryState(accessibleItemsKeys.all)?.isInvalidated,
      ).toBeTruthy();
    });
  });

  describe('useEditItem', () => {
    const item = FolderItemFactory();
    const mutation = mutations.useEditItem;
    const itemKey = buildItemKey(item.id);
    const payload = { id: item.id, description: 'new description' };

    it('Edit item in root', async () => {
      // set default data
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(accessibleItemsKeys.all, [FolderItemFactory()]);

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
        queryClient.getQueryState(accessibleItemsKeys.all)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Edit item in item', async () => {
      // set default data
      const parentItem = FolderItemFactory();
      const parentKey = getKeyForParentId(parentItem.id);
      const editedItem = FolderItemFactory({ parentItem });
      const editedItemKey = buildItemKey(editedItem.id);
      const editPayload = {
        id: editedItem.id,
        description: 'a new description',
      };
      queryClient.setQueryData(editedItemKey, editedItem);
      queryClient.setQueryData(parentKey, [FolderItemFactory()]);

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

    it('Edit item extra children order invalidate children key', async () => {
      // set default data
      const editedItem = FolderItemFactory();
      const editedItemKey = buildItemKey(editedItem.id);
      const editPayload = {
        id: editedItem.id,
        // these are dummy ids, in reality they should be UUIDs
        extra: { folder: { childrenOrder: ['1', '2'] } },
      };
      const childrenKey = buildItemChildrenKey(editedItem.id);
      queryClient.setQueryData(childrenKey, [FolderItemFactory()]);
      queryClient.setQueryData(editedItemKey, editedItem);

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
      expect(
        queryClient.getQueryState(childrenKey)?.isInvalidated,
      ).toBeTruthy();
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
      expect(
        queryClient.getQueryData<DiscriminatedItem>(itemKey),
      ).toMatchObject(item);
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useCopyItems', () => {
    const items = generateFolders(MAX_TARGETS_FOR_MODIFY_REQUEST + 1);
    const to = items[3].id;

    const mutation = mutations.useCopyItems;

    const key = getKeyForParentId(to);

    it('copy multiple root items to first level item', async () => {
      const copied = [items[0], items[1]];
      const copiedIds = copied.map((x) => x.id);

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });

      queryClient.setQueryData(key, [items[1]]);

      // we don't care about the returned value
      const response = items.map(() => OK_RESPONSE);

      const endpoints = splitEndpointByIds(
        copiedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildCopyItemsRoute(chunk)}`,
        response,
        (d) => d.id,
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
          ids: copiedIds,
        });
        await waitForMutation();
      });

      // original copied items path have not changed
      copied.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(item.path);
      });

      // Check new parent is not invalidated (because copy is async)
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
    });
  });

  describe('useMoveItems', () => {
    const items = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const to = items[0];
    const toId = to.id;

    const mutation = mutations.useMoveItems;

    it('Move 2 items from root to first level item', async () => {
      const nb = 2;
      const moved = items.slice(0, nb);
      const movedIds = moved.map((x) => x.id);
      const route = `/${buildMoveItemsRoute(movedIds)}`;
      // set data in cache
      moved.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), moved);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, items);

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
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${transformIdForPath(item.id)}`);
      });

      // Check new parent is not invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeFalsy();

      // Check old parent is not invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeFalsy();
    });

    it('Move many items from root to first level item', async () => {
      const moved = items;
      const movedIds = moved.map((x) => x.id);
      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), items);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, items);

      const response = moved.map(({ id }) => id);

      const endpoints = splitEndpointByIds(
        movedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildMoveItemsRoute(chunk)}`,
        response,
        (el) => el,
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
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${transformIdForPath(item.id)}`);
      });

      // Check new parent is not invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeFalsy();

      // Check old parent is not invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeFalsy();
    });
  });

  describe('useRecycleItems', () => {
    const mutation = mutations.useRecycleItems;
    const dataItems = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];

    it('Recycle root items', async () => {
      const items = dataItems.slice(0, 2);
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      // todo: change to use Accessible items
      queryClient.setQueryData(OWN_ITEMS_KEY, items);

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
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(items.find(({ id }) => id === itemId)!);
      }

      // todo: this will need to be updated too
      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      const childrenKey = getKeyForParentId(null);
      expect(
        queryClient
          .getQueryData<DiscriminatedItem[]>(childrenKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).length,
      ).toBeFalsy();

      // check key is not invalidated
      expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeFalsy();
    });

    it('Recycle child items', async () => {
      const children = [dataItems[0], dataItems[1], dataItems[2]];
      const toRecycle = [dataItems[3], dataItems[4], dataItems[5]];
      const itemIds = toRecycle.map(({ id }) => id);
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      toRecycle.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = getKeyForParentId(children[2].id);
      queryClient.setQueryData(childrenKey, children);

      const response = toRecycle;

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
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(toRecycle.find(({ id }) => id === itemId)!);
      }

      // Check parent's children key is not invalidated
      // and should not contain recycled item
      expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeFalsy();

      expect(
        queryClient
          .getQueryData<DiscriminatedItem[]>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).length,
      ).toBeFalsy();
    });
  });

  describe('useDeleteItems', () => {
    const mutation = mutations.useDeleteItems;
    const items = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];

    it('Delete root items', async () => {
      const itemIds = [
        RECYCLED_ITEM_DATA[0].item.id,
        RECYCLED_ITEM_DATA[2].item.id,
      ];
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, RECYCLED_ITEM_DATA);

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
        const state = queryClient.getQueryState<DiscriminatedItem>(itemKey);
        expect(state?.isInvalidated).toBeFalsy();
      }

      expect(queryClient.getQueryData(RECYCLED_ITEMS_DATA_KEY)).toEqual([
        RECYCLED_ITEM_DATA[1],
      ]);
    });

    it('Delete child items', async () => {
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });

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
        const state = queryClient.getQueryState<DiscriminatedItem>(itemKey);
        expect(state?.isInvalidated).toBeFalsy();
      }
    });
  });

  describe('useUploadFiles', () => {
    const mutation = mutations.useUploadFiles;
    const items = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const { id } = items[0];

    it('Upload one item', async () => {
      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(accessibleItemsKeys.all, items);
      queryClient.setQueryData(buildItemChildrenKey(id), items);

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
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(accessibleItemsKeys.all, items);
      queryClient.setQueryData(buildItemChildrenKey(id), items);

      const mockedMutation = await mockMutation({
        endpoints: [],
        mutation,
        wrapper,
      });

      const error = new Error('an error');

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
      const items = RECYCLED_ITEM_DATA.map(({ item }) => item);
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildRestoreItemsRoute(itemIds)}`;
      const response = RECYCLED_ITEM_DATA;

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getDirectParentId(item.path));
        queryClient.setQueryData(parentKey, [item]);
      });
      queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, response);
      expect(
        queryClient.getQueryData<RecycledItemData[]>(RECYCLED_ITEMS_DATA_KEY)!
          .length,
      ).not.toEqual(0);

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
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(item);
      }

      // check recycle bin key
      expect(
        queryClient.getQueryState(RECYCLED_ITEMS_DATA_KEY)?.isInvalidated,
      ).toBeFalsy();
      expect(
        queryClient.getQueryData<RecycledItemData[]>(RECYCLED_ITEMS_DATA_KEY)!
          .length,
      ).toEqual(0);
    });

    it('Restore many items', async () => {
      const response = RECYCLED_ITEM_DATA;
      const items = RECYCLED_ITEM_DATA.map(({ item }) => item);
      const itemIds = items.map(({ id }) => id);

      // set data in cache
      items.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getDirectParentId(item.path));
        queryClient.setQueryData(parentKey, [item]);
      });
      queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, response);
      expect(
        queryClient.getQueryData<RecycledItemData[]>(RECYCLED_ITEMS_DATA_KEY)!
          .length,
      ).not.toEqual(0);

      const endpoints = splitEndpointByIds(
        itemIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildRestoreItemsRoute(chunk)}`,
        items,
        (d) => d.id,
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
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(item);
      }

      // check original parent is invalidated
      expect(
        queryClient.getQueryState(RECYCLED_ITEMS_DATA_KEY)?.isInvalidated,
      ).toBeFalsy();
      expect(
        queryClient.getQueryData<RecycledItemData[]>(RECYCLED_ITEMS_DATA_KEY)!
          .length,
      ).toEqual(0);
    });
  });

  describe('useUploadItemThumbnail', () => {
    const mutation = mutations.useUploadItemThumbnail;
    const { id } = FolderItemFactory();

    it('Upload thumbnail', async () => {
      const route = `/${buildUploadItemThumbnailRoute(id)}`;

      // set data in cache
      Object.values(ThumbnailSize).forEach((size) => {
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
      for (const size of Object.values(ThumbnailSize)) {
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
      Object.values(ThumbnailSize).forEach((size) => {
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

      const error = new Error(`${StatusCodes.UNAUTHORIZED}`);

      await act(async () => {
        await mockedMutation.mutate({
          id,
          error,
        });
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const size of Object.values(ThumbnailSize)) {
        const key = buildItemThumbnailKey({ id, size });
        const state = queryClient.getQueryState(key);
        expect(state?.isInvalidated).toBeTruthy();
      }
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: uploadItemThumbnailRoutine.FAILURE,
        payload: {
          error,
        },
      });
    });
  });
});
