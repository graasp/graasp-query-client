import { HttpMethod } from '@graasp/sdk';

import { act } from '@testing-library/react';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildExportItemRoute } from '../routes.js';
import { exportItemRoutine } from '../routines/itemExport.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Export Item', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useExportItem', () => {
    const itemId = 'item-id';
    const route = `/${buildExportItemRoute(itemId)}`;
    const mutation = mutations.useExportItem;

    it('Export zip', async () => {
      const endpoints = [
        {
          response: { id: 'id', content: 'content' },
          method: HttpMethod.Get,
          route,
          headers: { 'content-disposition': 'attachment; filename=binary.zip' },
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        mockedMutation.mutate({ id: itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportItemRoutine.SUCCESS,
      });
    });
  });
});
