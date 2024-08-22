import { FlagType, FolderItemFactory, HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ITEM_FLAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import { buildPostItemFlagRoute } from '../routes.js';
import { postItemFlagRoutine } from '../routines/itemFlag.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Flag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemFlag', () => {
    const flagType = FlagType.FalseInformation;
    const itemId = FolderItemFactory().id;
    const flagKey = itemKeys.single(itemId).flags;
    const route = `/${buildPostItemFlagRoute(itemId)}`;
    const mutation = mutations.usePostItemFlag;

    it('Post item flag', async () => {
      // set some starting data
      queryClient.setQueryData(flagKey, ITEM_FLAGS);

      const response = {};

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
        mockedMutation.mutate({ type: flagType, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(flagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemFlagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_FLAG },
      });
    });

    it('Unauthorized to post item flag', async () => {
      // set some starting data
      queryClient.setQueryData(flagKey, ITEM_FLAGS);

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
        mockedMutation.mutate({ type: flagType, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(flagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemFlagRoutine.FAILURE,
        }),
      );
    });
  });
});
