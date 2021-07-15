import { getChildrenOrderFromFolderExtra } from './item';

export const userOrderComparator = (itemIdsOrder: string[]) => (
  a: any,
  b: any,
) => itemIdsOrder.indexOf(a.id) - itemIdsOrder.indexOf(b.id);

export const getUserOrderComparator = (parentItem: any) =>
  userOrderComparator(getChildrenOrderFromFolderExtra(parentItem.get('extra')));
