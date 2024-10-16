import {
  DiscriminatedItem,
  FolderItemFactory,
  HttpMethod,
  MAX_TARGETS_FOR_MODIFY_REQUEST,
  RecycledItemData,
  buildPathFromIds,
  getParentFromPath,
} from '@graasp/sdk';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OK_RESPONSE,
  RECYCLED_ITEM_DATA,
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  splitEndpointByIds,
  waitForMutation,
} from '../../test/utils.js';
import { getKeyForParentId, itemKeys, memberKeys } from '../keys.js';
import {
  buildCopyItemsRoute,
  buildDeleteItemsRoute,
  buildEditItemRoute,
  buildMoveItemsRoute,
  buildRecycleItemsRoute,
  buildRestoreItemsRoute,
} from './routes.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Items Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
    mockedNotifier.mockClear();
  });

  describe('useEditItem', () => {
    const item = FolderItemFactory();
    const mutation = mutations.useEditItem;
    const itemKey = itemKeys.single(item.id).content;
    const payload = {
      id: item.id,
      description: 'new description',
    };

    it('Edit item in root', async () => {
      // set default data
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(itemKeys.allAccessible(), [FolderItemFactory()]);

      const route = `/${buildEditItemRoute(item.id)}`;
      const response = item;
      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(payload);
        await waitForMutation();
      });

      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
      expect(
        queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
      ).toBeTruthy();
    });

    it('Edit item in root without item in cache', async () => {
      // set default data
      queryClient.setQueryData(itemKeys.allAccessible(), [FolderItemFactory()]);

      const route = `/${buildEditItemRoute(item.id)}`;
      const response = item;
      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(payload);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
      ).toBeTruthy();
    });

    it('Edit item in item', async () => {
      // set default data
      const parentItem = FolderItemFactory();
      const parentKey = getKeyForParentId(parentItem.id);
      const editedItem = FolderItemFactory({ parentItem });
      const editedItemKey = itemKeys.single(editedItem.id).content;
      const editPayload = {
        id: editedItem.id,
        description: 'a new description',
      };
      queryClient.setQueryData(editedItemKey, editedItem);
      queryClient.setQueryData(parentKey, [FolderItemFactory()]);

      const route = `/${buildEditItemRoute(editedItem.id)}`;
      const response = editedItem;
      const endpoints = [
        {
          response,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(editPayload);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(editedItemKey)?.isInvalidated,
      ).toBeTruthy();
      expect(queryClient.getQueryState(parentKey)?.isInvalidated).toBeTruthy();
    });

    it('Unauthorized', async () => {
      const route = `/${buildEditItemRoute(item.id)}`;
      queryClient.setQueryData(itemKey, item);

      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          method: HttpMethod.Patch,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(payload);
        await waitForMutation();
      });

      // item key should not be changed and should be invalidated
      expect(
        queryClient.getQueryData<DiscriminatedItem>(itemKey),
      ).toMatchObject(item);
      expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBeTruthy();
    });
  });

  describe('useCopyItems', () => {
    const items = generateFolders(MAX_TARGETS_FOR_MODIFY_REQUEST + 1);
    const to = items[3].id;

    const mutation = mutations.useCopyItems;

    const key = getKeyForParentId(to);

    it('copy multiple root items to first level item', async () => {
      const copied = [items[0], items[1]];
      const copiedIds = copied.map((x) => x.id);

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });

      queryClient.setQueryData(key, [items[1]]);

      // we don't care about the returned value
      const response = items.map(() => OK_RESPONSE);

      const endpoints = splitEndpointByIds(
        copiedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildCopyItemsRoute(chunk)}`,
        response,
        (d) => d.id,
        HttpMethod.Post,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          to,
          ids: copiedIds,
        });
        await waitForMutation();
      });

      // original copied items path have not changed
      copied.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(item.path);
      });

      // Check new parent is not invalidated (because copy is async)
      expect(queryClient.getQueryState(key)?.isInvalidated).toBeFalsy();
    });
  });

  describe('useMoveItems', () => {
    const items = generateFolders();
    const to = items[0];
    const toId = to.id;

    const mutation = mutations.useMoveItems;

    it('Move 2 items from root to first level item', async () => {
      const nb = 2;
      const moved = items.slice(0, nb);
      const movedIds = moved.map((x) => x.id);
      const route = `/${buildMoveItemsRoute(movedIds)}`;
      // set data in cache
      moved.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), moved);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, items);

      const response = moved.map(({ id }) => id);

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          to: toId,
          items: moved,
        });
        await waitForMutation();
      });

      // Check new path are corrects
      moved.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${buildPathFromIds(item.id)}`);
      });

      // Check new parent is not invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeFalsy();

      // Check old parent is not invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeFalsy();
    });

    it('Move many items from root to first level item', async () => {
      const moved = items;
      const movedIds = moved.map((x) => x.id);
      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(getKeyForParentId(null), items);
      const toItemKey = getKeyForParentId(toId);
      queryClient.setQueryData(toItemKey, items);

      const response = moved.map(({ id }) => id);

      const endpoints = splitEndpointByIds(
        movedIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildMoveItemsRoute(chunk)}`,
        response,
        (el) => el,
        HttpMethod.Post,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({
          to: toId,
          items: moved,
        });
        await waitForMutation();
      });

      // Check new paths are corrects
      moved.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        const path = queryClient.getQueryData<DiscriminatedItem>(itemKey)?.path;
        expect(path).toEqual(`${to.path}.${buildPathFromIds(item.id)}`);
      });

      // Check new parent is not invalidated
      expect(queryClient.getQueryState(toItemKey)?.isInvalidated).toBeFalsy();

      // Check old parent is not invalidated
      const fromItemKey = getKeyForParentId(null);
      expect(queryClient.getQueryState(fromItemKey)?.isInvalidated).toBeFalsy();
    });
  });

  describe('useRecycleItems', () => {
    const mutation = mutations.useRecycleItems;
    const dataItems = generateFolders(10);

    it('Recycle root items', async () => {
      const items = dataItems.slice(0, 2);
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(itemKeys.accessiblePage({}, {}), items);

      const response = items;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = itemKeys.single(itemId).content;
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(items.find(({ id }) => id === itemId)!);
      }

      // todo: this will need to be updated too
      // Check parent's children key is correctly invalidated
      // and should not contain recycled item
      const childrenKey = getKeyForParentId(null);
      expect(
        queryClient
          .getQueryData<DiscriminatedItem[]>(childrenKey)
          ?.filter(({ id: thisId }) => itemIds.includes(thisId)).length,
      ).toBeFalsy();

      // check key is not invalidated
      expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeFalsy();
    });

    it('Recycle child items', async () => {
      const children = [dataItems[0], dataItems[1], dataItems[2]];
      const toRecycle = [dataItems[3], dataItems[4], dataItems[5]];
      const itemIds = toRecycle.map(({ id }) => id);
      const route = `/${buildRecycleItemsRoute(itemIds)}`;

      // set data in cache
      toRecycle.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });
      const childrenKey = getKeyForParentId(children[2].id);
      queryClient.setQueryData(childrenKey, children);

      const response = toRecycle;

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = itemKeys.single(itemId).content;
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(toRecycle.find(({ id }) => id === itemId)!);
      }

      // Check parent's children key is not invalidated
      // and should not contain recycled item
      expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeFalsy();

      expect(
        queryClient
          .getQueryData<DiscriminatedItem[]>(childrenKey)
          ?.filter(({ id }) => itemIds.includes(id)).length,
      ).toBeFalsy();
    });
  });

  describe('useDeleteItems', () => {
    const mutation = mutations.useDeleteItems;
    const items = generateFolders();

    it('Delete root items', async () => {
      const itemIds = [
        RECYCLED_ITEM_DATA[0].item.id,
        RECYCLED_ITEM_DATA[2].item.id,
      ];
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });
      queryClient.setQueryData(
        memberKeys.current().allRecycled,
        RECYCLED_ITEM_DATA,
      );

      const response = [OK_RESPONSE];

      const endpoints = [
        {
          response,
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = itemKeys.single(itemId).content;
        const state = queryClient.getQueryState<DiscriminatedItem>(itemKey);
        expect(state?.isInvalidated).toBeFalsy();
      }

      expect(
        queryClient.getQueryData(memberKeys.current().allRecycled),
      ).toEqual([RECYCLED_ITEM_DATA[1]]);
    });

    it('Delete child items', async () => {
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildDeleteItemsRoute(itemIds)}`;

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
      });

      const response = [OK_RESPONSE];

      const endpoints = [
        {
          response,
          method: HttpMethod.Delete,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify items are not available
      // in real cases, the path should be different
      for (const itemId of itemIds) {
        const itemKey = itemKeys.single(itemId).content;
        const state = queryClient.getQueryState<DiscriminatedItem>(itemKey);
        expect(state?.isInvalidated).toBeFalsy();
      }
    });
  });

  describe('useRestoreItems', () => {
    const mutation = mutations.useRestoreItems;

    it('Restore items', async () => {
      const items = RECYCLED_ITEM_DATA.map(({ item }) => item);
      const itemIds = items.map(({ id }) => id);
      const route = `/${buildRestoreItemsRoute(itemIds)}`;
      const response = RECYCLED_ITEM_DATA;

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getParentFromPath(item.path));
        queryClient.setQueryData(parentKey, [item]);
      });
      queryClient.setQueryData(memberKeys.current().allRecycled, response);
      expect(
        queryClient.getQueryData<RecycledItemData[]>(
          memberKeys.current().allRecycled,
        )!.length,
      ).not.toEqual(0);

      const endpoints = [
        {
          response,
          method: HttpMethod.Post,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = itemKeys.single(item.id).content;
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(item);
      }

      // check recycle bin key
      expect(
        queryClient.getQueryState(memberKeys.current().allRecycled)
          ?.isInvalidated,
      ).toBeFalsy();
      expect(
        queryClient.getQueryData<RecycledItemData[]>(
          memberKeys.current().allRecycled,
        )!.length,
      ).toEqual(0);
    });

    it('Restore many items', async () => {
      const response = RECYCLED_ITEM_DATA;
      const items = RECYCLED_ITEM_DATA.map(({ item }) => item);
      const itemIds = items.map(({ id }) => id);

      // set data in cache
      items.forEach((item) => {
        const itemKey = itemKeys.single(item.id).content;
        queryClient.setQueryData(itemKey, item);
        const parentKey = getKeyForParentId(getParentFromPath(item.path));
        queryClient.setQueryData(parentKey, [item]);
      });
      queryClient.setQueryData(memberKeys.current().allRecycled, response);
      expect(
        queryClient.getQueryData<RecycledItemData[]>(
          memberKeys.current().allRecycled,
        )!.length,
      ).not.toEqual(0);

      const endpoints = splitEndpointByIds(
        itemIds,
        MAX_TARGETS_FOR_MODIFY_REQUEST,
        (chunk) => `/${buildRestoreItemsRoute(chunk)}`,
        items,
        (d) => d.id,
        HttpMethod.Post,
      );

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate(itemIds);
        await waitForMutation();
      });

      // verify item is still available
      // in real cases, the path should be different
      for (const item of items) {
        const itemKey = itemKeys.single(item.id).content;
        const data = queryClient.getQueryData<DiscriminatedItem>(itemKey);
        expect(data).toMatchObject(item);
      }

      // check original parent is invalidated
      expect(
        queryClient.getQueryState(memberKeys.current().allRecycled)
          ?.isInvalidated,
      ).toBeFalsy();
      expect(
        queryClient.getQueryData<RecycledItemData[]>(
          memberKeys.current().allRecycled,
        )!.length,
      ).toEqual(0);
    });
  });
});
