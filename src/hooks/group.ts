import { QueryClient, useQuery } from 'react-query';
import { List, Map } from 'immutable';
import * as Api from '../api';
import {
  buildGroupChildrenKey,
  buildGroupKey,
  buildGroupMembershipKey,
  buildGroupsKey,
  OWN_GROUP_MEMBERSHIPS_KEY, ROOT_GROUP_KEY,
} from '../config/keys';
import { Group, GroupMembership, QueryClientConfig, UUID } from '../types';

export default (queryClient: QueryClient,queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useGroup = (id: UUID) =>
    useQuery({
      queryKey: buildGroupKey(id),
      queryFn: () =>
        Api.getGroup(id,queryConfig).then((data) => Map(data)),
      enabled: id !=='',
      ...defaultOptions,
    });


  const useGroups = (ids: UUID[]) =>
    useQuery({
      queryKey: buildGroupsKey(ids),
      queryFn: () =>
        ids
          ? ids.length == 1
          ? Api.getGroup(ids[0], queryConfig).then((data) => List([data]))
          : Api.getGroups(ids, queryConfig).then((data) => List(data))
          : undefined,
      onSuccess: async (groups: List<Group>) => {
        // save items in their own key
        groups?.forEach(async (group) => {
          const { id } = group;
          queryClient.setQueryData(buildGroupKey(id), Map(group));
        });
      },
      enabled: ids && Boolean(ids.length) && ids.every((id) => Boolean(id)),
      ...defaultOptions,
    });

  const useOwnGroupMemberships = () =>
    useQuery({
      queryKey: OWN_GROUP_MEMBERSHIPS_KEY,
      queryFn: () => Api.getOwnGroupMemberships(queryConfig).then((data) => List(data)),
      onSuccess: async (groupMemberships: List<GroupMembership>) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        groupMemberships?.forEach(async (groupMembership) => {
          const { id } = groupMembership;
          queryClient.setQueryData(buildGroupMembershipKey(id), Map(groupMembership));
        });
      },
      ...defaultOptions,
    });

  const useGroupChildren = (id: UUID) =>
    useQuery({
      queryKey: buildGroupChildrenKey(id),
      queryFn: () =>
        Api.getGroupChildren(id,queryConfig).then((data) => List(data)),
      onSuccess: async (groups: List<Group>) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        groups?.forEach(async (group) => {
          const { id } = group;
          queryClient.setQueryData(buildGroupKey(id), Map(group));
        });
      },
      ...defaultOptions,
    });

  const useRootGroups = () =>
    useQuery({
      queryKey: ROOT_GROUP_KEY,
      queryFn: () => Api.getRootGroups(queryConfig).then((data) => List(data)),
      onSuccess: async (groups: List<Group>) => {
        // save items in their own key
        // eslint-disable-next-line no-unused-expressions
        groups?.forEach(async (group) => {
          const { id } = group;
          queryClient.setQueryData(buildGroupKey(id), Map(group));
        });
      },
      ...defaultOptions,
    });


  return {
    useGroup,
    useGroups,
    useOwnGroupMemberships,
    useRootGroups,
    useGroupChildren
  };
};
