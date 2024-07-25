import { ItemType, Member, PermissionLevel, UnionOfConst } from '@graasp/sdk';

export type ItemSearchParams = {
  creatorId?: Member['id'];
  ordering?: 'desc' | 'asc';
  sortBy?:
    | 'item.name'
    | 'item.type'
    | 'item.creator.name'
    | 'item.created_at'
    | 'item.updated_at';
  permissions?: PermissionLevel[];
  types?: UnionOfConst<typeof ItemType>[];
  keywords?: string;
};

export type ItemChildrenParams = {
  ordered?: boolean;
  types?: UnionOfConst<typeof ItemType>[];
  keywords?: string;
};
