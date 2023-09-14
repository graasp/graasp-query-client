import { EtherpadItemType, Item, UUID } from '@graasp/sdk';

import axios from 'axios';

import { QueryClientConfig } from '../types';
import { verifyAuthentication } from './axios';
import { buildGetEtherpadRoute, buildPostEtherpadRoute } from './routes';

/**
 * This is a queue singleton class that manages querying etherpads
 * It ensures that they are always retrieved sequentially (i.e. always after the previous is resolved)
 * This is required because the etherpad sessions are given in a single cookie which must be constructed cumulatively
 * To ensure that there is no race condition between requests in a given browser tab, this queue sends them one after the other
 */
class EtherpadQueue {
  /** Ensure singleton with a single instance */
  static instance = new EtherpadQueue();

  /** A reference to the last promise added to the queue */
  private lastPromise = Promise.resolve();

  /** Ensure singleton with private constructor */
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  private constructor() {}

  public getEtherpad(
    { itemId, mode }: { itemId: UUID; mode: 'read' | 'write' },
    { API_HOST }: QueryClientConfig,
  ) {
    const doFetch = () =>
      axios
        .get(`${API_HOST}/${buildGetEtherpadRoute(itemId)}`, {
          params: { mode },
        })
        .then(({ data }) => data);
    // The queue is implicitly managed by the nested promises call stack
    // We simply schedule this request after the last one that was set
    const nextPromise = this.lastPromise.finally(doFetch);
    this.lastPromise = nextPromise;
    // Retuning the previous reference allows multiple then calls
    return nextPromise;
  }
}

export const postEtherpad = async (
  {
    name,
    parentId,
  }: Pick<Item, 'name'> & {
    parentId?: UUID;
  },
  { API_HOST }: QueryClientConfig,
): Promise<EtherpadItemType> =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostEtherpadRoute(parentId)}`, {
        name: name.trim(),
      })
      .then(({ data }) => data),
  );

export const getEtherpad = (
  args: { itemId: UUID; mode: 'read' | 'write' },
  queryConfig: QueryClientConfig,
) => EtherpadQueue.instance.getEtherpad(args, queryConfig);
