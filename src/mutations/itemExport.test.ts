import { HttpMethod } from '@graasp/sdk';

import nock from 'nock';
import { act } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockMutation, setUpTest, waitForMutation } from '../../test/utils.js';
import { buildExportItemRoute } from '../api/routes.js';
import { exportItemRoutine } from '../routines/itemExport.js';

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('Export Zip', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useExportZip', () => {
    const itemId = 'item-id';
    const route = `/${buildExportItemRoute(itemId)}`;
    const mutation = mutations.useExportZip;

    it('Export zip', async () => {
      const endpoints = [
        {
          response: { id: 'id', content: 'content' },
          method: HttpMethod.Get,
          route,
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
