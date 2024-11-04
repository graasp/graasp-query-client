import { ShortLink, UpdateShortLink } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as Api from '../api/index.js';
import { buildShortLinkKey, itemKeys } from '../keys.js';
import {
  createShortLinkRoutine,
  deleteShortLinkRoutine,
  patchShortLinkRoutine,
} from '../routines/index.js';
import type { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (shortLink: ShortLink) =>
        Api.postShortLink(shortLink, queryConfig),
      onSuccess: (_data, variables) => {
        notifier?.({
          type: createShortLinkRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.CREATE_SHORT_LINK },
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(variables.itemId).shortLinks,
        });
        queryClient.invalidateQueries({
          queryKey: buildShortLinkKey(variables.alias),
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: createShortLinkRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  };

  const usePatchShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        alias,
        shortLink,
      }: {
        alias: string;
        shortLink: UpdateShortLink;
      }) => Api.patchShortLink(alias, shortLink, queryConfig),
      onSuccess: (data) => {
        notifier?.({
          type: patchShortLinkRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.EDIT_SHORT_LINK },
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(data.itemId).shortLinks,
        });
        queryClient.invalidateQueries({
          queryKey: buildShortLinkKey(data.alias),
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: patchShortLinkRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  };

  const useDeleteShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (alias: string) =>
        Api.deleteShortLink(alias, queryConfig),
      onSuccess: (data) => {
        notifier?.({
          type: deleteShortLinkRoutine.SUCCESS,
          payload: { message: SUCCESS_MESSAGES.DELETE_SHORT_LINK },
        });
        queryClient.invalidateQueries({
          queryKey: itemKeys.single(data.itemId).shortLinks,
        });
        queryClient.invalidateQueries({
          queryKey: buildShortLinkKey(data.alias),
        });
      },
      onError: (error: Error) => {
        notifier?.({
          type: deleteShortLinkRoutine.FAILURE,
          payload: { error },
        });
      },
    });
  };

  return {
    usePostShortLink,
    usePatchShortLink,
    useDeleteShortLink,
  };
};
