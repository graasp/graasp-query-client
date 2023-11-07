/* eslint-disable import/no-extraneous-dependencies */
import { HttpMethod } from '@graasp/sdk';

import nock from 'nock';
import { act } from 'react-test-renderer';

import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { buildExportItemRoute } from '../api/routes';
import { exportItemRoutine } from '../routines';

const mockedNotifier = jest.fn();
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
    const route = `/${buildExportItemRoute({ itemId })}`;
    const mutation = mutations.useExportZip;

    it('Export zip', async () => {
      const endpoints = [
        {
          response: { id: 'id', content: 'content' },
          method: HttpMethod.GET,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportItemRoutine.SUCCESS,
      });
    });
  });
});
