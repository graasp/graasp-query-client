import {
  AccountFactory,
  FolderItemFactory,
  HttpMethod,
  ItemVisibilityType,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ITEM_VISIBILITIES,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import {
  buildDeleteItemVisibilityRoute,
  buildPostItemVisibilityRoute,
} from '../routes.js';
import {
  deleteItemVisibilityRoutine,
  postItemVisibilityRoutine,
} from '../routines/itemVisibility.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Visibility Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemVisibility', () => {
    const itemId = FolderItemFactory().id;
    const creator = AccountFactory().id;
    const visibilityType = ItemVisibilityType.Hidden;
    const route = `/${buildPostItemVisibilityRoute({ itemId, type: visibilityType })}`;
    const mutation = mutations.usePostItemVisibility;
    const itemVisibilityKey = itemKeys.single(itemId).visibilities;

    it('Post item visibility', async () => {
      queryClient.setQueryData(itemVisibilityKey, ITEM_VISIBILITIES);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({
          itemId,
          type: visibilityType,
          creator,
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(itemVisibilityKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemVisibilityRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_VISIBILITY },
      });
    });

    it('Unauthorized to post item visibility', async () => {
      queryClient.setQueryData(itemVisibilityKey, ITEM_VISIBILITIES);

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
        mockedMutation.mutate({
          itemId,
          type: visibilityType,
          creator,
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(itemVisibilityKey)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemVisibilityRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemVisibility', () => {
    const visibility = ITEM_VISIBILITIES[0];
    const { item, type: visibilityType } = visibility;
    const itemId = item.id;
    const route = `/${buildDeleteItemVisibilityRoute({ itemId, type: visibilityType })}`;
    const mutation = mutations.useDeleteItemVisibility;
    const itemVisibilityKey = itemKeys.single(itemId).visibilities;

    it('Delete item visibility', async () => {
      queryClient.setQueryData(itemVisibilityKey, ITEM_VISIBILITIES);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({ itemId, type: visibilityType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemVisibilityKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data).toMatchObject(
        ITEM_VISIBILITIES.filter(({ type }) => type !== visibilityType),
      );
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemVisibilityRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_VISIBILITY },
      });
    });

    it('Unauthorized to delete item visibility', async () => {
      queryClient.setQueryData(itemVisibilityKey, ITEM_VISIBILITIES);

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
        mockedMutation.mutate({ itemId, type: visibilityType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemVisibilityKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data).toEqual(ITEM_VISIBILITIES);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemVisibilityRoutine.FAILURE,
        }),
      );
    });
  });
});
