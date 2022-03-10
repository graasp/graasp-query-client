/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';
import { ITEMS, ITEM_LIKES, LIKE_COUNT, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildDeleteItemLikeRoute, buildPostItemLikeRoute } from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import { buildGetLikeCountKey, buildGetLikedItemsKey, MUTATION_KEYS } from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Like Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_LIKE, () => {
    const itemId = ITEMS[0].id;
    const memberId = 'member-id';
    const likedItemsKey = buildGetLikedItemsKey(memberId);
    const likeCountKey = buildGetLikeCountKey(itemId);
    const route = `/${buildPostItemLikeRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_LIKE);

    it('Post item like', async () => {
      queryClient.setQueryData(likedItemsKey, List(ITEM_LIKES));
      queryClient.setQueryData(likeCountKey, LIKE_COUNT);

      const response = ITEM_LIKES[1];

      const endpoints = [
        {
          response,
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
        await mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(likedItemsKey)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(likeCountKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemLikeRoutine.SUCCESS,
      });
    });

    it('Unauthorized to post item like', async () => {
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
        await mockedMutation.mutate({ itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemLikeRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.DELETE_ITEM_LIKE, () => {
    const itemId = ITEMS[0].id;
    const memberId = 'member-id';
    const entryId = 'id';
    const likedItemsKey = buildGetLikedItemsKey(memberId);
    const likeCountKey = buildGetLikeCountKey(itemId);
    const route = `/${buildDeleteItemLikeRoute(entryId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_LIKE);

    it('Delete item like', async () => {
      queryClient.setQueryData(likedItemsKey, List(ITEM_LIKES));
      queryClient.setQueryData(likeCountKey, LIKE_COUNT);

      const response = ITEM_LIKES[1];

      const endpoints = [
        {
          response,
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
        await mockedMutation.mutate({ id: entryId, itemId, memberId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(likedItemsKey)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(likeCountKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemLikeRoutine.SUCCESS,
      });
    });

    it('Unauthorized to delete item like', async () => {
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
        await mockedMutation.mutate({ id: entryId, itemId, memberId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemLikeRoutine.FAILURE,
        }),
      );
    });
  });
});
