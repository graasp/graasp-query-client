import configureQueryClient from '@graasp/query-client';
const queryConfig = {
  API_HOST: 'http://localhost:3000',
  notifier: (payload: { type: string; payload: any }) => {
    console.log(payload);
  },
};

const {
  QueryClientProvider,
  queryClient,
  hooks,
  mutations,
} = configureQueryClient(queryConfig);

export { QueryClientProvider, queryClient, hooks, mutations };
