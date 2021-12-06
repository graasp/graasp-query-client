import Cookies from 'js-cookie';

export enum REQUEST_METHODS {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export const isUserAuthenticated = () => Boolean(Cookies.get('session'));
