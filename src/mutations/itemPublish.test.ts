import {
  FolderItemFactory,
  HttpMethod,
  MemberFactory,
  PublicationStatus,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ITEM_PUBLISHED_DATA,
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { itemKeys, memberKeys } from '../keys.js';
import { buildItemPublishRoute } from '../routes.js';
import { publishItemRoutine } from '../routines/itemPublish.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Publish Item', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePublishItem', () => {
    const item = FolderItemFactory();
    const itemId = item.id;
    const currentMember = MemberFactory();
    const currentMemberId = currentMember!.id;
    const notification = true;
    const mutation = mutations.usePublishItem;
    const items = generateFolders();

    it('Publish Item with notification', async () => {
      const route = `/${buildItemPublishRoute(itemId, notification)}`;
      queryClient.setQueryData(
        itemKeys.single(itemId).publishedInformation,
        ITEM_PUBLISHED_DATA,
      );
      queryClient.setQueryData(
        itemKeys.published().byMember(currentMemberId),
        items,
      );
      queryClient.setQueryData(itemKeys.published().forCategories(), items);
      queryClient.setQueryData(memberKeys.current().content, currentMember);
      queryClient.setQueryData(
        itemKeys.single(itemId).publicationStatus,
        PublicationStatus.Unpublished,
      );

      const endpoints = [
        {
          response: ITEM_PUBLISHED_DATA,
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
          id: itemId,
          notification,
        });
        await waitForMutation();
      });

      expect(route.includes('notification'));

      expect(
        queryClient.getQueryState(itemKeys.single(itemId).publishedInformation)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(
          itemKeys.published().byMember(currentMemberId),
        )?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(itemKeys.published().forCategories())
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(itemKeys.single(itemId).publicationStatus)
          ?.isInvalidated,
      ).toBeTruthy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: publishItemRoutine.SUCCESS,
      });
    });

    it('Publish Item without notification', async () => {
      const route = `/${buildItemPublishRoute(itemId)}`;
      queryClient.setQueryData(
        itemKeys.single(itemId).publishedInformation,
        ITEM_PUBLISHED_DATA,
      );
      queryClient.setQueryData(
        itemKeys.published().byMember(currentMemberId),
        items,
      );
      queryClient.setQueryData(itemKeys.published().forCategories(), items);
      queryClient.setQueryData(memberKeys.current().content, currentMember);
      queryClient.setQueryData(
        itemKeys.single(itemId).publicationStatus,
        PublicationStatus.Unpublished,
      );

      const endpoints = [
        {
          response: ITEM_PUBLISHED_DATA,
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
          id: itemId,
          notification: false,
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(itemKeys.single(itemId).publishedInformation)
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(
          itemKeys.published().byMember(currentMemberId),
        )?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(itemKeys.published().forCategories())
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(itemKeys.single(itemId).publicationStatus)
          ?.isInvalidated,
      ).toBeTruthy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: publishItemRoutine.SUCCESS,
      });
    });

    it('Unauthorized to publish item', async () => {
      const route = `/${buildItemPublishRoute(itemId, notification)}`;

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
          id: itemId,
          notification,
        });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith(
        expect.objectContaining({
          type: publishItemRoutine.FAILURE,
        }),
      );
    });
  });
});
