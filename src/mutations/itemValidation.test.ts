/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod } from '@graasp/sdk';

import {
  FULL_VALIDATION_RECORDS,
  ITEM_VALIDATION_STATUS,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildPostItemValidationRoute,
  buildUpdateItemValidationReviewRoute,
} from '../api/routes';
import {
  ITEM_VALIDATION_REVIEWS_KEY,
  MUTATION_KEYS,
  buildItemValidationAndReviewKey,
} from '../config/keys';
import {
  postItemValidationRoutine,
  updateItemValidationReviewRoutine,
} from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Validation Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_VALIDATION, () => {
    const itemId = 'item-id';
    const route = `/${buildPostItemValidationRoute(itemId)}`;
    const mutation = mutations.usePostItemValidation;
    const key = buildItemValidationAndReviewKey(itemId);

    it('Post item validation', async () => {
      queryClient.setQueryData(key, List([ITEM_VALIDATION_STATUS]));

      const endpoints = [
        {
          response: { itemId },
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
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemValidationRoutine.SUCCESS,
      });
    });
    it('Unauthorized to post item validation', async () => {
      queryClient.setQueryData(key, List([ITEM_VALIDATION_STATUS]));
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
        await mockedMutation.mutate({ itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemValidationRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.UPDATE_ITEM_VALIDATION_REVIEW, () => {
    const id = 'id1';
    const itemId = 'item-id';
    const status = 'accepted';
    const reason = '';
    const route = `/${buildUpdateItemValidationReviewRoute(id)}`;
    const mutation = mutations.useUpdateItemValidationReview;
    const statusKey = buildItemValidationAndReviewKey(itemId);
    const reviewsKey = ITEM_VALIDATION_REVIEWS_KEY;

    it('Update item validation review record', async () => {
      queryClient.setQueryData(statusKey, ITEM_VALIDATION_STATUS);
      queryClient.setQueryData(reviewsKey, FULL_VALIDATION_RECORDS);

      const endpoints = [
        {
          // just for test, real response is of ItemValidationReview object
          response: { id: 'entry-id', itemId: 'item-id', statusId: 'status' },
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
          id,
          itemId,
          status,
          reason,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(statusKey)?.isInvalidated).toBeTruthy();
      expect(queryClient.getQueryState(reviewsKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updateItemValidationReviewRoutine.SUCCESS,
        }),
      );
    });

    it('Unauthorized to update item validation review', async () => {
      queryClient.setQueryData(statusKey, ITEM_VALIDATION_STATUS);
      queryClient.setQueryData(reviewsKey, FULL_VALIDATION_RECORDS);

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
          id,
          itemId,
          status,
          reason,
        });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: updateItemValidationReviewRoutine.FAILURE,
        }),
      );
    });
  });
});
