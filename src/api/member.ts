import { failOnError, DEFAULT_GET } from './utils';
import {
  buildGetMemberBy,
  buildGetMember,
  GET_CURRENT_MEMBER_ROUTE,
} from './routes';
import { QueryClientConfig, UUID } from '../types';

export const getMemberBy = async (
  { email }: { email: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildGetMemberBy(email)}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};

export const getMember = async (
  { id }: { id: UUID },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildGetMember(id)}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};

export const getCurrentMember = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CURRENT_MEMBER_ROUTE}`, {
    ...DEFAULT_GET,
  }).then(failOnError);

  return res.json();
};
