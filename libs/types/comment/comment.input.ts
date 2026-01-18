import { CommentGroup, CommentStatus } from "@/libs/enums/comment.enum";
import { Direction } from "@/libs/enums/common.enum";


export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	rating?: number;
}

interface ComISearch {
	commentRefId: string;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ComISearch;
}

interface AdminCommentSearch {
	commentRefId?: string;
	memberId?: string;
	commentGroup?: CommentGroup;
	commentStatus?: CommentStatus;
	text?: string;
}

export interface AdminCommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction | string;
	search?: AdminCommentSearch;
}
