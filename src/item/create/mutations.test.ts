import * as sdk from '@graasp/sdk';
import { SUCCESS_MESSAGES } from '@graasp/translations';

import { act } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';

import {
  ITEM_GEOLOCATION,
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import {
  mockMutation,
  setUpTest,
  waitForMutation,
} from '../../../test/utils.js';
import {
  getKeyForParentId,
  itemKeys,
  itemsWithGeolocationKeys,
} from '../../keys.js';
import {
  buildPostItemRoute,
  buildPostItemWithThumbnailRoute,
  buildUploadFilesRoute,
} from '../routes.js';
import { uploadFilesRoutine } from '../routines.js';

const { FolderItemFactory, HttpMethod, ItemType, buildPathFromIds } = sdk;

const mockedNotifier = vi.fn();
const { wrapper, queryClient, mutations } = setUpTest({
  notifier: mockedNotifier,
});

describe('usePostItem', () => {
  const mutation = mutations.usePostItem;
  const newItem = {
    name: 'new item',
    type: ItemType.FOLDER,
  };

  it('Post item in root', async () => {
    const route = `/${buildPostItemRoute()}`;
    queryClient.setQueryData(itemKeys.allAccessible(), [FolderItemFactory()]);

    const response = { ...newItem, id: 'someid', path: 'someid' };

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate(newItem);
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });

  it('Post item in item', async () => {
    const parentItem = FolderItemFactory();
    const response = {
      ...newItem,
      id: 'someid',
      path: buildPathFromIds(parentItem.id, 'someid'),
    };

    // set default data
    queryClient.setQueryData(getKeyForParentId(parentItem.id), [
      FolderItemFactory(),
    ]);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildPostItemRoute(parentItem.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({ ...newItem, parentId: parentItem.id });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(getKeyForParentId(parentItem.id))
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Post item with geolocation', async () => {
    const parentItem = FolderItemFactory();
    const singleKey = itemsWithGeolocationKeys.inBounds({
      lat1: 1,
      lat2: 2,
      lng1: 1,
      lng2: 2,
    });
    const response = {
      ...newItem,
      id: 'someid',
      path: buildPathFromIds(parentItem.id, 'someid'),
    };

    // set default data
    queryClient.setQueryData(getKeyForParentId(parentItem.id), [
      FolderItemFactory(),
    ]);
    queryClient.setQueryData(singleKey, [ITEM_GEOLOCATION]);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildPostItemRoute(parentItem.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        ...newItem,
        parentId: parentItem.id,
        geolocation: { lat: 1, lng: 1 },
      });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(getKeyForParentId(parentItem.id))
        ?.isInvalidated,
    ).toBeTruthy();
    expect(queryClient.getQueryState(singleKey)?.isInvalidated).toBeTruthy();
  });

  it('Post item with thumbnail', async () => {
    const parentItem = FolderItemFactory();
    const newItemWithThumbnail = {
      ...newItem,
      thumbnail: new Blob(),
    };

    const response = {
      ...newItem,
      id: 'someid',
      path: buildPathFromIds(parentItem.id, 'someid'),
      settings: { hasThumbnail: true },
    };

    // set default data
    queryClient.setQueryData(getKeyForParentId(parentItem.id), [
      FolderItemFactory(),
    ]);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildPostItemWithThumbnailRoute(parentItem.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        ...newItemWithThumbnail,
        parentId: parentItem.id,
      });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(getKeyForParentId(parentItem.id))
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Post item with previous item id', async () => {
    const parentItem = FolderItemFactory();
    const previousItem = FolderItemFactory({ parentItem });
    const response = {
      ...newItem,
      id: 'someid',
      path: buildPathFromIds(parentItem.id, 'someid'),
    };

    // set default data
    queryClient.setQueryData(getKeyForParentId(parentItem.id), [
      FolderItemFactory(),
    ]);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildPostItemRoute(parentItem.id, previousItem.id)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        ...newItem,
        parentId: parentItem.id,
        previousItemId: previousItem.id,
      });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(getKeyForParentId(parentItem.id))
        ?.isInvalidated,
    ).toBeTruthy();
  });

  it('Unauthorized', async () => {
    const route = `/${buildPostItemRoute()}`;
    queryClient.setQueryData(itemKeys.allAccessible(), [FolderItemFactory()]);

    const endpoints = [
      {
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
        method: HttpMethod.Post,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate(newItem);
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });
});

describe('useUploadFilesFeedback', () => {
  const mutation = mutations.useUploadFilesFeedback;
  const items = generateFolders();
  const { id } = items[0];

  it('Upload one item', async () => {
    // set data in cache
    items.forEach((item) => {
      const itemKey = itemKeys.single(item.id).content;
      queryClient.setQueryData(itemKey, item);
    });
    queryClient.setQueryData(itemKeys.allAccessible(), items);
    queryClient.setQueryData(itemKeys.single(id).children(), items);

    const mockedMutation = await mockMutation({
      endpoints: [],
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({ data: [id], id });
      await waitForMutation();
    });

    // check memberships invalidation
    const data = queryClient.getQueryState(itemKeys.single(id).children());
    expect(data?.isInvalidated).toBeTruthy();

    // check notification trigger
    expect(mockedNotifier).toHaveBeenCalledWith({
      type: uploadFilesRoutine.SUCCESS,
      payload: { message: SUCCESS_MESSAGES.UPLOAD_FILES },
    });
  });

  it('Error while uploading an item', async () => {
    // set data in cache
    items.forEach((item) => {
      const itemKey = itemKeys.single(item.id).content;
      queryClient.setQueryData(itemKey, item);
    });
    queryClient.setQueryData(itemKeys.allAccessible(), items);
    queryClient.setQueryData(itemKeys.single(id).children(), items);

    const mockedMutation = await mockMutation({
      endpoints: [],
      mutation,
      wrapper,
    });

    const error = new Error('an error');

    await act(async () => {
      mockedMutation.mutate({ id, error });
      await waitForMutation();
    });

    // check memberships invalidation
    const data = queryClient.getQueryState(itemKeys.single(id).children());
    expect(data?.isInvalidated).toBeTruthy();

    // check notification trigger
    expect(mockedNotifier).toHaveBeenCalledWith({
      type: uploadFilesRoutine.FAILURE,
      payload: { error },
    });
  });
});

describe('useUploadFiles', () => {
  const mutation = mutations.useUploadFiles;
  const response = {
    data: [
      {
        name: 'new item',
        type: ItemType.FOLDER,
        id: 'someid',
      },
    ],
    errors: [],
  };

  it('Upload a file', async () => {
    // set default data
    queryClient.setQueryData(itemKeys.allAccessible(), []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute()}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        files: [new File([], 'name')],
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.SUCCESS }),
    );

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });

  it('Upload a file in parent', async () => {
    const parentId = v4();
    const childrenKey = itemKeys.single(parentId).allChildren;

    // set default data
    queryClient.setQueryData(childrenKey, []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute(parentId)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        id: parentId,
        files: [new File([], 'name')],
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.SUCCESS }),
    );

    expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeTruthy();
  });

  it('Upload a file in parent with previous item id', async () => {
    const parentId = v4();
    const previousItemId = v4();
    const childrenKey = itemKeys.single(parentId).allChildren;

    // set default data
    queryClient.setQueryData(childrenKey, []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute(parentId, previousItemId)}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        id: parentId,
        previousItemId,
        files: [new File([], 'name')],
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.SUCCESS }),
    );

    expect(queryClient.getQueryState(childrenKey)?.isInvalidated).toBeTruthy();
  });

  it('Upload 3 files', async () => {
    // set default data
    queryClient.setQueryData(itemKeys.allAccessible(), []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute()}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        files: [
          new File([], 'name'),
          new File([], 'name'),
          new File([], 'name'),
        ],
      });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });
  it('Warning for big files', async () => {
    // set default data
    queryClient.setQueryData(itemKeys.allAccessible(), []);

    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute()}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({
        files: [],
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.FAILURE }),
    );

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });

  it('Throw for no file', async () => {
    const endpoints = [
      {
        response,
        method: HttpMethod.Post,
        route: `/${buildUploadFilesRoute()}`,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    // fake big file
    const file = new File([], 'name');
    Object.defineProperty(file, 'size', { value: sdk.MAX_FILE_SIZE + 10 });

    await act(async () => {
      mockedMutation.mutate({
        files: [file, new File([], 'name'), new File([], 'name')],
      });
      await waitForMutation();
    });

    // notification of a big file
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.FAILURE }),
    );
    // still pass and upload the rest of the files
    expect(mockedNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ type: uploadFilesRoutine.SUCCESS }),
    );

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });

  it('Unauthorized', async () => {
    const route = `/${buildPostItemRoute()}`;
    queryClient.setQueryData(itemKeys.allAccessible(), [FolderItemFactory()]);

    const endpoints = [
      {
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
        method: HttpMethod.Post,
        route,
      },
    ];

    const mockedMutation = await mockMutation({
      endpoints,
      mutation,
      wrapper,
    });

    await act(async () => {
      mockedMutation.mutate({ files: [new File([], 'name')] });
      await waitForMutation();
    });

    expect(
      queryClient.getQueryState(itemKeys.allAccessible())?.isInvalidated,
    ).toBeTruthy();
  });
});
