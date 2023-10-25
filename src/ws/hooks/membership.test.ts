import { ItemMembership, PermissionLevel } from '@graasp/sdk';

import Cookies from 'js-cookie';

import { ITEMS, ITEM_MEMBERSHIPS_RESPONSE } from '../../../test/constants';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { buildItemMembershipsKey } from '../../config/keys';
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
    const itemId = ITEMS[0].id;
    const membershipsKey = buildItemMembershipsKey(itemId);
    const newItemMembership = ITEM_MEMBERSHIPS_RESPONSE[0];
    const newMembership = ITEM_MEMBERSHIPS_RESPONSE[0];
    const memberships = [ITEM_MEMBERSHIPS_RESPONSE[1]];
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
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toContainEqual(newMembership);
    });

    it(`Receive update membership update`, async () => {
      queryClient.setQueryData(
        membershipsKey,
        memberships.push(newItemMembership),
      );
      const updatedMembership = {
        ...newItemMembership,
        permission: PermissionLevel.Write,
      };
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        membership: updatedMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData =
        queryClient.getQueryData<ItemMembership[]>(membershipsKey);
      expect(membershipsData).toContainEqual(updatedMembership);
      expect(membershipsData?.length).toBe(memberships.length + 1);
    });

    it(`Receive delete membership update`, async () => {
      queryClient.setQueryData(membershipsKey, ITEM_MEMBERSHIPS_RESPONSE);
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.DELETE,
        membership: memberships[0],
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData =
        queryClient.getQueryData<ItemMembership[]>(membershipsKey);
      expect(
        membershipsData?.find(({ id }) => id === memberships[0].id),
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
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toEqual(memberships);
    });
  });
});
