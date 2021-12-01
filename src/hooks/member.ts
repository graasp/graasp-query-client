import { QueryClient, useQuery } from 'react-query';
import { Map, List } from 'immutable';
import * as Api from '../api';
import {
  buildAvatarKey,
  buildMemberKey,
  buildMembersKey,
  CURRENT_MEMBER_KEY,
} from '../config/keys';
import { Member, QueryClientConfig, UndefinedArgument, UUID } from '../types';
import { DEFAULT_THUMBNAIL_SIZES } from '../config/constants';
import { getRequestBlob } from '../utils/thumbnails';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime, S3_FILES_HOST } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useCurrentMember = () =>
    useQuery({
      queryKey: CURRENT_MEMBER_KEY,
      queryFn: () =>
        Api.getCurrentMember(queryConfig).then((data) => Map(data)),
      ...defaultOptions,
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
      ...defaultOptions,
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
      ...defaultOptions,
    });

  const useAvatar = ({
    id,
    size = DEFAULT_THUMBNAIL_SIZES,
  }: {
    id?: UUID;
    size?: string;
  }) =>
    useQuery({
      queryKey: buildAvatarKey({ id, size }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.downloadAvatar({ id, size }, queryConfig).then((data) => {
          // default
          return getRequestBlob(data, S3_FILES_HOST)
        })
      },
      ...defaultOptions,
      enabled: Boolean(id),
    });

  return { useCurrentMember, useMember, useMembers, useAvatar };
};
