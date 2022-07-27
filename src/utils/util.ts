import { List, Record, RecordOf, Seq, is } from 'immutable';

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
    | List<RecordOf<any>>[]
    | undefined,
  newData: RecordOf<any> | List<RecordOf<any>> | List<RecordOf<any>>[],
): boolean => {
  if (is(oldData, newData)) {
    return true;
  }
  return false;
};
