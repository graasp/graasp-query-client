import nock from 'nock';
import { v4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import { API_HOST } from '../../test/constants.js';
import { buildExportItemRoute } from '../routes.js';
import configureAxios from './axios.js';
import { exportItem } from './itemExport.js';

describe('itemExport', () => {
  it('decodes the download name', async () => {
    const id = v4();
    const name = 'hello my àle';
    const axiosInstance = configureAxios();
    nock(API_HOST)
      .get(`/${buildExportItemRoute(id)}`)
      .reply(
        200,
        {},
        { 'content-disposition': `filename="${encodeURI(name)}"` },
      );

    const { name: decodedName } = await exportItem(id, {
      API_HOST,
      axios: axiosInstance,
    });

    expect(decodedName).toEqual(name);
  });
});
