import { QueryClient } from 'react-query';
import * as Api from '../api';
import {
  createGroupMembershipRoutine,
  createGroupRoutine,
} from '../routines';
import {  MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig } from '../types';

const { POST_GROUP,SHARE_GROUP} = MUTATION_KEYS;
export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(POST_GROUP, {
    mutationFn: async (group) => ({
      parentId: group.parentId,
      group: await Api.postGroup(group, queryConfig),
    }),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({ type: createGroupRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: createGroupRoutine.FAILURE, payload: { error } });
    },
  });

  queryClient.setMutationDefaults(SHARE_GROUP, {
    mutationFn: (payload) =>
      Api.postGroupMemberships(payload,queryConfig).then(() => payload),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({ type: createGroupMembershipRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: createGroupMembershipRoutine.FAILURE, payload: { error } });
    },
  });


}
