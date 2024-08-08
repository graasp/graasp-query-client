import {
  AccountFactory,
  HttpMethod,
  MemberFactory,
  MentionStatus,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { v4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
  buildChatMention,
  buildMemberMentions,
  buildMentionResponse,
} from '../../test/constants.js';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildMentionKey } from '../keys.js';
import { buildGetCurrentMemberRoute } from '../member/routes.js';
import {
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildPatchMentionRoute,
} from '../routes.js';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines/mentions.js';

describe('Mention Mutations', () => {
  const mentionId = v4();
  const account = AccountFactory();
  const memberId = account.id;
  const currentMemberRoute = `/${buildGetCurrentMemberRoute()}`;
  const key = buildMentionKey();
  const MENTIONS = buildMemberMentions();

  describe('enableWebsockets = false', () => {
    const mockedNotifier = vi.fn();
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
            response: MemberFactory(),
          },
          {
            route,
            response: buildMentionResponse(
              MENTIONS[0],
              HttpMethod.Patch,
              MentionStatus.Read,
            ),
            method: HttpMethod.Patch,
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
          mockedMutation.mutate({
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
            response: MemberFactory(),
          },
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: HttpMethod.Patch,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({
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
            response: MemberFactory(),
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.Delete,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate(mentionId);
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeTruthy();
      });

      it(`Unauthorized`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MemberFactory(),
          },
          {
            route,
            response: UNAUTHORIZED_RESPONSE,
            method: HttpMethod.Delete,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate(mentionId);
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
            response: MemberFactory(),
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.Delete,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate();
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
            method: HttpMethod.Delete,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate();
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
            response: MemberFactory(),
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.Patch,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate({
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
            response: MemberFactory(),
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.Delete,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate(mentionId);
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
            response: MemberFactory(),
          },
          {
            route,
            response: OK_RESPONSE,
            method: HttpMethod.Delete,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ account }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          mockedMutation.mutate();
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });
  });
});
