import { buildGetEmbeddedLinkMetadata } from '../routes.js';
import { EmbeddedLinkMetadata, PartialQueryConfigForApi } from '../types.js';

export const getEmbeddedLinkMetadata = (
  link: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
): Promise<EmbeddedLinkMetadata> =>
  axios
    .get<EmbeddedLinkMetadata>(
      `${API_HOST}/${buildGetEmbeddedLinkMetadata(link)}`,
    )
    .then(({ data }) => data);
