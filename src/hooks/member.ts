import { useQuery } from 'react-query';
import { Map } from 'immutable';
import * as Api from '../api';
import { buildMemberKey, CURRENT_MEMBER_KEY } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useCurrentMember = () =>
    useQuery({
      queryKey: CURRENT_MEMBER_KEY,
      queryFn: () =>
        Api.getCurrentMember(queryConfig).then((data) => Map(data)),
      ...defaultOptions,
    });

  const useMember = (id: UUID) =>
    useQuery({
      queryKey: buildMemberKey(id),
      queryFn: () => Api.getMember({id}, queryConfig).then((data) => Map(data)),
      enabled: Boolean(id),
      ...defaultOptions,
    })

  return { useCurrentMember, useMember };
};
