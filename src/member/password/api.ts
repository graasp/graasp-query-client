import { PartialQueryConfigForApi } from '../../types.js';
import { buildGetPasswordStatusRoute } from './routes.js';

export const getPasswordStatus = async ({
  API_HOST,
  axios,
}: PartialQueryConfigForApi) =>
  axios
    .get<{
      hasPassword: boolean;
    }>(`${API_HOST}/${buildGetPasswordStatusRoute()}`)
    .then(({ data }) => data);
