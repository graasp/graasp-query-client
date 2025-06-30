> [!WARNING]
> This repository is archived since we have moved the code to the client project and use the automatic generation from the OpenAPI spec for new features.

# Graasp Query Client

React Query package to consume the Graasp API.

## Installation

Run the following to install the package in your project:

```cmd
yarn add github:graasp/graasp-query-client.git
```

The package exposes the following properties:

- `DATA_KEYS`: keys used to refer to invalidate data
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
