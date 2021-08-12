import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import { List, Map, Record } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import { buildCopyItemRoute, buildCopyItemsRoute, buildMoveItemRoute, buildMoveItemsRoute } from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import {
  OK_RESPONSE,
  ITEMS,
  UNAUTHORIZED_RESPONSE
} from '../../test/constants';
import {
  buildItemKey,
  getKeyForParentId,
  MUTATION_KEYS
} from '../config/keys';
import { Item } from '../types';


const { wrapper, queryClient, useMutation } = setUpTest();
describe('items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.COPY_ITEM, () => {
    const to = ITEMS[0].id;
    const copied = ITEMS[1];
    const copiedId = copied.id;

    const route = `/${buildCopyItemRoute(copiedId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEM);

    const key = getKeyForParentId(to);

    it('Copy a single item from root item to first level item', async () => {
      ITEMS.forEach(item => {
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
        }
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
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.get('path')).toEqual(copied.path);

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();  
    });

    it('Unauthorized to copy a single item', async () => {
      ITEMS.forEach(item => {
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
        }
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
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.get('path')).toEqual(copied.path);

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();  
    });
  });


  describe(MUTATION_KEYS.COPY_ITEMS, () => {

    const to = ITEMS[0].id;
    const copied = ITEMS.slice(1);
    const copiedIds = copied.map(x => x.id);
    
    const route = `/${buildCopyItemsRoute(copiedIds)}`;

    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEMS);


    const key = getKeyForParentId(to);

    it('copy multiple root items to first level item', async () => {
      // set data in cache
      ITEMS.forEach(item => {
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
        }
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
      copied.forEach(item => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<Record<Item>>(itemKey)?.get('path');
        expect(path).toEqual(item.path);
      });

      // Check new parent is correctly invalidated
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();  
    });

    it('Unauthorized to copy multiple items', async () => {
      // set data in cache
      ITEMS.forEach(item => {
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
        }
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
      copied.forEach(item => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<Record<Item>>(itemKey)?.get('path');
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
      ITEMS.forEach(item => {
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
        }
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
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to move a single item', async () => {
      ITEMS.forEach(item => {
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
        }
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
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.get('path')).toEqual(ITEMS[1].path);

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(to);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeTruthy();
    });
  });

  describe(MUTATION_KEYS.MOVE_ITEMS, () => {
    const to = ITEMS[0];
    const toId = to.id;

    const moved = ITEMS.slice(1);
    const movedIds = moved.map(x => x.id);
    const route = `/${buildMoveItemsRoute(movedIds)}`;

    const mutation = () => useMutation(MUTATION_KEYS.MOVE_ITEMS);

    it('Move items from root to fist level item', async () => {
      // set data in cache
      ITEMS.forEach(item => {
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
        }
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
      moved.forEach(item => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<Record<Item>>(itemKey)?.get('path');
        expect(path).toEqual(`${to.path}.${item.path}`);
      });

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(toId);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();  

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized to move multiple items', async () => {
      // set data in cache
      ITEMS.forEach(item => {
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
        }
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
      moved.forEach(item => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<Record<Item>>(itemKey)?.get('path');
        expect(path).toEqual(item.path);
      });

      // Check new parent is correctly invalidated
      const toItemKey = getKeyForParentId(toId);
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeTruthy();  

      // Check old parent is correctly invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeTruthy();
    });
  });
});