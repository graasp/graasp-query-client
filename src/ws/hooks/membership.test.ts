import { List } from 'immutable';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { ITEMS, ITEM_MEMBERSHIPS_RESPONSE } from '../../../test/constants';
import { buildItemMembershipsKey } from '../../config/keys';
import { configureWsMembershipHooks } from './membership';
import { KINDS, OPS, TOPICS } from '../constants';
import { Membership, PERMISSION_LEVELS } from '../../types';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsMembershipHooks,
});

describe('Ws Membership Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemMembershipsUpdates', () => {
    const itemId = ITEMS[0].id;
    const membershipsKey = buildItemMembershipsKey(itemId);
    const newMembership = ITEM_MEMBERSHIPS_RESPONSE[0];
    const memberships = List([ITEM_MEMBERSHIPS_RESPONSE[1]]);
    const channel = { name: itemId, topic: TOPICS.MEMBERSHIPS_ITEM };
    const hook = () => hooks.useItemMembershipsUpdates(itemId);

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
        queryClient.getQueryData<List<Membership>>(membershipsKey)?.toJS(),
      ).toContainEqual(newMembership);
    });

    it(`Receive update membership update`, async () => {
      queryClient.setQueryData(membershipsKey, memberships.push(newMembership));
      const updatedMembership = {
        ...newMembership,
        permission: PERMISSION_LEVELS.WRITE,
      };
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        membership: updatedMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData = queryClient
        .getQueryData<List<Membership>>(membershipsKey)
        ?.toJS();
      expect(membershipsData).toContainEqual(updatedMembership);
      expect(membershipsData?.length).toBe(memberships.size + 1);
    });

    it(`Receive delete membership update`, async () => {
      queryClient.setQueryData(membershipsKey, List(ITEM_MEMBERSHIPS_RESPONSE));
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.DELETE,
        membership: memberships.get(0),
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData = queryClient
        .getQueryData<List<Membership>>(membershipsKey)
        ?.toJS();
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
          .getQueryData<List<Membership>>(membershipsKey)
          ?.equals(memberships),
      ).toBeTruthy();
    });
  });
});
