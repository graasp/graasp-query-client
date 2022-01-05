/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { List } from 'immutable';
import { act } from 'react-test-renderer';
import Cookies from 'js-cookie';
import {
  ITEMS,
  ITEM_TAGS,
  MEMBER_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildDeleteItemTagRoute, buildPostItemTagRoute } from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemTagsKey, MUTATION_KEYS } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import { ItemTag } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_TAG, () => {
    const item = ITEMS[0];
    const itemId = item.id;
    const tagId = ITEM_TAGS[0].id;
    const creator = MEMBER_RESPONSE.id;
    const route = `/${buildPostItemTagRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_TAG);
    const itemTagKey = buildItemTagsKey(itemId);

    it('Post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
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
          id: itemId,
          tagId,
          itemPath: item.path,
          creator,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemTagRoutine.SUCCESS,
      });
    });

    it('Unauthorized to post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

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
        await mockedMutation.mutate({
          id: itemId,
          tagId,
          itemPath: item.path,
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

  describe(MUTATION_KEYS.DELETE_ITEM_TAG, () => {
    const item = ITEMS[0];
    const itemId = item.id;
    const tagId = ITEM_TAGS[0].id;
    const route = `/${buildDeleteItemTagRoute({ id: itemId, tagId })}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_TAG);
    const itemTagKey = buildItemTagsKey(itemId);

    it('Delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, List(ITEM_TAGS));

      const endpoints = [
        {
          response: {},
          method: REQUEST_METHODS.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId, tagId });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect((data?.data as List<ItemTag>)?.toJS()).toEqual(
        ITEM_TAGS.filter(({ id }) => id !== tagId),
      );
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemTagRoutine.SUCCESS,
      });
    });

    it('Unauthorized to delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, List(ITEM_TAGS));

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId, tagId });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect((data?.data as List<ItemTag>)?.toJS()).toEqual(ITEM_TAGS);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemTagRoutine.FAILURE,
        }),
      );
    });
  });
});
