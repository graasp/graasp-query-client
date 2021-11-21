import { QueryClient } from 'react-query';
import { buildItemCategoryAgeKey, buildItemCategoryDisciplineKey, MUTATION_KEYS } from '../config/keys';
import { postItemCategoryAgeRoutine, postItemCategoryDisciplineRoutine } from '../routines';
import * as Api from '../api';
import { QueryClientConfig } from '../types';

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_CATEGORY_AGE, {
    mutationFn: (payload) =>
      Api.postItemCategoryAge(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: postItemCategoryAgeRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postItemCategoryAgeRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries(buildItemCategoryAgeKey(id));
    },
  });

  queryClient.setMutationDefaults(MUTATION_KEYS.POST_ITEM_CATEGORY_DISCIPLINE, {
    mutationFn: (payload) =>
      Api.postItemCategoryDiscipline(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: postItemCategoryDisciplineRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: postItemCategoryDisciplineRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries(buildItemCategoryDisciplineKey(id));
    },
  });
};
