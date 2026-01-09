import { NoticeCategory, NoticeStatus } from '@/libs/enums/notice.enum';

export type Notice = {
  _id: string;
  noticeCategory: NoticeCategory;
  noticeStatus: NoticeStatus;
  noticeTitle: string;
  noticeContent: string;
  memberId: string;
  createdAt: string;
  updatedAt: string;
};

export type NoticeListResponse = {
  list: Notice[];
  metaCounter?: { total: number }[];
};
