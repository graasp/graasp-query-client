import { Invitation } from '@graasp/sdk';

import { AxiosError, AxiosInstance } from 'axios';
import { QueryObserverOptions } from 'react-query';

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
  axios: AxiosInstance;
  onConfigAxios?: (axios: AxiosInstance) => void;
  defaultQueryOptions?: {
    // time until data in cache considered stale if cache not invalidated
    staleTime?: number;
    // time before cache labeled as inactive to be garbage collected
    cacheTime?: number;
    retry?:
      | number
      | boolean
      | ((failureCount: number, error: Error) => boolean);
    refetchOnWindowFocus?: boolean;
    keepPreviousData?: boolean;
    refetchOnMount?: boolean;
    notifyOnChangeProps?: QueryObserverOptions['notifyOnChangeProps']; // tracked will be removed in v4. https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#notifyonchangeprops-property-no-longer-accepts-tracked-as-a-value
  };
};

export type PartialQueryConfigForApi = Pick<
  QueryClientConfig,
  'API_HOST' | 'axios'
>;

// todo: move per feature folders
export type NewInvitation = Pick<Invitation, 'email' & 'permission'> &
  Partial<Invitation>;
