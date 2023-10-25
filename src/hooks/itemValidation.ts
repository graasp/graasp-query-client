import { UUID } from '@graasp/sdk';
import { ItemValidationGroupRecord } from '@graasp/sdk/frontend';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { buildLastItemValidationGroupKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get last validation joined with review records of given item
  const useLastItemValidationGroup = (itemId: UUID) =>
    useQuery({
      queryKey: buildLastItemValidationGroupKey(itemId),
      queryFn: (): Promise<ItemValidationGroupRecord> =>
        Api.getLastItemValidationGroup(queryConfig, itemId).then(
          (data) => data,
        ),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  return {
    useLastItemValidationGroup,
  };
};
