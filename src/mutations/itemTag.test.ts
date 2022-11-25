/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import { List } from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  ITEMS,
  ITEM_TAGS,
  MEMBER_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import {
  buildTitleFromMutationKey,
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../test/utils';
import { buildDeleteItemTagRoute, buildPostItemTagRoute } from '../api/routes';
import { MUTATION_KEYS, buildItemTagsKey } from '../config/keys';
import { deleteItemTagRoutine, postItemTagRoutine } from '../routines';
import { ItemTagRecord } from '../types';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tag Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(buildTitleFromMutationKey(MUTATION_KEYS.POST_ITEM_TAG), () => {
    const item = ITEMS.first()!;
    const itemId = item.id;
    const tagId = ITEM_TAGS.first()!.id;
    const creator = MEMBER_RESPONSE.id;
    const route = `/${buildPostItemTagRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.POST_ITEM_TAG);
    const itemTagKey = buildItemTagsKey(itemId);

    it('Post item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          id: itemId,
          tagId,
          itemPath: item.path,
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
          method: HttpMethod.POST,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({
          id: itemId,
          tagId,
          itemPath: item.path,
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

  describe(buildTitleFromMutationKey(MUTATION_KEYS.DELETE_ITEM_TAG), () => {
    const item = ITEMS.first()!;
    const itemId = item.id;
    const tagId = ITEM_TAGS.first()!.id;
    const route = `/${buildDeleteItemTagRoute({ id: itemId, tagId })}`;
    const mutation = () => useMutation(MUTATION_KEYS.DELETE_ITEM_TAG);
    const itemTagKey = buildItemTagsKey(itemId);

    it('Delete item tag', async () => {
      queryClient.setQueryData(itemTagKey, ITEM_TAGS);

      const endpoints = [
        {
          response: {},
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId, tagId });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data as List<ItemTagRecord>).toEqualImmutable(
        ITEM_TAGS.filter(({ id }) => id !== tagId),
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
          method: HttpMethod.DELETE,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId, tagId });
        await waitForMutation();
      });

      const data = queryClient.getQueryState(itemTagKey);
      expect(data?.isInvalidated).toBeTruthy();
      expect(data?.data as List<ItemTagRecord>).toEqualImmutable(ITEM_TAGS);
      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteItemTagRoutine.FAILURE,
        }),
      );
    });
  });
});
