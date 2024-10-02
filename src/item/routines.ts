import createRoutine from '../routines/utils.js';

export const createItemRoutine = createRoutine('CREATE_ITEM');
export const deleteItemRoutine = createRoutine('DELETE_ITEM');
export const getAccessibleItemsRoutine = createRoutine('GET_ACCESSIBLE');
export const moveItemRoutine = createRoutine('MOVE_ITEM');
export const moveItemsRoutine = createRoutine('MOVE_ITEMS');
export const copyItemRoutine = createRoutine('COPY_ITEM');
export const copyItemsRoutine = createRoutine('COPY_ITEMS');
export const editItemRoutine = createRoutine('EDIT_ITEM');
export const reorderItemRoutine = createRoutine('REORDER_ITEM');
export const deleteItemsRoutine = createRoutine('DELETE_ITEMS');
export const uploadFilesRoutine = createRoutine('UPLOAD_FILES');
export const recycleItemsRoutine = createRoutine('RECYCLE_ITEMS');
export const restoreItemsRoutine = createRoutine('RESTORE_ITEMS');
export const uploadItemThumbnailRoutine = createRoutine(
  'UPLOAD_ITEM_THUMBNAIL',
);
export const importZipRoutine = createRoutine('IMPORT_ZIP');
export const importH5PRoutine = createRoutine('IMPORT_H5P');
export const createEtherpadRoutine = createRoutine('CREATE_ETHERPAD');
export const createShortLinkRoutine = createRoutine('CREATE_SHORT_LINK');
export const patchShortLinkRoutine = createRoutine('PATCH_SHORT_LINK');
export const deleteShortLinkRoutine = createRoutine('DELETE_SHORT_LINK');
export const deleteItemThumbnailRoutine = createRoutine(
  'DELETE_ITEM_THUMBNAIL',
);
