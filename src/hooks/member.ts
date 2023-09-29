import {
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  UUID,
  convertJs,
} from '@graasp/sdk';
import {
  MemberRecord,
  MemberStorageRecord,
  ResultOfRecord,
} from '@graasp/sdk/frontend';

import { UseQueryResult, useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import {
  CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
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
        queryFn: (): Promise<MemberRecord> =>
          Api.getCurrentMember(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
      }),

    useMember: (id?: UUID) =>
      useQuery({
        queryKey: buildMemberKey(id),
        queryFn: (): Promise<MemberRecord> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getMember({ id }, queryConfig).then((data) =>
            convertJs(data),
          );
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      }),

    useMembers: (ids: UUID[]): UseQueryResult<ResultOfRecord<Member>> => {
      const queryClient = useQueryClient();
      return useQuery({
        queryKey: buildMembersKey(ids),
        queryFn: async () =>
          splitRequestByIds(ids, MAX_TARGETS_FOR_READ_REQUEST, (chunk) =>
            Api.getMembers({ ids: chunk }, queryConfig),
          ),
        onSuccess: async (members) => {
          // save members in their own key
          members?.data?.toSeq().forEach(async (member) => {
            const { id } = member;
            queryClient.setQueryData(buildMemberKey(id), member);
          });
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
        shouldFetch =
          queryClient.getQueryData<MemberRecord>(buildMemberKey(id))?.extra
            ?.hasAvatar ?? true;
      }
      return useQuery({
        queryKey: buildAvatarKey({ id, size, replyUrl: false }),
        queryFn: (): Promise<Blob> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadAvatar({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
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
        shouldFetch =
          queryClient.getQueryData<MemberRecord>(buildMemberKey(id))?.extra
            ?.hasAvatar ?? true;
      }
      return useQuery({
        queryKey: buildAvatarKey({ id, size, replyUrl: true }),
        queryFn: (): Promise<string> => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadAvatarUrl({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
      });
    },

    useMemberStorage: () =>
      useQuery({
        queryKey: CURRENT_MEMBER_STORAGE_KEY,
        queryFn: (): Promise<MemberStorageRecord> =>
          Api.getMemberStorage(queryConfig).then((data) => convertJs(data)),
        ...defaultQueryOptions,
      }),
  };
};
