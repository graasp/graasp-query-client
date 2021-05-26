/* eslint-disable no-unused-vars */
import { List, Map } from 'immutable';
import {
  buildItemChildrenKey,
  buildItemKey,
  buildItemLoginKey,
  buildItemMembershipsKey,
  buildItemParentsKey,
  buildItemTagsKey,
  ITEM_TAGS,
  OWN_ITEMS_KEY,
  SHARED_ITEMS_KEY,
} from '../config/keys';
import * as Api from '../api';

export const buildGetItem = (id, queryConfig) => ({
  queryKey: buildItemKey(id),
  queryFn: () => Api.getItem(id, queryConfig).then((data) => Map(data)),
});

export const buildOwnItems = (queryConfig) => ({
  queryKey: OWN_ITEMS_KEY,
  queryFn: () => Api.getOwnItems(queryConfig).then((data) => List(data)),
});

export const buildChildren = (id, queryConfig) => ({
  queryKey: buildItemChildrenKey(id),
  queryFn: () => Api.getChildren(id, queryConfig).then((data) => List(data)),
});

export const buildParents = ({ id, path }, queryConfig) => ({
  queryKey: buildItemParentsKey(id),
  queryFn: () =>
    Api.getParents({ path }, queryConfig).then((data) => List(data)),
});

export const buildSharedItems = (queryConfig) => ({
  queryKey: SHARED_ITEMS_KEY,
  queryFn: () => Api.getSharedItems(queryConfig).then((data) => List(data)),
});

export const buildItemMembershipsQuery = (id, queryConfig) => ({
  queryKey: buildItemMembershipsKey(id),
  queryFn: () =>
    Api.getMembershipsForItem(id, queryConfig).then((data) => List(data)),
});

export const buildItemLoginQuery = (id, queryConfig) => ({
  queryKey: buildItemLoginKey(id),
  queryFn: () => Api.getItemLogin(id, queryConfig).then((data) => Map(data)),
});

export const buildTagsQuery = (queryConfig) => ({
  queryKey: ITEM_TAGS,
  queryFn: () => Api.getTags(queryConfig).then((data) => List(data)),
});

export const buildItemTagsQuery = (id, queryConfig) => ({
  queryKey: buildItemTagsKey(id),
  queryFn: () => Api.getItemTags(id, queryConfig).then((data) => List(data)),
});
