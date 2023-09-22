import { ItemRecord } from '@graasp/sdk/frontend';

import Immutable, { List } from 'immutable';
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
    const item = ITEMS.first()!;
    const itemId = item?.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM };
    const newItemRecord = item.update('description', () => 'new description');
    const hook = () => hooks.useItemUpdates(itemId);

    it(`Receive update item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(newItemRecord.toJS())),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        Immutable.is(
          queryClient.getQueryData<ItemRecord>(itemKey),
          newItemRecord,
        ),
      ).toBeTruthy();
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SELF,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(newItemRecord.toJS())),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(queryClient.getQueryData<ItemRecord>(itemKey)?.toJS()).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, item);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(newItemRecord.toJS())),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        Immutable.is(queryClient.getQueryData<ItemRecord>(itemKey), item),
      ).toBeTruthy();
    });
  });

  describe('useChildrenUpdates', () => {
    // we need to use a different id for the channel to avoid handlers collision
    const parent = ITEMS.get(1)!;
    const parentId = parent.id;
    const childrenKey = buildItemChildrenKey(parentId);
    const channel = { name: parentId, topic: TOPICS.ITEM };
    const targetItemRecord = ITEMS.get(2)!;
    const targetItem = ITEMS.get(2)!.toJS();
    const targetItemKey = buildItemKey(targetItemRecord.id);
    const hook = () => hooks.useChildrenUpdates(parentId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(childrenKey, List([ITEMS.get(3)!]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(targetItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check children key contains new item
      expect(
        queryClient.getQueryData<List<ItemRecord>>(childrenKey)?.toJS(),
      ).toContainEqual(targetItem);
      // check new item key
      expect(
        Immutable.is(
          queryClient.getQueryData<ItemRecord>(targetItemKey),
          targetItemRecord,
        ),
      ).toBeTruthy();
    });

    it(`Receive update child`, async () => {
      const updatedItemRecord = targetItemRecord.update(
        'description',
        () => 'new description',
      );
      const updatedItem = targetItemRecord
        .update('description', () => 'new description')
        .toJS();
      queryClient.setQueryData(targetItemKey, targetItemRecord);
      queryClient.setQueryData(childrenKey, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.CHILD,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(updatedItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(
        Immutable.is(
          queryClient.getQueryData<ItemRecord>(targetItemKey),
          updatedItemRecord,
        ),
      ).toBeTruthy();
      // check children key contains newly item
      const own = queryClient
        .getQueryData<List<ItemRecord>>(childrenKey)
        ?.toJS();
      expect(own).toContainEqual(updatedItem);
      expect(own?.length).toBe(ITEMS.size);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(targetItemKey, targetItemRecord);
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
          .getQueryData<List<ItemRecord>>(childrenKey)
          ?.find(({ id }: ItemRecord) => id === targetItem.id),
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

      expect(
        Immutable.is(queryClient.getQueryData<ItemRecord>(childrenKey), ITEMS),
      ).toBeTruthy();
    });
  });

  describe('useOwnItemsUpdates', () => {
    const itemRecord = ITEMS.first()!;
    const item = ITEMS.first()!.toJS();
    const itemId = itemRecord.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useOwnItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(OWN_ITEMS_KEY, List([ITEMS.get(2)!]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient.getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY)?.toJS(),
      ).toContainEqual(item);
      // check new item key
      expect(
        Immutable.is(queryClient.getQueryData<ItemRecord>(itemKey), itemRecord),
      ).toBeTruthy();
    });

    it(`Receive update child`, async () => {
      const updatedItemRecord = itemRecord.update(
        'description',
        () => 'new description',
      );
      const updatedItem = itemRecord
        .update('description', () => 'new description')
        .toJS();
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
      expect(
        Immutable.is(
          queryClient.getQueryData<ItemRecord>(itemKey),
          updatedItemRecord,
        ),
      );
      // check children key contains newly item
      const children = queryClient
        .getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY)
        ?.toJS();
      expect(children).toContainEqual(updatedItem);
      expect(children?.length).toBe(ITEMS.size);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, itemRecord);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.OWN,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const children = queryClient
        .getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY)
        ?.toJS();
      expect(children?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, itemRecord);
      queryClient.setQueryData(OWN_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        Immutable.is(
          queryClient.getQueryData<List<ItemRecord>>(OWN_ITEMS_KEY),
          ITEMS,
        ),
      );
    });
  });

  describe('useSharedItemsUpdates', () => {
    // we need to use a different id to avoid handler collision
    const itemRecord = ITEMS.get(1)!;
    const item = ITEMS.get(1)!.toJS();
    const itemId = itemRecord.id;
    const itemKey = buildItemKey(itemId);
    const channel = { name: itemId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useSharedItemsUpdates(itemId);

    it(`Receive create child`, async () => {
      queryClient.setQueryData(SHARED_ITEMS_KEY, List([ITEMS.get(2)!]));
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.CREATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key contains new item
      expect(
        queryClient.getQueryData<List<ItemRecord>>(SHARED_ITEMS_KEY)?.toJS(),
      ).toContainEqual(item);
      // check new item key
      expect(
        Immutable.is(queryClient.getQueryData<ItemRecord>(itemKey), itemRecord),
      );
    });

    it(`Receive update child`, async () => {
      const updatedItemRecord = itemRecord.update(
        'description',
        () => 'new description',
      );
      const updatedItem = itemRecord
        .update('description', () => 'new description')
        .toJS();
      queryClient.setQueryData(itemKey, itemRecord);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(updatedItem)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check new item key content
      expect(
        Immutable.is(
          queryClient.getQueryData<ItemRecord>(itemKey),
          updatedItemRecord,
        ),
      ).toBeTruthy();
      // check children key contains newly item
      const shared = queryClient
        .getQueryData<List<ItemRecord>>(SHARED_ITEMS_KEY)
        ?.toJS();
      expect(shared).toContainEqual(updatedItem);
      expect(shared?.length).toBe(ITEMS.size);
    });

    it(`Receive delete item update`, async () => {
      queryClient.setQueryData(itemKey, itemRecord);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: KINDS.SHARED,
        op: OPS.DELETE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      // check own items key does not contain deleted item
      const shared = queryClient
        .getQueryData<List<ItemRecord>>(SHARED_ITEMS_KEY)
        ?.toJS();
      expect(shared?.find(({ id }) => id === itemId)).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(itemKey, itemRecord);
      queryClient.setQueryData(SHARED_ITEMS_KEY, ITEMS);
      await mockWsHook({ hook, wrapper });

      const itemEvent = {
        kind: 'kind',
        op: OPS.UPDATE,
        item: JSON.parse(JSON.stringify(item)),
      };

      getHandlerByChannel(handlers, channel)?.handler(itemEvent);

      expect(
        queryClient.getQueryData<List<ItemRecord>>(SHARED_ITEMS_KEY)?.toJS(),
      ).toEqual(ITEMS_JS);
    });
  });
});
