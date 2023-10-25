import { ChatMention, HttpMethod, Member, MentionStatus } from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  MEMBER_RESPONSE,
  MENTION_IDS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildChatMention,
  buildMemberMentions,
  buildMentionResponse,
} from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  GET_CURRENT_MEMBER_ROUTE,
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildPatchMentionRoute,
} from '../api/routes';
import { buildMentionKey } from '../config/keys';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Mention Mutations', () => {
  const mentionId = MENTION_IDS[0];
  const member = MEMBER_RESPONSE as Member;
  const memberId = member.id;
  const currentMemberRoute = `/${GET_CURRENT_MEMBER_ROUTE}`;
  const key = buildMentionKey();
  const MENTIONS = buildMemberMentions();

  describe('enableWebsockets = false', () => {
    const mockedNotifier = jest.fn();
    const { wrapper, queryClient, mutations } = setUpTest({
      notifier: mockedNotifier,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe('usePatchMention', () => {
      const route = `/${buildPatchMentionRoute(mentionId)}`;
      const mutation = mutations.usePatchMention;

      it(`Patch mention status`, async () => {
        const endpoints = [
          // mock currentMember route for the Mention hook to work
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: buildMentionResponse(
              MENTIONS[0] as ChatMention,
              HttpMethod.PATCH,
              MentionStatus.Read,
            ),
            method: HttpMethod.PATCH,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, MENTIONS);

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            id: mentionId,
            status: MentionStatus.Read,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: HttpMethod.PATCH,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            id: mentionId,
            status: MentionStatus.Read,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: patchMentionRoutine.FAILURE,
          }),
        );
      });
    });

    describe('useDeleteMention', () => {
      const route = `/${buildDeleteMentionRoute(mentionId)}`;
      const mutation = mutations.useDeleteMention;

      it(`Delete member mention`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.DELETE,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(mentionId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: HttpMethod.DELETE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(mentionId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: deleteMentionRoutine.FAILURE,
          }),
        );
      });
    });

    describe('useClearMentions', () => {
      const route = `/${buildClearMentionsRoute()}`;
      const mutation = mutations.useClearMentions;

      it(`Clear Member Mentions`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.DELETE,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate();
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: HttpMethod.DELETE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate();
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
        expect(mockedNotifier).toHaveBeenCalledWith(
          expect.objectContaining({
            type: clearMentionsRoutine.FAILURE,
          }),
        );
      });
    });
  });

  describe('enableWebsockets = true', () => {
    const { wrapper, queryClient, mutations } = setUpTest({
      enableWebsocket: true,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe('usePatchMention', () => {
      const route = `/${buildPatchMentionRoute(mentionId)}`;
      const mutation = mutations.usePatchMention;
      it(`Patch mention status`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.PATCH,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            id: mentionId,
            status: MentionStatus.Read,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });

    describe('useDeleteMention', () => {
      const route = `/${buildDeleteMentionRoute(mentionId)}`;
      const mutation = mutations.useDeleteMention;
      it(`Delete member mention`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.DELETE,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate(mentionId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });

    describe('useClearMentions', () => {
      const route = `/${buildClearMentionsRoute()}`;
      const mutation = mutations.useClearMentions;
      it(`Clear chat`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.DELETE,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ member }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate();
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });
  });
});
