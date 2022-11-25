import { InfiniteData } from '@tanstack/react-query';
import { List, Record, RecordOf, is } from 'immutable';

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

type GeneralType =
  | RecordOf<any>
  | List<RecordOf<any>>
  | List<List<RecordOf<any>>>
  // necessary for download avatar, thumbnail
  // might be removed if we only use links
  | Blob;

export const structuralSharing = (
  oldData: GeneralType | undefined,
  newData: GeneralType,
): GeneralType | undefined => (is(oldData, newData) ? oldData : newData);

export const isPaginatedChildrenDataEqual = (
  oldData: InfiniteData<RecordOf<any>> | undefined,
  newData: InfiniteData<RecordOf<any>>,
): InfiniteData<RecordOf<any>> => {
  if (oldData?.pages.length === newData?.pages.length && oldData.pages.length) {
    for (const [idx, p] of oldData.pages.entries()) {
      if (!is(p, newData.pages[idx])) {
        return newData;
      }
    }
    return oldData;
  }
  return newData;
};

export const paginate = (
  list: List<RecordOf<any>>,
  pageSize: number,
  pageNumber: number,
  filterFunction?: (item: List<RecordOf<any>>) => List<RecordOf<any>>,
): Promise<RecordOf<any>> =>
  new Promise((resolve, reject) => {
    try {
      let data = filterFunction ? filterFunction(list) : list;
      data = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      // compute next page number, set at -1 if it's the end of the list
      const nextPageNumber =
        data.isEmpty() || list.size <= pageNumber * pageSize ? -1 : pageNumber;
      const createRecordPaginatedResponse = Record({
        data,
        pageNumber: nextPageNumber,
      });
      const response = createRecordPaginatedResponse();
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
