import nock from 'nock';
import { List } from 'immutable';
import { mockHook, setUpTest } from '../../test/utils';
import {
  buildGetCategoriesRoute,
  buildGetCategoryRoute,
  buildGetItemCategoriesRoute,
  buildGetItemsByCategoriesRoute,
  GET_CATEGORY_TYPES_ROUTE,
} from '../api/routes';
import {
  buildCategoriesKey,
  buildCategoryKey,
  buildItemCategoriesKey,
  buildItemsByCategoriesKey,
  CATEGORY_TYPES_KEY,
} from '../config/keys';
import {
  CATEGORIES,
  CATEGORY_TYPES,
  ITEM_CATEGORIES,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { Category, CategoryType, ItemCategory } from '../types';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';

const { hooks, wrapper, queryClient } = setUpTest();

type ItemId = {
  itemId: string;
};

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Category Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useCategoryTypes', () => {
    const route = `/${GET_CATEGORY_TYPES_ROUTE}`;
    const key = CATEGORY_TYPES_KEY;

    const hook = () => hooks.useCategoryTypes();

    it(`Receive category types`, async () => {
      const response = CATEGORY_TYPES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<CategoryType>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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

  describe('useCategories', () => {
    const typeIds = ['type-id1', 'type-id2'];
    const route = `/${buildGetCategoriesRoute(typeIds)}`;
    const key = buildCategoriesKey(typeIds);

    const hook = () => hooks.useCategories(typeIds);

    it(`Receive category types`, async () => {
      const response = CATEGORIES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<Category>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
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
      const response = CATEGORIES[0];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data as Category).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
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

      expect((data as List<ItemCategory>).toJS()).toEqual(response);

      // verify cache keys
      expect(
        (queryClient.getQueryData(key) as List<ItemCategory>).toJS(),
      ).toEqual(response);
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
    const route = `/${buildGetItemsByCategoriesRoute(categoryIds)}`;
    const key = buildItemsByCategoriesKey(categoryIds);

    const hook = () => hooks.useItemsInCategories(categoryIds);

    it(`Receive items in categories`, async () => {
      const response = [{ itemId: 'id1' }, { itemId: 'id2' }];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ItemId>).toJS()).toEqual(response);

      // verify cache keys
      expect((queryClient.getQueryData(key) as List<ItemId>)?.toJS()).toEqual(
        response,
      );
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
