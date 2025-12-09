import { Location } from "@/libs/enums/appointment.enum";
import { AuthProvider, DoctorSpecialization, MemberStatus, MemberType } from "@/libs/enums/member.enum";


export interface MemberUpdate {
  _id?: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberPhone?: string;
  memberNick?: string;
  memberPassword?: string;
  memberFullName?: string;
  memberImage?: string;
  memberAddress?: string;
  memberDesc?: string;
  authProvider?: AuthProvider;
  location?: Location;
  clinicId?: string;
  specialization?: DoctorSpecialization;
}