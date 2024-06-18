import { ItemTypeUnion, PackedItem, UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../../types.js';
import { buildGetItemDescendants } from '../routes.js';

export const getDescendants = async (
  {
    id,
    types,
    showHidden,
  }: { id: UUID; types?: ItemTypeUnion[]; showHidden?: boolean },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const url = new URL(`${API_HOST}/${buildGetItemDescendants(id)}`);
  // add item types to the query as repeating parameters
  types?.forEach((itemType) => {
    url.searchParams.append('types', itemType);
  });
  if (showHidden !== undefined) {
    url.searchParams.set('showHidden', showHidden.toString());
  }
  return axios.get<PackedItem[]>(url.toString()).then(({ data }) => data);
};
