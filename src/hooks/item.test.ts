/* eslint-disable import/no-extraneous-dependencies */
import Cookies from 'js-cookie';
import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import { Record, Map, List } from 'immutable';
import {
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildGetChildrenRoute,
  buildGetItemLoginRoute,
  buildGetItemRoute,
  buildGetItemsRoute,
  buildGetPublicItemRoute,
  buildGetPublicItemsWithTag,
  buildPublicDownloadFilesRoute,
  GET_OWN_ITEMS_ROUTE,
  GET_RECYCLED_ITEMS_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
} from '../api/routes';
import { Endpoint, mockHook, setUpTest } from '../../test/utils';
import {
  FILE_RESPONSE,
  ITEMS,
  TAGS,
  THUMBNAIL_BLOB_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemParentsKey,
  buildItemsChildrenKey,
  buildItemsKey,
  buildPublicItemsWithTagKey,
  buildItemThumbnailKey,
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import type { Item, ItemLogin } from '../types';
import { THUMBNAIL_SIZES } from '../config/constants';

const { hooks, wrapper, queryClient } = setUpTest();
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Items Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnItems', () => {
    const route = `/${GET_OWN_ITEMS_ROUTE}`;
    const hook = () => hooks.useOwnItems();

    it(`Receive own items`, async () => {
      const response = ITEMS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Item>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(OWN_ITEMS_KEY)).toEqual(List(response));
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(item),
        );
      }
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
      expect(queryClient.getQueryData(OWN_ITEMS_KEY)).toBeFalsy();
    });
  });

  describe('useChildren', () => {
    const id = 'item-id';
    const route = `/${buildGetChildrenRoute(id, true)}`;
    const response = ITEMS;
    const key = buildItemChildrenKey(id);

    it(`Receive children of item by id`, async () => {
      const hook = () => hooks.useChildren(id);
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect((data as Record<Item>).toJS()).toEqual(response);
      expect(isSuccess).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(item),
        );
      }
    });

    it(`Undefined id does not fetch`, async () => {
      const hook = () => hooks.useChildren(undefined);
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toBeFalsy();
      }
    });

    it(`enabled=false does not fetch`, async () => {
      const hook = () => hooks.useChildren(id, { enabled: false });
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toBeFalsy();
      }
    });

    it(`ordered=false fetch children`, async () => {
      const unorderedRoute = `/${buildGetChildrenRoute(id, false)}`;
      const hook = () => hooks.useChildren(id, { ordered: false });
      const endpoints = [{ route: unorderedRoute, response }];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(isSuccess).toBeTruthy();
      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(item),
        );
      }
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route: `/${buildGetChildrenRoute(id, true)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        endpoints,
        hook: () => hooks.useChildren(id),
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(buildItemChildrenKey(id))).toBeFalsy();
    });
  });

  describe('useItemsChildren', () => {
    const ids = ['item-id-1', 'item-id-2'];
    const response = ITEMS;
    const key = buildItemsChildrenKey(ids);

    it(`Receive children of item by id`, async () => {
      const hook = () => hooks.useItemsChildren(ids);
      const endpoints = ids.map((id) => ({
        route: `/${buildGetChildrenRoute(id, true)}`,
        response,
      }));
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(isSuccess).toBeTruthy();
      for (const item of data as List<Item>[]) {
        expect(item).toEqual(List(response));
      }

      // verify cache keys
      for (const item of queryClient.getQueryData(key) as List<Item>[]) {
        expect(item).toEqual(List(response));
      }
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(item),
        );
      }
    });

    it(`Unauthorized`, async () => {
      const endpoints = ids.map((id) => ({
        route: `/${buildGetChildrenRoute(id, true)}`,
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
      }));

      const { data, isError } = await mockHook({
        endpoints,
        hook: () => hooks.useItemsChildren(ids),
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(buildItemsChildrenKey(ids))).toBeFalsy();
    });
  });

  describe('useParents', () => {
    const childItem: Item = {
      id: 'child-item-id',
      path: [...ITEMS.map(({ id }) => id), 'child_item_id'].join('.'),
      name: 'child-item-id',
      type: 'folder',
      description: '',
      extra: {},
    };
    const response = ITEMS;
    it(`Receive parents of item by id`, async () => {
      const hook = () => hooks.useParents({ ...childItem, enabled: true });

      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      for (const i of response) {
        endpoints.push({ route: `/${buildGetItemRoute(i.id)}`, response: i });
      }
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toEqual(List(response));
      for (const i of response) {
        expect(queryClient.getQueryData(buildItemKey(i.id))).toEqual(Map(i));
      }
    });

    it(`enabled=false does not fetch parents`, async () => {
      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      for (const i of response) {
        endpoints.push({ route: `/${buildGetItemRoute(i.id)}`, response: i });
      }
      const { data, isFetched } = await mockHook({
        hook: () => hooks.useParents({ ...childItem, enabled: false }),
        endpoints,
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toBeFalsy();
      // verify cache keys
      for (const i of response) {
        expect(queryClient.getQueryData(buildItemKey(i.id))).toBeFalsy();
      }
    });

    it(`Unauthorized`, async () => {
      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      for (const i of response) {
        endpoints.push({
          route: `/${buildGetItemRoute(i.id)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }
      const { data, isError } = await mockHook({
        hook: () => hooks.useParents({ ...childItem, enabled: true }),
        endpoints,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toBeFalsy();
      // verify cache keys
      for (const i of response) {
        expect(queryClient.getQueryData(buildItemKey(i.id))).toBeFalsy();
      }
    });

    it(`Return an error if one item rejects`, async () => {
      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      for (const i of response.slice(1)) {
        endpoints.push({ route: `/${buildGetItemRoute(i.id)}`, response: i });
      }
      // error for one item
      endpoints.push({
        route: `/${buildGetItemRoute(response[0].id)}`,
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
      });

      const { data, isError } = await mockHook({
        hook: () => hooks.useParents({ ...childItem, enabled: true }),
        endpoints,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toBeFalsy();
      // verify cache keys
      for (const i of response) {
        expect(queryClient.getQueryData(buildItemKey(i.id))).toBeFalsy();
      }
    });
  });

  describe('useSharedItems', () => {
    const route = `/${SHARED_ITEM_WITH_ROUTE}`;
    const response = ITEMS;
    const hook = () => hooks.useSharedItems();
    it(`Receive shared items`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(SHARED_ITEMS_KEY)).toEqual(
        List(response),
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
        endpoints,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(SHARED_ITEMS_KEY)).toBeFalsy();
    });
  });

  describe('useItem', () => {
    const response = ITEMS[0];
    const { id } = response;
    const route = `/${buildGetItemRoute(id)}`;
    const hook = () => hooks.useItem(id);
    const key = buildItemKey(id);

    it(`Receive item by id`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });

    it(`Undefined id does not fetch`, async () => {
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.useItem(undefined),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
        {
          route: `/${buildGetPublicItemRoute(id)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Successfully fallback to public`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
        {
          route: `/${buildGetPublicItemRoute(id)}`,
          response,
        },
      ];
      const { data, isSuccess } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(isSuccess).toBeTruthy();
      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });
  });

  describe('useItems', () => {
    it(`Receive one item`, async () => {
      const response = ITEMS[0];
      const { id } = response;
      // use single item call
      const route = `/${buildGetItemRoute(id)}`;
      const endpoints = [{ route, response }];
      const hook = () => hooks.useItems([id]);
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<Item>).toJS()).toEqual([response]);
      // verify cache keys
      const item = queryClient.getQueryData(buildItemKey(id)) as Record<Item>;
      expect(item.toJS()).toEqual(response);
      const items = queryClient.getQueryData(buildItemsKey([id])) as List<Item>;
      expect(items.toJS()).toEqual([response]);
    });

    it(`Receive two items`, async () => {
      const response = ITEMS;
      const ids = response.map(({ id }) => id);
      const hook = () => hooks.useItems(ids);
      const route = `/${buildGetItemsRoute(ids)}`;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildItemsKey(ids))).toEqual(data);
      for (const item of response) {
        const itemById = response.find(({ id }) => id === item.id) as Item;
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(itemById),
        );
      }
    });

    it(`Unauthorized`, async () => {
      const requestedItems = ITEMS;
      const ids = requestedItems.map(({ id }) => id);
      const hook = () => hooks.useItems(ids);
      const route = `/${buildGetItemsRoute(ids)}`;
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(buildItemsKey(ids))).toBeFalsy();
    });
  });

  describe('useItemLogin', () => {
    const response = ITEMS[0];
    const { id } = response;
    const route = `/${buildGetItemLoginRoute(id)}`;
    const hook = () => hooks.useItemLogin(id);
    const key = buildItemLoginKey(id);

    it(`Receive item login`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as Record<ItemLogin>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(Map(response));
    });

    it(`Undefined id does not fetch`, async () => {
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.useItemLogin(undefined),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
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
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useFileContent', () => {
    const response = FILE_RESPONSE;
    const { id } = ITEMS[0];
    const route = `/${buildDownloadFilesRoute(id)}`;
    const hook = () => hooks.useFileContent(id);
    const key = buildFileContentKey(id);

    it(`Receive file content`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it(`Undefined id does not fetch`, async () => {
      const endpoints = [{ route, response }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.useFileContent(undefined),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`enabled=false does not fetch file`, async () => {
      // build endpoint for each item
      const endpoints: Endpoint[] = [];
      const { data, isFetched } = await mockHook({
        hook: () => hooks.useFileContent(id, { enabled: false }),
        endpoints,
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
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
        endpoints,
        wrapper,
      });

      expect(isError).toBeTruthy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Successfully fallback to public`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
        {
          route: `/${buildPublicDownloadFilesRoute(id)}`,
          response,
        },
      ];
      const { data, isSuccess } = await mockHook({
        hook,
        endpoints,
        wrapper,
      });

      expect(isSuccess).toBeTruthy();
      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });
  });

  describe('useRecycledItems', () => {
    const route = `/${GET_RECYCLED_ITEMS_ROUTE}`;
    const hook = () => hooks.useRecycledItems();
    const recycleBinKey = RECYCLED_ITEMS_KEY;

    it(`Receive recycled items`, async () => {
      const response = ITEMS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect((data as Record<Item>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(recycleBinKey)).toEqual(List(response));
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(
          Map(item),
        );
      }
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
      expect(queryClient.getQueryData(recycleBinKey)).toBeFalsy();
    });
  });

  describe('usePublicItemsWithTag', () => {
    const response = ITEMS;
    const { id } = TAGS[0];
    const route = `/${buildGetPublicItemsWithTag({ tagId: id })}`;
    const hook = () => hooks.usePublicItemsWithTag(id);
    const key = buildPublicItemsWithTagKey(id);

    it(`Receive items`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<Item>).toJS()).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });

    it(`Undefined id does not fetch`, async () => {
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook: () => hooks.usePublicItemsWithTag(undefined),
        wrapper,
        enabled: false,
      });

      expect(data).toBeFalsy();
      expect(isFetched).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItemThumbnail', () => {
    const item = ITEMS[0];
    const key = buildItemThumbnailKey({ id: item.id });

    describe('Default', () => {
      const response = THUMBNAIL_BLOB_RESPONSE;
      const route = `/${buildDownloadItemThumbnailRoute({ id: item.id })}`;
      const hook = () => hooks.useItemThumbnail({ id: item.id });

      it(`Receive default thumbnail`, async () => {
        const endpoints = [
          {
            route,
            response,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          },
        ];
        const { data } = await mockHook({ endpoints, hook, wrapper });

        expect(data).toBeTruthy();
        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeTruthy();
      });

      it(`Receive large thumbnail`, async () => {
        const size = THUMBNAIL_SIZES.LARGE;
        const routeLarge = `/${buildDownloadItemThumbnailRoute({
          id: item.id,
          size,
        })}`;
        const hookLarge = () => hooks.useItemThumbnail({ id: item.id, size });
        const keyLarge = buildItemThumbnailKey({ id: item.id, size });

        const endpoints = [
          {
            route: routeLarge,
            response,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          },
        ];
        const { data } = await mockHook({
          endpoints,
          hook: hookLarge,
          wrapper,
        });

        expect(data).toBeTruthy();
        // verify cache keys
        expect(queryClient.getQueryData(keyLarge)).toBeTruthy();
      });

      it(`Undefined id does not fetch`, async () => {
        const endpoints = [
          {
            route,
            response,
          },
        ];
        const { data, isFetched } = await mockHook({
          endpoints,
          hook: () => hooks.useItemThumbnail({ id: undefined }),
          wrapper,
          enabled: false,
        });

        expect(data).toBeFalsy();
        expect(isFetched).toBeFalsy();
        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
      });

      it(`Does not fetch if item has no thumbnail`, async () => {
        const itemWithoutThumbnail = {
          ...item,
          settings: { hasThumbnail: false },
        };
        queryClient.setQueryData(
          buildItemKey(itemWithoutThumbnail.id),
          Map(itemWithoutThumbnail),
        );
        const endpoints = [
          {
            route,
            response,
          },
        ];
        const { data, isFetched } = await mockHook({
          endpoints,
          hook: () => hooks.useItemThumbnail({ id: itemWithoutThumbnail.id }),
          wrapper,
          enabled: false,
        });

        expect(data).toBeFalsy();
        expect(isFetched).toBeFalsy();
        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        const { data, isError } = await mockHook({ endpoints, hook, wrapper });

        expect(data).toBeFalsy();
        expect(isError).toBeTruthy();
        // verify cache keys
        expect(queryClient.getQueryData(key)).toBeFalsy();
      });
    });
  });
});
