/* eslint-disable import/no-extraneous-dependencies */
import nock from 'nock';
import Cookies from 'js-cookie';
import { act } from 'react-test-renderer';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import { REQUEST_METHODS } from '../api/utils';
import { MUTATION_KEYS } from '../config/keys';
import { buildDownloadItemRoute } from '../api/routes';
import { downloadItemRoutine } from '../routines';

const mockedNotifier = jest.fn();
const { wrapper, queryClient, useMutation } = setUpTest({
  notifier: mockedNotifier,
});

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Export Zip', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe(MUTATION_KEYS.EXPORT_ZIP, () => {
    const itemId = 'item-id';
    const route = `/${buildDownloadItemRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.EXPORT_ZIP);

    it('export zip', async () => {
      const endpoints = [
        {
          response: { id: 'id', content: 'content' },
          method: REQUEST_METHODS.GET,
          route,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: downloadItemRoutine.SUCCESS,
      });
    });
  });
});
