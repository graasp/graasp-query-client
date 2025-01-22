import { HttpMethod, MAX_FILE_SIZE } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import {
  buildDeleteItemThumbnailRoute,
  buildUploadItemThumbnailRoute,
} from '../routes.js';
import {
  deleteItemThumbnailRoutine,
  uploadItemThumbnailRoutine,
} from '../routines.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('useDeleteItemThumbnail', () => {
  const mutation = mutations.useDeleteItemThumbnail;
  const items = generateFolders(1);

  const itemId = items[0].id;
  it('Delete item thumbnail', async () => {
    const route = `/${buildDeleteItemThumbnailRoute(itemId)}`;

    queryClient.setQueryData(itemKeys.single(itemId).allThumbnails, items[0]);

    const response = [StatusCodes.NO_CONTENT];

    const endpoints = [
      {
        response,
        method: HttpMethod.Delete,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate(itemId);
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(itemKeys.single(itemId).allThumbnails)
        ?.isInvalidated,
    ).toBeTruthy();

    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({
        type: deleteItemThumbnailRoutine.SUCCESS,
      }),
    );
  });
});

describe('useUploadItemThumbnail', () => {
  const item = {
    name: 'new item',
    id: 'someid',
  };
  const file = new Blob();
  const mutation = mutations.useUploadItemThumbnail;
  const response = 'OK';

  it('Upload a thumbnail', async () => {
    // set default data
    queryClient.setQueryData(itemKeys.single(item.id).content, item);
    queryClient.setQueryData(itemKeys.single(item.id).allThumbnails, []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadItemThumbnailRoute(item.id)}`,
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

    expect(
      queryClient.getQueryState(itemKeys.single(item.id).content)
        ?.isInvalidated,
    ).toBeTruthy();
    expect(
      queryClient.getQueryState(itemKeys.single(item.id).allThumbnails)
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Warning for big files', async () => {
    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadItemThumbnailRoute(item.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    // fake big file
    const bigFile = new Blob([]);
    Object.defineProperty(bigFile, 'size', { value: MAX_FILE_SIZE + 10 });

    await act(async () => {
      mockedMutation.mutate({
        file: bigFile,
        id: item.id,
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadItemThumbnailRoutine.FAILURE }),
    );
    // still pass and upload the rest of the files
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadItemThumbnailRoutine.SUCCESS }),
    );
  });

  it('Unauthorized', async () => {
    const route = `/${buildUploadItemThumbnailRoute(item.id)}`;
    // set default data
    queryClient.setQueryData(itemKeys.single(item.id).content, item);
    queryClient.setQueryData(itemKeys.single(item.id).allThumbnails, []);

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
      mockedMutation.mutate({ file, id: item.id });
      await waitForMutation();
    });

    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadItemThumbnailRoutine.FAILURE }),
    );

    expect(
      queryClient.getQueryState(itemKeys.single(item.id).content)
        ?.isInvalidated,
    ).toBeTruthy();
    expect(
      queryClient.getQueryState(itemKeys.single(item.id).allThumbnails)
        ?.isInvalidated,
    ).toBeTruthy();
  });
});
