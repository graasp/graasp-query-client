import { HttpMethod, ItemTagType } from '@graasp/sdk';
import { ItemTagRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import {
  ITEMS_JS,
  ITEM_TAGS,
  MEMBER_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildDeleteItemTagRoute, buildPostItemTagRoute } from '../api/routes';
import { itemTagsKeys } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemTag', () => {
    const itemId = ITEMS_JS[0].id;
    const creator = MEMBER_RESPONSE.id;
    const tagType = ItemTagType.Hidden;
    const route = `/${buildPostItemTagRoute({ itemId, type: tagType })}`;
    const mutation = mutations.usePostItemTag;
    const itemTagKey = itemTagsKeys.singleId(itemId);

    it('Post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
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
          itemId,
          type: tagType,
          creator,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemTagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_TAG },
      });
    });

    it('Unauthorized to post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

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
        await mockedMutation.mutate({
          itemId,
          type: tagType,
          creator,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemTagRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemTag', () => {
    const tag = ITEM_TAGS.first()!;
    const { item, type: tagType } = tag;
    const itemId = item.id;
    const route = `/${buildDeleteItemTagRoute({ itemId, type: tagType })}`;
    const mutation = mutations.useDeleteItemTag;
    const itemTagKey = itemTagsKeys.singleId(itemId);

    it('Delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
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
        await mockedMutation.mutate({ itemId, type: tagType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data as List<ItemTagRecord>).toEqualImmutable(
        ITEM_TAGS.filter(({ type }) => type !== tagType),
      );
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemTagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_TAG },
      });
    });

    it('Unauthorized to delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
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
        await mockedMutation.mutate({ itemId, type: tagType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data as List<ItemTagRecord>).toEqualImmutable(ITEM_TAGS);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemTagRoutine.FAILURE,
        }),
      );
    });
  });
});
