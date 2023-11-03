import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';

import {
  ITEMS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildExportActions, buildPostItemAction } from '../api/routes';
import { exportActionsRoutine, postActionRoutine } from '../routines';

describe('Action Mutations', () => {
  const itemId = ITEMS[0].id;

  const mockedNotifier = jest.fn();
  const { wrapper, queryClient, mutations } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useExportActions', () => {
    const route = `/${buildExportActions(itemId)}`;
    const mutation = mutations.useExportActions;

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

  describe('usePostItemAction', () => {
    const route = `/${buildPostItemAction(itemId)}`;
    const mutation = mutations.usePostItemAction;
    const payload = { type: 'hello', extra: { to: 'me' } };

    it(`Post Item Action`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.POST },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId, payload });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postActionRoutine.SUCCESS,
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
        await mockedMutation.mutate({ itemId, payload });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postActionRoutine.FAILURE,
        }),
      );
    });
  });
});
