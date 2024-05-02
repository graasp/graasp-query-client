import { EmbeddedLinkMetadata, PartialQueryConfigForApi } from '../types.js';
import { buildGetEmbeddedLinkMetadata } from './routes.js';

// eslint-disable-next-line import/prefer-default-export
export const getEmbeddedLinkMetadata = (
  link: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<EmbeddedLinkMetadata> =>
  axios
    .get<EmbeddedLinkMetadata>(
      `${API_HOST}/${buildGetEmbeddedLinkMetadata(link)}`,
    )
    .then(({ data }) => data);
