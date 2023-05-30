import { useQuery } from 'react-query';

import { UUID, convertJs } from '@graasp/sdk';
import { ItemValidationGroupRecord } from '@graasp/sdk/frontend';

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
        Api.getLastItemValidationGroup(queryConfig, itemId).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  // get last validation joined with review records of given item
  // const useItemValidationAndReview = (itemId: UUID) =>
  //   useQuery({
  //     queryKey: buildItemValidationAndReviewKey(itemId),
  //     queryFn: () =>
  //       Api.getItemValidationAndReview(queryConfig, itemId).then((data) =>
  //         convertJs(data),
  //       ),
  //     ...defaultQueryOptions,
  //     enabled: Boolean(itemId),
  //   });

  return {
    useLastItemValidationGroup,
    // useItemValidationAndReview,
  };
};
