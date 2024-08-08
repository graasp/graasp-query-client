import {
  FolderItemFactory,
  ItemMembership,
  PermissionLevel,
} from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import {
  ITEM_MEMBERSHIPS_RESPONSE,
  createMockMembership,
} from '../../../test/constants.js';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { itemKeys } from '../../keys.js';
import { KINDS, OPS, TOPICS } from '../constants.js';
import { configureWsMembershipHooks } from './membership.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsMembershipHooks,
});

describe('Ws Membership Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemsMembershipsUpdates', () => {
    const item = FolderItemFactory();
    const itemId = item.id;
    const membershipsKey = itemKeys.single(itemId).memberships;
    const newItemMembership = createMockMembership({
      item,
    });
    const memberships = [createMockMembership({ item })];
    const channel = { name: itemId, topic: TOPICS.MEMBERSHIPS_ITEM };
    const hook = () => hooks.useItemsMembershipsUpdates([itemId]);

    it(`Receive create membership update`, async () => {
      queryClient.setQueryData(membershipsKey, memberships);

      await mockWsHook({ hook, wrapper });

      const event = {
        kind: KINDS.ITEM,
        op: OPS.CREATE,
        membership: newItemMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(event);

      expect(
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toContainEqual(newItemMembership);
    });

    it(`Receive update membership update`, async () => {
      queryClient.setQueryData(membershipsKey, [
        ...memberships,
        newItemMembership,
      ]);
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
        membership: newItemMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      expect(
        queryClient.getQueryData<ItemMembership[]>(membershipsKey),
      ).toEqual(memberships);
    });
  });
});
