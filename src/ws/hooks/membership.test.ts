import { List } from 'immutable';
import Cookies from 'js-cookie';

import { ItemMembership, PermissionLevel } from '@graasp/sdk';

import { ITEMS, ITEM_MEMBERSHIPS_RESPONSE } from '../../../test/constants';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { buildItemMembershipsKey } from '../../config/keys';
import { ItemMembershipRecord } from '../../types';
import { KINDS, OPS, TOPICS } from '../constants';
import { configureWsMembershipHooks } from './membership';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsMembershipHooks,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Ws Membership Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemsMembershipsUpdates', () => {
    const itemId = ITEMS.first()!.id;
    const membershipsKey = buildItemMembershipsKey(itemId);
    const newItemMembershipRecord = ITEM_MEMBERSHIPS_RESPONSE.first()!;
    const newMembership = ITEM_MEMBERSHIPS_RESPONSE.first()!.toJS();
    const memberships = List([ITEM_MEMBERSHIPS_RESPONSE.get(1)]);
    const channel = { name: itemId, topic: TOPICS.MEMBERSHIPS_ITEM };
    const hook = () => hooks.useItemsMembershipsUpdates([itemId]);

    it(`Receive create membership update`, async () => {
      queryClient.setQueryData(membershipsKey, memberships);

      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.CREATE,
        membership: newMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient
          .getQueryData<List<ItemMembershipRecord>>(membershipsKey)
          ?.toJS(),
      ).toContainEqual(newMembership);
    });

    it(`Receive update membership update`, async () => {
      queryClient.setQueryData(
        membershipsKey,
        memberships.push(newItemMembershipRecord),
      );
      const updatedMembership = newItemMembershipRecord
        .update('permission', () => PermissionLevel.Write)
        .toJS();
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        membership: updatedMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData = queryClient
        .getQueryData<List<ItemMembershipRecord>>(membershipsKey)
        ?.toJS();
      expect(membershipsData).toContainEqual(updatedMembership);
      expect(membershipsData?.length).toBe(memberships.size + 1);
    });

    it(`Receive delete membership update`, async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.DELETE,
        membership: memberships.get(0)?.toJS(),
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData = queryClient
        .getQueryData<List<ItemMembershipRecord>>(membershipsKey)
        ?.toJS() as ItemMembership[];
      expect(
        membershipsData?.find(({ id }) => id === memberships.get(0)?.id),
      ).toBeFalsy();
    });

    it(`Does not update on other events`, async () => {
      queryClient.setQueryData(membershipsKey, memberships);
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: 'false kind',
        op: OPS.PUBLISH,
        membership: newMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient
          .getQueryData<List<ItemMembershipRecord>>(membershipsKey)
          ?.equals(memberships),
      ).toBeTruthy();
    });
  });
});
