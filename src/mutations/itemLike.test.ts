import {
  AccountFactory,
  FolderItemFactory,
  HttpMethod,
  MemberFactory,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ITEM_LIKES, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { memberKeys } from '../keys.js';
import { buildDeleteItemLikeRoute, buildPostItemLikeRoute } from '../routes.js';
import {
  deleteItemLikeRoutine,
  postItemLikeRoutine,
} from '../routines/itemLike.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Like Mutations', () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemLike', () => {
    const itemId = FolderItemFactory().id;
    const memberId = AccountFactory().id;
    const likedItemsKey = memberKeys.single(memberId).likedItems;
    const route = `/${buildPostItemLikeRoute(itemId)}`;
    const mutation = mutations.usePostItemLike;

    it('Post item like', async () => {
      queryClient.setQueryData(likedItemsKey, ITEM_LIKES);

      const response = ITEM_LIKES.at(1);

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
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
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
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
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
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
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, memberId });
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
