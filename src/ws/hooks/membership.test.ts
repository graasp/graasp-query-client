import { List } from 'immutable';
import Cookies from 'js-cookie';
import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils';
import { ITEMS, ITEM_MEMBERSHIPS_RESPONSE } from '../../../test/constants';
import { buildItemMembershipsKey } from '../../config/keys';
import { configureWsMembershipHooks } from './membership';
import { KINDS, OPS, TOPICS } from '../constants';
import { Membership, MembershipRecord, PERMISSION_LEVELS } from '../../types';

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
    const newMembershipRecord = ITEM_MEMBERSHIPS_RESPONSE.first()!;
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
        queryClient.getQueryData<List<MembershipRecord>>(membershipsKey)?.toJS(),
      ).toContainEqual(newMembership);
    });

    it(`Receive update membership update`, async () => {
      queryClient.setQueryData(membershipsKey, memberships.push(newMembershipRecord));
      const updatedMembership = (newMembershipRecord.update('permission', () => PERMISSION_LEVELS.WRITE)).toJS();
      await mockWsHook({ hook, wrapper });

      const chatEvent = {
        kind: KINDS.ITEM,
        op: OPS.UPDATE,
        membership: updatedMembership,
      };

      getHandlerByChannel(handlers, channel)?.handler(chatEvent);

      const membershipsData = queryClient
        .getQueryData<List<MembershipRecord>>(membershipsKey)
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
        .getQueryData<List<MembershipRecord>>(membershipsKey)
        ?.toJS() as Membership[];
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
          .getQueryData<List<MembershipRecord>>(membershipsKey)
          ?.equals(memberships),
      ).toBeTruthy();
    });
  });
});
