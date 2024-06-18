import {
  FolderItemFactory,
  HttpMethod,
  ItemTagType,
  MemberFactory,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { act } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ITEM_TAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys } from '../config/keys.js';
import { buildDeleteItemTagRoute, buildPostItemTagRoute } from '../routes.js';
import {
  deleteItemTagRoutine,
  postItemTagRoutine,
} from '../routines/itemTag.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Item Tag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePostItemTag', () => {
    const itemId = FolderItemFactory().id;
    const creator = MemberFactory().id;
    const tagType = ItemTagType.Hidden;
    const route = `/${buildPostItemTagRoute({ itemId, type: tagType })}`;
    const mutation = mutations.usePostItemTag;
    const itemTagKey = itemKeys.single(itemId).tags;

    it('Post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
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
          type: tagType,
          creator,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: postItemTagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.POST_ITEM_TAG },
      });
    });

    it('Unauthorized to post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

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
          type: tagType,
          creator,
        });
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemTagKey)?.isInvalidated).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: postItemTagRoutine.FAILURE,
        }),
      );
    });
  });

  describe('useDeleteItemTag', () => {
    const tag = ITEM_TAGS[0];
    const { item, type: tagType } = tag;
    const itemId = item.id;
    const route = `/${buildDeleteItemTagRoute({ itemId, type: tagType })}`;
    const mutation = mutations.useDeleteItemTag;
    const itemTagKey = itemKeys.single(itemId).tags;

    it('Delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
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
        mockedMutation.mutate({ itemId, type: tagType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data).toMatchObject(
        ITEM_TAGS.filter(({ type }) => type !== tagType),
      );
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: deleteItemTagRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEM_TAG },
      });
    });

    it('Unauthorized to delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
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
        mockedMutation.mutate({ itemId, type: tagType });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data).toEqual(ITEM_TAGS);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemTagRoutine.FAILURE,
        }),
      );
    });
  });
});
