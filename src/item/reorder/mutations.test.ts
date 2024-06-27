import { FolderItemFactory, HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

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
import { buildReorderItemRoute } from '../routes.js';
import { reorderItemRoutine } from '../routines.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

const child = FolderItemFactory();
const response = [FolderItemFactory(), child];
const previousItemId = v4();

describe('useReorderItem', () => {
  const mutation = mutations.useReorderItem;
  const { id: parentItemId } = FolderItemFactory();

  it('Reorder item', async () => {
    const route = `/${buildReorderItemRoute({ id: child.id })}`;

    // set data in cache
    const key = itemKeys.single(parentItemId).allChildren;
    queryClient.setQueryData(key, [child, FolderItemFactory()]);

    const endpoints = [
      {
        response,
        method: HttpMethod.Patch,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({ id: child.id, parentItemId, previousItemId });
      await waitForMutation();
    });

    const state = queryClient.getQueryState(key);
    expect(state?.isInvalidated).toBeTruthy();

    expect(mockedNotifier).toHaveBeenCalledWith({
      type: reorderItemRoutine.SUCCESS,
      payload: { message: SUCCESS_MESSAGES.REORDER_ITEM },
    });
  });

  it('Unauthorized to upload a thumbnail', async () => {
    const route = `/${buildReorderItemRoute({ id: child.id })}`;

    // set data in cache
    const key = itemKeys.single(parentItemId).allChildren;
    queryClient.setQueryData(key, [child, FolderItemFactory()]);

    const endpoints = [
      {
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
        method: HttpMethod.Patch,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({ id: child.id, parentItemId, previousItemId });
      await waitForMutation();
    });

    const state = queryClient.getQueryState(key);
    expect(state?.isInvalidated).toBeTruthy();

    expect(mockedNotifier).toHaveBeenCalledWith({
      type: reorderItemRoutine.FAILURE,
      payload: expect.anything(),
    });
  });
});
