/** Utils functions
 * todo: use utils from a dedicated repo */

import CryptoJS from 'crypto-js';
import type { UUID, GraaspError } from '../types';

// eslint-disable-next-line no-useless-escape
export const transformIdForPath = (id: UUID) => id.replace(/\-/g, '_');

export const getParentsIdsFromPath = (
  path: string,
  { ignoreSelf = false } = {},
) => {
  if (!path) {
    return [];
  }

  let p = path;
  // ignore self item in path
  if (ignoreSelf) {
    // split path in half parents / self
    // eslint-disable-next-line no-useless-escape
    const els = path.split(/\.[^\.]*$/);
    // if els has only one element, the item has no parent
    if (els.length <= 1) {
      return [];
    }
    [p] = els;
  }
  const ids = p.replace(/_/g, '-').split('.');
  return ids;
};

export const buildPath = (opts: { prefix: string; ids: UUID[] }) => {
  const { prefix, ids } = opts;
  const pre = prefix ? prefix.concat('.') : prefix;
  return `${pre}${ids.map((id) => transformIdForPath(id)).join('.')}`;
};

export const getDirectParentId = (path: string) => {
  const ids = getParentsIdsFromPath(path);
  const parentIdx = ids.length - 2;
  if (parentIdx < 0) {
    return null;
  }
  return ids[parentIdx];
};

export const hashItemsIds = (ids?: UUID[]) =>
  ids
    ? CryptoJS.SHA1([...ids].sort().join(""))
    : undefined;

export const isError = (error: unknown) => {
  const errorObject = error as GraaspError;
  return errorObject?.statusCode;
};
