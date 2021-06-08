import { useQuery } from 'react-query';
import { Map } from 'immutable';
import * as Api from '../api';
import { CURRENT_MEMBER_KEY } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry } = queryConfig;
  const useCurrentMember = () =>
    useQuery({
      queryKey: CURRENT_MEMBER_KEY,
      queryFn: () =>
        Api.getCurrentMember(queryConfig).then((data) => Map(data)),
      retry,
    });

  return { useCurrentMember };
};
