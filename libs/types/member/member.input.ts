import { AuthProvider, MemberStatus, MemberType, DoctorSpecialization } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';

export interface MemberInput {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberFullName: string;
  memberType?: MemberType;
  authProvider?: AuthProvider;
  clinicId?: string;
  specialization?: DoctorSpecialization;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface PhoneOtpInput {
  phone: string;
  otp: string;
}

export interface TelegramLoginInput {
  id: string;
  hash: string;
  auth_date: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface GoogleLoginInput {
  idToken: string; // Google ID token (JWT)
}

export interface KakaoLoginInput {
  accessToken: string; // Kakao access token
}

export interface NaverLoginInput {
  accessToken: string; // Naver access token
}

interface DISearch {
  text?: string;
}

export interface DoctorsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction | string;
  search: DISearch;
}

interface CISearch {
  text?: string;
}

export interface ClinicsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction | string;
  search: CISearch;
}

interface MISearch {
  memberStatus?: MemberStatus;
  memberType?: MemberType;
  text?: string;
}

export interface MembersInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction | string;
  search: MISearch;
}