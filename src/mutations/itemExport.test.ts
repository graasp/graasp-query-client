/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';
import { act } from 'react-test-renderer';

import { HttpMethod } from '@graasp/sdk';

import { UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildExportItemRoute,
  buildExportPublicItemRoute,
} from '../api/routes';
import { MUTATION_KEYS } from '../config/keys';
import { exportItemRoutine } from '../routines';

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
    const route = `/${buildExportItemRoute(itemId)}`;
    const mutation = () => useMutation(MUTATION_KEYS.EXPORT_ZIP);

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
        await mockedMutation.mutate({ id: itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportItemRoutine.SUCCESS,
      });
    });

    it(`Fallback to public`, async () => {
      const endpoints = [
        {
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
          route,
        },
        {
          response: { id: 'id', content: 'content' },
          method: HttpMethod.GET,
          route: `/${buildExportPublicItemRoute(itemId)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportItemRoutine.SUCCESS,
      });
    });

    it(`Fallback to public automatically`, async () => {
      const endpoints = [
        {
          response: { id: 'id', content: 'public content' },
          method: HttpMethod.GET,
          route: `/${buildExportPublicItemRoute(itemId)}`,
        },
      ];

      const mockedMutation = await mockMutation({
        endpoints,
        mutation,
        wrapper,
      });

      await act(async () => {
        await mockedMutation.mutate({ id: itemId, options: { public: true } });
        await waitForMutation();
      });

      expect(mockedNotifier).toHaveBeenCalledWith({
        type: exportItemRoutine.SUCCESS,
      });
    });
  });
});
