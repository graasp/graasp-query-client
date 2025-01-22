import { CompleteMember, Member, Pagination, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
} from '../config/constants.js';
import { UndefinedArgument } from '../config/errors.js';
import { memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import * as Api from './api.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useCurrentMember: () =>
      useQuery({
        queryKey: memberKeys.current().content,
        queryFn: () => Api.getCurrentMember(queryConfig),
        ...defaultQueryOptions,
      }),

    useMember: (id?: UUID) =>
      useQuery({
        queryKey: memberKeys.single(id).content,
        queryFn: () => {
          if (!id) {
            throw new UndefinedArgument();
          }
          return Api.getMember({ id }, queryConfig);
        },
        enabled: Boolean(id),
        ...defaultQueryOptions,
      }),

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
          return Api.downloadAvatarUrl({ id, size }, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(id) && shouldFetch,
        staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
      });
    },

    useMemberStorage: () =>
      useQuery({
        queryKey: memberKeys.current().storage,
        queryFn: () => Api.getMemberStorage(queryConfig),
        ...defaultQueryOptions,
      }),

    useMemberStorageFiles: (pagination: Partial<Pagination>) =>
      useQuery({
        queryKey: memberKeys.current().storageFiles(pagination),
        queryFn: () => Api.getMemberStorageFiles(pagination, queryConfig),
        ...defaultQueryOptions,
      }),
  };
};
