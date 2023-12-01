import createRoutine from './utils';

export const createItemRoutine = createRoutine('CREATE_ITEM');
export const deleteItemRoutine = createRoutine('DELETE_ITEM');
export const getOwnItemsRoutine = createRoutine('GET_OWN_ITEMS');
export const getAccessibleItemsRoutine = createRoutine('GET_ACCESSIBLE');
export const moveItemRoutine = createRoutine('MOVE_ITEM');
export const moveItemsRoutine = createRoutine('MOVE_ITEMS');
export const copyItemRoutine = createRoutine('COPY_ITEM');
export const copyItemsRoutine = createRoutine('COPY_ITEMS');
export const editItemRoutine = createRoutine('EDIT_ITEM');
export const deleteItemsRoutine = createRoutine('DELETE_ITEMS');
export const uploadFileRoutine = createRoutine('UPLOAD_FILE');
export const recycleItemsRoutine = createRoutine('RECYCLE_ITEMS');
export const restoreItemsRoutine = createRoutine('RESTORE_ITEMS');
export const uploadItemThumbnailRoutine = createRoutine(
  'UPLOAD_ITEM_THUMBNAIL',
);
export const importZipRoutine = createRoutine('IMPORT_ZIP');
export const importH5PRoutine = createRoutine('IMPORT_H5P');
export const createEtherpadRoutine = createRoutine('CREATE_ETHERPAD');
