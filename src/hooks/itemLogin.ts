import { UseQueryResult, useQuery } from 'react-query';

import { ItemLoginSchemaType, UUID, convertJs } from '@graasp/sdk';
import { ItemLoginSchemaRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import {
  buildItemLoginSchemaKey,
  buildItemLoginSchemaTypeKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useItemLoginSchema: (
      args: {
        itemId: UUID;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = (options?.enabled ?? true) && Boolean(args.itemId);
      return useQuery({
        queryKey: buildItemLoginSchemaKey(args.itemId),
        queryFn: (): Promise<ItemLoginSchemaRecord> =>
          Api.getItemLoginSchema(args.itemId, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },

    useItemLoginSchemaType: (
      args: {
        itemId: UUID;
      },
      options?: { enabled?: boolean },
    ): UseQueryResult<ItemLoginSchemaType> => {
      const enabledValue = (options?.enabled ?? true) && Boolean(args.itemId);
      return useQuery({
        queryKey: buildItemLoginSchemaTypeKey(args.itemId),
        queryFn: () =>
          Api.getItemLoginSchemaType(args.itemId, queryConfig).then((data) =>
            convertJs(data),
          ),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },

    //   // still used?
    //   useItemLogin: (id?: UUID) =>
    //     useQuery({
    //       queryKey: buildItemLoginKey(id),
    //       queryFn: (): Promise<ItemLoginRecord> => {
    //         if (!id) {
    //           throw new UndefinedArgument();
    //         }
    //         return Api.getItemLogin(id, queryConfig).then((data) =>
    //           convertJs(data),
    //         );
    //       },
    //       enabled: Boolean(id),
    //       ...defaultQueryOptions,
    //     }),
    // };
  };
};