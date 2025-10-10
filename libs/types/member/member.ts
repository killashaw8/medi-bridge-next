import { AuthProvider, DoctorSpecialization, MemberStatus, MemberType } from "@/libs/enums/member.enum";
import { MeLiked } from "../like/like";
import { MeFollowed } from "../follow/follow";



export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  authProvider: AuthProvider;
  memberEmail?: string;
  memberPhone?: string;
  memberNick: string;
  memberPassword?: string;
  memberFullName?: string;
  memberImage: string;
  memberAddress?: string;
  memberDesc?: string;
  memberAppointments: number;
  memberArticles: number;
  memberFollowers: number;
  memberFollowings: number;
  memberPoints: number;
  memberLikes: number;
  memberViews: number;
  memberComments: number;
  memberRank: number;
  memberWarnings: number;
  memberBlocks: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;
  refreshToken?: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];

  /** Provider IDs **/
  telegramId?: string;
  googleId?: string;
  kakaoId?: string;
  naverId?: string;


  /** Only for Clinics **/
  doctors?: Member[]

  /** Only for Doctors **/
  clinicId?: string;
  specialization?: DoctorSpecialization;
}

export interface TotalCounter {
  total: number;
}

export interface Members {
  list: Member[];
  metaCounter: TotalCounter[];
}