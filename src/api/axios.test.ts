import { UNAUTHORIZED_RESPONSE, buildResultOfData } from '../../test/constants';
import { splitRequestByIds } from './axios';

const chunkSize = 5;
const ids = Array.from({ length: chunkSize * 3 + 1 }, (_, idx) =>
  idx.toString(),
);
const buildRequest = async (chunk: typeof ids) =>
  buildResultOfData(chunk, (el) => el);

describe('Axios Tests', () => {
  describe('Axios Tests', () => {
    it('result contains the correct number of responses', async () => {
      const zero = 0;
      const result0 = await splitRequestByIds(
        ids.slice(0, zero),
        chunkSize,
        buildRequest,
      );
      expect(result0).toBeNull();

      const small = 2;
      const result1 = await splitRequestByIds(
        ids.slice(0, small),
        chunkSize,
        buildRequest,
      );
      expect(result1.data.toSeq().size).toEqual(small);

      const twice = chunkSize + 1;
      const result2 = await splitRequestByIds(
        ids.slice(0, twice),
        chunkSize,
        buildRequest,
      );
      expect(result2.data.toSeq().size).toEqual(twice);

      const big = ids.length;
      const result3 = await splitRequestByIds(
        ids.slice(0, big),
        chunkSize,
        buildRequest,
      );
      expect(result3.data.toSeq().size).toEqual(big);
    });

    it('throws if one of the request throws', async () => {
      await expect(
        splitRequestByIds(ids.slice(0, 2), 1, async ([id]) => {
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
        await splitRequestByIds(ids.slice(0, 2), 1, async ([id]) => {
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
});
