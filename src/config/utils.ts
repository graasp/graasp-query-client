import { QueryClient, QueryKey } from '@tanstack/react-query';
import { expect } from 'vitest';

import { HAS_CHANGES_KEY } from './keys.js';

/**
 * Custom set where the key is converted to string using JSON.stringify.
 * This allows to use an array as a key and to compare with the value instead of reference.
 */
export class HashSet<T> {
  private stringSet = new Set<string>();

  add(key: T) {
    const stringKey = JSON.stringify(key);
    if (!this.stringSet.has(stringKey)) {
      this.stringSet.add(stringKey);
    }
    return this;
  }

  clear() {
    this.stringSet.clear();
  }

  forEach(callbackfn: (value: T, set: Set<T>) => void, thisArg?: unknown) {
    this.stringSet.forEach((stringValue: string) => {
      callbackfn.call(
        thisArg,
        JSON.parse(stringValue),
        this.stringSet as Set<T>,
      );
    });
  }

  has(key: T) {
    return this.stringSet.has(JSON.stringify(key));
  }

  /**
   * Return a deep copy of the values.
   * @returns A 2D string array.
   */
  values() {
    return JSON.parse(JSON.stringify(Array.from(this.stringSet))) as string[][];
  }
}

export const addToChangesKey = (queryClient: QueryClient, key: QueryKey) => {
  const changedKeys =
    queryClient.getQueryData<HashSet<QueryKey>>(HAS_CHANGES_KEY) ??
    new HashSet<QueryKey>();
  changedKeys.add(key);
  queryClient.setQueryData(HAS_CHANGES_KEY, changedKeys);
};

export const isInChangesKey = (queryClient: QueryClient, key: QueryKey) =>
  queryClient.getQueryData<HashSet<QueryKey>>(HAS_CHANGES_KEY)?.has(key) ??
  false;

export const invalidateChangedQueries = (queryClient: QueryClient) => {
  const changes = queryClient.getQueryData<HashSet<QueryKey>>(HAS_CHANGES_KEY);
  if (changes) {
    changes.forEach((k) => queryClient.invalidateQueries(k));
    changes.clear();
  }
};

/**
 * Expect to find or not the given key in the changes key.
 *
 * @param queryClient The QueryClient instance
 * @param key The key who should (or not) be in the changes key.
 * @param expectation If true, the key should be in, else the key should not be in.
 * @returns Assertion<boolean>
 */
export const expectIsInChangesKey = (
  queryClient: QueryClient,
  key: QueryKey,
  expectation = true,
) => expect(isInChangesKey(queryClient, key)).toBe(expectation);
