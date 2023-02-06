import { List, Record, RecordOf, is } from 'immutable';
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

export const isPaginatedChildrenDataEqual = (
  oldData: InfiniteData<RecordOf<any>> | undefined,
  newData: InfiniteData<RecordOf<any>>,
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

export type ImmutableCast<Type> = RecordOf<{
  [Property in keyof Type]: Type[Property] extends (infer U)[]
    ? List<U>
    : Type[Property] extends (infer U)[] | undefined
    ? List<U> | undefined
    : Type[Property] extends object
    ? ImmutableCast<Type[Property]>
    : Type[Property];
}>;
