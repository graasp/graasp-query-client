import { List, RecordOf, is } from 'immutable';
import { InfiniteData } from 'react-query';

export const isObject = (value: unknown) =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;

export const convertFalseToUndefined = (notification?: boolean) =>
  notification ? true : undefined;

export const isServer = () =>
  !(typeof window !== 'undefined' && window.document);

export const getHostname = () => {
  if (isServer()) {
    return undefined;
  }
  return window?.location?.hostname;
};

export const isDataEqual = (
  oldData:
    | RecordOf<any>
    | List<RecordOf<any>>
    | List<List<RecordOf<any>>>
    // necessary for download avatar, thumbnail
    // might be removed if we only use links
    | Blob
    | undefined,
  newData:
    | RecordOf<any>
    | List<RecordOf<any>>
    | List<List<RecordOf<any>>>
    // necessary for download avatar, thumbnail
    // might be removed if we only use links
    | Blob,
): boolean => is(oldData, newData);

export const isPaginatedChildrenDataEqual = <T>(
  oldData: InfiniteData<T> | undefined,
  newData: InfiniteData<T>,
) => {
  if (oldData?.pages.length === newData?.pages.length && oldData.pages.length) {
    for (const [idx, p] of oldData.pages.entries()) {
      if (!is(p, newData.pages[idx])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const paginate = <U, T extends List<U>>(
  list: T,
  pageSize: number,
  pageNumber: number,
  filterFunction?: (item: T) => T,
): Promise<{ data: T; pageNumber: number }> =>
  new Promise((resolve, reject) => {
    try {
      // apply some filtering to the elements provided
      let data: T = filterFunction ? filterFunction(list) : list;
      // get data from current page
      data = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      // compute next page number, set at -1 if it's the end of the list
      const nextPageNumber =
        data.isEmpty() || list.size <= pageNumber * pageSize ? -1 : pageNumber;
      resolve({
        data,
        pageNumber: nextPageNumber,
      });
    } catch (error) {
      reject(error);
    }
  });
