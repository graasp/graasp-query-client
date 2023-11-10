import { AnyOfExcept, ShortLinkPayload } from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import { buildShortLinkKey, buildShortLinksItemKey } from '../config/keys';
import {
  createShortLinkRoutine,
  deleteShortLinkRoutine,
  patchShortLinkRoutine,
} from '../routines';
import type { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  const usePostShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (shortLink: ShortLinkPayload) =>
        Api.postShortLink(shortLink, queryConfig),
      {
        onSuccess: (_data, variables) => {
          notifier?.({
            type: createShortLinkRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.CREATE_SHORT_LINK },
          });
          queryClient.invalidateQueries(
            buildShortLinksItemKey(variables.item.id),
          );
          queryClient.invalidateQueries(buildShortLinkKey(variables.alias));
        },
        onError: (error: Error) => {
          notifier?.({
            type: createShortLinkRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  const usePatchShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({
        alias,
        shortLink,
      }: {
        alias: string;
        shortLink: AnyOfExcept<ShortLinkPayload, 'item'>;
      }) => Api.patchShortLink(alias, shortLink, queryConfig),
      {
        onSuccess: (data) => {
          notifier?.({
            type: patchShortLinkRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.EDIT_SHORT_LINK },
          });
          queryClient.invalidateQueries(buildShortLinksItemKey(data.item.id));
          queryClient.invalidateQueries(buildShortLinkKey(data.alias));
        },
        onError: (error: Error) => {
          notifier?.({
            type: patchShortLinkRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  const useDeleteShortLink = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (alias: string) => Api.deleteShortLink(alias, queryConfig),
      {
        onSuccess: (data) => {
          notifier?.({
            type: deleteShortLinkRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_SHORT_LINK },
          });
          queryClient.invalidateQueries(buildShortLinksItemKey(data.item.id));
          queryClient.invalidateQueries(buildShortLinkKey(data.alias));
        },
        onError: (error: Error) => {
          notifier?.({
            type: deleteShortLinkRoutine.FAILURE,
            payload: { error },
          });
        },
      },
    );
  };

  return {
    usePostShortLink,
    usePatchShortLink,
    useDeleteShortLink,
  };
};
