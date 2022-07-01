# Graasp Query Client

React Query package to consume the Graasp API.

## Installation

Run the following to install the package in your project:

```cmd
yarn add github:graasp/graasp-query-client.git
```

The package exposes the following properties:

- `MUTATION_KEYS` and `DATA_KEYS`: keys used to refer to defined mutations or invalidate data
- `routines`: message types used for notifications
- `API_ROUTES`: object containing all endpoint routes
- `Api`: api endpoints collection


`configureQueryClient` returns the following properties:

- `queryClient`: query client property
- `QueryClientProvider`: query client provider
- `hooks`: object containing all the `useQuery`s
- `useMutation`: hook for running mutations
- `ReactQueryDevtools`: devtools component for the imported queryclient 
- `dehydrate` & `Hydrate`: necessary properties for SSR projects (ie: nextjs)

```javascript
import { configureQueryClient } from '@graasp/query-client';

const prop = configureQueryClient({ API_HOST });
```

## Development

Run `yarn` to install this package's dependencies

## Testing

Execute the following to run the tests in your project

```cmd
yarn test
```

or

```cmd
yarn test:watch
```
