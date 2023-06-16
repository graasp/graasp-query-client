export type Notifier = (e: {
  type: string;
  payload?: { error?: Error; message?: string; [key: string]: unknown };
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
    retry?: boolean | number | ((failureCount: number, error: any) => boolean);
    refetchOnWindowFocus?: boolean;
    keepPreviousData?: boolean;
    refetchOnMount?: boolean;
    notifyOnChangeProps?: any;
    structuralSharing?:
      | boolean
      | ((oldData: any | undefined, newData: any) => any);
  };
};

export type SearchFields = {
  keywords?: string;
  tags?: string[];
  parentId?: string;
  name?: string;
  creator?: string;
};
