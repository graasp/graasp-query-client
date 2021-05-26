export type Notifier = (e: any) => any;

export type QueryClient = {};

export type QueryClientConfig = {
  API_HOST: string;
  S3_FILES_HOST?: string;
  SHOW_NOTIFICATIONS?: boolean;
  notifier?: Notifier;
};

export type UUID = string;
