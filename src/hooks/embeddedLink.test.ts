import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  BAD_REQUEST_RESPONSE,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { buildEmbeddedLinkMetadataKey } from '../keys.js';
import { buildGetEmbeddedLinkMetadata } from '../routes.js';
import { EmbeddedLinkMetadata } from '../types.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Embedded Links Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useLinkMetadata', () => {
    const url = 'https://example.com';
    const mockMetadata: EmbeddedLinkMetadata = {
      title: 'test',
      description: 'my description',
      icons: [`${url}/favicon.ico`],
      thumbnails: [],
      isEmbeddingAllowed: true,
    };
    const route = `/${buildGetEmbeddedLinkMetadata(url)}`;
    const key = buildEmbeddedLinkMetadataKey(url);

    const hook = () => hooks.useLinkMetadata(url);

    it(`Receive metadata`, async () => {
      const response = mockMetadata;
      const endpoints = [
        {
          route,
          response,
        },
      ];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`Bad request when using invalid url`, async () => {
      const invalidUrl = 'invalid';
      const invalidRoute = `/${buildGetEmbeddedLinkMetadata(invalidUrl)}`;
      const invalidKey = buildEmbeddedLinkMetadataKey(invalidUrl);

      const invalidHook = () => hooks.useLinkMetadata(invalidUrl);

      const endpoints = [
        {
          route: invalidRoute,
          response: BAD_REQUEST_RESPONSE,
          statusCode: StatusCodes.BAD_REQUEST,
        },
      ];
      const { data, isError } = await mockHook({
        endpoints,
        hook: invalidHook,
        wrapper,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();

      // verify cache keys
      expect(queryClient.getQueryData(invalidKey)).toBeFalsy();
    });
  });
});
