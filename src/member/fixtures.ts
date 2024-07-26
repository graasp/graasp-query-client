import { MemberStorageItem, Paginated } from '@graasp/sdk';

export const MEMBER_STORAGE_ITEM_RESPONSE: Paginated<MemberStorageItem> = {
  data: [
    {
      id: 'b0bd68a8-6071-418c-9599-18ecb76b7b22',
      name: 'Document1.pdf',
      size: 102400,
      updatedAt: '2024-07-01T12:00:00Z',
      path: '3ac6dfb2_92f0_4013_b933_1a32d5687870.b0bd68a8_6071_418c_9599_18ecb76b7b22',
      parent: {
        id: '3ac6dfb2-92f0-4013-b933-1a32d5687870',
        name: 'Documents',
      },
    },
    {
      id: '4de1b419-38cd-46e5-81f2-916150819175',
      name: 'Image1.png',
      size: 204800,
      updatedAt: '2024-07-02T14:30:00Z',
      path: '28c849e2_604b_430c_aa0a_7d2630291b07.4de1b419_38cd_46e5_81f2_916150819175',
      parent: {
        id: '28c849e2-604b-430c-aa0a-7d2630291b07',
        name: 'Images',
      },
    },
    {
      id: 'b485360b-f94c-4cb1-8e49-db0b6db4e15b',
      name: 'Presentation.pdf',
      size: 512000,
      updatedAt: '2024-07-03T09:15:00Z',
      path: 'b485360b_f94c_4cb1_8e49_db0b6db4e15b',
      // the item has no parent
    },
  ],
  totalCount: 2,
  pagination: {
    page: 1,
    pageSize: 2,
  },
};
