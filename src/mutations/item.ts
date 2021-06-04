import { List, Record } from 'immutable';
import { QueryClient } from 'react-query';
import * as Api from '../api';
import {
  copyItemRoutine,
  createItemRoutine,
  deleteItemsRoutine,
  deleteItemRoutine,
  editItemRoutine,
  moveItemRoutine,
  shareItemRoutine,
  uploadFileRoutine,
  putItemLoginRoutine,
  postItemLoginRoutine,
} from '../routines';
import {
  buildItemChildrenKey,
  buildItemKey,
  getKeyForParentId,
  POST_ITEM_MUTATION_KEY,
  DELETE_ITEM_MUTATION_KEY,
  EDIT_ITEM_MUTATION_KEY,
  FILE_UPLOAD_MUTATION_KEY,
  SHARE_ITEM_MUTATION_KEY,
  MOVE_ITEM_MUTATION_KEY,
  COPY_ITEM_MUTATION_KEY,
  DELETE_ITEMS_MUTATION_KEY,
  POST_ITEM_LOGIN_MUTATION_KEY,
  PUT_ITEM_LOGIN_MUTATION_KEY,
  buildItemLoginKey,
} from '../config/keys';
import { buildPath, getDirectParentId } from '../utils/item';
import { Item, QueryClientConfig, UUID } from '../types';

interface Value {
  value: any;
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
  const mutateItem = async ({ id, value }: { id: UUID; value: any }) => {
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

    if (!parentId) {
      return;
    }

    // get parent key
    const childrenKey = buildItemChildrenKey(parentId);

    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries(childrenKey);

    // Snapshot the previous value
    const prevParent = queryClient.getQueryData(childrenKey);

    // Optimistically update
    queryClient.setQueryData(childrenKey, value);

    // Return a context object with the snapshotted value
    return prevParent;
  };

  queryClient.setMutationDefaults(POST_ITEM_MUTATION_KEY, {
    mutationFn: async (item) => ({
      parentId: item.parentId,
      item: await Api.postItem(item, queryConfig),
    }),
    // we cannot optimistically add an item because we need its id
    onSuccess: () => {
      notifier?.({ type: createItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: createItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (newItem) => {
      const key = getKeyForParentId(newItem?.parentId);
      queryClient.invalidateQueries(key);
    },
  });

  queryClient.setMutationDefaults(EDIT_ITEM_MUTATION_KEY, {
    mutationFn: (item) => Api.editItem(item.id, item, queryConfig),
    onMutate: async (newItem) => {
      const previousItems = {
        parent: await mutateParentChildren({
          childPath: newItem.path,
          value: (old: List<Item>) => {
            const idx = old.findIndex(({ id }) => id === newItem.id);
            return old.set(idx, newItem);
          },
        }),
        item: await mutateItem({ id: newItem.id, value: newItem }),
      };

      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: editItemRoutine.SUCCESS });
    },
    onError: (error, newItem, context) => {
      const parentKey = getKeyForParentId(getDirectParentId(newItem.path));
      queryClient.setQueryData(parentKey, context.parent);
      const itemKey = buildItemKey(newItem.id);
      queryClient.setQueryData(itemKey, context.item);
      notifier?.({ type: editItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (newItem) => {
      const parentKey = getKeyForParentId(getDirectParentId(newItem.path));
      queryClient.invalidateQueries(parentKey);

      const itemKey = buildItemKey(newItem.id);
      queryClient.invalidateQueries(itemKey);
    },
  });

  queryClient.setMutationDefaults(DELETE_ITEM_MUTATION_KEY, {
    mutationFn: ([itemId]) =>
      Api.deleteItem(itemId, queryConfig).then(() => itemId),

    onMutate: async ([itemId]) => {
      const itemKey = buildItemKey(itemId);
      const itemData = queryClient.getQueryData(itemKey);
      const previousItems = {
        ...(Boolean(itemData) && {
          parent: 'dd',
          item: await mutateItem({ id: itemId, value: null }),
        }),
      };
      return previousItems;
    },
    onSuccess: () => {
      notifier?.({ type: deleteItemRoutine.SUCCESS });
    },
    onError: (error, itemId, context) => {
      const itemData = context.item;

      if (itemData) {
        const itemKey = buildItemKey(itemId);
        queryClient.setQueryData(itemKey, context.item);
        const parentKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.setQueryData(parentKey, context.parent);
      }
      notifier?.({ type: deleteItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (itemId, _error, _variables, context) => {
      const itemData = context.item;

      if (itemData) {
        const itemKey = buildItemKey(itemId);
        queryClient.invalidateQueries(itemKey);

        const parentKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.invalidateQueries(parentKey);
      }
    },
  });

  queryClient.setMutationDefaults(DELETE_ITEMS_MUTATION_KEY, {
    mutationFn: (itemIds) =>
      Api.deleteItems(itemIds, queryConfig).then(() => itemIds),

    onMutate: async (itemIds: UUID[]) => {
      // get path from first item
      const itemKey = buildItemKey(itemIds[0]);
      const item = queryClient.getQueryData(itemKey) as Record<Item>;
      const itemPath = item?.get('path');

      const previousItems = {
        ...(Boolean(itemPath) && {
          parent: await mutateParentChildren({
            childPath: itemPath,
            value: (old: List<Item>) =>
              old.filter(({ id }) => !itemIds.includes(id)),
          }),
        }),
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
        const parentKey = getKeyForParentId(getDirectParentId(itemPath));
        queryClient.setQueryData(parentKey, context.parent);
      }

      itemIds.forEach((id) => {
        const itemKey = buildItemKey(id);
        queryClient.setQueryData(itemKey, context[id]);
      });

      notifier?.({ type: deleteItemsRoutine.FAILURE, payload: { error } });
    },
    onSettled: (itemIds: UUID[], _error, _variables, context) => {
      const itemPath = context[itemIds[0]]?.get('path');

      itemIds.forEach((id) => {
        const itemKey = buildItemKey(id);
        queryClient.invalidateQueries(itemKey);
      });

      if (itemPath) {
        const parentKey = getKeyForParentId(getDirectParentId(itemPath));
        queryClient.invalidateQueries(parentKey);
      }
    },
  });

  queryClient.setMutationDefaults(COPY_ITEM_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.copyItem(payload, queryConfig).then((newItem) => ({
        to: payload.to,
        ...newItem,
      })),
    // cannot mutate because it needs the id
    onSuccess: () => {
      notifier?.({ type: copyItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: copyItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: (newItem) => {
      const parentKey = getKeyForParentId(newItem?.to);
      queryClient.invalidateQueries(parentKey);
    },
  });

  queryClient.setMutationDefaults(MOVE_ITEM_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.moveItem(payload, queryConfig).then(() => payload),
    onMutate: async ({ id: itemId, to }) => {
      const itemKey = buildItemKey(itemId);
      const itemData = queryClient.getQueryData(itemKey) as Record<Item>;
      const previousItems = {
        ...(Boolean(itemData) && {
          // add item in target folder
          targetParent: await mutateParentChildren({
            id: to,
            value: (old: List<Item>) => old?.push(itemData.toJS()),
          }),

          // remove item in original folder
          originalParent: await mutateParentChildren({
            childPath: itemData.get('path'),
            value: (old: List<Item>) => old?.filter(({ id }) => id !== itemId),
          }),

          // update item's path
          item: await mutateItem({
            id: itemId,
            value: (item: Record<Item>) =>
              item.set(
                'path',
                buildPath({
                  prefix: itemData.get('path'),
                  ids: [itemId],
                }),
              ),
          }),
        }),
      };
      return previousItems;
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
        const parentKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.setQueryData(parentKey, context.originalParent);
      }
      notifier?.({ type: moveItemRoutine.FAILURE, payload: { error } });
    },
    // Always refetch after error or success:
    onSettled: ({ id, to }) => {
      const parentKey = getKeyForParentId(to);
      queryClient.invalidateQueries(parentKey);

      const itemKey = buildItemKey(id);
      queryClient.invalidateQueries(itemKey);

      const itemData = queryClient.getQueryData(id) as Record<Item>;
      if (itemData) {
        const parentKey = getKeyForParentId(
          getDirectParentId(itemData.get('path')),
        );
        queryClient.invalidateQueries(parentKey);
      }
    },
  });

  queryClient.setMutationDefaults(SHARE_ITEM_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.shareItemWith(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: shareItemRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: shareItemRoutine.FAILURE, payload: { error } });
    },
    onSettled: ({ id }) => {
      const itemKey = buildItemKey(id);
      queryClient.invalidateQueries(itemKey);

      // invalidate children since membership will also change for them
      queryClient.invalidateQueries(buildItemChildrenKey(id));
    },
  });

  // this mutation is used for its callback
  queryClient.setMutationDefaults(FILE_UPLOAD_MUTATION_KEY, {
    mutationFn: ({ id, error }) => Promise.resolve({ id, error }),
    onSuccess: ({ error }) => {
      if (!error) {
        notifier?.({ type: uploadFileRoutine.SUCCESS });
      } else {
        notifier?.({ type: uploadFileRoutine.FAILURE, payload: { error } });
      }
    },
    onSettled: ({ id }) => {
      const parentKey = getKeyForParentId(id);
      queryClient.invalidateQueries(parentKey);
    },
  });

  queryClient.setMutationDefaults(POST_ITEM_LOGIN_MUTATION_KEY, {
    mutationFn: (payload) => Api.postItemLoginSignIn(payload, queryConfig),
    onError: (error) => {
      notifier?.({ type: postItemLoginRoutine.FAILURE, payload: { error } });
    },
    onSettled: () => {
      queryClient.resetQueries();
    },
  });

  queryClient.setMutationDefaults(PUT_ITEM_LOGIN_MUTATION_KEY, {
    mutationFn: (payload) =>
      Api.putItemLoginSchema(payload, queryConfig).then(() => payload),
    onSuccess: () => {
      notifier?.({ type: putItemLoginRoutine.SUCCESS });
    },
    onError: (error) => {
      notifier?.({ type: putItemLoginRoutine.FAILURE, payload: { error } });
    },
    onSettled: ({ itemId }) => {
      queryClient.invalidateQueries(buildItemLoginKey(itemId));
    },
  });
};
