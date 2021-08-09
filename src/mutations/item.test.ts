import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import { Map, Record } from 'immutable';
import { buildCopyItemRoute, buildCopyItemsRoute, buildMoveItemRoute, buildMoveItemsRoute } from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import {
  OK_RESPONSE,
  ITEMS
} from '../../test/constants';
import {
  buildItemKey,
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
    const copied = ITEMS[1].id;

    const route = `/${buildCopyItemRoute(copied)}`;
    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEM);

    // set random data in cache
    ITEMS.forEach(item => {
      const itemKey = buildItemKey(item.id);
      queryClient.setQueryData(itemKey, Map(item));
    });

    it('singleCopySuccess', async () => {
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
          id: copied,
        });
        await waitForMutation();
      });

      // verify cache keys
      const itemKey = buildItemKey(to);
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeFalsy();
    });
  });


  describe(MUTATION_KEYS.COPY_ITEMS, () => {

    const to = ITEMS[0].id;
    const copied = ITEMS.slice(1).map(x => x.id)
    const route = `/${buildCopyItemsRoute(copied)}`;

    const mutation = () => useMutation(MUTATION_KEYS.COPY_ITEMS);

    it('multiCopySuccess', async () => {
      // set random data in cache
      ITEMS.forEach(item => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });

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
          id: copied,
        });
        await waitForMutation();
      });

      // verify cache keys
      const itemKey = buildItemKey(to);
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeFalsy();
    });
  });


  describe(MUTATION_KEYS.MOVE_ITEM, () => {

    const to = ITEMS[0].id;
    const moved = ITEMS[1].id;
    const route = `/${buildMoveItemRoute(moved)}`;

    const mutation = () => useMutation(MUTATION_KEYS.MOVE_ITEM);

    it('singleMoveSuccess', async () => {
      // set random data in cache
      ITEMS.forEach(item => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });

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

      const itemKey = buildItemKey(moved);
      const data = queryClient.getQueryData<Record<Item>>(itemKey);

      // verify cache keys
      expect(data?.get('path')).toEqual(`${ITEMS[0].path}.${ITEMS[1].path}`);
    });
  });

  describe(MUTATION_KEYS.MOVE_ITEMS, () => {
    const to = ITEMS[0].id;
    const moved = ITEMS.slice(1).map(x => x.id);
    const route = `/${buildMoveItemsRoute(moved)}`;

    const mutation = () => useMutation(MUTATION_KEYS.MOVE_ITEMS);

    it('multiMoveSuccess', async () => {
      // set random data in cache
      ITEMS.forEach(item => {
        const itemKey = buildItemKey(item.id);
        queryClient.setQueryData(itemKey, Map(item));
      });

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

      ITEMS.forEach(item => {
        const itemKey = buildItemKey(item.id);
        const path = queryClient.getQueryData<Record<Item>>(itemKey)?.get('path');

        if (item.id === to) {
          expect(path).toEqual(`${ITEMS[0].path}`);
        }
        else {
          expect(path).toEqual(`${ITEMS[0].path}.${item.path}`);
        }
      });
    });
  });
});