import { QueryClient, useMutation } from 'react-query';

import { MemberExtra, ThumbnailSize, UUID, convertJs } from '@graasp/sdk';
import { MemberRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import { throwIfArrayContainsErrorOrReturn } from '../api/axios';
import {
  CURRENT_MEMBER_KEY,
  MUTATION_KEYS,
  buildAvatarKey,
} from '../config/keys';
import {
  addFavoriteItemRoutine,
  deleteFavoriteItemRoutine,
  deleteMemberRoutine,
  editMemberRoutine,
  uploadAvatarRoutine,
} from '../routines';
import { QueryClientConfig } from '../types';

const {
  DELETE_MEMBER,
  EDIT_MEMBER,
  UPLOAD_AVATAR,
  ADD_FAVORITE_ITEM,
  DELETE_FAVORITE_ITEM,
} = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  queryClient.setMutationDefaults(DELETE_MEMBER, {
    mutationFn: (payload) =>
      Api.deleteMember(payload, queryConfig).then(() =>
        Api.signOut(queryConfig),
      ),
    onSuccess: (_data, { id: _id }) => {
      notifier?.({
        type: deleteMemberRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_MEMBER },
      });

      queryClient.resetQueries();

      // remove cookies from browser when logout succeeds
      if (queryConfig.DOMAIN) {
        // todo: find a way to do this with an httpOnly cookie
        // removeSession(id, queryConfig.DOMAIN);
        // setCurrentSession(null, queryConfig.DOMAIN);
      }

      // Update when the server confirmed the logout, instead optimistically updating the member
      // This prevents logout loop (redirect to logout -> still cookie -> logs back in)
      queryClient.setQueryData(CURRENT_MEMBER_KEY, undefined);
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _args, _context) => {
      notifier?.({ type: deleteMemberRoutine.FAILURE, payload: { error } });
    },
  });
  const useDeleteMember = () =>
    useMutation<void, unknown, { id: UUID }>(DELETE_MEMBER);

  // suppose you can only edit yourself
  queryClient.setMutationDefaults(EDIT_MEMBER, {
    mutationFn: (payload: { id: UUID; extra: MemberExtra }) =>
      Api.editMember(payload, queryConfig).then((member) => convertJs(member)),
    onMutate: async ({ member }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember?.merge(member),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({
        type: editMemberRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.EDIT_MEMBER },
      });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      notifier?.({ type: editMemberRoutine.FAILURE, payload: { error } });
      queryClient.setQueryData(CURRENT_MEMBER_KEY, context.previousMember);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
  const useEditMember = () =>
    useMutation<void, unknown, { id: UUID; extra: MemberExtra }>(EDIT_MEMBER);

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(UPLOAD_AVATAR, {
    mutationFn: async ({ error, data } = {}) => {
      throwIfArrayContainsErrorOrReturn(data);
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({
        type: uploadAvatarRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_AVATAR },
      });
    },
    onError: (_error, { error }) => {
      notifier?.({ type: uploadAvatarRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      Object.values(ThumbnailSize).forEach((size) => {
        const key1 = buildAvatarKey({ replyUrl: true, id, size });
        queryClient.invalidateQueries(key1);
        const key2 = buildAvatarKey({ replyUrl: false, id, size });
        queryClient.invalidateQueries(key2);
      });
    },
  });
  const useUploadAvatar = () =>
    useMutation<void, unknown, { error?: any; data?: any; id: UUID }>(
      UPLOAD_AVATAR,
    );

  // mutation to update favorite items of given member
  queryClient.setMutationDefaults(ADD_FAVORITE_ITEM, {
    mutationFn: ({ memberId, itemId, extra: prevExtra }) => {
      const favoriteItems = prevExtra.favoriteItems
        ? prevExtra.favoriteItems.concat(
            prevExtra.favoriteItems.includes(itemId) ? [] : [itemId],
          )
        : [itemId];
      return Api.editMember(
        {
          id: memberId,
          extra: {
            ...prevExtra,
            favoriteItems,
          },
        },
        queryConfig,
      ).then((member) => convertJs(member));
    },
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      const { itemId, extra } = payload;
      const favoriteItems = extra.favoriteItems
        ? extra.favoriteItems.concat(
            extra.favoriteItems.includes(itemId) ? [] : [itemId],
          )
        : [itemId];

      const member = convertJs({
        extra: { ...extra, favoriteItems },
      });

      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember?.merge(member),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({ type: addFavoriteItemRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      notifier?.({ type: addFavoriteItemRoutine.FAILURE, payload: { error } });
      queryClient.setQueryData(CURRENT_MEMBER_KEY, context.previousMember);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
  const useAddFavoriteItem = () =>
    useMutation<
      void,
      unknown,
      { memberId: UUID; itemId: UUID; extra: MemberExtra }
    >(ADD_FAVORITE_ITEM);

  queryClient.setMutationDefaults(DELETE_FAVORITE_ITEM, {
    mutationFn: (payload) => {
      const { memberId, itemId, extra: prevExtra } = payload;
      const newFavoriteItems = prevExtra.favoriteItems?.filter(
        (id: UUID) => id !== itemId,
      );
      return Api.editMember(
        {
          id: memberId,
          extra: { ...prevExtra, favoriteItems: newFavoriteItems },
        },
        queryConfig,
      ).then((member) => convertJs(member));
    },
    onMutate: async (payload) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(CURRENT_MEMBER_KEY);

      // Snapshot the previous value
      const previousMember =
        queryClient.getQueryData<MemberRecord>(CURRENT_MEMBER_KEY);

      // Optimistically update to the new value
      const { itemId, extra } = payload;
      extra.favoriteItems = extra.favoriteItems?.filter(
        (id: UUID) => id !== itemId,
      );
      const member = convertJs({ extra });

      queryClient.setQueryData(
        CURRENT_MEMBER_KEY,
        previousMember?.merge(member),
      );

      // Return a context object with the snapshotted value
      return { previousMember };
    },
    onSuccess: () => {
      notifier?.({ type: deleteFavoriteItemRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      notifier?.({
        type: deleteFavoriteItemRoutine.FAILURE,
        payload: { error },
      });
      queryClient.setQueryData(CURRENT_MEMBER_KEY, context.previousMember);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // invalidate all queries
      queryClient.invalidateQueries(CURRENT_MEMBER_KEY);
    },
  });
  const useDeleteFavoriteItem = () =>
    useMutation<
      void,
      unknown,
      { memberId: UUID; itemId: UUID; extra: MemberExtra }
    >(DELETE_FAVORITE_ITEM);

  return {
    useDeleteMember,
    useDeleteFavoriteItem,
    useAddFavoriteItem,
    useUploadAvatar,
    useEditMember,
  };
};
