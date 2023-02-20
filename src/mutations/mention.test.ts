/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod, MentionStatus } from '@graasp/sdk';

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
import { MUTATION_KEYS, buildMentionKey } from '../config/keys';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Mention Mutations', () => {
  const mentionId = MENTION_IDS[0];
  const memberId = MEMBER_RESPONSE.id;
  const currentMemberRoute = `/${GET_CURRENT_MEMBER_ROUTE}`;
  const key = buildMentionKey(memberId);
  const MENTIONS = buildMemberMentions(memberId);

  describe('enableWebsockets = false', () => {
    const mockedNotifier = jest.fn();
    const { wrapper, queryClient, mutations } = setUpTest({
      notifier: mockedNotifier,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.PATCH_MENTION, () => {
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
              MENTIONS[0],
              HttpMethod.PATCH,
              MentionStatus.READ,
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
            status: MentionStatus.READ,
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            id: mentionId,
            status: MentionStatus.READ,
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

    describe(MUTATION_KEYS.DELETE_MENTION, () => {
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            mentionId,
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
            method: HttpMethod.DELETE,
            statusCode: StatusCodes.UNAUTHORIZED,
          },
        ];
        // set random data in cache
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            mentionId,
          });
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

    describe(MUTATION_KEYS.CLEAR_MENTIONS, () => {
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ memberId });
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ memberId });
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

    describe(MUTATION_KEYS.PATCH_MENTION, () => {
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            id: mentionId,
            status: MentionStatus.READ,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });

    describe(MUTATION_KEYS.DELETE_MENTION, () => {
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({
            memberId,
            mentionId,
          });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });

    describe(MUTATION_KEYS.CLEAR_MENTIONS, () => {
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
        queryClient.setQueryData(key, buildChatMention({ memberId }));

        const mockedMutation = await mockMutation({
          endpoints,
          mutation,
          wrapper,
        });

        await act(async () => {
          await mockedMutation.mutate({ memberId });
          await waitForMutation();
        });

        // verify cache keys
        expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
      });
    });
  });
});
