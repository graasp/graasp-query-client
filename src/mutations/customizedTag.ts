import { QueryClient } from 'react-query';
import { buildCustomizedTagsKey, MUTATION_KEYS } from '../config/keys';
import { postCustomizedTagsRoutine } from '../routines';
import * as Api from '../api';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_CUSTOMIZED_TAGS, {
    mutationFn: (payload) => Api.postCustomizedTags(payload, queryConfig),
    onSuccess: () => {
      notifier?.({ type: postCustomizedTagsRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postCustomizedTagsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { itemId }) => {
      queryClient.invalidateQueries(buildCustomizedTagsKey(itemId));
    },
  });
};
