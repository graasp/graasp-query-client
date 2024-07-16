import { ItemType, Member, PermissionLevel, UnionOfConst } from '@graasp/sdk';

export type ItemSearchParams =
  | {
      creatorId?: Member['id'];
      name?: string;
      ordering?: 'desc' | 'asc';
      sortBy?:
        | 'item.name'
        | 'item.type'
        | 'item.creator.name'
        | 'item.created_at'
        | 'item.updated_at';
      permissions?: PermissionLevel[];
      types?: UnionOfConst<typeof ItemType>[];
    }
  | undefined;

export type ItemChildrenParams = {
  ordered?: boolean;
  types?: UnionOfConst<typeof ItemType>[];
  includeFiles?: boolean;
  includeFolders?: boolean;
};
