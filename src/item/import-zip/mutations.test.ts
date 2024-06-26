import { HttpMethod } from '@graasp/sdk';
import { REQUEST_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { buildImportZipRoute } from '../../routes.js';
import { importZipRoutine } from '../routines.js';

const mockedNotifier = vi.fn();
const { wrapper, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('useImportZip', () => {
  const item = {
    name: 'new item',
    id: 'someid',
  };
  const file = new Blob();
  const mutation = mutations.useImportZip;
  const response = 'OK';

  it('Import zip file', async () => {
    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildImportZipRoute()}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        file,
      });
      await waitForMutation();
    });

    expect(mockedNotifier).toHaveBeenCalledWith({
      type: importZipRoutine.SUCCESS,
      payload: { message: REQUEST_MESSAGES.IMPORT_ZIP },
    });
  });

  it('Import a zip file in item', async () => {
    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildImportZipRoute(item.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        file,
        id: item.id,
      });
      await waitForMutation();
    });

    expect(mockedNotifier).toHaveBeenCalledWith({
      type: importZipRoutine.SUCCESS,
      payload: { message: REQUEST_MESSAGES.IMPORT_ZIP },
    });
  });

  it('Unauthorized', async () => {
    const route = `/${buildImportZipRoute()}`;

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
      mockedMutation.mutate({ file });
      await waitForMutation();
    });

    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: importZipRoutine.FAILURE }),
    );
  });
});
