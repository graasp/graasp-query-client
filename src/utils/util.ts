import { List, RecordOf, is } from 'immutable';

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
    | undefined,
  newData: RecordOf<any> | List<RecordOf<any>> | List<List<RecordOf<any>>>,
): boolean => is(oldData, newData);
