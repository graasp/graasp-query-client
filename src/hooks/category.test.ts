/* eslint-disable import/no-extraneous-dependencies */
import { CategoryRecord, ItemCategoryRecord } from '@graasp/sdk/frontend';

import { StatusCodes } from 'http-status-codes';
import { List, Record, RecordOf } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  CATEGORIES,
  ITEM_CATEGORIES,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsInCategoryRoute,
} from '../api/routes';
import {
  buildCategoriesKey,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
} from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

type ItemId = {
  itemId: string;
};

type ItemIdRecord = RecordOf<ItemId>;

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Category Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  // describe('useCategoryTypes', () => {
  //   const route = `/${GET_CATEGORY_TYPES_ROUTE}`;
  //   const key = CATEGORY_TYPES_KEY;

  //   const hook = () => hooks.useCategoryTypes();

  //   it(`Receive category types`, async () => {
  //     const response = CATEGORY_TYPES;
  //     const endpoints = [{ route, response }];
  //     const { data } = await mockHook({ endpoints, hook, wrapper });

  //     expect(data as List<CategoryTypeRecord>).toEqualImmutable(response);

  //     // verify cache keys
  //     expect(queryClient.getQueryData(key)).toEqualImmutable(response);
  //   });
  //   it(`Unauthorized`, async () => {
  //     const endpoints = [
  //       {
  //         route,
  //         response: UNAUTHORIZED_RESPONSE,
  //         statusCode: StatusCodes.UNAUTHORIZED,
  //       },
  //     ];
  //     const { data, isError } = await mockHook({
  //       hook,
  //       wrapper,
  //       endpoints,
  //     });

  //     expect(data).toBeFalsy();
  //     expect(isError).toBeTruthy();
  //     // verify cache keys
  //     expect(queryClient.getQueryData(key)).toBeFalsy();
  //   });
  // });

  describe('useCategories', () => {
    const typeIds = ['type-id1', 'type-id2'];
    const route = `/${buildGetCategoriesRoute(typeIds)}`;
    const key = buildCategoriesKey(typeIds);

    const hook = () => hooks.useCategories(typeIds);

    it(`Receive category types`, async () => {
      const response = CATEGORIES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<CategoryRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });
    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useCategory', () => {
    const categoryId = 'id';
    const route = `/${buildGetCategoryRoute(categoryId)}`;
    const key = buildCategoryKey(categoryId);

    const hook = () => hooks.useCategory(categoryId);

    it(`Receive category info`, async () => {
      const response = CATEGORIES.first()!;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as CategoryRecord).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
    });
    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItemCategories', () => {
    const itemId = 'item-id';
    const route = `/${buildGetItemCategoriesRoute(itemId)}`;
    const key = buildItemCategoriesKey(itemId);

    const hook = () => hooks.useItemCategories(itemId);

    it(`Receive item categories`, async () => {
      const response = ITEM_CATEGORIES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemCategoryRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(
        queryClient.getQueryData(key) as List<ItemCategoryRecord>,
      ).toEqualImmutable(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItemsInCategories', () => {
    const categoryIds = ['id1'];
    const route = `/${buildGetItemsInCategoryRoute(categoryIds)}`;
    const key = buildItemsByCategoriesKey(categoryIds);

    const hook = () => hooks.useItemsInCategories(categoryIds);

    it(`Receive items in categories`, async () => {
      const defaultItemIdValues: ItemId = { itemId: 'id1' };
      const createMockItemId: Record.Factory<ItemId> =
        Record(defaultItemIdValues);
      const ITEM_ID_1: ItemIdRecord = createMockItemId();
      const ITEM_ID_2: ItemIdRecord = createMockItemId({ itemId: 'id2' });
      const response = List([ITEM_ID_1, ITEM_ID_2]);
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as List<ItemIdRecord>).toEqualImmutable(response);

      // verify cache keys
      expect(
        queryClient.getQueryData(key) as List<ItemIdRecord>,
      ).toEqualImmutable(response);
    });
    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});
