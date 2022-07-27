import Cookies from 'js-cookie';
import { RecordOf, List } from 'immutable';
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
import { convertJs } from '../../utils/util';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsItemHooks,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Ws Item Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemUpdates', () => {
    const item = ITEMS.toArray()[0];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM };
    var changedItem = item.toJS();
    changedItem = { ...changedItem, description: 'new description' };
    const newItem: RecordOf<Item> = convertJs(changedItem);
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

      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        newItem.toJS(),
      );
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

      expect(
        queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS(),
      ).toBeFalsy();
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

      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        item.toJS(),
      );
    });
  });

  describe('useChildrenUpdates', () => {
    // we need to use a different id for the channel to avoid handlers collision
    const parent = ITEMS.toArray()[1];
    const parentId = parent.id;
    const childrenKey = buildItemChildrenKey(parentId);
    const channel = { name: parentId, topic: TOPICS.ITEM };
    const targetItem = ITEMS.toArray()[2];
    const targetItemKey = buildItemKey(targetItem.id);
    const hook = () => hooks.useChildrenUpdates(parentId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(childrenKey, List([ITEMS.toArray()[3]]));
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
      ).toContainEqual(targetItem.toJS());
      // check new item key
      expect(
        queryClient.getQueryData<RecordOf<Item>>(targetItemKey)?.toJS(),
      ).toEqual(targetItem.toJS());
    });

    it(`Receive update child`, async () => {
      var changedItem = targetItem.toJS();
      changedItem = { ...changedItem, description: 'new description' };
      const updatedItem: RecordOf<Item> = convertJs(changedItem);
      queryClient.setQueryData(targetItemKey, targetItem);
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(
        queryClient.getQueryData<RecordOf<Item>>(targetItemKey)?.toJS(),
      ).toEqual(updatedItem.toJS());
      // check children key contains newly item
      const own = queryClient
        .getQueryData<List<RecordOf<Item>>>(childrenKey)
        ?.toJS();
      expect(own).toContainEqual(updatedItem.toJS());
      expect(own?.length).toBe(ITEMS.size);
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
          .getQueryData<List<RecordOf<Item>>>(childrenKey)
          ?.find(({ id }) => id === targetItem.id),
      ).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.DELETE,
        item: targetItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<RecordOf<Item>>(childrenKey)?.toJS(),
      ).toEqual(ITEMS.toJS());
    });
  });

  describe('useOwnItemsUpdates', () => {
    const item = ITEMS.toArray()[0];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useOwnItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS.toArray()[2]]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient.getQueryData<List<RecordOf<Item>>>(OWN_ITEMS_KEY)?.toJS(),
      ).toContainEqual(item.toJS());
      // check new item key
      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        item.toJS(),
      );
    });

    it(`Receive update child`, async () => {
      var changedItem = item.toJS();
      changedItem = { ...changedItem, description: 'new description' };
      const updatedItem: RecordOf<Item> = convertJs(changedItem);
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        updatedItem.toJS(),
      );
      // check children key contains newly item
      const children = queryClient
        .getQueryData<List<RecordOf<Item>>>(OWN_ITEMS_KEY)
        ?.toJS();
      expect(children).toContainEqual(updatedItem.toJS());
      expect(children?.length).toBe(ITEMS.size);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const children = queryClient
        .getQueryData<List<RecordOf<Item>>>(OWN_ITEMS_KEY)
        ?.toJS() as Item[];
      expect(children?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(OWN_ITEMS_KEY, List(ITEMS));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<List<RecordOf<Item>>>(OWN_ITEMS_KEY)?.toJS(),
      ).toEqual(ITEMS.toJS());
    });
  });

  describe('useSharedItemsUpdates', () => {
    // we need to use a different id to avoid handler collision
    const item = ITEMS.toArray()[1];
    const itemId = item.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useSharedItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(SHARED_ITEMS_KEY, List([ITEMS.toArray()[2]]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.CREATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient
          .getQueryData<List<RecordOf<Item>>>(SHARED_ITEMS_KEY)
          ?.toJS(),
      ).toContainEqual(item.toJS());
      // check new item key
      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        item.toJS(),
      );
    });

    it(`Receive update child`, async () => {
      var changedItem = item.toJS();
      changedItem = { ...changedItem, description: 'new description' };
      const updatedItem: RecordOf<Item> = convertJs(changedItem);
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.UPDATE,
        item: updatedItem,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(queryClient.getQueryData<RecordOf<Item>>(itemKey)?.toJS()).toEqual(
        updatedItem.toJS(),
      );
      // check children key contains newly item
      const shared = queryClient
        .getQueryData<List<RecordOf<Item>>>(SHARED_ITEMS_KEY)
        ?.toJS();
      expect(shared).toContainEqual(updatedItem.toJS());
      expect(shared?.length).toBe(ITEMS.size);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.DELETE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const shared = queryClient
        .getQueryData<List<RecordOf<Item>>>(SHARED_ITEMS_KEY)
        ?.toJS() as Item[];
      expect(shared?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item,
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient
          .getQueryData<List<RecordOf<Item>>>(SHARED_ITEMS_KEY)
          ?.toJS(),
      ).toEqual(ITEMS.toJS());
    });
  });
});
