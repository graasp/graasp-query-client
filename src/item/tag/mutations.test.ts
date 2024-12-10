import { HttpMethod, TagCategory, TagFactory } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UNAUTHORIZED_RESPONSE } from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import { buildAddTagRoute, buildRemoveTagRoute } from './routes.js';
import { addTagRoutine, removeTagRoutine } from './routines.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

const TAGS = [TagFactory()];

describe('Tag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useAddTag', () => {
    const itemId = 'item-id';
    const route = `/${buildAddTagRoute({ itemId })}`;
    const mutation = mutations.useAddTag;
    const key = itemKeys.single(itemId).tags;

    it('Post tag', async () => {
      queryClient.setQueryData(key, TAGS);

      const endpoints = [
        {
          response: null,
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
        mockedMutation.mutate({
          itemId,
          tag: { name: 'name', category: TagCategory.Discipline },
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addTagRoutine.SUCCESS,
      });
    });
    it('Unauthorized to post tag', async () => {
      queryClient.setQueryData(key, TAGS);
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
        mockedMutation.mutate({
          itemId,
          tag: { name: 'name', category: TagCategory.Discipline },
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: addTagRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useRemoveTag', () => {
    const tagId = v4();
    const itemId = 'item-id';
    const route = `/${buildRemoveTagRoute({
      itemId,
      tagId,
    })}`;
    const mutation = mutations.useRemoveTag;
    const key = itemKeys.single(itemId).tags;

    it('Delete tag', async () => {
      queryClient.setQueryData(key, TAGS);

      const endpoints = [
        {
          response: { itemId: 'item-id' },
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
        mockedMutation.mutate({
          tagId,
          itemId,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: removeTagRoutine.SUCCESS,
        }),
      );
    });
    it('Unauthorized to delete tag', async () => {
      queryClient.setQueryData(key, TAGS);
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
        mockedMutation.mutate({ tagId, itemId });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: removeTagRoutine.FAILURE,
        }),
      );
    });
  });
});
