import {
  CompleteMember,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  UUID,
} from '@graasp/sdk';

import { useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIdsAndReturn } from '../api/axios';
import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
} from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  CURRENT_MEMBER_KEY,
  CURRENT_MEMBER_STORAGE_KEY,
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
} from '../config/keys';
import { getMembersRoutine } from '../routines/member';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions, notifier } = queryConfig;

  return {
    useCurrentMember: () =>
      useQuery({
        queryKey: CURRENT_MEMBER_KEY,
        queryFn: () => Api.getCurrentMember(queryConfig),
        ...defaultQueryOptions,
      }),

    useMember: (id?: UUID) =>
      useQuery({
        queryKey: buildMemberKey(id),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getMember({ id }, queryConfig);
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      }),

    useMembers: (ids: UUID[]) => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildMembersKey(ids),
        queryFn: async () =>
          splitRequestByIdsAndReturn(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getMembers({ ids: chunk }, queryConfig),
          ),
        onSuccess: async (members) => {
          // save members in their own key
          if (members?.data) {
            Object.values(members?.data).forEach(async (member) => {
              const { id } = member;
              queryClient.setQueryData(buildMemberKey(id), member);
            });
          }
        },
        onError: (error) => {
          notifier?.({ type: getMembersRoutine.FAILURE, payload: { error } });
        },
        enabled: Boolean(ids?.length),
        ...defaultQueryOptions,
      });
    },

    useAvatar: ({
      id,
      size = DEFAULT_THUMBNAIL_SIZE,
    }: {
      id?: UUID;
      size?: string;
    }) => {
      const queryClient = useQueryClient();
      let shouldFetch = true;
      if (id) {
        // TODO: this casting is totally wrong, but allows to work for current member
        // to be fixed
        shouldFetch =
          (
            queryClient.getQueryData<Member>(
              buildMemberKey(id),
            ) as CompleteMember
          )?.extra?.hasAvatar ?? true;
      }
      return useQuery({
        queryKey: buildAvatarKey({ id, size, replyUrl: false }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadAvatar({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      });
    },

    // use another hook because of key content
    useAvatarUrl: ({
      id,
      size = DEFAULT_THUMBNAIL_SIZE,
    }: {
      id?: UUID;
      size?: string;
    }) => {
      const queryClient = useQueryClient();
      let shouldFetch = true;
      if (id) {
        // TODO: this casting is totally wrong, but allows to work for current member
        // to be fixed
        shouldFetch =
          (
            queryClient.getQueryData<Member>(
              buildMemberKey(id),
            ) as CompleteMember
          )?.extra?.hasAvatar ?? true;
      }
      return useQuery({
        queryKey: buildAvatarKey({ id, size, replyUrl: true }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadAvatarUrl({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      });
    },

    useMemberStorage: () =>
      useQuery({
        queryKey: CURRENT_MEMBER_STORAGE_KEY,
        queryFn: () => Api.getMemberStorage(queryConfig),
        ...defaultQueryOptions,
      }),
  };
};
