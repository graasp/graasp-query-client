import {
  DiscriminatedItem,
  FolderItemExtra,
  Item,
  ItemSettings,
  ItemType,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  ThumbnailSize,
  UUID,
  convertJs,
} from '@graasp/sdk';
import { ItemRecord, RecycledItemDataRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { List, Record } from 'immutable';
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
        onSettled: (_data, _error, { parentId }) => {
          const key = getKeyForParentId(parentId);
          queryClient.invalidateQueries(key);
        },
      },
    );
  };

  const usePostEtherpad = () => {
    const queryClient = useQueryClient();
    return useMutation(
      async (
        params: Pick<Item<ItemSettings>, 'name'> & {
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
        item: Pick<
          DiscriminatedItem,
          'id' | 'name' | 'description' | 'extra' | 'settings'
        >,
      ) => Api.editItem(item.id, item, queryConfig),
      // newItem contains all updatable properties
      {
        onMutate: async (newItem: Partial<Item> & Pick<Item, 'id'>) => {
          const trimmed: ItemRecord = convertJs({
            ...newItem,
            name: newItem.name?.trim(),
          });

          const itemKey = buildItemKey(newItem.id);

          // invalidate key
          await queryClient.cancelQueries(itemKey);

          // build full item with new values
          const prevItem = queryClient.getQueryData<ItemRecord>(itemKey);

          const newFullItem = prevItem ? prevItem.merge(trimmed) : prevItem;

          queryClient.setQueryData(itemKey, newFullItem);

          const previousItems = {
            ...(Boolean(prevItem) && {
              parent: await mutateParentChildren(
                {
                  childPath: prevItem?.path,
                  value: (old: List<ItemRecord>) => {
                    if (!old || old.isEmpty()) {
                      return old;
                    }
                    const idx = old.findIndex(({ id }) => id === newItem.id);
                    if (newFullItem) {
                      old.set(idx, newFullItem);
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
          const itemData = queryClient.getQueryData<ItemRecord>(itemKey);
          const itemPath = itemData?.path;
          const newParent = itemPath
            ? {
                parent: await mutateParentChildren(
                  {
                    childPath: itemPath,
                    value: (old: List<ItemRecord>) =>
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
        onSuccess: () => {
          notifier?.({
            type: recycleItemsRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.RECYCLE_ITEMS },
          });
        },
        onError: (error: Error, itemIds: UUID[], context) => {
          const itemKey = buildItemKey(itemIds[0]);
          const itemData = queryClient.getQueryData<ItemRecord>(itemKey);
          const itemPath = itemData?.path;

          if (itemPath && context?.parent) {
            const childrenKey = getKeyForParentId(getDirectParentId(itemPath));
            queryClient.setQueryData(childrenKey, context.parent);
          }
          notifier?.({ type: recycleItemsRoutine.FAILURE, payload: { error } });

          // invalidations
          itemIds.forEach((id) => {
            const iKey = buildItemKey(id);
            queryClient.invalidateQueries(iKey);
          });

          if (itemPath) {
            const childrenKey = getKeyForParentId(getDirectParentId(itemPath));
            queryClient.invalidateQueries(childrenKey);
          }
          // settled only on error since endpoint is async
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
            queryClient.getQueryData<List<RecycledItemDataRecord>>(itemKey);
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
        onSuccess: () =>
          notifier?.({
            type: deleteItemsRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.DELETE_ITEMS },
          }),
        onError: (error: Error, itemIds: UUID[], context) => {
          const itemPath = context?.[itemIds[0]]?.path;

          if (itemPath) {
            queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, context.parent);
          }

          itemIds.forEach((id) => {
            const itemKey = buildItemKey(id);
            queryClient.setQueryData(itemKey, context?.[id]);
          });

          notifier?.({ type: deleteItemsRoutine.FAILURE, payload: { error } });

          // invalidations
          itemIds.forEach((id) => {
            const itemKey = buildItemKey(id);
            queryClient.invalidateQueries(itemKey);
          });

          if (itemPath) {
            queryClient.invalidateQueries(RECYCLED_ITEMS_DATA_KEY);
          }
          // settled only on error since the endpoint is async
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
        onSuccess: () => {
          notifier?.({
            type: copyItemsRoutine.TRIGGER,
            // TODO: CHANGE FOR PENDING TEXT
            payload: { message: SUCCESS_MESSAGES.COPY_ITEMS },
          });
        },
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
              const itemData = queryClient.getQueryData<ItemRecord>(itemKey);
              return itemData?.toJS() as DiscriminatedItem;
            })
            .filter(Boolean);

          const { path } = itemsData[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const context: any = {
            ...(Boolean(itemsData) && {
              // add item in target item
              targetParent: await mutateParentChildren(
                {
                  id: to,
                  value: (old: List<Item>) => old?.concat(itemsData),
                },
                queryClient,
              ),

              // remove item in original item
              originalParent: await mutateParentChildren(
                {
                  childPath: path,
                  value: (old: List<Item>) =>
                    old?.filter(({ id: oldId }) => !itemIds.includes(oldId)),
                },
                queryClient,
              ),
            }),
          };

          const toData = queryClient.getQueryData<ItemRecord>(buildItemKey(to));
          if (toData?.has('path')) {
            const toDataPath = toData.path;
            // update item's path
            itemIds.forEach(async (itemId: UUID) => {
              context[itemId] = await mutateItem({
                queryClient,
                id: itemId,
                value: (item: Record<Item>) =>
                  item.set(
                    'path',
                    buildPath({
                      prefix: toDataPath,
                      ids: [itemId],
                    }),
                  ),
              });
            });
          }
          return context;
        },
        onSuccess: () => {
          notifier?.({
            type: moveItemsRoutine.TRIGGER,
            // TODO: CHANGE FOR PENDING TEXT
            payload: { message: SUCCESS_MESSAGES.MOVE_ITEMS },
          });
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (error: Error, { ids, to }, context) => {
          const itemIds = ids;
          const parentKey = getKeyForParentId(to);
          if (context.targetParent) {
            queryClient.setQueryData(parentKey, context.targetParent);
          }
          itemIds.forEach((itemId: UUID) => {
            const itemKey = buildItemKey(itemId);
            queryClient.setQueryData(itemKey, context[itemId]);

            const itemData = context[itemId];
            if (itemData && context.originalParent) {
              const pKey = getKeyForParentId(getDirectParentId(itemData.path));
              queryClient.setQueryData(pKey, context.originalParent);
            }
          });
          notifier?.({ type: moveItemsRoutine.FAILURE, payload: { error } });

          // Invalidate new parent
          const newParentKey = getKeyForParentId(to);
          queryClient.invalidateQueries(newParentKey);

          // Invalidate old parent
          const oldParentKey = getKeyForParentId(context.originalParent.id);
          queryClient.invalidateQueries(oldParentKey);

          itemIds.forEach((itemId: UUID) => {
            // Invalidate moved items
            const itemKey = buildItemKey(itemId);
            queryClient.invalidateQueries(itemKey);
          });
          // invalidate only on error since endpoint is async
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
            queryClient.getQueryData<List<RecycledItemDataRecord>>(key);
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
        onSuccess: (_data, itemIds) => {
          // invalidate parents' children to now get the restored items
          for (const id of itemIds) {
            const item = queryClient.getQueryData<Record<Item>>(
              buildItemKey(id),
            );
            if (item) {
              const key = getKeyForParentId(
                getDirectParentId(item?.get('path')) ?? null,
              );
              queryClient.invalidateQueries(key);
            }
          }
          notifier?.({
            type: restoreItemsRoutine.SUCCESS,
            payload: { message: SUCCESS_MESSAGES.RESTORE_ITEMS },
          });
        },
        onError: (error: Error, _itemId, context) => {
          queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, context);
          notifier?.({ type: restoreItemsRoutine.FAILURE, payload: { error } });
          queryClient.invalidateQueries(RECYCLED_ITEMS_DATA_KEY);
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
