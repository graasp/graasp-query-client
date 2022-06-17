/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { act } from 'react-test-renderer';
import { StatusCodes } from 'http-status-codes';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import { buildItemTagsKey, MUTATION_KEYS } from '../config/keys';
import {
  buildItemPublishRoute,
} from '../api/routes';
import { publishItemRoutine } from '../routines';
import { ITEMS, ITEM_TAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Publish Item', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.PUBLISH_ITEM, () => {
    const item = ITEMS[0];
    const itemId = item.id;
    const notification = true;
    const route = `/${buildItemPublishRoute(itemId, notification)}`;
    const mutation = () => useMutation(MUTATION_KEYS.PUBLISH_ITEM);
    const itemTagKey = buildItemTagsKey(itemId);

    it('Publish Item', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: { item },
          method: REQUEST_METHODS.GET,
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
          notification,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: publishItemRoutine.SUCCESS,
      });
    });

    it('Unauthorized to publish item', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: REQUEST_METHODS.GET,
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
          notification,
        });
        await waitForMutation();
      });

     // expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: publishItemRoutine.FAILURE,
        }),
      );
    });
  });
});
