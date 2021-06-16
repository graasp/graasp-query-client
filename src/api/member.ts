import { failOnError, DEFAULT_GET, DEFAULT_PATCH } from './utils';
import {
  buildGetMemberBy,
  buildGetMember,
  GET_CURRENT_MEMBER_ROUTE,
  buildPatchMember,
} from './routes';
import { Member, QueryClientConfig, UUID } from '../types';

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

export const editMember = async (
  payload: { id: UUID; member: Partial<Member> },
  { API_HOST }: QueryClientConfig,
) => {
  const { id } = payload;
  const res = await fetch(`${API_HOST}/${buildPatchMember(id)}`, {
    ...DEFAULT_PATCH,
    body: JSON.stringify(payload),
  }).then(failOnError);

  return res.json();
};
