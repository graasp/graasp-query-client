import { describe, expect, it, vi } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
} from '../../test/constants.js';
import { splitRequestByIds, splitRequestByIdsAndReturn } from './axios.js';

const chunkSize = 5;
const ids = Array.from({ length: chunkSize * 3 + 1 }, (_, idx) =>
  idx.toString(),
);
const buildRequest = async (chunk: typeof ids) =>
  buildResultOfData(chunk, (el) => el);

describe('splitRequestByIds', () => {
  it('Does not send request for empty arrays', async () => {
    const mockBuildRequests = vi.fn().mockResolvedValue('ok');
    await splitRequestByIds([], 1, mockBuildRequests);
    expect(mockBuildRequests).toBeCalledTimes(0);
  });
});

describe('Axios Tests', () => {
  it('Throw for empty responses', async () => {
    const zero = 0;
    expect(() =>
      splitRequestByIdsAndReturn(ids.slice(0, zero), chunkSize, buildRequest),
    ).rejects.toThrow();
  });
  it('result contains the correct number of responses', async () => {
    const small = 2;
    const result1 = await splitRequestByIdsAndReturn(
      ids.slice(0, small),
      chunkSize,
      buildRequest,
    );
    expect(Object.values(result1!.data).length).toEqual(small);

    const twice = chunkSize + 1;
    const result2 = await splitRequestByIdsAndReturn(
      ids.slice(0, twice),
      chunkSize,
      buildRequest,
    );
    expect(Object.values(result2!.data).length).toEqual(twice);

    const big = ids.length;
    const result3 = await splitRequestByIdsAndReturn(
      ids.slice(0, big),
      chunkSize,
      buildRequest,
    );
    expect(Object.values(result3!.data).length).toEqual(big);
  });

  it('throws if one of the request throws', async () => {
    await expect(
      splitRequestByIdsAndReturn(ids.slice(0, 2), 1, async ([id]) => {
        if (id === '1') {
          throw new Error();
        }
        return buildResultOfData([id]);
      }),
    ).rejects.toThrow();
  });

  it('throws if one of the request contains an error', async () => {
    let thrownError;

    try {
      await splitRequestByIdsAndReturn(ids.slice(0, 2), 1, async ([id]) => {
        if (id === '1') {
          return buildResultOfData([], (el) => el, [UNAUTHORIZED_RESPONSE]);
        }
        return buildResultOfData([id]);
      });
    } catch (error) {
      thrownError = error;
    }

    // throwIfArrayContainsErrorOrReturn encapsulates the error in response.data
    expect(thrownError).toEqual({
      response: { data: [UNAUTHORIZED_RESPONSE] },
    });
  });
});
