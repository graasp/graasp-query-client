import { List, Record, RecordOf, Seq, is } from 'immutable';
import { ITEM_TYPES } from '../types';

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

export function convertJs<T extends object>(data: T) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data) || data instanceof Map) {
    return Seq<any>(data).map(convertJs).toList();
  }

  const Factory = Record(data);

  return new Factory(Seq<any>(data).map(convertJs));
}

export const isDataEqual = (
  oldData:
    | RecordOf<any>
    | List<RecordOf<any>>
    | List<List<RecordOf<any>>>
    | undefined,
  newData: RecordOf<any> | List<RecordOf<any>> | List<List<RecordOf<any>>>,
): boolean => {
  return is(oldData, newData);
};

export const paginate = (
  list: List<RecordOf<any>>,
  pageSize: number,
  pageNumber: number,
): Promise<RecordOf<any>> => {
  return new Promise((resolve, reject) => {
    try {
      const data = list
        .filter((i) => i.type !== ITEM_TYPES.FOLDER)
        .filter((i) => !i.settings?.isPinned)
        .slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      const createRecordPaginatedResponse = Record({
        data: data,
        pageNumber: -1,
      });

      if (data.isEmpty() || list.size <= pageNumber * pageSize) {
        resolve(createRecordPaginatedResponse());
      }
      const response = createRecordPaginatedResponse({
        data: data,
        pageNumber: pageNumber,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};
