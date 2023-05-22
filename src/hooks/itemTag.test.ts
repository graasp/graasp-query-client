import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { Item, ItemTag, ItemTagType, Member, convertJs } from '@graasp/sdk';

import {
  ITEMS,
  ITEM_TAGS,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetItemTagsRoute, buildGetItemsTagsRoute } from '../api/routes';
import { itemTagsKeys } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tags Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemTags', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildGetItemTagsRoute(itemId)}`;
    const key = itemTagsKeys.singleId(itemId);

    const hook = () => hooks.useItemTags(itemId);

    it(`Receive tags of given item`, async () => {
      const response = ITEM_TAGS;
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqualImmutable(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(response);
      expect(isSuccess).toBeTruthy();
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

  describe('useItemsTags', () => {
    const itemsIds = ITEMS.map(({ id }) => id).toArray();
    const route = `/${buildGetItemsTagsRoute(itemsIds)}`;
    const keys = itemsIds.map((itemId) => itemTagsKeys.singleId(itemId));
    const tags = itemsIds.map((id) => [
      {
        id: 'some id',
        createdAt: new Date(),
        creator: {} as Member,
        item: { id } as Item,
        type: ItemTagType.HIDDEN,
      },
    ]);

    const hook = () => hooks.useItemsTags(itemsIds);

    it(`Receive tags of given items`, async () => {
      const response = buildResultOfData(tags, (t: ItemTag[]) => t[0].item.id);
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqualImmutable(convertJs(response));

      // verify cache keys
      keys.forEach((key, idx) =>
        expect(queryClient.getQueryData(key)).toEqualImmutable(
          convertJs(tags[idx]),
        ),
      );

      expect(isSuccess).toBeTruthy();
    });

    it(`Receive tags and save only for non-error tags`, async () => {
      const errors = [
        {
          name: 'error',
          message: 'error',
          stack: '',
        },
      ];
      const response = buildResultOfData(
        tags,
        (t: ItemTag[]) => t[0].item.id,
        errors,
      );
      const idWithError = 'some-id';
      const routeWithError = `/${buildGetItemsTagsRoute([
        ...itemsIds,
        idWithError,
      ])}`;
      const hookWithError = () =>
        hooks.useItemsTags([...itemsIds, idWithError]);

      const endpoints = [{ route: routeWithError, response }];
      const { data, isSuccess } = await mockHook({
        endpoints,
        hook: hookWithError,
        wrapper,
      });

      expect(data).toEqualImmutable(convertJs(response));

      // verify cache keys
      keys.forEach((key, idx) =>
        expect(queryClient.getQueryData(key)).toEqualImmutable(
          convertJs(tags[idx]),
        ),
      );
      expect(
        queryClient.getQueryData(itemTagsKeys.singleId(idWithError)),
      ).toBeFalsy();

      expect(isSuccess).toBeTruthy();
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
      keys.forEach((key) => expect(queryClient.getQueryData(key)).toBeFalsy());
    });
  });
});
