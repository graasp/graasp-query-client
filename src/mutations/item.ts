import { List, Record } from 'immutable';
import { QueryClient, useMutation } from 'react-query';

import {
  DiscriminatedItem,
  GraaspError,
  Item,
  ItemSettings,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  ThumbnailSize,
  UUID,
  convertJs,
} from '@graasp/sdk';
import { ItemRecord } from '@graasp/sdk/frontend';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import * as Api from '../api';
import {
  splitAsyncRequestByIds,
  splitRequestByIds,
  throwIfArrayContainsErrorOrReturn,
} from '../api/axios';
import {
  MUTATION_KEYS,
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

const {
  POST_ITEM,
  EDIT_ITEM,
  UPLOAD_FILES,
  MOVE_ITEMS,
  COPY_ITEMS,
  DELETE_ITEMS,
  RECYCLE_ITEMS,
  RESTORE_ITEMS,
  UPLOAD_ITEM_THUMBNAIL,
  IMPORT_ZIP,
  IMPORT_H5P,
  POST_ETHERPAD,
} = MUTATION_KEYS;

interface Value {
  value: unknown;
}

interface IdAndValue extends Value {
  id: UUID;
}

interface PathAndValue extends Value {
  childPath: string;
}

type IdOrPathWithValue = IdAndValue | PathAndValue;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  const { notifier } = queryConfig;

  // Utils functions to mutate react query data
  const mutateItem = async ({
    id,
    value,
  }: {
    id: UUID;
    value: unknown;
  }): Promise<unknown> => {
    const itemKey = buildItemKey(id);

    await queryClient.cancelQueries(itemKey);

    // Snapshot the previous value
    const prevValue = queryClient.getQueryData(itemKey);

    queryClient.setQueryData(itemKey, value);

    // Return a context object with the snapshotted value
    return prevValue;
  };

  const mutateParentChildren = async (
    args: IdOrPathWithValue,
  ): Promise<unknown> => {
    const { value } = args;
    const parentId =
      (args as IdAndValue).id ||
      getDirectParentId((args as PathAndValue).childPath);

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

  queryClient.setMutationDefaults(POST_ITEM, {
    mutationFn: async (item: Api.PostItemPayloadType) =>
      Api.postItem(item, queryConfig),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({
        type: createItemRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
      });
    },
    onError: (error) => {
      notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { parentId }) => {
      const key = getKeyForParentId(parentId);
      queryClient.invalidateQueries(key);
    },
  });
  const usePostItem = () =>
    useMutation<void, unknown, Api.PostItemPayloadType>(POST_ITEM);

  queryClient.setMutationDefaults(POST_ETHERPAD, {
    mutationFn: async (params) => Api.postEtherpad(params, queryConfig),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({
        type: createEtherpadRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.CREATE_ITEM },
      });
    },
    onError: (error) => {
      notifier?.({ type: createEtherpadRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { parentId }) => {
      const key = getKeyForParentId(parentId);
      queryClient.invalidateQueries(key);
    },
  });
  const usePostEtherpad = () =>
    useMutation<
      void,
      unknown,
      Pick<Item<ItemSettings>, 'name'> & {
        parentId?: string;
      }
    >(POST_ETHERPAD);

  queryClient.setMutationDefaults(EDIT_ITEM, {
    mutationFn: (item: Partial<Item> & Pick<Item, 'id'>) =>
      Api.editItem(item.id, item, queryConfig),
    // newItem contains only changed values
    onMutate: async (newItem: Partial<Item> & Pick<Item, 'id'>) => {
      const trimmed: ItemRecord = convertJs({
        ...newItem,
        name: newItem.name?.trim(),
      });

      const itemKey = buildItemKey(newItem.id);

      // invalidate key
      await queryClient.cancelQueries(itemKey);

      // build full item with new values
      const prevItem = queryClient.getQueryData(itemKey) as ItemRecord;

      const newFullItem = prevItem ? prevItem.merge(trimmed) : prevItem;

      queryClient.setQueryData(itemKey, newFullItem);

      const previousItems = {
        ...(Boolean(prevItem) && {
          parent: await mutateParentChildren({
            childPath: prevItem.path,
            value: (old: List<ItemRecord>) => {
              if (!old || old.isEmpty()) {
                return old;
              }
              const idx = old.findIndex(({ id }) => id === newItem.id);
              // todo: remove toJS when moving to List<Map<Item>>
              return old.set(idx, newFullItem);
            },
          }),
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
    onError: (error, newItem, context) => {
      const { item: prevItem } = context;
      const parentKey = getKeyForParentId(getDirectParentId(prevItem.path));
      if (context.parent) {
        queryClient.setQueryData(parentKey, context.parent);
      }

      const itemKey = buildItemKey(newItem.id);
      queryClient.setQueryData(itemKey, context.item);
      notifier?.({ type: editItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_newItem, _error, { id }, context) => {
      const { item: prevItem } = context;
      if (prevItem) {
        const parentKey = getKeyForParentId(getDirectParentId(prevItem.path));
        queryClient.invalidateQueries(parentKey);
      }

      const itemKey = buildItemKey(id);
      queryClient.invalidateQueries(itemKey);
    },
  });
  const useEditItem = () =>
    useMutation<
      void,
      unknown,
      Partial<DiscriminatedItem> & Pick<DiscriminatedItem, 'id'>
    >(EDIT_ITEM);

  queryClient.setMutationDefaults(RECYCLE_ITEMS, {
    mutationFn: (itemIds) =>
      splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
        Api.recycleItems(chunk, queryConfig),
      ),
    onMutate: async (itemIds: UUID[]) => {
      // get path from first item and invalidate parent's children
      const itemKey = buildItemKey(itemIds[0]);
      const itemData = queryClient.getQueryData<ItemRecord>(itemKey);
      const itemPath = itemData?.path;
      const newParent = itemPath
        ? {
            parent: await mutateParentChildren({
              childPath: itemPath,
              value: (old: List<ItemRecord>) =>
                old.filter(({ id }) => !itemIds.includes(id)),
            }),
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
    onError: (error, itemIds: UUID[], context) => {
      const itemKey = buildItemKey(itemIds[0]);
      const itemData = queryClient.getQueryData(itemKey) as ItemRecord;
      const itemPath = itemData?.path;

      if (itemPath && context.parent) {
        const childrenKey = getKeyForParentId(getDirectParentId(itemPath));
        queryClient.setQueryData(childrenKey, context.parent);
      }
      notifier?.({ type: recycleItemsRoutine.FAILURE, payload: { error } });
    },
    // does not settled since endpoint is async
  });
  const useRecycleItems = () =>
    useMutation<void, unknown, UUID[]>(RECYCLE_ITEMS);

  queryClient.setMutationDefaults(DELETE_ITEMS, {
    mutationFn: (itemIds) =>
      splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
        Api.deleteItems(chunk, queryConfig),
      ),

    onMutate: async (itemIds: UUID[]) => {
      // get path from first item
      const itemKey = RECYCLED_ITEMS_DATA_KEY;
      const items = queryClient.getQueryData(itemKey) as List<ItemRecord>;
      queryClient.setQueryData(
        RECYCLED_ITEMS_DATA_KEY,
        items?.filter(({ id }) => !itemIds.includes(id)),
      );
      const previousItems: any = {
        parent: items,
      };

      itemIds.forEach(async (id) => {
        previousItems[id] = await mutateItem({ id, value: null });
      });
      return previousItems;
    },
    onSuccess: (result) => {
      const errors = result.filter(
        (r: Item | GraaspError) => (r as GraaspError).statusCode,
      );
      if (!errors.isEmpty()) {
        // todo: revert deleted items
        return notifier?.({
          type: deleteItemsRoutine.FAILURE,
          payload: { error: errors.first() },
        });
      }
      return notifier?.({
        type: deleteItemsRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.DELETE_ITEMS },
      });
    },
    onError: (error, itemIds: UUID[], context) => {
      const itemPath = context[itemIds[0]]?.path;

      if (itemPath) {
        queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, context.parent);
      }

      itemIds.forEach((id) => {
        const itemKey = buildItemKey(id);
        queryClient.setQueryData(itemKey, context[id]);
      });

      notifier?.({ type: deleteItemsRoutine.FAILURE, payload: { error } });
    },
    // does not settled since endpoint is async
  });
  const useDeleteItems = () => useMutation<void, unknown, UUID[]>(DELETE_ITEMS);

  queryClient.setMutationDefaults(COPY_ITEMS, {
    mutationFn: ({ ids, to }: { ids: UUID[]; to?: UUID }) =>
      splitAsyncRequestByIds(ids, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
        Api.copyItems({ ids: chunk, to }, queryConfig),
      ),
    // cannot mutate because it needs the id
    onSuccess: () => {
      notifier?.({
        type: copyItemsRoutine.TRIGGER,
        // TODO: CHANGE FOR PENDING TEXT
        payload: { message: SUCCESS_MESSAGES.COPY_ITEMS },
      });
    },
    onError: (error) => {
      notifier?.({ type: copyItemsRoutine.FAILURE, payload: { error } });
    },
    // does not settled since endpoint is async
  });
  const useCopyItems = () =>
    useMutation<
      void,
      unknown,
      {
        ids: UUID[];
        to?: UUID;
      }
    >(COPY_ITEMS);

  queryClient.setMutationDefaults(MOVE_ITEMS, {
    mutationFn: ({ ids, to }: { ids: UUID[]; to: UUID }) =>
      splitAsyncRequestByIds(ids, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
        Api.moveItems({ ids: chunk, to }, queryConfig),
      ),
    onMutate: async ({ id, ids, to }) => {
      const itemIds = id ?? ids;
      const itemsData = itemIds.map((itemId: UUID) => {
        const itemKey = buildItemKey(itemId);
        const itemData = queryClient.getQueryData<ItemRecord>(itemKey);
        return itemData?.toJS();
      });

      const { path } = itemsData[0];

      const context: any = {
        ...(Boolean(itemsData) && {
          // add item in target item
          targetParent: await mutateParentChildren({
            id: to,
            value: (old: List<Item>) => old?.concat(itemsData),
          }),

          // remove item in original item
          originalParent: await mutateParentChildren({
            childPath: path,
            value: (old: List<Item>) =>
              old?.filter(({ id: oldId }) => !itemIds.includes(oldId)),
          }),
        }),
      };

      const toData = queryClient.getQueryData<ItemRecord>(buildItemKey(to));
      if (toData?.has('path')) {
        const toDataPath = toData.path;
        // update item's path
        itemIds.forEach(async (itemId: UUID) => {
          context[itemId] = await mutateItem({
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
    onError: (error, { id, ids, to }, context) => {
      const itemIds = id ?? ids;
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
    },

    // does not settled since endpoint is async
  });
  const useMoveItems = () =>
    useMutation<
      void,
      unknown,
      {
        ids: UUID[];
        to?: UUID;
      }
    >(MOVE_ITEMS);

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(UPLOAD_FILES, {
    mutationFn: async ({ error, data }) => {
      throwIfArrayContainsErrorOrReturn(data);
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({
        type: uploadFileRoutine.SUCCESS,
        payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
      });
    },
    onError: (axiosError, { error }) => {
      notifier?.({
        type: uploadFileRoutine.FAILURE,
        payload: { error: error ?? axiosError },
      });
    },
    onSettled: (_data, _error, { id }) => {
      const parentKey = getKeyForParentId(id);
      queryClient.invalidateQueries(parentKey);
    },
  });
  const useUploadFiles = () =>
    useMutation<void, unknown, { error?: any; data?: any; id?: string }>(
      UPLOAD_FILES,
    );

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(UPLOAD_ITEM_THUMBNAIL, {
    mutationFn: async ({ error } = {}) => {
      if (error) throw new Error(JSON.stringify(error));
    },
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
  });
  const useUploadItemThumbnail = () =>
    useMutation<void, unknown, { id: string; error?: any; data?: any }>(
      UPLOAD_ITEM_THUMBNAIL,
    );

  queryClient.setMutationDefaults(IMPORT_ZIP, {
    mutationFn: async ({ error }) => {
      if (error) {
        throw new Error(JSON.stringify(error));
      }
    },
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
  });
  const useImportZip = () =>
    useMutation<void, unknown, { error: any }>(IMPORT_ZIP);

  queryClient.setMutationDefaults(IMPORT_H5P, {
    mutationFn: async ({ error }) => {
      if (error) {
        throw new Error(JSON.stringify(error));
      }
    },
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
  });
  const useImportH5P = () =>
    useMutation<void, unknown, { error: any }>(IMPORT_H5P);

  queryClient.setMutationDefaults(RESTORE_ITEMS, {
    mutationFn: (itemIds) =>
      splitRequestByIds(itemIds, MAX_TARGETS_FOR_MODIFY_REQUEST, (chunk) =>
        Api.restoreItems(chunk, queryConfig),
      ),

    onMutate: async (itemIds) => {
      const key = RECYCLED_ITEMS_DATA_KEY;
      const items = queryClient.getQueryData(key) as List<Item>;
      queryClient.setQueryData(
        key,
        items.filter(({ id }) => !itemIds.includes(id)),
      );
      return items;
    },
    onSuccess: (_data, itemIds) => {
      // invalidate parents' children to now get the restored items
      for (const id of itemIds) {
        const item = queryClient.getQueryData<Record<Item>>(buildItemKey(id));
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
    onError: (error, _itemId, context) => {
      queryClient.setQueryData(RECYCLED_ITEMS_DATA_KEY, context);
      notifier?.({ type: restoreItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(RECYCLED_ITEMS_DATA_KEY);
    },
  });
  const useRestoreItems = () =>
    useMutation<void, unknown, UUID[]>(RESTORE_ITEMS);

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
