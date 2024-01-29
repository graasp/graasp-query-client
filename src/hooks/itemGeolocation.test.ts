import { StatusCodes } from 'http-status-codes';

import { ITEM_GEOLOCATION, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { ITEMS_ROUTE } from '../api/routes';
import {
  buildItemGeolocationKey,
  itemsWithGeolocationKeys,
} from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useItemGeolocation', () => {
  const response = ITEM_GEOLOCATION;
  const itemId = response.item.id;
  const route = `/${ITEMS_ROUTE}/${itemId}/geolocation`;
  const hook = () => hooks.useItemGeolocation(response.item.id);
  const key = buildItemGeolocationKey(itemId);
  const endpoints = [{ route, response }];

  it(`Retrieve geolocation of item`, async () => {
    const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

    expect(isSuccess).toBeTruthy();
    expect(data).toEqual(response);

    // verify cache keys
    expect(queryClient.getQueryData(key)).toMatchObject(response);
  });

  it(`Undefined id does not fetch`, async () => {
    const { data, isFetched } = await mockHook({
      endpoints,
      hook,
      wrapper,
      enabled: false,
    });

    expect(isFetched).toBeFalsy();
    expect(data).toBeFalsy();

    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });

  it(`Unauthorized`, async () => {
    const { data, isError } = await mockHook({
      hook,
      wrapper,
      endpoints: [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ],
    });

    expect(data).toBeFalsy();
    expect(isError).toBeTruthy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });
});

describe('useItemsInMap', () => {
  const response = [ITEM_GEOLOCATION];
  const values = { lat1: 1, lat2: 1, lng1: 1, lng2: 1 };
  const route = `/${ITEMS_ROUTE}/geolocation?lat1=1&lat2=1&lng1=1&lng2=1`;
  const hook = () => hooks.useItemsInMap(values);
  const key = itemsWithGeolocationKeys.inBounds(values);
  const endpoints = [{ route, response }];

  it(`Retrieve geolocation of item`, async () => {
    const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

    expect(isSuccess).toBeTruthy();
    expect(data).toEqual(response);

    // verify cache keys
    expect(queryClient.getQueryData(key)).toMatchObject(response);
  });

  it(`Retrieve geolocation for lat1=0`, async () => {
    const valuesAndLat1IsZero = { ...values, lat1: 0 };
    const { data, isSuccess } = await mockHook({
      endpoints: [
        {
          route: `/${ITEMS_ROUTE}/geolocation?lat1=0&lat2=1&lng1=1&lng2=1`,
          response,
        },
      ],
      hook: () => hooks.useItemsInMap(valuesAndLat1IsZero),
      wrapper,
    });

    expect(isSuccess).toBeTruthy();
    expect(data).toEqual(response);

    // verify cache keys
    expect(
      queryClient.getQueryData(
        itemsWithGeolocationKeys.inBounds(valuesAndLat1IsZero),
      ),
    ).toMatchObject(response);
  });

  it(`Undefined lat1 does not fetch`, async () => {
    const { data, isFetched } = await mockHook({
      endpoints: [
        { route: `/${ITEMS_ROUTE}/geolocation?lat2=1&lng1=1&lng2=1`, response },
      ],
      hook: () => hooks.useItemsInMap({ ...values, lat1: undefined! }),
      wrapper,
      enabled: false,
    });

    expect(isFetched).toBeFalsy();
    expect(data).toBeFalsy();

    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });

  it(`Undefined lat2 does not fetch`, async () => {
    const { data, isFetched } = await mockHook({
      endpoints: [
        { route: `/${ITEMS_ROUTE}/geolocation?lat1=1&lng1=1&lng2=1`, response },
      ],
      hook: () => hooks.useItemsInMap({ ...values, lat2: undefined! }),
      wrapper,
      enabled: false,
    });

    expect(isFetched).toBeFalsy();
    expect(data).toBeFalsy();

    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });

  it(`Undefined lng1 does not fetch`, async () => {
    const { data, isFetched } = await mockHook({
      endpoints: [
        { route: `/${ITEMS_ROUTE}/geolocation?lat1=1&lat2=1&lng2=1`, response },
      ],
      hook: () => hooks.useItemsInMap({ ...values, lng1: undefined! }),
      wrapper,
      enabled: false,
    });

    expect(isFetched).toBeFalsy();
    expect(data).toBeFalsy();

    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });

  it(`Undefined lng2 does not fetch`, async () => {
    const { data, isFetched } = await mockHook({
      endpoints: [
        { route: `/${ITEMS_ROUTE}/geolocation?lat1=1&lat2=1&lng1=1`, response },
      ],
      hook: () => hooks.useItemsInMap({ ...values, lng2: undefined! }),
      wrapper,
      enabled: false,
    });

    expect(isFetched).toBeFalsy();
    expect(data).toBeFalsy();

    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });

  it(`Unauthorized`, async () => {
    const { data, isError } = await mockHook({
      hook,
      wrapper,
      endpoints: [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ],
    });

    expect(data).toBeFalsy();
    expect(isError).toBeTruthy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });
});
