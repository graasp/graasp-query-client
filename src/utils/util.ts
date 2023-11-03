export const isObject = (value: unknown) =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;

export const isServer = () =>
  !(typeof window !== 'undefined' && window.document);

export const getHostname = () => {
  if (isServer()) {
    return undefined;
  }
  return window?.location?.hostname;
};

export const paginate = <U>(
  list: U[],
  pageSize: number,
  pageNumber: number,
  filterFunction?: (items: U[]) => U[],
): Promise<{ data: U[]; pageNumber: number }> =>
  new Promise((resolve, reject) => {
    try {
      // apply some filtering to the elements provided
      let data = filterFunction ? filterFunction(list) : list;
      // get data from current page
      data = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      // compute next page number, set at -1 if it's the end of the list
      const nextPageNumber =
        !data.length || list.length <= pageNumber * pageSize ? -1 : pageNumber;
      resolve({
        data,
        pageNumber: nextPageNumber,
      });
    } catch (error) {
      reject(error);
    }
  });
