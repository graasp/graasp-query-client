export const DEFAULT_GET: RequestInit = {
  credentials: 'include',
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
};

export const DEFAULT_POST: RequestInit = {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

export const DEFAULT_DELETE: RequestInit = {
  method: 'DELETE',
  credentials: 'include',
};

export const DEFAULT_PATCH: RequestInit = {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
};

export const DEFAULT_PUT: RequestInit = {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
};

export const failOnError = (res: Response) => {
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  // res.status >= 200 && res.status < 300
  return res;
};
