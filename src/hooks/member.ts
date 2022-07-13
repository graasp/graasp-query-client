import { QueryClient, useQuery } from 'react-query';
import { Map, List, Record } from 'immutable';
import * as Api from '../api';
import {
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
  CURRENT_MEMBER_KEY,
} from '../config/keys';
import { Member, QueryClientConfig, UndefinedArgument, UUID } from '../types';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useCurrentMember = () =>
    useQuery({
      queryKey: CURRENT_MEMBER_KEY,
      queryFn: () =>
        Api.getCurrentMember(queryConfig).then((data) => Map(data)),
      ...defaultQueryOptions,
    });

  const useMember = (id?: UUID) =>
    useQuery({
      queryKey: buildMemberKey(id),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getMember({ id }, queryConfig).then((data) => Map(data));
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  const useMembers = (ids: UUID[]) =>
    useQuery({
      queryKey: buildMembersKey(ids),
      queryFn: () =>
        Api.getMembers({ ids }, queryConfig).then((data) => List(data)),
      enabled: Boolean(ids?.length),
      onSuccess: async (members: List<Member>) => {
        // save members in their own key
        members?.forEach(async (member) => {
          const { id } = member;
          queryClient.setQueryData(buildMemberKey(id), Map(member));
        });
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
        queryClient
          .getQueryData<Record<Member>>(buildMemberKey(id))
          ?.get('extra')?.hasAvatar ?? true;
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
    });
  };

  return { useCurrentMember, useMember, useMembers, useAvatar };
};
