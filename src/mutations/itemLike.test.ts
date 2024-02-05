import { FolderItemFactory, HttpMethod, MemberFactory } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { ITEM_LIKES, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildDeleteItemLikeRoute,
  buildPostItemLikeRoute,
} from '../api/routes';
import { memberKeys } from '../config/keys';
import { deleteItemLikeRoutine, postItemLikeRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Like Mutations', () => {
  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemLike', () => {
    const itemId = FolderItemFactory().id;
    const memberId = MemberFactory().id;
    const likedItemsKey = memberKeys.single(memberId).likedItems;
    const route = `/${buildPostItemLikeRoute(itemId)}`;
    const mutation = mutations.usePostItemLike;

    it('Post item like', async () => {
      queryClient.setQueryData(likedItemsKey, ITEM_LIKES);

      const response = ITEM_LIKES.at(1);

      const endpoints = [
        {
          response,
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
        await mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(likedItemsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemLikeRoutine.SUCCESS,
      });
    });

    it('Unauthorized to post item like', async () => {
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
        await mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemLikeRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemLike', () => {
    const itemId = FolderItemFactory().id;
    const memberId = MemberFactory().id;
    const likedItemsKey = memberKeys.single(memberId).likedItems;
    const route = `/${buildDeleteItemLikeRoute(itemId)}`;
    const mutation = mutations.useDeleteItemLike;

    it('Delete item like', async () => {
      queryClient.setQueryData(likedItemsKey, ITEM_LIKES);

      const response = ITEM_LIKES.at(1);

      const endpoints = [
        {
          response,
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
        await mockedMutation.mutate({ itemId, memberId });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(likedItemsKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemLikeRoutine.SUCCESS,
      });
    });

    it('Unauthorized to delete item like', async () => {
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
        await mockedMutation.mutate({ itemId, memberId });
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
