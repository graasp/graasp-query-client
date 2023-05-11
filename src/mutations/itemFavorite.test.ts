import { act } from '@testing-library/react-hooks';
import Cookies from 'js-cookie';
import nock from 'nock';

import { HttpMethod } from '@graasp/sdk';


import { mockMutation, setUpTest, waitForMutation } from '../../test/utils';
import {
  buildFavoriteItemRoute,
} from '../api/routes';
import { FAVORITE_ITEMS_KEY } from '../config/keys';
import { addFavoriteItemRoutine, deleteFavoriteItemRoutine } from '../routines';
import { UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { StatusCodes } from 'http-status-codes';

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

const mockedNotifier = jest.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});
describe('Favorite Mutations', () => {
  afterEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  describe('useFavoriteItem', () => {
    const itemId = 'item-id';
    const route = `/${buildFavoriteItemRoute(itemId)}`;
    const mutation = mutations.useFavoriteItem;

    it(`Successfully add favorite item`, async () => {
      // set random data in cache
      queryClient.setQueryData(FAVORITE_ITEMS_KEY, "mock");
      const endpoints = [
        {
          response: itemId,
          method: HttpMethod.POST,
          route,
        },
      ];
      const mockedMutation = await mockMutation({
        mutation,
        wrapper,
        endpoints,
      });

      await act(async () => {
        await mockedMutation.mutate(itemId);
        await waitForMutation();
      });

      expect(
        queryClient.getQueryState(FAVORITE_ITEMS_KEY)?.isInvalidated,
      ).toBeTruthy();
      expect(mockedNotifier).toHaveBeenCalledWith({
        type: addFavoriteItemRoutine.SUCCESS,
      });
    });

    it(`Unauthorized`, async () => {
        const endpoints = [
            {
              response: UNAUTHORIZED_RESPONSE,
              statusCode: StatusCodes.UNAUTHORIZED,
              method: HttpMethod.POST,
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
    
          expect(mockedNotifier).toHaveBeenCalledWith(
            expect.objectContaining({
              type: addFavoriteItemRoutine.FAILURE,
            }),
          );
        });
    });

    describe('useDeleteItemLike', () => {
        const itemId = 'item-id';
        const route = `/${buildFavoriteItemRoute(itemId)}`;
        const mutation = mutations.useUnfavoriteItem;
    
        it('Delete item like', async () => {
          queryClient.setQueryData(FAVORITE_ITEMS_KEY, itemId);
    
    
          const endpoints = [
            {
              response: itemId,
              method: HttpMethod.DELETE,
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
    
          expect(
            queryClient.getQueryState(FAVORITE_ITEMS_KEY)?.isInvalidated,
          ).toBeTruthy();
          expect(mockedNotifier).toHaveBeenCalledWith({
            type: deleteFavoriteItemRoutine.SUCCESS,
          });
        });
    
        it('Unauthorized to delete item like', async () => {
          const endpoints = [
            {
              response: UNAUTHORIZED_RESPONSE,
              statusCode: StatusCodes.UNAUTHORIZED,
              method: HttpMethod.DELETE,
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
    
          expect(mockedNotifier).toHaveBeenCalledWith(
            expect.objectContaining({
              type: deleteFavoriteItemRoutine.FAILURE,
            }),
          );
        });
    });
});