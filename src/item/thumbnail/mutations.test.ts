import { FolderItemFactory, HttpMethod, ThumbnailSize } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';

import {
  THUMBNAIL_BLOB_RESPONSE,
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

describe('useUploadItemThumbnailFeedback', () => {
  const mutation = mutations.useUploadItemThumbnailFeedback;
  const { id } = FolderItemFactory();

  it('Upload thumbnail', async () => {
    const route = `/${buildUploadItemThumbnailRoute(id)}`;

    // set data in cache
    Object.values(ThumbnailSize).forEach((size) => {
      const key = itemKeys.single(id).thumbnail({ size });
      queryClient.setQueryData(key, Math.random());
    });

    const response = THUMBNAIL_BLOB_RESPONSE;

    const endpoints = [
      {
        response,
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
      mockedMutation.mutate({ id, data: [id] });
      await waitForMutation();
    });

    // verify item is still available
    // in real cases, the path should be different
    for (const size of Object.values(ThumbnailSize)) {
      const key = itemKeys.single(id).thumbnail({ size });
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
    }
    expect(mockedNotifier).toHaveBeenCalledWith({
      type: uploadItemThumbnailRoutine.SUCCESS,
      payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
    });
  });

  it('Unauthorized to upload a thumbnail', async () => {
    const route = `/${buildUploadItemThumbnailRoute(id)}`;
    // set data in cache
    Object.values(ThumbnailSize).forEach((size) => {
      const key = itemKeys.single(id).thumbnail({ size });
      queryClient.setQueryData(key, Math.random());
    });

    const response = UNAUTHORIZED_RESPONSE;

    const endpoints = [
      {
        response,
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

    const error = new Error(`${StatusCodes.UNAUTHORIZED}`);

    await act(async () => {
      mockedMutation.mutate({
        id,
        error,
      });
      await waitForMutation();
    });

    // verify item is still available
    // in real cases, the path should be different
    for (const size of Object.values(ThumbnailSize)) {
      const key = itemKeys.single(id).thumbnail({ size });
      const state = queryClient.getQueryState(key);
      expect(state?.isInvalidated).toBeTruthy();
    }
    expect(mockedNotifier).toHaveBeenCalledWith({
      type: uploadItemThumbnailRoutine.FAILURE,
      payload: {
        error,
      },
    });
  });
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
