import { UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { itemKeys } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  // get last validation joined with review records of given item
  const useLastItemValidationGroup = (itemId: UUID) =>
    useQuery({
      queryKey: itemKeys.single(itemId).validation,
      queryFn: () => Api.getLastItemValidationGroup(queryConfig, itemId),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  return {
    useLastItemValidationGroup,
  };
};
