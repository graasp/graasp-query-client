import { ItemType } from '@graasp/sdk';

import { AxiosInstance } from 'axios';
import { v4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';

import { getDescendants } from './api.js';

const API_HOST = 'https://localhost:3000';

describe('getDescendants', () => {
  it('without parameters', async () => {
    const mockGet = vi.fn().mockResolvedValue({ data: { value: 'hello' } });
    const axios = {
      get: mockGet,
    } as unknown as AxiosInstance;
    await getDescendants({ id: v4() }, { API_HOST, axios });
    expect(mockGet).toHaveBeenCalledWith(expect.not.stringContaining('types'));
  });

  it.each([
    { inputs: { showHidden: true }, query: 'showHidden=true' },
    { inputs: { showHidden: false }, query: 'showHidden=false' },
    {
      inputs: { types: [ItemType.FOLDER], showHidden: false },
      query: 'types=folder&showHidden=false',
    },
    {
      inputs: { types: [ItemType.FOLDER], showHidden: true },
      query: 'types=folder&showHidden=true',
    },
    {
      inputs: { types: [ItemType.FOLDER, ItemType.APP], showHidden: false },
      query: 'types=folder&types=app&showHidden=false',
    },
    {
      inputs: { types: [ItemType.FOLDER, ItemType.APP], showHidden: true },
      query: 'types=folder&types=app&showHidden=true',
    },
  ])('With parameters: $inputs', async ({ inputs, query }) => {
    const mockGet = vi.fn().mockResolvedValue({ data: { value: 'hello' } });
    const axios = {
      get: mockGet,
    } as unknown as AxiosInstance;
    await getDescendants({ id: v4(), ...inputs }, { API_HOST, axios });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(query));
  });
});
