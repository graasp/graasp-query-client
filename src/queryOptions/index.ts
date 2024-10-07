import { QueryClientConfig } from '../types.js';
import configureItemPublish from './itemPublish.js';

export default (queryConfig: QueryClientConfig) => ({
  ...configureItemPublish(queryConfig),
});
