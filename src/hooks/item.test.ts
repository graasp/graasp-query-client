import {
  DiscriminatedItem,
  FolderItemFactory,
  FolderItemType,
  ItemType,
  LocalFileItemFactory,
  MAX_TARGETS_FOR_READ_REQUEST,
  ThumbnailSize,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  FILE_RESPONSE,
  THUMBNAIL_BLOB_RESPONSE,
  THUMBNAIL_URL_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
  generateFolders,
} from '../../test/constants';
import {
  Endpoint,
  mockHook,
  setUpTest,
  splitEndpointByIds,
} from '../../test/utils';
import {
  GET_OWN_ITEMS_ROUTE,
  SHARED_ITEM_WITH_ROUTE,
  buildDownloadFilesRoute,
  buildDownloadItemThumbnailRoute,
  buildGetAccessibleItems,
  buildGetChildrenRoute,
  buildGetItemParents,
  buildGetItemRoute,
  buildGetItemsRoute,
} from '../api/routes';
import {
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  accessibleItemsKeys,
  buildFileContentKey,
  buildItemChildrenKey,
  buildItemKey,
  buildItemParentsKey,
  buildItemThumbnailKey,
  buildItemsKey,
} from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Items Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useOwnItems', () => {
    const route = `/${GET_OWN_ITEMS_ROUTE}`;
    const hook = () => hooks.useOwnItems();

    it(`Receive own items`, async () => {
      const response = [
        FolderItemFactory(),
        FolderItemFactory(),
        FolderItemFactory(),
      ];
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(
        queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY),
      ).toEqual(response);
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(item);
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
    const params = { ordered: true };
    const route = `/${buildGetChildrenRoute(id, params)}`;
    const response = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const key = buildItemChildrenKey(id);

    it(`Receive children of item by id`, async () => {
      const hook = () => hooks.useChildren(id);
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data).toMatchObject(response);
      expect(isSuccess).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toEqual(item);
      }
    });

    it(`Route constructed correctly for children folders`, async () => {
      const typesParams = { types: [ItemType.FOLDER] };
      const url = `/${buildGetChildrenRoute(id, typesParams)}`;
      const urlObject = new URL(url, 'https://no-existing-url.tmp');
      const queryParams = urlObject.searchParams;
      const typesValue = queryParams.get('types');

      expect(typesValue).toEqual(ItemType.FOLDER);
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
      const hook = () => hooks.useChildren(id, {}, { enabled: false });
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
      const unorderedRoute = `/${buildGetChildrenRoute(id, {
        ordered: false,
      })}`;
      const hook = () => hooks.useChildren(id, { ordered: false });
      const endpoints = [{ route: unorderedRoute, response }];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(isSuccess).toBeTruthy();
      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
      for (const item of response) {
        expect(queryClient.getQueryData(buildItemKey(item.id))).toMatchObject(
          item,
        );
      }
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route: `/${buildGetChildrenRoute(id, { ordered: true })}`,
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

  describe('useParents', () => {
    const response = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const childItem: FolderItemType = FolderItemFactory({
      id: 'child-item-id',
      path: [...response.map(({ id }) => id), 'child_item_id'].join('.'),
    });
    it(`Receive parents of item by id`, async () => {
      const hook = () => hooks.useParents({ id: childItem.id, enabled: true });

      // build endpoint for each item
      const endpoints = [
        {
          route: `/${buildGetItemParents(childItem.id)}`,
          response,
        },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toMatchObject(response);
      for (const i of response) {
        expect(queryClient.getQueryData(buildItemKey(i.id))).toMatchObject(i);
      }
    });

    it(`enabled=false does not fetch parents`, async () => {
      // build endpoint for each item
      const endpoints = [
        {
          route: `/${buildGetItemParents(childItem.id)}`,
          response,
        },
      ];
      const { data, isFetched } = await mockHook({
        hook: () => hooks.useParents({ id: childItem.id, enabled: false }),
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

    it(`providing path can deduce empty array`, async () => {
      const { data, isFetched } = await mockHook({
        hook: () => hooks.useParents({ id: childItem.id, path: 'some-id' }),
        endpoints: [],
        wrapper,
      });

      expect(data).toHaveLength(0);
      expect(isFetched).toBeTruthy();
      expect(
        queryClient.getQueryData(buildItemParentsKey(childItem.id)),
      ).toHaveLength(0);
    });

    it(`Unauthorized`, async () => {
      // build endpoint for each item
      const endpoints = [
        {
          route: `/${buildGetItemParents(childItem.id)}`,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook: () => hooks.useParents({ id: childItem.id, enabled: true }),
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
    const response = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const hook = () => hooks.useSharedItems();
    it(`Receive shared items`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData(SHARED_ITEMS_KEY)).toMatchObject(
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
        endpoints,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(SHARED_ITEMS_KEY)).toBeFalsy();
    });
  });

  describe('useAccessibleItems', () => {
    const params = {};
    const pagination = {};
    const route = `/${buildGetAccessibleItems(params, pagination)}`;
    const items = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    const response = { data: items, totalCount: items.length };
    const hook = () => hooks.useAccessibleItems();
    const key = accessibleItemsKeys.singlePage(params, pagination);

    it(`Receive accessible items`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
    });

    it(`Route constrcuted correctly for accessible folders`, async () => {
      const typesParams = { types: [ItemType.FOLDER] };
      const url = `/${buildGetAccessibleItems(typesParams, {})}`;
      const urlObject = new URL(url, 'https://no-existing-url.tmp');
      const queryParams = urlObject.searchParams;
      const typesValue = queryParams.get('types');

      expect(typesValue).toEqual(ItemType.FOLDER);
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
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useItem', () => {
    const response = FolderItemFactory();
    const { id } = response;
    const route = `/${buildGetItemRoute(id)}`;
    const hook = () => hooks.useItem(id);
    const key = buildItemKey(id);

    it(`Receive item by id`, async () => {
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);
      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
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

  describe('useItems', () => {
    const dataItems = [
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
      FolderItemFactory(),
    ];
    it(`Receive one item`, async () => {
      const oneItem = FolderItemFactory();
      const { id } = dataItems[0];
      const response = buildResultOfData([oneItem]);
      // use single item call
      const route = `/${buildGetItemsRoute([id])}`;
      const endpoints = [{ route, response }];
      const hook = () => hooks.useItems([id]);
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
      // verify cache keys
      const item = queryClient.getQueryData<DiscriminatedItem>(
        buildItemKey(id),
      );
      expect(item).toEqual(response.data[id]);
      const items = queryClient.getQueryData<DiscriminatedItem[]>(
        buildItemsKey([id]),
      );
      expect(items).toEqual(response);
    });

    it(`Receive two items`, async () => {
      const items = dataItems.slice(0, 2);
      const response = buildResultOfData(items);
      const ids: string[] = items.map(({ id }) => id);
      const hook = () => hooks.useItems(ids);
      const route = `/${buildGetItemsRoute(ids)}`;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildItemsKey(ids))).toMatchObject(data!);
      for (const item of items) {
        const itemById = items.find(({ id }) => id === item.id);
        expect(queryClient.getQueryData(buildItemKey(item.id))).toMatchObject(
          itemById!,
        );
      }
    });

    it(`Receive many items`, async () => {
      const items = generateFolders(MAX_TARGETS_FOR_READ_REQUEST + 1);
      const response = buildResultOfData(items);
      const ids: string[] = items.map(({ id }) => id);
      const hook = () => hooks.useItems(ids);
      const endpoints = splitEndpointByIds(
        ids,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetItemsRoute(chunk)}`,
        items,
      );
      const { data } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);
      // verify cache keys
      expect(queryClient.getQueryData(buildItemsKey(ids))).toMatchObject(data!);
      for (const item of items) {
        const itemById = items.find(({ id }) => id === item.id);
        expect(queryClient.getQueryData(buildItemKey(item.id))).toMatchObject(
          itemById!,
        );
      }
    });

    it(`Unauthorized`, async () => {
      const requestedItems = dataItems;
      const ids: string[] = requestedItems.map(({ id }) => id);
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

    // TODO: errors, contains errors, full errors
  });

  describe('useFileContent', () => {
    const response = FILE_RESPONSE;
    const { id } = LocalFileItemFactory();
    const route = `/${buildDownloadFilesRoute(id)}`;
    const hook = () => hooks.useFileContent(id);
    const key = buildFileContentKey({ id });

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
  });

  describe('useItemThumbnail', () => {
    const item = FolderItemFactory();
    const replyUrl = false;
    const key = buildItemThumbnailKey({ id: item.id, replyUrl });
    const response = THUMBNAIL_BLOB_RESPONSE;
    const route = `/${buildDownloadItemThumbnailRoute({
      id: item.id,
      replyUrl,
    })}`;
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
      const size = ThumbnailSize.Large;
      const routeLarge = `/${buildDownloadItemThumbnailRoute({
        id: item.id,
        size,
        replyUrl,
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
        itemWithoutThumbnail,
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

  describe('useItemThumbnailUrl', () => {
    const item = FolderItemFactory();
    const replyUrl = true;
    const key = buildItemThumbnailKey({ id: item.id, replyUrl });
    const response = THUMBNAIL_URL_RESPONSE;
    const route = `/${buildDownloadItemThumbnailRoute({
      id: item.id,
      replyUrl,
    })}`;
    const hook = () => hooks.useItemThumbnailUrl({ id: item.id });

    it(`Receive default thumbnail`, async () => {
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeTruthy();
    });

    it(`Receive large thumbnail`, async () => {
      const size = ThumbnailSize.Large;
      const routeLarge = `/${buildDownloadItemThumbnailRoute({
        id: item.id,
        size,
        replyUrl,
      })}`;
      const hookLarge = () => hooks.useItemThumbnailUrl({ id: item.id, size });
      const keyLarge = buildItemThumbnailKey({ id: item.id, size, replyUrl });

      const endpoints = [
        {
          route: routeLarge,
          response,
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
        itemWithoutThumbnail,
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
