import { List, Record, Map } from 'immutable';
import { QueryClient } from 'react-query';
import * as Api from '../api';
import {
  copyItemRoutine,
  copyItemsRoutine,
  createItemRoutine,
  deleteItemsRoutine,
  deleteItemRoutine,
  editItemRoutine,
  moveItemRoutine,
  moveItemsRoutine,
  shareItemRoutine,
  uploadFileRoutine,
  recycleItemsRoutine,
  restoreItemsRoutine,
  uploadItemThumbnailRoutine,
} from '../routines';
import {
  buildItemChildrenKey,
  buildItemKey,
  getKeyForParentId,
  MUTATION_KEYS,
  OWN_ITEMS_KEY,
  buildItemMembershipsKey,
  RECYCLED_ITEMS_KEY,
  buildManyItemMembershipsKey,
  buildItemThumbnailKey,
} from '../config/keys';
import { buildPath, getDirectParentId } from '../utils/item';
import type { Item, QueryClientConfig, UUID } from '../types';
import { THUMBNAIL_SIZES } from '../config/constants';

const {
  POST_ITEM,
  DELETE_ITEM,
  EDIT_ITEM,
  FILE_UPLOAD,
  SHARE_ITEM,
  MOVE_ITEM,
  MOVE_ITEMS,
  COPY_ITEM,
  COPY_ITEMS,
  DELETE_ITEMS,
  RECYCLE_ITEM,
  RECYCLE_ITEMS,
  RESTORE_ITEMS,
  UPLOAD_ITEM_THUMBNAIL,
  COPY_PUBLIC_ITEM,
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
  const mutateItem = async ({ id, value }: { id: UUID; value: unknown }) => {
    const itemKey = buildItemKey(id);

    await queryClient.cancelQueries(itemKey);

    // Snapshot the previous value
    const prevValue = queryClient.getQueryData(itemKey);

    queryClient.setQueryData(itemKey, value);

    // Return a context object with the snapshotted value
    return prevValue;
  };

  const mutateParentChildren = async (args: IdOrPathWithValue) => {
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

    // Snapshot the previous value
    const prevChildren = queryClient.getQueryData(childrenKey);

    // Optimistically update
    queryClient.setQueryData(childrenKey, value);

    // Return a context object with the snapshotted value
    return prevChildren;
  };

  queryClient.setMutationDefaults(POST_ITEM, {
    mutationFn: async (item) => Api.postItem(item, queryConfig),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({ type: createItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { parentId }) => {
      const key = getKeyForParentId(parentId);
      queryClient.invalidateQueries(key);
    },
  });

  queryClient.setMutationDefaults(EDIT_ITEM, {
    mutationFn: (item) => Api.editItem(item.id, item, queryConfig),
    // newItem contains only changed values
    onMutate: async (newItem: Partial<Item>) => {
      const trimmed = Map({
        ...newItem,
        name: newItem.name?.trim(),
      });

      const itemKey = buildItemKey(newItem.id);

      // invalidate key
      await queryClient.cancelQueries(itemKey);

      // build full item with new values
      const prevItem = queryClient.getQueryData(itemKey) as Record<Item>;
      const newFullItem = prevItem ? prevItem.merge(trimmed) : prevItem;
      queryClient.setQueryData(itemKey, newFullItem);

      const previousItems = {
        ...(Boolean(prevItem) && {
          parent: await mutateParentChildren({
            childPath: prevItem.get('path'),
            value: (old: List<Item>) => {
              if (!old || old.isEmpty()) {
                return old;
              }
              const idx = old.findIndex(({ id }) => id === newItem.id);
              // todo: remove toJS when moving to List<Map<Item>>
              return old.set(idx, newFullItem.toJS() as Item);
            },
          }),
          item: prevItem,
        }),
      };

      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: editItemRoutine.SUCCESS });
    },
    onError: (error, newItem, context) => {
      const { item: prevItem } = context;
      const parentKey = getKeyForParentId(
        getDirectParentId(prevItem.get('path')),
      );
      queryClient.setQueryData(parentKey, context.parent);
      const itemKey = buildItemKey(newItem.id);
      queryClient.setQueryData(itemKey, context.item);
      notifier?.({ type: editItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_newItem, _error, { id }, context) => {
      const { item: prevItem } = context;
      if (prevItem) {
        const parentKey = getKeyForParentId(
          getDirectParentId(prevItem.get('path')),
        );
        queryClient.invalidateQueries(parentKey);
      }

      const itemKey = buildItemKey(id);
      queryClient.invalidateQueries(itemKey);
    },
  });

  queryClient.setMutationDefaults(RECYCLE_ITEM, {
    mutationFn: (itemId) =>
      Api.recycleItem(itemId, queryConfig).then(() => itemId),

    onMutate: async (itemId) => {
      const itemKey = buildItemKey(itemId);
      const itemData = queryClient.getQueryData(itemKey) as Record<Item>;
      const previousItems = {
        ...(Boolean(itemData) && {
          children: await mutateParentChildren({
            childPath: itemData.get('path'),
            value: (children: List<Item>) =>
              children.filter((child) => child.id !== itemId),
          }),
          // item itself still exists but the path is different
          item: itemData,
        }),
      };
      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: recycleItemsRoutine.SUCCESS });
    },
    onError: (error, _itemId, context) => {
      const itemData = context.item;

      if (itemData) {
        const childrenKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.setQueryData(childrenKey, context.children);
      }
      notifier?.({ type: recycleItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (itemId, _error, _variables, context) => {
      const itemData = context.item;

      if (itemData) {
        const itemKey = buildItemKey(itemId);
        queryClient.invalidateQueries(itemKey);

        const childrenKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.invalidateQueries(childrenKey);
      }
    },
  });

  queryClient.setMutationDefaults(RECYCLE_ITEMS, {
    mutationFn: (itemIds) =>
      Api.recycleItems(itemIds, queryConfig).then(() => itemIds),

    onMutate: async (itemIds: UUID[]) => {
      // get path from first item
      const itemKey = buildItemKey(itemIds[0]);
      const itemData = queryClient.getQueryData(itemKey) as Record<Item>;
      const itemPath = itemData?.get('path');

      const previousItems = {
        ...(Boolean(itemPath) && {
          parent: await mutateParentChildren({
            childPath: itemPath,
            value: (old: List<Item>) =>
              old.filter(({ id }) => !itemIds.includes(id)),
          }),
        }),
      };
      // items themselves still exist but the path is different
      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: recycleItemsRoutine.SUCCESS });
    },
    onError: (error, itemIds: UUID[], context) => {
      const itemKey = buildItemKey(itemIds[0]);
      const itemData = queryClient.getQueryData(itemKey) as Record<Item>;
      const itemPath = itemData?.get('path');

      if (itemPath) {
        const childrenKey = getKeyForParentId(getDirectParentId(itemPath));
        queryClient.setQueryData(childrenKey, context.parent);
      }
      notifier?.({ type: recycleItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, itemIds: UUID[], _variables) => {
      const itemKey = buildItemKey(itemIds[0]);
      const itemData = queryClient.getQueryData(itemKey) as Record<Item>;
      const itemPath = itemData?.get('path');

      itemIds.forEach((id) => {
        const iKey = buildItemKey(id);
        queryClient.invalidateQueries(iKey);
      });

      if (itemPath) {
        const childrenKey = getKeyForParentId(getDirectParentId(itemPath));
        queryClient.invalidateQueries(childrenKey);
      }
    },
  });

  queryClient.setMutationDefaults(DELETE_ITEM, {
    mutationFn: ([itemId]) =>
      Api.deleteItem(itemId, queryConfig).then(() => itemId),

    onMutate: async ([itemId]) => {
      const key = RECYCLED_ITEMS_KEY;
      const data = queryClient.getQueryData(key) as List<Item>;
      queryClient.setQueryData(
        key,
        data?.filter(({ id }) => id !== itemId),
      );
      const previousItems = {
        parent: data,
        item: await mutateItem({ id: itemId, value: null }),
      };
      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: deleteItemRoutine.SUCCESS });
    },
    onError: (error, [itemId], context) => {
      const itemData = context.item;

      if (itemData) {
        const itemKey = buildItemKey(itemId);
        queryClient.setQueryData(itemKey, context.item);
        queryClient.setQueryData(RECYCLED_ITEMS_KEY, context.parent);
      }
      notifier?.({ type: deleteItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, [itemId], context) => {
      const itemData = context.item;

      if (itemData) {
        const itemKey = buildItemKey(itemId);
        queryClient.invalidateQueries(itemKey);
        queryClient.invalidateQueries(RECYCLED_ITEMS_KEY);
      }
    },
  });

  queryClient.setMutationDefaults(DELETE_ITEMS, {
    mutationFn: (itemIds) =>
      Api.deleteItems(itemIds, queryConfig).then(() => itemIds),

    onMutate: async (itemIds: UUID[]) => {
      // get path from first item
      const itemKey = RECYCLED_ITEMS_KEY;
      const items = queryClient.getQueryData(itemKey) as List<Item>;
      queryClient.setQueryData(
        RECYCLED_ITEMS_KEY,
        items?.filter(({ id }) => !itemIds.includes(id)),
      );
      const previousItems = {
        parent: items,
      };

      itemIds.forEach(async (id) => {
        previousItems[id] = await mutateItem({ id, value: null });
      });

      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: deleteItemRoutine.SUCCESS });
    },
    onError: (error, itemIds: UUID[], context) => {
      const itemPath = context[itemIds[0]]?.get('path');

      if (itemPath) {
        queryClient.setQueryData(RECYCLED_ITEMS_KEY, context.parent);
      }

      itemIds.forEach((id) => {
        const itemKey = buildItemKey(id);
        queryClient.setQueryData(itemKey, context[id]);
      });

      notifier?.({ type: deleteItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, itemIds: UUID[], context) => {
      const itemPath = context[itemIds[0]]?.get('path');

      itemIds.forEach((id) => {
        const itemKey = buildItemKey(id);
        queryClient.invalidateQueries(itemKey);
      });

      if (itemPath) {
        queryClient.invalidateQueries(RECYCLED_ITEMS_KEY);
      }
    },
  });

  queryClient.setMutationDefaults(COPY_ITEM, {
    mutationFn: (payload) =>
      Api.copyItem(payload, queryConfig).then((newItem) => ({
        to: payload.to,
        ...newItem,
      })),
    // cannot mutate because it needs the id
    onSuccess: (data) => {
      notifier?.({ type: copyItemRoutine.SUCCESS, payload: data });
    },
    onError: (error) => {
      notifier?.({ type: copyItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_newItem, _err, payload) => {
      const parentKey = getKeyForParentId(payload.to);
      queryClient.invalidateQueries(parentKey);
    },
  });

  queryClient.setMutationDefaults(COPY_PUBLIC_ITEM, {
    mutationFn: (payload) =>
      Api.copyPublicItem(payload, queryConfig).then((newItem) => ({
        to: payload.to,
        ...newItem,
      })),
    onSuccess: (data) => {
      notifier?.({ type: copyItemRoutine.SUCCESS, payload: data });
    },
    onError: (error) => {
      notifier?.({ type: copyItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_newItem, _err, payload) => {
      const parentKey = getKeyForParentId(payload.to);
      queryClient.invalidateQueries(parentKey);
    },
  });

  queryClient.setMutationDefaults(COPY_ITEMS, {
    mutationFn: (payload) =>
      Api.copyItems(payload, queryConfig).then((newItems) => ({
        to: payload.to,
        ...newItems,
      })),
    // cannot mutate because it needs the id
    onSuccess: () => {
      notifier?.({ type: copyItemsRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: copyItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_newItems, _err, payload) => {
      const parentKey = getKeyForParentId(payload.to);
      queryClient.invalidateQueries(parentKey);
    },
  });

  queryClient.setMutationDefaults(MOVE_ITEM, {
    mutationFn: (payload) =>
      Api.moveItem(payload, queryConfig).then(() => payload),
    onMutate: async ({ id: itemId, to }) => {
      const itemKey = buildItemKey(itemId);
      const itemData = queryClient.getQueryData<Record<Item>>(itemKey);
      const toData = queryClient.getQueryData<Record<Item>>(buildItemKey(to));

      const context: {
        targetParent?: unknown;
        originalParent?: unknown;
        item?: unknown;
      } = {};

      if (itemData?.has('path') && toData?.has('path')) {
        const newPath = buildPath({
          prefix: toData.get('path'),
          ids: [itemId],
        });

        // update item
        context.item = itemData;
        const updatedItem = itemData.set('path', newPath);
        queryClient.setQueryData(itemKey, updatedItem);

        // add item to target item children
        context.targetParent = await mutateParentChildren({
          id: to,
          value: (old: List<Item>) => old?.push(updatedItem?.toJS() as Item),
        });

        // remove item from current parent children
        const oldPath = itemData.get('path');
        context.originalParent = await mutateParentChildren({
          childPath: oldPath,
          value: (old: List<Item>) => old?.filter(({ id }) => id !== itemId),
        });
      }
      return context;
    },
    onSuccess: () => {
      notifier?.({ type: moveItemRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, { id, to }, context) => {
      const itemKey = buildItemKey(id);
      queryClient.setQueryData(itemKey, context.item);

      const parentKey = getKeyForParentId(to);
      queryClient.setQueryData(parentKey, context.targetParent);

      const itemData = context.item;
      if (itemData) {
        const pKey = getKeyForParentId(getDirectParentId(itemData.get('path')));
        queryClient.setQueryData(pKey, context.originalParent);
      }
      notifier?.({ type: moveItemRoutine.FAILURE, payload: { error } });
    },
    // Always refetch after error or success:
    onSettled: (_newItem, _err, { id, to }, context) => {
      // Invalidate new parent
      const newParentKey = getKeyForParentId(to);
      queryClient.invalidateQueries(newParentKey);

      // Invalidate old parent
      const oldParentKey = getKeyForParentId(context.originalParent.id);
      queryClient.invalidateQueries(oldParentKey);

      // Invalidate moved item
      const itemKey = buildItemKey(id);
      queryClient.invalidateQueries(itemKey);
    },
  });

  queryClient.setMutationDefaults(MOVE_ITEMS, {
    mutationFn: (payload) =>
      Api.moveItems(payload, queryConfig).then(() => payload),
    onMutate: async ({ id: itemIds, to }) => {
      const itemsData = itemIds.map((id: UUID) => {
        const itemKey = buildItemKey(id);
        const itemData = queryClient.getQueryData<Record<Item>>(itemKey);
        return itemData?.toJS();
      });

      const { path } = itemsData[0];

      const context = {
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
              old?.filter(({ id }) => !itemIds.includes(id)),
          }),
        }),
      };

      const toData = queryClient.getQueryData<Record<Item>>(buildItemKey(to));
      if (toData?.has('path')) {
        const toDataPath = toData.get('path');
        // update item's path
        itemIds.forEach(async (id: UUID) => {
          context[id] = await mutateItem({
            id,
            value: (item: Record<Item>) =>
              item.set(
                'path',
                buildPath({
                  prefix: toDataPath,
                  ids: [id],
                }),
              ),
          });
        });
      }
      return context;
    },
    onSuccess: () => {
      notifier?.({ type: moveItemsRoutine.SUCCESS });
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, { id: itemIds, to }, context) => {
      const parentKey = getKeyForParentId(to);
      queryClient.setQueryData(parentKey, context.targetParent);
      itemIds.forEach((id: UUID) => {
        const itemKey = buildItemKey(id);
        queryClient.setQueryData(itemKey, context[id]);

        const itemData = context[id];
        if (itemData) {
          const pKey = getKeyForParentId(
            getDirectParentId(itemData.get('path')),
          );
          queryClient.setQueryData(pKey, context.originalParent);
        }
      });
      notifier?.({ type: moveItemsRoutine.FAILURE, payload: { error } });
    },
    // Always refetch after error or success:
    onSettled: (_newItem, _err, { id: itemIds, to }, context) => {
      // Invalidate new parent
      const newParentKey = getKeyForParentId(to);
      queryClient.invalidateQueries(newParentKey);

      // Invalidate old parent
      const oldParentKey = getKeyForParentId(context.originalParent.id);
      queryClient.invalidateQueries(oldParentKey);

      itemIds.forEach((id: UUID) => {
        // Invalidate moved item
        const itemKey = buildItemKey(id);
        queryClient.invalidateQueries(itemKey);
      });
    },
  });

  queryClient.setMutationDefaults(SHARE_ITEM, {
    mutationFn: (payload) => Api.shareItemWith(payload, queryConfig),
    onSuccess: () => {
      notifier?.({ type: shareItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: shareItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      // invalidate memberships
      // todo: invalidate all pack of memberships containing the given id
      // this won't trigger too many errors as long as the stale time is low
      queryClient.invalidateQueries(buildManyItemMembershipsKey([id]));
      queryClient.invalidateQueries(buildItemMembershipsKey(id));
    },
  });

  // this mutation is used for its callback and invalidate the keys
  /**
   * @param {UUID} id parent item id wher the file is uploaded in
   * @param {error} [error] error occured during the file uploading
   */
  queryClient.setMutationDefaults(FILE_UPLOAD, {
    mutationFn: async ({ error }) => {
      if (error) throw new Error(JSON.stringify(error));
    },
    onSuccess: () => {
      notifier?.({ type: uploadFileRoutine.SUCCESS });
    },
    onError: (_error, { error }) => {
      notifier?.({ type: uploadFileRoutine.FAILURE, payload: { error } });
    },
    onSettled: (_data, _error, { id }) => {
      const parentKey = buildItemChildrenKey(id);
      queryClient.invalidateQueries(parentKey);
    },
  });

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
      notifier?.({ type: uploadItemThumbnailRoutine.SUCCESS });
    },
    onError: (_error, { error }) => {
      notifier?.({
        type: uploadItemThumbnailRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { id }) => {
      Object.values(THUMBNAIL_SIZES).forEach((size) => {
        const key = buildItemThumbnailKey({ id, size });
        queryClient.invalidateQueries(key);
      });
    },
  });

  queryClient.setMutationDefaults(RESTORE_ITEMS, {
    mutationFn: (itemIds) =>
      Api.restoreItems(itemIds, queryConfig).then(() => true),

    onMutate: async (itemIds) => {
      const key = RECYCLED_ITEMS_KEY;
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
      notifier?.({ type: restoreItemsRoutine.SUCCESS });
    },
    onError: (error, _itemId, context) => {
      queryClient.setQueryData(RECYCLED_ITEMS_KEY, context);
      notifier?.({ type: restoreItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.invalidateQueries(RECYCLED_ITEMS_KEY);
    },
  });
};
