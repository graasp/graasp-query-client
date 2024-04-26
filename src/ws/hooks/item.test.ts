import { afterEach, describe, it } from 'vitest';

import { setUpWsTest } from '../../../test/wsUtils.js';
import { configureWsItemHooks } from './item.js';

const { queryClient } = setUpWsTest({
  configureWsHooks: configureWsItemHooks,
});

describe('Ws Item Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  // TODO: implement test for feedback
  it('Dummy Test', () => {});

  // TODO: remove their and implement test for feedback ?
  // describe('useItemUpdates', () => {
  //   const item = FolderItemFactory();
  //   const itemId = item?.id;
  //   const itemKey = itemKeys.single(itemId).content;
  //   const channel = { name: itemId, topic: TOPICS.ITEM };
  //   const newItem = { ...item, description: 'new description' };
  //   const hook = () => hooks.useItemUpdates(itemId);

  //   it(`Receive update item update`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.SELF,
  //       op: OPS.UPDATE,
  //       item: newItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBe(true);
  //   });

  //   it(`Receive delete item update`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.SELF,
  //       op: OPS.DELETE,
  //       item: newItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBe(true);
  //   });

  //   it(`Does not update on other events`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: 'kind',
  //       op: OPS.UPDATE,
  //       item: newItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKey)?.isInvalidated).toBe(false);
  //   });
  // });

  // describe('useChildrenUpdates', () => {
  //   // we need to use a different id for the channel to avoid handlers collision
  //   const items = generateFolders();
  //   const parent = FolderItemFactory();
  //   const parentId = parent.id;
  //   const childrenKey = itemKeys.single(parentId).children();
  //   const channel = { name: parentId, topic: TOPICS.ITEM };
  //   const targetItem = items[0];
  //   const targetItemKey = itemKeys.single(targetItem.id).content;
  //   const hook = () => hooks.useChildrenUpdates(parentId);

  //   it(`Receive create child`, async () => {
  //     queryClient.setQueryData(childrenKey, [FolderItemFactory()]);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.CHILD,
  //       op: OPS.CREATE,
  //       item: targetItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBe(true);
  //   });

  //   it(`Receive update child`, async () => {
  //     const updatedItem = { ...targetItem, description: 'new description' };

  //     queryClient.setQueryData(targetItemKey, targetItem);
  //     queryClient.setQueryData(childrenKey, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.CHILD,
  //       op: OPS.UPDATE,
  //       item: updatedItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBe(true);
  //   });

  //   it(`Receive delete item update`, async () => {
  //     queryClient.setQueryData(targetItemKey, targetItem);
  //     queryClient.setQueryData(childrenKey, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.CHILD,
  //       op: OPS.DELETE,
  //       item: targetItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBe(true);
  //   });

  //   it(`Does not update on other events`, async () => {
  //     queryClient.setQueryData(childrenKey, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: 'kind',
  //       op: OPS.DELETE,
  //       item: targetItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBe(false);
  //   });
  // });

  // describe('useOwnItemsUpdates', () => {
  //   const items = generateFolders();
  //   const item = items[0];
  //   const itemId = item.id;
  //   const itemKey = itemKeys.single(itemId).content;
  //   const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
  //   const hook = () => hooks.useOwnItemsUpdates(itemId);

  //   it(`Receive create child`, async () => {
  //     queryClient.setQueryData(OWN_ITEMS_KEY, [items[2]]);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.OWN,
  //       op: OPS.CREATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive update child`, async () => {
  //     const updatedItem = { ...item, description: 'new description' };
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(OWN_ITEMS_KEY, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.OWN,
  //       op: OPS.UPDATE,
  //       item: updatedItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive delete item update`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(OWN_ITEMS_KEY, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.OWN,
  //       op: OPS.DELETE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Does not update on other events`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(OWN_ITEMS_KEY, items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: 'kind',
  //       op: OPS.UPDATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(OWN_ITEMS_KEY)?.isInvalidated).toBe(
  //       false,
  //     );
  //   });
  // });

  // describe('useSharedItemsUpdates', () => {
  //   // we need to use a different id to avoid handler collision
  //   const items = generateFolders();
  //   const item = items[1];
  //   const itemId = item.id;
  //   const itemKey = itemKeys.single(itemId).content;
  //   const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
  //   const hook = () => hooks.useSharedItemsUpdates(itemId);

  //   it(`Receive create child`, async () => {
  //     queryClient.setQueryData(itemKeys.shared(), [items[2]]);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.SHARED,
  //       op: OPS.CREATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKeys.shared())?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive update child`, async () => {
  //     const updatedItem = { ...item, description: 'new description' };
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(itemKeys.shared(), items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.SHARED,
  //       op: OPS.UPDATE,
  //       item: updatedItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKeys.shared())?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive delete item update`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(itemKeys.shared(), items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.SHARED,
  //       op: OPS.DELETE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKeys.shared())?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Does not update on other events`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     queryClient.setQueryData(itemKeys.shared(), items);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: 'kind',
  //       op: OPS.UPDATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(itemKeys.shared())?.isInvalidated).toBe(
  //       false,
  //     );
  //   });
  // });

  // describe('useAccessibleItemsUpdates', () => {
  //   const items = generateFolders();
  //   const item = items[2];
  //   const itemId = item.id;
  //   const itemKey = itemKeys.single(itemId).content;
  //   const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
  //   const hook = () => hooks.useAccessibleItemsUpdates(itemId);

  //   const params1 = { name: 'name1' };
  //   const pagination1 = { page: 1 };
  //   const params2 = { name: 'name2' };
  //   const pagination2 = { page: 2 };

  //   const accessibleKey1 = itemKeys.accessiblePage(params1, pagination1);
  //   const accessibleKey2 = itemKeys.accessiblePage(params2, pagination2);

  //   beforeEach(() => {
  //     queryClient.setQueryData(accessibleKey1, {
  //       data: items,
  //       totalCount: items.length,
  //     });
  //     queryClient.setQueryData(accessibleKey2, {
  //       data: items,
  //       totalCount: items.length,
  //     });
  //   });

  //   it(`Receive create child`, async () => {
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.ACCESSIBLE,
  //       op: OPS.CREATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(accessibleKey1)?.isInvalidated).toBe(
  //       true,
  //     );
  //     expect(queryClient.getQueryState(accessibleKey2)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive update child`, async () => {
  //     const updatedItem = { ...item, description: 'new description' };
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.ACCESSIBLE,
  //       op: OPS.UPDATE,
  //       item: updatedItem,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     expect(queryClient.getQueryState(accessibleKey1)?.isInvalidated).toBe(
  //       true,
  //     );
  //     expect(queryClient.getQueryState(accessibleKey2)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Receive delete item update`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: KINDS.ACCESSIBLE,
  //       op: OPS.DELETE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);

  //     // check accessible items keys are all invalidated
  //     expect(queryClient.getQueryState(accessibleKey1)?.isInvalidated).toBe(
  //       true,
  //     );
  //     expect(queryClient.getQueryState(accessibleKey2)?.isInvalidated).toBe(
  //       true,
  //     );
  //   });

  //   it(`Does not update on other events`, async () => {
  //     queryClient.setQueryData(itemKey, item);
  //     await mockWsHook({ hook, wrapper });

  //     const itemEvent = {
  //       kind: 'kind',
  //       op: OPS.UPDATE,
  //       item,
  //     };

  //     getHandlerByChannel(handlers, channel)?.handler(itemEvent);
  //     expect(queryClient.getQueryState(accessibleKey1)?.isInvalidated).toBe(
  //       false,
  //     );
  //     expect(queryClient.getQueryState(accessibleKey2)?.isInvalidated).toBe(
  //       false,
  //     );
  //   });
  // });
});
