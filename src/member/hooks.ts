import {
  CompleteMember,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
  Pagination,
  UUID,
} from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
} from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import { memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import * as Api from './api.js';
import { getMembersRoutine } from './routines.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useCurrentMember: () =>
      useQuery({
        queryKey: memberKeys.current().content,
        queryFn: () => Api.getCurrentMember(),
        ...defaultQueryOptions,
      }),

    useMember: (id?: UUID) =>
      useQuery({
        queryKey: memberKeys.single(id).content,
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getMember({ id });
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      }),

    useMembers: (ids: UUID[]) => {
      return useQuery({
        queryKey: memberKeys.many(ids),
        queryFn: async () =>
          splitRequestByIdsAndReturn(
            ids,
            MAX_TARGETS_FOR_READ_REQUEST,
            (chunk) => Api.getMembers({ ids: chunk }),
          ),
        meta: {
          routine: getMembersRoutine,
        },
        enabled: Boolean(ids?.length),
        ...defaultQueryOptions,
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
              memberKeys.single(id).content,
            ) as CompleteMember
          )?.extra?.hasAvatar ?? true;
      }
      return useQuery({
        queryKey: memberKeys.single(id).avatar({ size, replyUrl: true }),
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.downloadAvatarUrl({ id, size });
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      });
    },

    useMemberStorage: () =>
      useQuery({
        queryKey: memberKeys.current().storage,
        queryFn: () => Api.getMemberStorage(),
        ...defaultQueryOptions,
      }),

    useMemberStorageFiles: (pagination: Partial<Pagination>) =>
      useQuery({
        queryKey: memberKeys.current().storageFiles(pagination),
        queryFn: () => Api.getMemberStorageFiles(pagination),
        ...defaultQueryOptions,
      }),
  };
};
