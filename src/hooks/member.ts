import { List } from 'immutable';
import { QueryClient, useQuery } from 'react-query';

import { MAX_TARGETS_FOR_READ_REQUEST, convertJs } from '@graasp/sdk';

import * as Api from '../api';
import { splitRequestByIds } from '../api/axios';
import {
  CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZES,
} from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  CURRENT_MEMBER_KEY,
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
} from '../config/keys';
import { getMembersRoutine } from '../routines';
import { MemberRecord, QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions, notifier } = queryConfig;

  const useCurrentMember = () =>
    useQuery({
      queryKey: CURRENT_MEMBER_KEY,
      queryFn: (): Promise<MemberRecord> =>
        Api.getCurrentMember(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
    });

  const useMember = (id?: UUID) =>
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
    });

  const useMembers = (ids: UUID[]) =>
    useQuery({
      queryKey: buildMembersKey(ids),
      queryFn: (): Promise<List<MemberRecord>> =>
        splitRequestByIds(ids, MAX_TARGETS_FOR_READ_REQUEST, (chunk) =>
          Api.getMembers({ ids: chunk }, queryConfig),
        ),
      enabled: Boolean(ids?.length),
      onSuccess: async (members: List<MemberRecord>) => {
        // save members in their own key
        members?.forEach(async (member) => {
          const { id } = member;
          queryClient.setQueryData(buildMemberKey(id), member);
        });
      },
      onError: (error) => {
        notifier?.({ type: getMembersRoutine.FAILURE, payload: { error } });
      },
      ...defaultQueryOptions,
    });

  const useAvatar = ({
    id,
    size = DEFAULT_THUMBNAIL_SIZES,
  }: {
    id?: UUID;
    size?: string;
  }) => {
    let shouldFetch = true;
    if (id) {
      shouldFetch =
        queryClient.getQueryData<MemberRecord>(buildMemberKey(id))?.extra
          ?.hasAvatar ?? true;
    }
    return useQuery({
      queryKey: buildAvatarKey({ id, size }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.downloadAvatar({ id, size }, queryConfig).then(
          (data) => data,
        );
      },
      ...defaultQueryOptions,
      enabled: Boolean(id) && shouldFetch,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });
  };

  return { useCurrentMember, useMember, useMembers, useAvatar };
};
