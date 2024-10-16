import {
  DiscriminatedItem,
  FolderItemFactory,
  ItemOpFeedbackEvent,
  PublicationStatus,
  buildPathFromIds,
  getParentFromPath,
} from '@graasp/sdk';

import { afterEach, describe, expect, it } from 'vitest';

import {
  getHandlerByChannel,
  mockWsHook,
  setUpWsTest,
} from '../../../test/wsUtils.js';
import { getKeyForParentId, itemKeys, memberKeys } from '../../keys.js';
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

    const handleWS = (itemEvent: ItemOpFeedbackEvent<DiscriminatedItem>) => {
      const handler = getHandlerByChannel(handlers, channel);
      expect(handler).not.toBeUndefined();
      handler?.handler(itemEvent);
    };

    describe('Delete Feedback', () => {
      it(`Receive delete feedback`, async () => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(memberKeys.current().allRecycled, []);

        await mockWsHook({ hook, wrapper });

        const itemEvent: ItemOpFeedbackEvent<
          DiscriminatedItem,
          typeof OPS.DELETE
        > = {
          kind: KINDS.FEEDBACK,
          resource: [item.id],
          op: OPS.DELETE,
          errors: [],
        };

        handleWS(itemEvent);

        expect(
          queryClient.getQueryState(memberKeys.current().allRecycled)
            ?.isInvalidated,
        ).toBe(true);
      });
    });

    describe('Move Feedback', () => {
      const setUpQueryCache = (
        oldParentItemKey: readonly unknown[],
        newParentItemKey: readonly unknown[],
      ) => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(oldParentItemKey, null);
        queryClient.setQueryData(newParentItemKey, null);
      };

      const MoveItemEventFactory = (
        originalItem: DiscriminatedItem,
        movedItem: DiscriminatedItem,
      ): ItemOpFeedbackEvent<DiscriminatedItem, typeof OPS.MOVE> => ({
        kind: KINDS.FEEDBACK,
        resource: [originalItem.id],
        op: OPS.MOVE,
        result: {
          items: [originalItem],
          moved: [movedItem],
        },
        errors: [],
      });

      const expectInvalidates = (
        oldParentItemKey: readonly unknown[],
        newParentItemKey: readonly unknown[],
      ) => {
        expect(queryClient.getQueryState(oldParentItemKey)?.isInvalidated).toBe(
          true,
        );
        expect(queryClient.getQueryState(newParentItemKey)?.isInvalidated).toBe(
          true,
        );
      };

      it(`Receive move feedback when moving folder from accessible to another folder`, async () => {
        const newParentItem = FolderItemFactory();
        const oldParentItemKey = getKeyForParentId(
          getParentFromPath(item.path),
        );
        const movedItem = {
          ...item,
          path: buildPathFromIds(newParentItem.id, item.id),
        };
        const newParentItemKey = itemKeys.single(newParentItem.id).allChildren;

        setUpQueryCache(oldParentItemKey, newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(MoveItemEventFactory(item, movedItem));
        expectInvalidates(oldParentItemKey, newParentItemKey);
      });

      it(`Receive move feedback when moving folder from a subfolder to another folder`, async () => {
        const oldParentItem = FolderItemFactory();
        const oldItem = {
          ...item,
          path: buildPathFromIds(oldParentItem.id, item.id),
        };
        const oldParentItemKey = getKeyForParentId(
          getParentFromPath(oldItem.path),
        );
        const newParentItem = FolderItemFactory();
        const movedItem = {
          ...item,
          path: buildPathFromIds(newParentItem.id, item.id),
        };
        const newParentItemKey = itemKeys.single(newParentItem.id).allChildren;

        setUpQueryCache(oldParentItemKey, newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(MoveItemEventFactory(oldItem, movedItem));
        expectInvalidates(oldParentItemKey, newParentItemKey);
      });

      it(`Receive move feedback when moving folder from a subfolder to accessible`, async () => {
        const oldParentItem = FolderItemFactory();
        const oldItem = {
          ...item,
          path: buildPathFromIds(oldParentItem.id, item.id),
        };
        const oldParentItemKey = getKeyForParentId(
          getParentFromPath(oldItem.path),
        );
        const movedItem = {
          ...item,
          path: buildPathFromIds(item.id),
        };
        const newParentItemKey = getKeyForParentId(
          getParentFromPath(movedItem.path),
        );

        setUpQueryCache(oldParentItemKey, newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(MoveItemEventFactory(oldItem, movedItem));
        expectInvalidates(oldParentItemKey, newParentItemKey);
      });
    });

    describe('Copy Feedback', () => {
      const setUpQueryCache = (newParentItemKey: readonly unknown[]) => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(newParentItemKey, null);
      };

      const CopyItemEventFactory = (
        originalItem: DiscriminatedItem,
        copiedItem: DiscriminatedItem,
      ): ItemOpFeedbackEvent<DiscriminatedItem, typeof OPS.COPY> => ({
        kind: KINDS.FEEDBACK,
        resource: [originalItem.id],
        op: OPS.COPY,
        result: {
          items: [originalItem],
          copies: [copiedItem],
        },
        errors: [],
      });

      const expectInvalidates = (newParentItemKey: readonly unknown[]) => {
        expect(queryClient.getQueryState(newParentItemKey)?.isInvalidated).toBe(
          true,
        );
      };

      it(`Receive copy feedback when copying folder to accessible`, async () => {
        const copiedItem = {
          ...item,
          path: buildPathFromIds(item.id),
        };
        const newParentItemKey = itemKeys.allAccessible();

        setUpQueryCache(newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(CopyItemEventFactory(item, copiedItem));
        expectInvalidates(newParentItemKey);
      });

      it(`Receive copy feedback when copying folder to the same folder`, async () => {
        const originalParentItem = FolderItemFactory();
        const originalItem = {
          ...item,
          path: buildPathFromIds(originalParentItem.id, item.id),
        };
        const copiedItem = {
          ...originalItem,
          id: 'copied-id',
          path: buildPathFromIds(originalItem.id),
        };
        const newParentItemKey = getKeyForParentId(
          getParentFromPath(copiedItem.path),
        );

        setUpQueryCache(newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(CopyItemEventFactory(originalItem, copiedItem));
        expectInvalidates(newParentItemKey);
      });

      it(`Receive copy feedback when copying folder to the another folder`, async () => {
        const originalParentItem = FolderItemFactory();
        const originalItem = {
          ...item,
          path: buildPathFromIds(originalParentItem.id, item.id),
        };
        const copiedItem = {
          ...originalItem,
          id: 'copied-id',
          path: buildPathFromIds(FolderItemFactory().id),
        };
        const newParentItemKey = getKeyForParentId(
          getParentFromPath(copiedItem.path),
        );

        setUpQueryCache(newParentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(CopyItemEventFactory(originalItem, copiedItem));
        expectInvalidates(newParentItemKey);
      });
    });

    describe('Recycle Feedback', () => {
      const setUpQueryCache = (parentItemKey: readonly unknown[]) => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(parentItemKey, null);
      };

      const RecycleItemEventFactory = (
        recycledItem: DiscriminatedItem,
      ): ItemOpFeedbackEvent<DiscriminatedItem, typeof OPS.RECYCLE> => ({
        kind: KINDS.FEEDBACK,
        resource: [recycledItem.id],
        op: OPS.RECYCLE,
        result: { [recycledItem.id]: recycledItem },
        errors: [],
      });

      const expectInvalidates = (parentItemKey: readonly unknown[]) => {
        expect(queryClient.getQueryState(parentItemKey)?.isInvalidated).toBe(
          true,
        );
      };

      it(`Receive recycle feedback when recycling folder in accessible`, async () => {
        const parentItemKey = itemKeys.allAccessible();

        setUpQueryCache(parentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(RecycleItemEventFactory(item));
        expectInvalidates(parentItemKey);
      });

      it(`Receive recycle feedback when recycling folder in a sub folder`, async () => {
        const parentItem = FolderItemFactory();
        const recycledItem = {
          ...item,
          path: buildPathFromIds(parentItem.id, item.id),
        };
        const parentItemKey = getKeyForParentId(
          getParentFromPath(recycledItem.path),
        );

        setUpQueryCache(parentItemKey);
        await mockWsHook({ hook, wrapper });
        handleWS(RecycleItemEventFactory(recycledItem));
        expectInvalidates(parentItemKey);
      });
    });

    describe('Restore Feedback', () => {
      const setUpQueryCache = (parentItemKey: readonly unknown[]) => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(parentItemKey, null);
      };

      const RestoreItemEventFactory = (
        recycledItem: DiscriminatedItem,
      ): ItemOpFeedbackEvent<DiscriminatedItem, typeof OPS.RESTORE> => ({
        kind: KINDS.FEEDBACK,
        resource: [recycledItem.id],
        op: OPS.RESTORE,
        errors: [],
      });

      const expectInvalidates = (parentItemKey: readonly unknown[]) => {
        expect(queryClient.getQueryState(parentItemKey)?.isInvalidated).toBe(
          true,
        );
      };

      it(`Receive restore feedback when restoring a folder`, async () => {
        const recycledItemsKey = memberKeys.current().allRecycled;

        setUpQueryCache(recycledItemsKey);
        await mockWsHook({ hook, wrapper });
        handleWS(RestoreItemEventFactory(item));
        expectInvalidates(recycledItemsKey);
      });
    });

    describe('Validate Feedback', () => {
      it(`Receive validate feedback`, async () => {
        // If the keys are not set in the cache, they are never invalidated.
        queryClient.setQueryData(
          itemKeys.single(item.id).publicationStatus,
          PublicationStatus.Unpublished,
        );

        await mockWsHook({ hook, wrapper });

        const itemEvent: ItemOpFeedbackEvent<
          DiscriminatedItem,
          typeof OPS.VALIDATE
        > = {
          kind: KINDS.FEEDBACK,
          resource: [item.id],
          op: OPS.VALIDATE,
          errors: [],
        };

        handleWS(itemEvent);

        expect(
          queryClient.getQueryState(itemKeys.single(item.id).publicationStatus)
            ?.isInvalidated,
        ).toBe(true);
      });
    });
  });
});
