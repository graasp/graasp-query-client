import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { buildGetItemsByKeywordRoute } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const getItemsByKeywords = async (range: string, keywords: string, { API_HOST }: QueryClientConfig) =>
  (axios.get(`${API_HOST}/${buildGetItemsByKeywordRoute(range, keywords)}`).then(({ data }) => data)
);
