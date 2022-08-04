import { QueryClient, useQuery } from 'react-query';
import { List } from 'immutable';
import * as Api from '../api';
import {
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
  CURRENT_MEMBER_KEY,
} from '../config/keys';
import { MemberRecord, QueryClientConfig, UndefinedArgument, UUID } from '../types';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import { convertJs } from '../utils/util';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

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
        Api.getMembers({ ids }, queryConfig).then((data) => convertJs(data)),
      enabled: Boolean(ids?.length),
      onSuccess: async (members: List<MemberRecord>) => {
        // save members in their own key
        members?.forEach(async (member) => {
          const { id } = member;
          queryClient.setQueryData(buildMemberKey(id), member);
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
    });
  };

  return { useCurrentMember, useMember, useMembers, useAvatar };
};
