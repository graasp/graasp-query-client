import { DiscriminatedItem, FolderItemFactory } from '@graasp/sdk';

import { QueryKey } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { generateFolders } from '../../../test/constants.js';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { OWN_ITEMS_KEY, itemKeys } from '../../config/keys.js';
import { isInChangesKey } from '../../config/utils.js';
import { KINDS, OPS, TOPICS } from '../constants.js';
import { configureWsItemHooks } from './item.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsItemHooks,
});

/**
 * Expect to find or not the given key in the changes key.
 *
 * @param queryClient The QueryClient instance
 * @param key The key who should (or not) be in the changes key.
 * @param expectation If true, the key should be in, else the key should not be in.
 * @returns Assertion<boolean>
 */
const expectIsInChangesKey = (key: QueryKey, expectation = true) =>
  expect(isInChangesKey(queryClient, key)).toBe(expectation);

describe('Ws Item Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemUpdates', () => {
    const item = FolderItemFactory();
    const itemId = item?.id;
    const itemKey = itemKeys.single(itemId).content;
    const channel = { name: itemId, topic: TOPICS.ITEM };
    const newItem = { ...item, description: 'new description' };
    const hook = () => hooks.useItemUpdates(itemId);

    it(`Receive update item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.UPDATE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(itemKey);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.DELETE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<DiscriminatedItem>(itemKey)).toBeFalsy();
      // expect not in changes key
      expectIsInChangesKey(itemKey, false);
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<DiscriminatedItem>(itemKey),
      ).toMatchObject(item);
      // not in changes key
      expectIsInChangesKey(itemKey, false);
    });
  });

  describe('useChildrenUpdates', () => {
    // we need to use a different id for the channel to avoid handlers collision
    const items = generateFolders();
    const parent = FolderItemFactory();
    const parentId = parent.id;
    const childrenKey = itemKeys.single(parentId).children();
    const channel = { name: parentId, topic: TOPICS.ITEM };
    const targetItem = items[0];
    const targetItemKey = itemKeys.single(targetItem.id).content;
    const hook = () => hooks.useChildrenUpdates(parentId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(childrenKey, [FolderItemFactory()]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.CREATE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // TODO: remove if ok
      // // check children key contains new item
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem[]>(childrenKey),
      // ).toContainEqual(targetItem);
      // // check new item key
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(targetItemKey),
      // ).toMatchObject(targetItem);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(childrenKey);
      expectIsInChangesKey(targetItemKey);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...targetItem, description: 'new description' };

      queryClient.setQueryData(targetItemKey, targetItem);
      queryClient.setQueryData(childrenKey, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(childrenKey);
      expectIsInChangesKey(targetItemKey);

      // TODO: remove if ok
      // check new item key content
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(targetItemKey),
      // ).toMatchObject(updatedItem);
      // // check children key contains newly item
      // const own = queryClient.getQueryData<DiscriminatedItem[]>(childrenKey);
      // expect(own).toContainEqual(updatedItem);
      // expect(own?.length).toBe(items.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(targetItemKey, targetItem);
      queryClient.setQueryData(childrenKey, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient
          .getQueryData<DiscriminatedItem[]>(childrenKey)
          ?.find(({ id }) => id === targetItem.id),
      ).toBeFalsy();
      // expect not in changes key
      expectIsInChangesKey(childrenKey, false);
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(childrenKey, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<DiscriminatedItem>(childrenKey)).toEqual(
        items,
      );
      // expect not in changes key
      expectIsInChangesKey(childrenKey, false);
    });
  });

  describe('useOwnItemsUpdates', () => {
    const items = generateFolders();
    const item = items[0];
    const itemId = item.id;
    const itemKey = itemKeys.single(itemId).content;
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useOwnItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(OWN_ITEMS_KEY, [items[2]]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(OWN_ITEMS_KEY);
      expectIsInChangesKey(itemKey);
      // TODO: remove if ok
      // check own items key contains new item
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY),
      // ).toContainEqual(item);
      // // check new item key
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(item);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(OWN_ITEMS_KEY);
      expectIsInChangesKey(itemKey);

      // TODO: remove if ok
      // check new item key content
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(updatedItem);
      // // check children key contains newly item
      // const children =
      //   queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY);
      // expect(children).toContainEqual(updatedItem);
      // expect(children?.length).toBe(items.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const children =
        queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY);
      expect(children?.find(({ id }) => id === itemId)).toBeFalsy();
      // expect not in changes key
      expectIsInChangesKey(OWN_ITEMS_KEY, false);
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<DiscriminatedItem[]>(OWN_ITEMS_KEY),
      ).toMatchObject(items);
      // expect not in changes key
      expectIsInChangesKey(OWN_ITEMS_KEY, false);
    });
  });

  describe('useSharedItemsUpdates', () => {
    // we need to use a different id to avoid handler collision
    const items = generateFolders();
    const item = items[1];
    const itemId = item.id;
    const itemKey = itemKeys.single(itemId).content;
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useSharedItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(itemKeys.shared(), [items[2]]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(itemKey);
      expectIsInChangesKey(itemKeys.shared());

      // TODO: remove if ok
      // check own items key contains new item
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem[]>(itemKeys.shared()),
      // ).toContainEqual(item);
      // // check new item key
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(item);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(itemKeys.shared(), items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // the changes are not in the cache anymore, but their keys are in
      // a new queryData, allowing the client to invalidates all the changes
      expectIsInChangesKey(itemKeys.shared());
      expectIsInChangesKey(itemKey);

      // TODO: remove if it is acceptable
      // check new item key content
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(updatedItem);
      // check children key contains newly item
      // const shared = queryClient.getQueryData<DiscriminatedItem[]>(
      //   itemKeys.shared(),
      // );
      // expect(shared).toContainEqual(updatedItem);
      // expect(shared?.length).toBe(items.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(itemKeys.shared(), items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const shared = queryClient.getQueryData<DiscriminatedItem[]>(
        itemKeys.shared(),
      );
      expect(shared?.find(({ id }) => id === itemId)).toBeFalsy();
      // expect not in changes key
      expectIsInChangesKey(itemKeys.shared(), false);
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(itemKeys.shared(), items);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<DiscriminatedItem[]>(itemKeys.shared()),
      ).toEqual(items);

      // expect not in changes key
      expectIsInChangesKey(itemKeys.shared(), false);
    });
  });

  describe('useAccessibleItemsUpdates', () => {
    const items = generateFolders();
    const item = items[2];
    const itemId = item.id;
    const itemKey = itemKeys.single(itemId).content;
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useAccessibleItemsUpdates(itemId);

    const params1 = { name: 'name1' };
    const pagination1 = { page: 1 };
    const params2 = { name: 'name2' };
    const pagination2 = { page: 2 };

    beforeEach(() => {
      queryClient.setQueryData(itemKeys.accessiblePage(params1, pagination1), {
        data: items,
        totalCount: items.length,
      });
      queryClient.setQueryData(itemKeys.accessiblePage(params2, pagination2), {
        data: items,
        totalCount: items.length,
      });
    });

    it(`Receive create child`, async () => {
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.ACCESSIBLE,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expectIsInChangesKey(itemKeys.allAccessible());

      // TODO: remove if ok
      // check accessible items keys are all invalidated
      // expect(
      //   queryClient.getQueryState(itemKeys.accessiblePage(params1, pagination1))
      //     ?.isInvalidated,
      // ).toBe(true);
      // expect(
      //   queryClient.getQueryState(itemKeys.accessiblePage(params2, pagination2))
      //     ?.isInvalidated,
      // ).toBe(true);
      // check new item key
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(item);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.ACCESSIBLE,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expectIsInChangesKey(itemKeys.allAccessible());

      // check new item key content
      // expect(
      //   queryClient.getQueryData<DiscriminatedItem>(itemKey),
      // ).toMatchObject(updatedItem);
      // check accessible items keys are all invalidated
      // expect(
      //   queryClient.getQueryState(itemKeys.accessiblePage(params1, pagination1))
      //     ?.isInvalidated,
      // ).toBe(true);
      // expect(
      //   queryClient.getQueryState(itemKeys.accessiblePage(params2, pagination2))
      //     ?.isInvalidated,
      // ).toBe(true);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.ACCESSIBLE,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check accessible items keys are all invalidated
      expect(
        queryClient.getQueryState(itemKeys.accessiblePage(params1, pagination1))
          ?.isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(itemKeys.accessiblePage(params2, pagination2))
          ?.isInvalidated,
      ).toBe(true);

      // expect not in changes key
      expectIsInChangesKey(itemKeys.allAccessible(), false);
      expectIsInChangesKey(
        itemKeys.accessiblePage(params1, pagination1),
        false,
      );
      expectIsInChangesKey(
        itemKeys.accessiblePage(params2, pagination2),
        false,
      );
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);
      // check accessible items keys still contain data and are not invalidated
      // check accessible items keys are all invalidated
      expect(
        queryClient.getQueryState(itemKeys.accessiblePage(params1, pagination1))
          ?.isInvalidated,
      ).toBe(false);
      expect(
        queryClient.getQueryState(itemKeys.accessiblePage(params2, pagination2))
          ?.isInvalidated,
      ).toBe(false);
      expect(
        queryClient.getQueryData(itemKeys.accessiblePage(params1, pagination1)),
      ).toEqual({ data: items, totalCount: items.length });
      expect(
        queryClient.getQueryData(itemKeys.accessiblePage(params2, pagination2)),
      ).toEqual({ data: items, totalCount: items.length });

      // expect not in changes key
      expectIsInChangesKey(itemKeys.allAccessible(), false);
      expectIsInChangesKey(
        itemKeys.accessiblePage(params1, pagination1),
        false,
      );
      expectIsInChangesKey(
        itemKeys.accessiblePage(params2, pagination2),
        false,
      );
    });
  });
});
