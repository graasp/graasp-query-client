/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import nock from 'nock';
import { act } from 'react-test-renderer';
import { CUSTOMIZED_TAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildPostCustomizedTagsRoute } from '../api/routes';
import { REQUEST_METHODS } from '../api/utils';
import { buildCustomizedTagsKey, MUTATION_KEYS } from '../config/keys';
import { postCustomizedTagsRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});
describe('Item Flag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_CUSTOMIZED_TAGS, () => {
    const itemId = 'item-id';
    const key = buildCustomizedTagsKey(itemId);
    const route = `/${buildPostCustomizedTagsRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_CUSTOMIZED_TAGS);

    it('Post customized tags', async () => {
      queryClient.setQueryData(key, []);

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
        await mockedMutation.mutate({ itemId, values: CUSTOMIZED_TAGS });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postCustomizedTagsRoutine.SUCCESS,
      });
    });

    it('Unauthorized to post', async () => {
      queryClient.setQueryData(key, []);
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
        await mockedMutation.mutate({ itemId, values: CUSTOMIZED_TAGS });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postCustomizedTagsRoutine.FAILURE,
        payload: { error: new Error(ReasonPhrases.UNAUTHORIZED) },
      });
    });
  });
});
