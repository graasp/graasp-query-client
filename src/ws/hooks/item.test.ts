import { Item } from '@graasp/sdk';

import Cookies from 'js-cookie';

import { ITEMS, ITEMS_JS } from '../../../test/constants';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import {
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
  buildItemChildrenKey,
  buildItemKey,
} from '../../config/keys';
import { KINDS, OPS, TOPICS } from '../constants';
import { configureWsItemHooks } from './item';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsItemHooks,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Ws Item Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemUpdates', () => {
    const item = ITEMS[0];
    const itemId = item?.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM };
    const newItem = { ...item, description: 'new description' };
    const hook = () => hooks.useItemUpdates(itemId);

    it(`Receive update item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(newItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(newItem);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(newItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item>(itemKey)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(newItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(item);
    });
  });

  describe('useChildrenUpdates', () => {
    // we need to use a different id for the channel to avoid handlers collision
    const parent = ITEMS[1];
    const parentId = parent.id;
    const childrenKey = buildItemChildrenKey(parentId);
    const channel = { name: parentId, topic: TOPICS.ITEM };
    const targetItem = ITEMS[2];
    const targetItemKey = buildItemKey(targetItem.id);
    const hook = () => hooks.useChildrenUpdates(parentId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(childrenKey, [ITEMS[3]]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(targetItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check children key contains new item
      expect(queryClient.getQueryData<Item[]>(childrenKey)).toContainEqual(
        targetItem,
      );
      // check new item key
      expect(queryClient.getQueryData<Item>(targetItemKey)).toMatchObject(
        targetItem,
      );
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...targetItem, description: 'new description' };

      queryClient.setQueryData(targetItemKey, targetItem);
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(updatedItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<Item>(targetItemKey)).toMatchObject(
        updatedItem,
      );
      // check children key contains newly item
      const own = queryClient.getQueryData<Item[]>(childrenKey);
      expect(own).toContainEqual(updatedItem);
      expect(own?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(targetItemKey, targetItem);
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient
          .getQueryData<Item[]>(childrenKey)
          ?.find(({ id }: Item) => id === targetItem.id),
      ).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(targetItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item>(childrenKey)).toEqual(ITEMS);
    });
  });

  describe('useOwnItemsUpdates', () => {
    const item = ITEMS[0];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useOwnItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(OWN_ITEMS_KEY, [ITEMS[2]]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(queryClient.getQueryData<Item[]>(OWN_ITEMS_KEY)).toContainEqual(
        item,
      );
      // check new item key
      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(item);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(updatedItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(
        updatedItem,
      );
      // check children key contains newly item
      const children = queryClient.getQueryData<Item[]>(OWN_ITEMS_KEY);
      expect(children).toContainEqual(updatedItem);
      expect(children?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const children = queryClient.getQueryData<Item[]>(OWN_ITEMS_KEY);
      expect(children?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item[]>(OWN_ITEMS_KEY)).toMatchObject(
        ITEMS,
      );
    });
  });

  describe('useSharedItemsUpdates', () => {
    // we need to use a different id to avoid handler collision
    const item = ITEMS[1];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useSharedItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(SHARED_ITEMS_KEY, [ITEMS[2]]);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(queryClient.getQueryData<Item[]>(SHARED_ITEMS_KEY)).toContainEqual(
        item,
      );
      // check new item key
      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(item);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(updatedItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<Item>(itemKey)).toMatchObject(
        updatedItem,
      );
      // check children key contains newly item
      const shared = queryClient.getQueryData<Item[]>(SHARED_ITEMS_KEY);
      expect(shared).toContainEqual(updatedItem);
      expect(shared?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const shared = queryClient.getQueryData<Item[]>(SHARED_ITEMS_KEY);
      expect(shared?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Item[]>(SHARED_ITEMS_KEY)).toEqual(
        ITEMS_JS,
      );
    });
  });
});
