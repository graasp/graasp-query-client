import {
  DiscriminatedItem,
  FolderItemExtra,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  RecycledItemData,
  ThumbnailSize,
  UUID,
} from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { QueryClient, useMutation, useQueryClient } from 'react-query';

import * as Api from '../api';
import {
  splitRequestByIds,
  throwIfArrayContainsErrorOrReturn,
} from '../api/axios';
import {
  OWN_ITEMS_KEY,
  RECYCLED_ITEMS_DATA_KEY,
  buildItemChildrenKey,
  buildItemKey,
  buildItemThumbnailKey,
  getKeyForParentId,
  itemsWithGeolocationKeys,
} from '../config/keys';
import {
  copyItemsRoutine,
  createEtherpadRoutine,
  createItemRoutine,
  deleteItemsRoutine,
  editItemRoutine,
  importH5PRoutine,
  importZipRoutine,
  moveItemsRoutine,
  recycleItemsRoutine,
  restoreItemsRoutine,
  uploadFileRoutine,
  uploadItemThumbnailRoutine,
} from '../routines';
import type { QueryClientConfig } from '../types';
import { buildPath, getDirectParentId } from '../utils/item';

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
    const itemKey = buildItemKey(id);

    await queryClient.cancelQueries(itemKey);

    // Snapshot the previous value
    const prevValue = queryClient.getQueryData<T>(itemKey);

    queryClient.setQueryData(itemKey, value);

    // Return a context object with the snapshotted value
    return prevValue;
  };

  // todo: we don't consider accessible, shared or published items here
  // this part is a bit flacky/unclear it might be better to refactor it
  const mutateParentChildren = async (
    args: ({ id?: string } | { childPath: string }) & { value: unknown },
    queryClient: QueryClient,
  ): Promise<unknown> => {
    const { value } = args;
    const parentId =
      'childPath' in args ? getDirectParentId(args.childPath) : args.id;

    // get parent key
    const childrenKey = !parentId
      ? OWN_ITEMS_KEY
      : buildItemChildrenKey(parentId);
    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries(childrenKey);

    // Snapshot the previous value if exists
    // do not create entry if it doesn't exist
    if (queryClient.getQueryState(childrenKey)) {
      const prevChildren = queryClient.getQueryData(childrenKey);

      // Optimistically update
      queryClient.setQueryData(childrenKey, value);

      // Return a context object with the snapshotted value
      return prevChildren;
    }
    return null;
  };

  const usePostItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (item: Api.PostItemPayloadType) => Api.postItem(item, queryConfig),
      // we cannot optimistically add an item because we need its id
      {
        onSuccess: () => {
          notifier?.({
            type: createItemRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
          });
        },
        onError: (error: Error) => {
          notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { lat, lng, parentId }) => {
          const key = getKeyForParentId(parentId);
          queryClient.invalidateQueries(key);

          // if item has geoloc, invalidate map related keys
          if (lat || lng) {
            queryClient.invalidateQueries(itemsWithGeolocationKeys.all);
          }
        },
      },
    );
  };

  const usePostEtherpad = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (
        params: Pick<DiscriminatedItem, 'name'> & {
          parentId?: string;
        },
      ) => Api.postEtherpad(params, queryConfig),
      // we cannot optimistically add an item because we need its id
      {
        onSuccess: () => {
          notifier?.({
            type: createEtherpadRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
          });
        },
        onError: (error: Error) => {
          notifier?.({
            type: createEtherpadRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { parentId }) => {
          const key = getKeyForParentId(parentId);
          queryClient.invalidateQueries(key);
        },
      },
    );
  };

  const useEditItem = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (
        item: Pick<DiscriminatedItem, 'id'> &
          Partial<
            Pick<
              DiscriminatedItem,
              'name' | 'description' | 'extra' | 'settings'
            >
          >,
      ) => Api.editItem(item.id, item, queryConfig),
      // newItem contains all updatable properties
      {
        onMutate: async (
          newItem: Partial<DiscriminatedItem> &
            Pick<DiscriminatedItem, 'id'> & {
              extra?: DiscriminatedItem['extra'];
            },
        ) => {
          const itemKey = buildItemKey(newItem.id);

          // invalidate key
          await queryClient.cancelQueries(itemKey);

          // build full item with new values
          const prevItem = queryClient.getQueryData<DiscriminatedItem>(itemKey);

          // if the item is not in the cache, we don't need to continue with optimistic mutation
          if (!prevItem) {
            return {};
          }

          // trim manually name because it does it in the backend
          const newFullItem = { ...prevItem, name: prevItem?.name?.trim() };
          queryClient.setQueryData(itemKey, newFullItem);

          const previousItems = {
            ...(Boolean(prevItem) && {
              parent: await mutateParentChildren(
                {
                  childPath: prevItem?.path,
                  value: (old: DiscriminatedItem[]) => {
                    if (!old?.length) {
                      return old;
                    }
                    const idx = old.findIndex(({ id }) => id === newItem.id);
                    if (newFullItem && idx >= 0) {
                      // eslint-disable-next-line no-param-reassign
                      old[idx] = newFullItem;
                    }
                    return old;
                  },
                },
                queryClient,
              ),
              item: prevItem,
            }),
          };
          return previousItems;
        },
        onSuccess: () => {
          notifier?.({
            type: editItemRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.EDIT_ITEM },
          });
        },
        onError: (error: Error, newItem, context) => {
          if (context?.parent && context?.item) {
            const prevItem = context?.item;
            const parentKey = getKeyForParentId(
              getDirectParentId(prevItem?.path),
            );
            queryClient.setQueryData(parentKey, context.parent);
          }

          const itemKey = buildItemKey(newItem.id);
          queryClient.setQueryData(itemKey, context?.item);
          notifier?.({ type: editItemRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_newItem, _error, { id, extra }, context) => {
          const prevItem = context?.item;
          if (prevItem) {
            const parentKey = getKeyForParentId(
              getDirectParentId(prevItem.path),
            );
            queryClient.invalidateQueries(parentKey);
          }

          // reorder affect children to change
          if ((extra as FolderItemExtra)?.[ItemType.FOLDER]?.childrenOrder) {
            queryClient.invalidateQueries(buildItemChildrenKey(id));
          }

          const itemKey = buildItemKey(id);
          queryClient.invalidateQueries(itemKey);
        },
      },
    );
  };

  const useRecycleItems = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemIds: UUID[]) =>
        splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.recycleItems(chunk, queryConfig),
        ),
      {
        onMutate: async (itemIds: UUID[]) => {
          // get path from first item and invalidate parent's children
          const itemKey = buildItemKey(itemIds[0]);
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
      },
    );
  };

  const useDeleteItems = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemIds) =>
        splitRequestByIds<DiscriminatedItem>(
          itemIds,
          MAX_TARGETS_FOR_MODIFY_REQUEST,
          (chunk) => Api.deleteItems(chunk, queryConfig),
        ),

      {
        onMutate: async (itemIds: UUID[]) => {
          // get path from first item
          const itemKey = RECYCLED_ITEMS_DATA_KEY;
          const itemData =
            queryClient.getQueryData<RecycledItemData[]>(itemKey);
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
      },
    );
  };

  const useCopyItems = () =>
    useMutation(
      ({ ids, to }: { ids: UUID[]; to?: UUID }) =>
        splitRequestByIds(ids, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.copyItems({ ids: chunk, to }, queryConfig),
        ),
      // cannot mutate because it needs the id
      {
        onError: (error: Error) => {
          notifier?.({ type: copyItemsRoutine.FAILURE, payload: { error } });

          // does not settled since endpoint is async
        },
      },
    );

  const useMoveItems = () => {
    const queryClient = useQueryClient();
    return useMutation(
      ({ ids, to }: { ids: UUID[]; to?: UUID }) =>
        splitRequestByIds<DiscriminatedItem>(
          ids,
          MAX_TARGETS_FOR_MODIFY_REQUEST,
          (chunk) => Api.moveItems({ ids: chunk, to }, queryConfig),
        ),
      {
        onMutate: async ({ ids, to }: { ids: UUID[]; to?: UUID }) => {
          const itemIds = ids;
          const itemsData = itemIds
            .map((itemId: UUID) => {
              const itemKey = buildItemKey(itemId);
              const itemData =
                queryClient.getQueryData<DiscriminatedItem>(itemKey);
              return itemData;
            })
            .filter(Boolean) as DiscriminatedItem[];

          const { path } = itemsData[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const context: any = {
            ...(Boolean(itemsData) && {
              // add item in target item
              targetParent: await mutateParentChildren(
                {
                  id: to,
                  value: (old: DiscriminatedItem[]) => old?.concat(itemsData),
                },
                queryClient,
              ),

              // remove item in original item
              originalParent: await mutateParentChildren(
                {
                  childPath: path,
                  value: (old: DiscriminatedItem[]) =>
                    old?.filter(({ id: oldId }) => !itemIds.includes(oldId)),
                },
                queryClient,
              ),
            }),
          };

          const toData = queryClient.getQueryData<DiscriminatedItem>(
            buildItemKey(to),
          );
          if (toData?.path) {
            const toDataPath = toData.path;
            // update item's path
            itemIds.forEach(async (itemId: UUID) => {
              context[itemId] = await mutateItem({
                queryClient,
                id: itemId,
                value: (item: DiscriminatedItem) => ({
                  ...item,
                  path: buildPath({
                    prefix: toDataPath,
                    ids: [itemId],
                  }),
                }),
              });
            });
          }
          return context;
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (error: Error) => {
          notifier?.({ type: moveItemsRoutine.FAILURE, payload: { error } });
        },
      },
    );
  };

  /**
   * this mutation is used for its callback and invalidate the keys
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  const useUploadFiles = () => {
    const queryClient = useQueryClient();
    return useMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async ({ error, data }: { error?: Error; data?: any; id?: string }) => {
        throwIfArrayContainsErrorOrReturn(data);
        if (error) throw new Error(JSON.stringify(error));
      },
      {
        onSuccess: () => {
          notifier?.({
            type: uploadFileRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
          });
        },
        onError: (axiosError: Error, { error }) => {
          notifier?.({
            type: uploadFileRoutine.FAILURE,
            payload: { error: error ?? axiosError },
          });
        },
        onSettled: (_data, _error, { id }) => {
          const parentKey = getKeyForParentId(id);
          queryClient.invalidateQueries(parentKey);
        },
      },
    );
  };

  /**
   * this mutation is used for its callback and invalidate the keys
   * @param {UUID} id parent item id where the file is uploaded in
   * @param {error} [error] error occurred during the file uploading
   */
  const useUploadItemThumbnail = () => {
    const queryClient = useQueryClient();
    return useMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async ({ error }: { id: string; error?: Error; data?: any }) => {
        if (error) throw new Error(JSON.stringify(error));
      },
      {
        onSuccess: () => {
          notifier?.({
            type: uploadItemThumbnailRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.UPLOAD_ITEM_THUMBNAIL },
          });
        },
        onError: (_error, { error }) => {
          notifier?.({
            type: uploadItemThumbnailRoutine.FAILURE,
            payload: { error },
          });
        },
        onSettled: (_data, _error, { id }) => {
          Object.values(ThumbnailSize).forEach((size) => {
            const key1 = buildItemThumbnailKey({ replyUrl: false, id, size });
            queryClient.invalidateQueries(key1);
            const key2 = buildItemThumbnailKey({ replyUrl: true, id, size });
            queryClient.invalidateQueries(key2);
          });
          // invalidate item to update settings.hasThumbnail
          queryClient.invalidateQueries(buildItemKey(id));
        },
      },
    );
  };

  const useImportZip = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({ error }: { error?: Error; id: string }) => {
        if (error) {
          throw new Error(JSON.stringify(error));
        }
      },
      {
        onSuccess: () => {
          notifier?.({
            type: importZipRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.IMPORT_ZIP },
          });
        },
        onError: (_error, { error }) => {
          notifier?.({ type: importZipRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { id }) => {
          const parentKey = getKeyForParentId(id);
          queryClient.invalidateQueries(parentKey);
        },
      },
    );
  };

  const useImportH5P = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async ({ error }: { error?: Error; id: string }) => {
        if (error) {
          throw new Error(JSON.stringify(error));
        }
      },
      {
        onSuccess: () => {
          notifier?.({
            type: importH5PRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.IMPORT_H5P },
          });
        },
        onError: (_error, { error }) => {
          notifier?.({ type: importH5PRoutine.FAILURE, payload: { error } });
        },
        onSettled: (_data, _error, { id }) => {
          const parentKey = getKeyForParentId(id);
          queryClient.invalidateQueries(parentKey);
        },
      },
    );
  };

  const useRestoreItems = () => {
    const queryClient = useQueryClient();
    return useMutation(
      (itemIds: UUID[]) =>
        splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
          Api.restoreItems(chunk, queryConfig),
        ),
      {
        onMutate: async (itemIds) => {
          const key = RECYCLED_ITEMS_DATA_KEY;
          const recycleItemData =
            queryClient.getQueryData<RecycledItemData[]>(key);
          if (recycleItemData) {
            queryClient.setQueryData(
              key,
              recycleItemData.filter(
                ({ item: { id } }) => !itemIds.includes(id),
              ),
            );
          }
          return recycleItemData;
        },

        onError: (error: Error, _itemId) => {
          notifier?.({ type: restoreItemsRoutine.FAILURE, payload: { error } });
        },
      },
    );
    // invalidate only on error since endpoint is async
  };

  return {
    usePostItem,
    usePostEtherpad,
    useEditItem,
    useRecycleItems,
    useDeleteItems,
    useCopyItems,
    useUploadFiles,
    useUploadItemThumbnail,
    useRestoreItems,
    useImportH5P,
    useImportZip,
    useMoveItems,
  };
};
