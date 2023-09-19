import { AxiosError } from 'axios';
import { QueryObserverOptions } from 'react-query';

import { isDataEqual } from './utils/util';

export type Notifier = (e: {
  type: string;
  payload?: {
    error?: Error | AxiosError;
    message?: string;
    [key: string]: unknown;
  };
}) => void;

export type QueryClientConfig = {
  API_HOST: string;
  SHOW_NOTIFICATIONS: boolean;
  WS_HOST: string;
  DOMAIN?: string;
  enableWebsocket: boolean;
  notifier?: Notifier;
  defaultQueryOptions: {
    // time until data in cache considered stale if cache not invalidated
    staleTime: number;
    // time before cache labeled as inactive to be garbage collected
    cacheTime: number;
    retry?:
      | number
      | boolean
      | ((failureCount: number, error: Error) => boolean);
    refetchOnWindowFocus?: boolean;
    keepPreviousData?: boolean;
    refetchOnMount?: boolean;
    notifyOnChangeProps?: QueryObserverOptions['notifyOnChangeProps']; // tracked will be removed in v4. https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#notifyonchangeprops-property-no-longer-accepts-tracked-as-a-value
    isDataEqual?: typeof isDataEqual;
  };
};

export type SearchFields = {
  keywords?: string;
  tags?: string[];
  parentId?: string;
  name?: string;
  creator?: string;
};

export type OwnItemsQuery = {
  page?: number;
  name?: string;
  all?: boolean;
};
