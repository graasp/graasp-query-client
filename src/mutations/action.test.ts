/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import { buildExportActions } from '../api/routes';
import { setUpTest, mockMutation, waitForMutation } from '../../test/utils';
import {
  ITEMS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import { exportActionsRoutine } from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Action Mutations', () => {
  const itemId = ITEMS.first()!.id;

  const mockedNotifier = jest.fn();
  const { wrapper, queryClient, useMutation } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.POST_ITEM_CHAT_MESSAGE, () => {
    const route = `/${buildExportActions(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.EXPORT_ACTIONS);

    it(`Export Actions`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: REQUEST_METHODS.POST },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: exportActionsRoutine.SUCCESS,
        }),
      );
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          method: REQUEST_METHODS.POST,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: exportActionsRoutine.FAILURE,
        }),
      );
    });
  });
});
