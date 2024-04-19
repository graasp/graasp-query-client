import { QueryClient, QueryKey } from '@tanstack/react-query';

import { HAS_CHANGES_KEY } from './keys.js';

export const addToChangesKeys = (queryClient: QueryClient, key: QueryKey) => {
  const changedKeys =
    queryClient.getQueryData<Set<QueryKey>>(HAS_CHANGES_KEY) ??
    new Set<QueryKey>();
  changedKeys.add(key);
  queryClient.setQueryData(HAS_CHANGES_KEY, changedKeys);
};

export const isInChangesKeys = (queryClient: QueryClient, key: QueryKey) =>
  queryClient.getQueryData<Set<QueryKey>>(HAS_CHANGES_KEY)?.has(key);

export const invalidateChangedQueries = (queryClient: QueryClient) => {
  const changes = queryClient.getQueryData<Set<QueryKey>>(HAS_CHANGES_KEY);
  if (changes) {
    changes.forEach((k) => queryClient.invalidateQueries(k));
    changes.clear();
  }
};
