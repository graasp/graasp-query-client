import {
  DiscriminatedItem,
  FolderItemFactory,
  ItemOpFeedbackEvent,
} from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { memberKeys } from '../../config/keys.js';
import { KINDS, OPS, TOPICS } from '../constants.js';
import { configureWsItemHooks } from './item.js';

const { hooks, wrapper, queryClient, handlers } = setUpWsTest({
  configureWsHooks: configureWsItemHooks,
});

describe('Ws Item Hooks', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('useItemFeedbackUpdates', () => {
    const item = FolderItemFactory();
    const itemActorId = item.creator?.id ?? 'random-id';
    const channel = { name: itemActorId, topic: TOPICS.ITEM_MEMBER };
    const hook = () => hooks.useItemFeedbackUpdates(itemActorId);

    it(`Receive delete feedback`, async () => {
      // If the keys are not set in the cache, they are never invalidated.
      queryClient.setQueryData(memberKeys.current().recycled, []);
      queryClient.setQueryData(memberKeys.current().recycledItems, []);

      await mockWsHook({ hook, wrapper });

      const itemEvent: ItemOpFeedbackEvent<DiscriminatedItem> = {
        kind: KINDS.FEEDBACK,
        resource: [item.id],
        op: OPS.DELETE,
        errors: [],
      };

      const handler = getHandlerByChannel(handlers, channel);
      expect(handler).not.toBeUndefined();
      handler?.handler(itemEvent);

      expect(
        queryClient.getQueryState(memberKeys.current().recycled)?.isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(memberKeys.current().recycledItems)
          ?.isInvalidated,
      ).toBe(true);
    });
  });
});
