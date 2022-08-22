/* eslint-disable import/no-extraneous-dependencies */
import { act } from '@testing-library/react-hooks';
import nock from 'nock';
import Cookies from 'js-cookie';
import { StatusCodes } from 'http-status-codes';
import {
  buildClearMentionsRoute,
  buildDeleteMentionRoute,
  buildPatchMentionRoute,
  GET_CURRENT_MEMBER_ROUTE,
} from '../api/routes';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildChatMention,
  buildMemberMentions,
  buildMentionResponse,
  MEMBER_RESPONSE,
  MENTION_IDS,
  OK_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { buildMentionKey, MUTATION_KEYS } from '../config/keys';
import { REQUEST_METHODS } from '../api/utils';
import {
  clearMentionsRoutine,
  deleteMentionRoutine,
  patchMentionRoutine,
} from '../routines';
import { MentionStatus } from '@graasp/sdk';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Mention Mutations', () => {
  const mentionId = MENTION_IDS[0];
  const memberId = MEMBER_RESPONSE.id;
  const currentMemberRoute = `/${GET_CURRENT_MEMBER_ROUTE}`;
  const key = buildMentionKey(memberId);
  const MENTIONS = buildMemberMentions(memberId);

  describe('enableWebsockets = false', () => {
    const mockedNotifier = jest.fn();
    const { wrapper, queryClient, useMutation } = setUpTest({
      notifier: mockedNotifier,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.PATCH_MENTION, () => {
      const route = `/${buildPatchMentionRoute(mentionId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.PATCH_MENTION);

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
              REQUEST_METHODS.PATCH,
              MentionStatus.READ,
            ),
            method: REQUEST_METHODS.PATCH,
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
            method: REQUEST_METHODS.PATCH,
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
      const mutation = () => useMutation(MUTATION_KEYS.DELETE_MENTION);

      it(`Delete member mention`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: REQUEST_METHODS.DELETE,
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
            method: REQUEST_METHODS.DELETE,
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
      const mutation = () => useMutation(MUTATION_KEYS.CLEAR_MENTIONS);

      it(`Clear Member Mentions`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: REQUEST_METHODS.DELETE,
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
            method: REQUEST_METHODS.DELETE,
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
    const { wrapper, queryClient, useMutation } = setUpTest({
      enableWebsocket: true,
    });

    afterEach(() => {
      queryClient.clear();
      nock.cleanAll();
    });

    describe(MUTATION_KEYS.PATCH_MENTION, () => {
      const route = `/${buildPatchMentionRoute(mentionId)}`;
      const mutation = () => useMutation(MUTATION_KEYS.PATCH_MENTION);
      it(`Patch mention status`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: REQUEST_METHODS.PATCH,
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
      const mutation = () => useMutation(MUTATION_KEYS.DELETE_MENTION);
      it(`Delete member mention`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: REQUEST_METHODS.DELETE,
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
      const mutation = () => useMutation(MUTATION_KEYS.CLEAR_MENTIONS);
      it(`Clear chat`, async () => {
        const endpoints = [
          {
            route: currentMemberRoute,
            response: MEMBER_RESPONSE,
          },
          {
            route,
            response: OK_RESPONSE,
            method: REQUEST_METHODS.DELETE,
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
