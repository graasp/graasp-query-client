import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemValidation.js';
import { itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

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
