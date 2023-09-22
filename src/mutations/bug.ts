import { useMutation } from 'react-query';

import * as Api from '../api';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const usePostBug = () =>
    useMutation(async (bug: Api.PostBugPayloadType) =>
      Api.postBug(bug, queryConfig),
    );
  return { usePostBug };
};
