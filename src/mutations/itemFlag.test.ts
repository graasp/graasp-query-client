/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';
import { FLAGS, ITEMS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildPostItemFlagRoute } from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemFlagsKey, MUTATION_KEYS } from '../config/keys';
import { postItemFlagRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Flag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_FLAG, () => {
    const flagId = FLAGS[0].id;
    const itemId = ITEMS[0].id;
    const flagKey = buildItemFlagsKey(itemId);
    const route = `/${buildPostItemFlagRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_FLAG);

    it('Post item flag', async () => {
      queryClient.setQueryData(flagKey, List(FLAGS));

      const response = {};

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
        await mockedMutation.mutate({ flagId, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(flagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemFlagRoutine.SUCCESS,
      });
    });

    it('Unauthorized to post item flag', async () => {
      queryClient.setQueryData(flagKey, List(FLAGS));
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
        await mockedMutation.mutate({ flagId, itemId });
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
