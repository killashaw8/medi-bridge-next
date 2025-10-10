import { LikeGroup } from "@/libs/enums/like.enum";


export interface LikeInput {
	memberId: string;
	likeRefId: string;
	likeGroup: LikeGroup;
}
