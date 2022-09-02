/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod } from '@graasp/sdk';

import {
  ITEMS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildExportActions } from '../api/routes';
import { MUTATION_KEYS } from '../config/keys';
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
        { route, response: OK_RESPONSE, method: HttpMethod.POST },
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
          method: HttpMethod.POST,
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
