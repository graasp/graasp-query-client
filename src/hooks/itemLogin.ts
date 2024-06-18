import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemLogin.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

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
        queryKey: itemKeys.single(args.itemId).itemLoginSchema.content,
        queryFn: () => Api.getItemLoginSchema(args.itemId, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },

    useItemLoginSchemaType: (
      args: {
        itemId?: UUID;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = (options?.enabled ?? true) && Boolean(args.itemId);
      return useQuery({
        queryKey: itemKeys.single(args.itemId).itemLoginSchema.type,
        queryFn: () => {
          if (!args.itemId) {
            throw new UndefinedArgument();
          }
          return Api.getItemLoginSchemaType(args.itemId, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
  };
};
