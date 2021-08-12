import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import { List, Map, Record } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import {
  buildCopyItemRoute,
  buildCopyItemsRoute,
  buildEditItemRoute,
  buildMoveItemRoute,
  buildMoveItemsRoute,
  buildPostItemRoute,
} from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import {
  OK_RESPONSE,
  ITEMS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildItemKey,
  getKeyForParentId,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
} from '../config/keys';
import { Item, ITEM_TYPES } from '../types';
import { buildPath } from '../utils/item';

const { wrapper, queryClient, useMutation } = setUpTest();
describe('Items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM, () => {
    const newItem = {
      name: 'new item',
      type: ITEM_TYPES.FOLDER,
    };

    it('Post item in root', async () => {
      const route = `/${buildPostItemRoute()}`;
      const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM);
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS[1]]));

      const response = { ...newItem, id: 'someid', path: 'someid' };

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
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
      const parentItem = ITEMS[1];
      const response = {
        ...newItem,
        id: 'someid',
        path: buildPath({ prefix: parentItem.path, ids: ['someid'] }),
      };

      // set default data
      queryClient.setQueryData(
        getKeyForParentId(parentItem.id),
        List([ITEMS[2]]),
      );

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
          route: `/${buildPostItemRoute(parentItem.id)}`,
        },
      ];

      const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM);

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
      const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM);
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS[1]]));

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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

  describe(MUTATION_KEYS.EDIT_ITEM, () => {
    const item = ITEMS[0];
    const itemKey = buildItemKey(item.id);
    const payload = { id: item.id, description: 'new description' };

    it('Edit item in root', async () => {
      // set default data
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS[1]]));

      const route = `/${buildEditItemRoute(item.id)}`;
      const mutation = () => useMutation(MUTATION_KEYS.EDIT_ITEM);
      const response = item;
      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.PATCH,
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
      const parentItem = ITEMS[2];
      const parentKey = getKeyForParentId(parentItem.id);
      const editedItem = ITEMS[3];
      const editedItemKey = buildItemKey(editedItem.id);
      const payload = { id: editedItem.id, description: 'a new description' };
      queryClient.setQueryData(editedItemKey, Map(editedItem));
      queryClient.setQueryData(parentKey, List([ITEMS[1]]));

      const route = `/${buildEditItemRoute(editedItem.id)}`;
      const mutation = () => useMutation(MUTATION_KEYS.EDIT_ITEM);
      const response = item;
      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.PATCH,
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

      expect(
        queryClient.getQueryState(editedItemKey)?.isInvalidated,
      ).toBeTruthy();
      expect(queryClient.getQueryState(parentKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized', async () => {
      const route = `/${buildEditItemRoute(item.id)}`;
      const mutation = () => useMutation(MUTATION_KEYS.EDIT_ITEM);
      queryClient.setQueryData(itemKey, Map(item));

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.PATCH,
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
        (queryClient.getQueryData(itemKey) as Record<Item>).toJS(),
      ).toEqual(item);
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
    });
  });

  describe(MUTATION_KEYS.COPY_ITEM, () => {
    const to = ITEMS[0].id;
    const copied = ITEMS[1];
    const copiedId = copied.id;

    const route = `/${buildCopyItemRoute(copiedId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEM);

    const key = getKeyForParentId(to);

    it('Copy a single item from root item to first level item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(key, List([ITEMS[1]]));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
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
      expect(
        queryClient.getQueryData<Record<Item>>(itemKey)?.get('path'),
      ).toEqual(copied.path);

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to copy a single item', async () => {
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(key, List([ITEMS[1]]));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
      expect(
        queryClient.getQueryData<Record<Item>>(itemKey)?.get('path'),
      ).toEqual(copied.path);

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });
  });

  describe(MUTATION_KEYS.COPY_ITEMS, () => {
    const to = ITEMS[0].id;
    const copied = ITEMS.slice(1);
    const copiedIds = copied.map((x) => x.id);

    const route = `/${buildCopyItemsRoute(copiedIds)}`;

    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEMS);

    const key = getKeyForParentId(to);

    it('copy multiple root items to first level item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });

      queryClient.setQueryData(key, List([ITEMS[1]]));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
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
        const path = queryClient
          .getQueryData<Record<Item>>(itemKey)
          ?.get('path');
        expect(path).toEqual(item.path);
      });

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to copy multiple items', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(key, List([ITEMS[1]]));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
        const path = queryClient
          .getQueryData<Record<Item>>(itemKey)
          ?.get('path');
        expect(path).toEqual(item.path);
      });

      // check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
    });
  });

  describe(MUTATION_KEYS.MOVE_ITEM, () => {
    const to = ITEMS[0].id;
    const moved = ITEMS[1].id;
    const route = `/${buildMoveItemRoute(moved)}`;

    const mutation = () => useMutation(MUTATION_KEYS.MOVE_ITEM);

    it('Move a single root item to first level item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
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
      const data = queryClient.getQueryData<Record<Item>>(itemKey);
      expect(data?.get('path')).toEqual(`${ITEMS[0].path}.${ITEMS[1].path}`);

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(to);
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
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(getKeyForParentId(null), List(ITEMS));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
      expect(
        queryClient.getQueryData<Record<Item>>(itemKey)?.get('path'),
      ).toEqual(ITEMS[1].path);

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

  describe(MUTATION_KEYS.MOVE_ITEMS, () => {
    const to = ITEMS[0];
    const toId = to.id;

    const moved = ITEMS.slice(1);
    const movedIds = moved.map((x) => x.id);
    const route = `/${buildMoveItemsRoute(movedIds)}`;

    const mutation = () => useMutation(MUTATION_KEYS.MOVE_ITEMS);

    it('Move items from root to fist level item', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(getKeyForParentId(null), List(ITEMS));

      const response = OK_RESPONSE;

      const endpoints = [
        {
          response,
          method: REQUEST_METHODS.POST,
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

      // Check new path are corrects
      moved.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient
          .getQueryData<Record<Item>>(itemKey)
          ?.get('path');
        expect(path).toEqual(`${to.path}.${item.path}`);
      });

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(toId);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });

    it('Unauthorized to move multiple items', async () => {
      // set data in cache
      ITEMS.forEach((item) => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });
      queryClient.setQueryData(getKeyForParentId(null), List(ITEMS));

      const response = UNAUTHORIZED_RESPONSE;

      const endpoints = [
        {
          response,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.POST,
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
        const path = queryClient
          .getQueryData<Record<Item>>(itemKey)
          ?.get('path');
        expect(path).toEqual(item.path);
      });

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(toId);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(
        queryClient.getQueryState(fromItemKey)?.isInvalidated,
      ).toBeTruthy();
    });
  });
});
