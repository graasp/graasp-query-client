
// eslint-disable-next-line import/prefer-default-export
export enum REQUEST_METHODS {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

// export const DEFAULT_GET: RequestInit = {
//   credentials: 'include',
//   method: REQUEST_METHODS.GET,
//   headers: { 'Content-Type': 'application/json' },
// };

// export const DEFAULT_POST: RequestInit = {
//   method: REQUEST_METHODS.POST,
//   credentials: 'include',
//   headers: { 'Content-Type': 'application/json' },
// };

// export const DEFAULT_DELETE: RequestInit = {
//   method: REQUEST_METHODS.DELETE,
//   credentials: 'include',
// };

// export const DEFAULT_PATCH: RequestInit = {
//   method: REQUEST_METHODS.PATCH,
//   headers: { 'Content-Type': 'application/json' },
//   credentials: 'include',
// };

// export const DEFAULT_PUT: RequestInit = {
//   method: REQUEST_METHODS.PUT,
//   headers: { 'Content-Type': 'application/json' },
//   credentials: 'include',
// };

// export const failOnError = (res: Response) => {
//   if (!res.ok) {
//     throw new Error(res.statusText);
//   }

//   // res.status >= 200 && res.status < 300
//   return res;
// };
