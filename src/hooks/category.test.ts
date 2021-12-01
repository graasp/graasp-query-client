import nock from 'nock';
import { List } from 'immutable';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetCategoriesRoute, buildGetCategoryInfoRoute, buildGetItemCategoriesRoute, buildGetItemsInCategoryRoute, GET_CATEGORY_TYPES_ROUTE } from '../api/routes';
import { buildCategoriesKey, buildItemCategoryKey, buildItemsByCategoryKey, CATEGORY_KEY, CATEGORY_TYPES_KEY } from '../config/keys';
import { CATEGORIES, CATEGORY_TYPES, ITEM_CATEGORIES } from '../../test/constants';
import { Category, CategoryType, ItemCategory } from '../types';

const { hooks, wrapper, queryClient } = setUpTest();

type ItemId = {
  item_id: string,
}

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
  });

  describe('useCategory', () => {
    const categoryId = 'id';
    const route = `/${buildGetCategoryInfoRoute(categoryId)}`;
    const key = CATEGORY_KEY;

    const hook = () => hooks.useCategory(categoryId);

    it(`Receive category info`, async () => {
      const response = CATEGORIES[0];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Category)).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });
  });

  describe('useItemCategories', () => {
    const itemId = 'item-id';
    const route = `/${buildGetItemCategoriesRoute(itemId)}`;
    const key = buildItemCategoryKey(itemId);

    const hook = () => hooks.useItemCategories(itemId);

    it(`Receive item categories`, async () => {
      const response = ITEM_CATEGORIES;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ItemCategory>).toJS()).toEqual(response);

      // verify cache keys
      expect((queryClient.getQueryData(key) as List<ItemCategory>).toJS()).toEqual(response);
    });
  });

  describe('useItemsInCategories', () => {
    const categoryIds = ['id1'];
    const route = `/${buildGetItemsInCategoryRoute(categoryIds)}`;
    const key = buildItemsByCategoryKey(categoryIds);

    const hook = () => hooks.useItemsInCategories(categoryIds);

    it(`Receive items in categories`, async () => {
      const response = [{item_id: 'id1'}, {item_id: 'id2'}];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<ItemId>).toJS()).toEqual(response);

      // verify cache keys
      expect((queryClient.getQueryData(key) as List<ItemId>)?.toJS()).toEqual(response);
    });
  });
});
