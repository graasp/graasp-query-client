import {
  DiscriminatedItem,
  Etherpad,
  EtherpadItemType,
  UUID,
} from '@graasp/sdk';

import axios from 'axios';

import { buildGetEtherpadRoute, buildPostEtherpadRoute } from '../routes.js';
import { QueryClientConfig } from '../types.js';
import { verifyAuthentication } from './axios.js';

/**
 * This is a queue singleton class that manages querying etherpads
 * It ensures that they are always retrieved sequentially (i.e. always after the previous is resolved)
 * This is required because the etherpad sessions are given in a single cookie which must be constructed cumulatively
 * To ensure that there is no race condition between requests in a given browser tab, this queue sends them one after the other
 */
class EtherpadQueue {
  /** Ensure singleton with a single instance */
  static readonly instance = new EtherpadQueue();

  /** A reference to the last promise added to the queue */
  private lastPromise: Promise<void | Etherpad> = Promise.resolve();

  /** Ensure singleton with private constructor */
  private constructor() {}

  public getEtherpad(
    { itemId, mode }: { itemId: UUID; mode: 'read' | 'write' },
    { API_HOST }: QueryClientConfig,
  ) {
    const doFetch = () =>
      axios
        .get<Etherpad>(`${API_HOST}/${buildGetEtherpadRoute(itemId)}`, {
          params: { mode },
        })
        .then(({ data }) => data);
    // The queue is implicitly managed by the nested promises call stack
    // We simply schedule this request after the last one that was set
    // We CANNOT use this.lastPromise.finally(doFetch)! The finally semantics will return the previous return value, even if failing!
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally#description
    // instead we use .then(onResolve, onRejected) with both arguments set to doFetch
    const nextPromise = this.lastPromise.then(doFetch, doFetch);
    this.lastPromise = nextPromise;
    // Retuning the previous reference allows multiple then / catch calls
    return nextPromise;
  }
}

export const postEtherpad = async (
  {
    name,
    parentId,
  }: Pick<DiscriminatedItem, 'name'> & {
    parentId?: UUID;
  },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post<EtherpadItemType>(
        `${API_HOST}/${buildPostEtherpadRoute(parentId)}`,
        {
          name: name.trim(),
        },
      )
      .then(({ data }) => data),
  );

export const getEtherpad = (
  args: { itemId: UUID; mode: 'read' | 'write' },
  queryConfig: QueryClientConfig,
) => EtherpadQueue.instance.getEtherpad(args, queryConfig);
