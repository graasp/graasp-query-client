/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { act } from 'react-test-renderer';
import { List } from 'immutable';
import { StatusCodes } from 'http-status-codes';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import { buildValidationStatusKey, MUTATION_KEYS, VALIDATION_REVIEW_KEY } from '../config/keys';
import {
  buildPostValidationRoute,
  buildUpdateValidationReviewRoute,
} from '../api/routes';
import {
  postItemValidationRoutine,
  updateItemValidationReviewRoutine,
} from '../routines';
import { FULL_VALIDATION_RECORDS, ITEM_VALIDATION_STATUS, UNAUTHORIZED_RESPONSE } from '../../test/constants';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Validation Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_VALIDATION, () => {
    const itemId = 'item-id';
    const route = `/${buildPostValidationRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_VALIDATION);
    const key = buildValidationStatusKey(itemId);

    it('Post validation', async () => {
      queryClient.setQueryData(key, List([ITEM_VALIDATION_STATUS]));

      const endpoints = [
        {
          response: { itemId },
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
          itemId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemValidationRoutine.SUCCESS,
      });
    });
    it('Unauthorized to post item category', async () => {
      queryClient.setQueryData(key, List([ITEM_VALIDATION_STATUS]));
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
          type: postItemValidationRoutine.FAILURE,
        }),
      );
    });
  });

  describe(MUTATION_KEYS.UPDATE_VALIDATION_REVIEW, () => {
    const id = 'id1';
    const itemId = 'item-id';
    const status = 'accepted';
    const reason = '';
    const route = `/${buildUpdateValidationReviewRoute(id)}`;
    const mutation = () => useMutation(MUTATION_KEYS.UPDATE_VALIDATION_REVIEW);
    const statusKey = buildValidationStatusKey(itemId);
    const reviewsKey = VALIDATION_REVIEW_KEY;

    it('Update validation review record', async () => {
      queryClient.setQueryData(statusKey, ITEM_VALIDATION_STATUS);
      queryClient.setQueryData(reviewsKey, FULL_VALIDATION_RECORDS);

      const endpoints = [
        {
          // just for test, real response is of ItemValidationReview object
          response: { id: 'entry-id', itemId: 'item-id', statusId: 'status' },
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

    it('Unauthorized to update validation review', async () => {
      queryClient.setQueryData(statusKey, ITEM_VALIDATION_STATUS);
      queryClient.setQueryData(reviewsKey, FULL_VALIDATION_RECORDS);

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
          id,
          itemId,
          status,
          reason 
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
