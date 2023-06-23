import { DiscriminatedItem } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { buildGetItemsByKeywordRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const getItemsByKeywords = async (
  fields: {
    keywords?: string;
    tags?: string[];
    parentId?: string;
    name?: string;
    creator?: string;
  },
  { API_HOST }: QueryClientConfig,
): Promise<DiscriminatedItem[]> =>
  axios
    .get(`${API_HOST}/${buildGetItemsByKeywordRoute(fields)}`)
    .then(({ data }) => data);
