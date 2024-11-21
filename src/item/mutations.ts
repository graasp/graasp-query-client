import {
  DiscriminatedItem,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  PackedItem,
  RecycledItemData,
  UUID,
  buildPathFromIds,
  getParentFromPath,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { splitRequestByIds } from '../api/axios.js';
import { getKeyForParentId, itemKeys, memberKeys } from '../keys.js';
import {
  type EnableNotificationsParam,
  type QueryClientConfig,
} from '../types.js';
import { DEFAULT_ENABLE_NOTIFICATIONS } from '../utils/notifications.js';
import * as Api from './api.js';
import {
  usePostItem,
  useUploadFiles,
  useUploadFilesFeedback,
} from './create/mutations.js';
import { useImportH5P } from './h5p/mutations.js';
import { useImportZip } from './import-zip/mutations.js';
import { useReorderItem } from './reorder/mutations.js';
import {
  copyItemsRoutine,
  deleteItemsRoutine,
  editItemRoutine,
  moveItemsRoutine,
  recycleItemsRoutine,
  restoreItemsRoutine,
} from './routines.js';
import {
  useDeleteItemThumbnail,
  useUploadItemThumbnail,
  useUploadItemThumbnailFeedback,
} from './thumbnail/mutations.js';

export default (queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // Utils functions to mutate react query data
  const mutateItem = async <T extends object | null>({
    id,
    value,
    queryClient,
  }: {
    id: UUID;
    value: T;
    queryClient: QueryClient;
  }): Promise<T | undefined> => {
    const itemKey = itemKeys.single(id).content;

    await queryClient.cancelQueries({ queryKey: itemKey });

    // Snapshot the previous value
    const prevValue = queryClient.getQueryData<T>(itemKey);

    queryClient.setQueryData(itemKey, value);

    // Return a context object with the snapshot value
    return prevValue;
  };

  // todo: we don't consider accessible, shared or published items here
  // this part is a bit flaky/unclear it might be better to refactor it
  const mutateParentChildren = async (
    args: ({ id?: string } | { childPath: string }) & { value: unknown },
    queryClient: QueryClient,
  ): Promise<unknown> => {
    const { value } = args;
    const parentId =
      'childPath' in args ? getParentFromPath(args.childPath) : args.id;

    // get parent key
    const childrenKey = !parentId
      ? // todo: this should be removed when we remove this function, previously was OWN_ITEMS
        ['']
      : itemKeys.single(parentId).allChildren;
    // Cancel any outgoing re-fetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey: childrenKey });

    // Snapshot the previous value if exists
    // do not create entry if it doesn't exist
    if (queryClient.getQueryState(childrenKey)) {
      const prevChildren = queryClient.getQueryData(childrenKey);

      // Optimistically update
      queryClient.setQueryData(childrenKey, value);

      // Return a context object with the a snapshot of the value
      return prevChildren;
    }
    return null;
  };

  const useEditItem = ({
    enableNotifications,
  }: EnableNotificationsParam = DEFAULT_ENABLE_NOTIFICATIONS) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (
        item: Pick<DiscriminatedItem, 'id'> &
          Partial<
            Pick<
              DiscriminatedItem,
              'name' | 'description' | 'extra' | 'settings' | 'lang'
            >
          >,
      ) => Api.editItem(item.id, item, queryConfig),
      onSuccess: () => {
        notifier?.(
          {
            type: editItemRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.EDIT_ITEM },
          },
          { enableNotifications },
        );
      },
      onError: (error: Error) => {
        notifier?.(
          { type: editItemRoutine.FAILURE, payload: { error } },
          { enableNotifications },
        );
      },
      onSettled: (newItem, _error, { id }) => {
        if (newItem) {
          const parentKey = getKeyForParentId(getParentFromPath(newItem.path));
          queryClient.invalidateQueries({ queryKey: parentKey });
        }
        const itemKey = itemKeys.single(id).content;
        queryClient.invalidateQueries({ queryKey: itemKey });
      },
    });
  };

  const useRecycleItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (itemIds: UUID[]) =>
        splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.recycleItems(chunk, queryConfig),
        ),
      onMutate: async (itemIds: UUID[]) => {
        // get path from first item and invalidate parent's children
        const itemKey = itemKeys.single(itemIds[0]).content;
        const itemData = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        const itemPath = itemData?.path;
        const newParent = itemPath
          ? {
              parent: await mutateParentChildren(
                {
                  childPath: itemPath,
                  value: (old: DiscriminatedItem[]) =>
                    old.filter(({ id }) => !itemIds.includes(id)),
                },
                queryClient,
              ),
            }
          : {};
        const previousItems = {
          ...newParent,
        };
        // items themselves still exist but the path is different
        return previousItems;
      },
      onError: (error: Error) => {
        notifier?.({ type: recycleItemsRoutine.FAILURE, payload: { error } });

        // does not settled since endpoint is async
      },
    });
  };

  const useDeleteItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (itemIds) =>
        splitRequestByIds<DiscriminatedItem>(
          itemIds,
          MAX_TARGETS_FOR_MODIFY_REQUEST,
          (chunk) => Api.deleteItems(chunk, queryConfig),
        ),
      onMutate: async (itemIds: UUID[]) => {
        // get path from first item
        const itemKey = memberKeys.current().allRecycled;
        const itemData = queryClient.getQueryData<RecycledItemData[]>(itemKey);
        queryClient.setQueryData(
          itemKey,
          itemData?.filter(({ item: { id } }) => !itemIds.includes(id)),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const previousItems: any = {
          parent: itemData,
        };

        itemIds.forEach(async (id) => {
          previousItems[id] = await mutateItem({
            queryClient,
            id,
            value: null,
          });
        });
        return previousItems;
      },
      onError: (error: Error) => {
        notifier?.({ type: deleteItemsRoutine.FAILURE, payload: { error } });

        // does not settled since endpoint is async
      },
    });
  };

  const useCopyItems = () =>
    useMutation({
      mutationFn: ({ ids, to }: { ids: UUID[]; to?: UUID }) =>
        splitRequestByIds(ids, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.copyItems({ ids: chunk, to }, queryConfig),
        ),
      // cannot mutate because it needs the id
      onError: (error: Error) => {
        notifier?.({ type: copyItemsRoutine.FAILURE, payload: { error } });

        // does not settled since endpoint is async
      },
    });

  const useMoveItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ items, to }: { items: PackedItem[]; to?: UUID }) =>
        splitRequestByIds<DiscriminatedItem>(
          items.map((i) => i.id),
          MAX_TARGETS_FOR_MODIFY_REQUEST,
          (chunk) => Api.moveItems({ ids: chunk, to }, queryConfig),
        ),
      onMutate: async ({ items, to }) => {
        const itemIds = items.map((i) => i.id);
        if (items.length) {
          // suppose items are at the same level
          const { path } = items[0];
          // add item in target item
          await mutateParentChildren(
            {
              id: to,
              value: (old: PackedItem[]) => old?.concat(items),
            },
            queryClient,
          );

          // remove item in original item
          await mutateParentChildren(
            {
              childPath: path,
              value: (old: PackedItem[]) =>
                old?.filter(({ id: oldId }) => !itemIds.includes(oldId)),
            },
            queryClient,
          );
        }

        const toData = queryClient.getQueryData<PackedItem>(
          itemKeys.single(to).content,
        );
        if (toData?.id) {
          const toDataId = toData.id;
          // update item's path
          itemIds.forEach(async (itemId: UUID) => {
            await mutateItem({
              queryClient,
              id: itemId,
              value: (item: PackedItem) => ({
                ...item,
                path: buildPathFromIds(toDataId, itemId),
              }),
            });
          });
        }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error: Error) => {
        notifier?.({ type: moveItemsRoutine.FAILURE, payload: { error } });
      },
    });
  };

  const useRestoreItems = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (itemIds: UUID[]) =>
        splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.restoreItems(chunk, queryConfig),
        ),
      onMutate: async (itemIds) => {
        const key = memberKeys.current().allRecycled;
        const recycleItemData =
          queryClient.getQueryData<RecycledItemData[]>(key);
        if (recycleItemData) {
          queryClient.setQueryData(
            key,
            recycleItemData.filter(({ item: { id } }) => !itemIds.includes(id)),
          );
        }
        return recycleItemData;
      },

      onError: (error: Error, _itemId) => {
        notifier?.({ type: restoreItemsRoutine.FAILURE, payload: { error } });
      },
    });
    // invalidate only on error since endpoint is async
  };

  return {
    useReorderItem: useReorderItem(queryConfig),
    usePostItem: usePostItem(queryConfig),
    useEditItem,
    useRecycleItems,
    useDeleteItems,
    useCopyItems,
    useUploadFiles: useUploadFiles(queryConfig),
    /** @deprecated use useUploadFiles */
    useUploadFilesFeedback: useUploadFilesFeedback(queryConfig),
    useUploadItemThumbnail: useUploadItemThumbnail(queryConfig),
    /** @deprecated use useUploadItemThumbnail */
    useUploadItemThumbnailFeedback: useUploadItemThumbnailFeedback(queryConfig),
    useRestoreItems,
    useImportZip: useImportZip(queryConfig),
    useMoveItems,
    useDeleteItemThumbnail: useDeleteItemThumbnail(queryConfig),
    useImportH5P: useImportH5P(queryConfig),
  };
};
