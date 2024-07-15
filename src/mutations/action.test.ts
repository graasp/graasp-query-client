import {
  ExportActionsFormatting,
  FolderItemFactory,
  HttpMethod,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OK_RESPONSE, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildExportActions, buildPostItemAction } from '../routes.js';
import { exportActionsRoutine, postActionRoutine } from '../routines/index.js';

describe('Action Mutations', () => {
  const itemId = FolderItemFactory().id;

  const mockedNotifier = vi.fn();
  const { wrapper, queryClient, mutations } = setUpTest({
    notifier: mockedNotifier,
  });

  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useExportActions', () => {
    const route = `/${buildExportActions(itemId, ExportActionsFormatting.CSV)}`;
    const mutation = mutations.useExportActions;

    it(`Export Actions`, async () => {
      const endpoints = [
        { route, response: OK_RESPONSE, method: HttpMethod.Post },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, format: ExportActionsFormatting.CSV });
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
          method: HttpMethod.Post,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, format: ExportActionsFormatting.CSV });
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
        { route, response: OK_RESPONSE, method: HttpMethod.Post },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, payload });
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
          method: HttpMethod.Post,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ itemId, payload });
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
