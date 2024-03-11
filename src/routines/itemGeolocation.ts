import createRoutine from './utils.js';

export const getItemGeolocationRoutine = createRoutine('GET_ITEM_GEOLOCATION');
export const getAddressFromCoordinatesRoutine = createRoutine(
  'GET_ADDRESS_FROM_COORDINATES',
);
export const deleteItemGeolocationRoutine = createRoutine(
  'DELETE_ITEM_GEOLOCATION',
);
export const putItemGeolocationRoutine = createRoutine('PUT_ITEM_GEOLOCATION');
export const getItemsInMapRoutine = createRoutine('GET_ITEMS_IN_MAP');

export const getSuggestionsForAddressRoutine = createRoutine(
  'GET_SUGGESTIONS_FOR_ADDRESS',
);
