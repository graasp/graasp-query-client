import { DiscriminatedItem } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import { BUGS_ROUTE } from './routes';

const axios = configureAxios();

export type PostBugPayloadType = {
  email: string;
  name: string;
  details: string;
};

export const postBug = async (
  { name, email, details }: PostBugPayloadType,
  { API_HOST }: QueryClientConfig,
): Promise<DiscriminatedItem> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${BUGS_ROUTE}`, {
        name: name.trim(),
        email,
        details,
      })
      .then(({ data }) => data),
  );

