import { H5PItemFactory, HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import { buildImportH5PRoute } from '../../routes.js';
import { importH5PRoutine } from '../routines.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('useImportH5P', () => {
  const item = {
    name: 'new item',
    id: 'someid',
  };
  const file = new Blob();
  const mutation = mutations.useImportH5P;
  const response = H5PItemFactory();

  it('Upload a h5p file', async () => {
    queryClient.setQueryData(itemKeys.allAccessible(), []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildImportH5PRoute()}`,
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

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: importH5PRoutine.SUCCESS }),
    );

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });

  it('Upload a h5p file in item', async () => {
    queryClient.setQueryData(itemKeys.single(item.id).allChildren, []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildImportH5PRoute(item.id)}`,
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

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: importH5PRoutine.SUCCESS }),
    );

    expect(
      queryClient.getQueryState(itemKeys.single(item.id).allChildren)
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Upload a h5p file in item with previous item id', async () => {
    const previousItemId = v4();
    queryClient.setQueryData(itemKeys.single(item.id).allChildren, []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildImportH5PRoute(item.id, previousItemId)}`,
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
        previousItemId,
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: importH5PRoutine.SUCCESS }),
    );

    expect(
      queryClient.getQueryState(itemKeys.single(item.id).allChildren)
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Unauthorized', async () => {
    const route = `/${buildImportH5PRoute()}`;
    // set default data
    queryClient.setQueryData(itemKeys.allAccessible(), []);

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
      expect.objectContaining({ type: importH5PRoutine.FAILURE }),
    );

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });
});
