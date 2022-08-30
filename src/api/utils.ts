import Cookies from 'js-cookie';

// eslint-disable-next-line import/prefer-default-export
export const isUserAuthenticated = () => Boolean(Cookies.get('session'));
