/* eslint-disable import/no-extraneous-dependencies */
import { HttpMethod } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import {
  ITEMS,
  ITEM_PUBLISHED_DATA,
  MEMBERS_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildItemPublishRoute } from '../api/routes';
import {
  CURRENT_MEMBER_KEY,
  buildItemPublishedInformationKey,
  buildPublishedItemsForMemberKey,
  buildPublishedItemsKey,
} from '../config/keys';
import { publishItemRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Publish Item', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('usePublishItem', () => {
    const item = ITEMS.first()!;
    const itemId = item.id;
    const currentMember = MEMBERS_RESPONSE.first();
    const currentMemberId = currentMember!.id;
    const notification = true;
    const mutation = mutations.usePublishItem;

    it('Publish Item with notification', async () => {
      const route = `/${buildItemPublishRoute(itemId, notification)}`;
      queryClient.setQueryData(
        buildItemPublishedInformationKey(itemId),
        ITEM_PUBLISHED_DATA,
      );
      queryClient.setQueryData(
        buildPublishedItemsForMemberKey(currentMemberId),
        ITEMS,
      );
      queryClient.setQueryData(buildPublishedItemsKey(), ITEMS);
      queryClient.setQueryData(CURRENT_MEMBER_KEY, currentMember);

      const endpoints = [
        {
          response: ITEM_PUBLISHED_DATA,
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
          notification,
        });
        await waitForMutation();
      });

      expect(route.includes('notification'));

      expect(
        queryClient.getQueryState(buildItemPublishedInformationKey(itemId))
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(
          buildPublishedItemsForMemberKey(currentMemberId),
        )?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(buildPublishedItemsKey())?.isInvalidated,
      ).toBeTruthy();

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: publishItemRoutine.SUCCESS,
      });
    });

    it('Publish Item without notification', async () => {
      const route = `/${buildItemPublishRoute(itemId)}`;
      queryClient.setQueryData(
        buildItemPublishedInformationKey(itemId),
        ITEM_PUBLISHED_DATA,
      );
      queryClient.setQueryData(
        buildPublishedItemsForMemberKey(currentMemberId),
        ITEMS,
      );
      queryClient.setQueryData(buildPublishedItemsKey(), ITEMS);
      queryClient.setQueryData(CURRENT_MEMBER_KEY, currentMember);

      const endpoints = [
        {
          response: ITEM_PUBLISHED_DATA,
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
          notification: false,
        });
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(buildItemPublishedInformationKey(itemId))
          ?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(
          buildPublishedItemsForMemberKey(currentMemberId),
        )?.isInvalidated,
      ).toBeTruthy();
      expect(
        queryClient.getQueryState(buildPublishedItemsKey())?.isInvalidated,
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
