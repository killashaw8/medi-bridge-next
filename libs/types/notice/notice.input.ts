import { NoticeCategory } from '@/libs/enums/notice.enum';

export interface NoticeBroadcastInput {
  title: string;
  content: string;
  category?: NoticeCategory;
}
