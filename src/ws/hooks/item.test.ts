import Cookies from 'js-cookie';
import { Map, Record, List } from 'immutable';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { ITEMS } from '../../../test/constants';
import {
  buildItemChildrenKey,
  buildItemKey,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../../config/keys';
import { Item } from '../../types';
import { configureWsItemHooks } from './item';
import { KINDS, OPS, TOPICS } from '../constants';

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
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM };
    const newItem = { ...item, description: 'new description' };
    const hook = () => hooks.useItemUpdates(itemId);

    it(`Receive update item update`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.UPDATE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        newItem,
      );
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.DELETE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<Record<Item>>(itemKey)?.toJS(),
      ).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: newItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        item,
      );
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
      queryClient.setQueryData(childrenKey, List([ITEMS[3]]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.CREATE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check children key contains new item
      expect(
        queryClient.getQueryData<List<Item>>(childrenKey)?.toJS(),
      ).toContainEqual(targetItem);
      // check new item key
      expect(
        queryClient.getQueryData<Record<Item>>(targetItemKey)?.toJS(),
      ).toEqual(targetItem);
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...targetItem, description: 'new description' };
      queryClient.setQueryData(targetItemKey, Map(targetItem));
      queryClient.setQueryData(childrenKey, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(
        queryClient.getQueryData<Record<Item>>(targetItemKey)?.toJS(),
      ).toEqual(updatedItem);
      // check children key contains newly item
      const own = queryClient.getQueryData<List<Item>>(childrenKey)?.toJS();
      expect(own).toContainEqual(updatedItem);
      expect(own?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(targetItemKey, Map(targetItem));
      queryClient.setQueryData(childrenKey, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient
          .getQueryData<List<Item>>(childrenKey)
          ?.find(({ id }) => id === targetItem.id),
      ).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(childrenKey, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<Record<Item>>(childrenKey)?.toJS(),
      ).toEqual(ITEMS);
    });
  });

  describe('useOwnItemsUpdates', () => {
    const item = ITEMS[0];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useOwnItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS[2]]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient.getQueryData<List<Item>>(OWN_ITEMS_KEY)?.toJS(),
      ).toContainEqual(item);
      // check new item key
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        item,
      );
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        updatedItem,
      );
      // check children key contains newly item
      const children = queryClient
        .getQueryData<List<Item>>(OWN_ITEMS_KEY)
        ?.toJS();
      expect(children).toContainEqual(updatedItem);
      expect(children?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const children = queryClient
        .getQueryData<List<Item>>(OWN_ITEMS_KEY)
        ?.toJS();
      expect(children?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<List<Item>>(OWN_ITEMS_KEY)?.toJS(),
      ).toEqual(ITEMS);
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
      queryClient.setQueryData(SHARED_ITEMS_KEY, List([ITEMS[2]]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient.getQueryData<List<Item>>(SHARED_ITEMS_KEY)?.toJS(),
      ).toContainEqual(item);
      // check new item key
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        item,
      );
    });

    it(`Receive update child`, async () => {
      const updatedItem = { ...item, description: 'new description' };
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(SHARED_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<Record<Item>>(itemKey)?.toJS()).toEqual(
        updatedItem,
      );
      // check children key contains newly item
      const shared = queryClient
        .getQueryData<List<Item>>(SHARED_ITEMS_KEY)
        ?.toJS();
      expect(shared).toContainEqual(updatedItem);
      expect(shared?.length).toBe(ITEMS.length);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(SHARED_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const shared = queryClient
        .getQueryData<List<Item>>(SHARED_ITEMS_KEY)
        ?.toJS();
      expect(shared?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, Map(item));
      queryClient.setQueryData(SHARED_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<List<Item>>(SHARED_ITEMS_KEY)?.toJS(),
      ).toEqual(ITEMS);
    });
  });
});
