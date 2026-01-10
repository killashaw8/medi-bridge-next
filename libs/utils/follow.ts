import { MemberType } from "@/libs/enums/member.enum";

export const canFollowMemberType = (
  followerType?: string,
  targetType?: string
): boolean => {
  if (!followerType || !targetType) return false;
  if (followerType === MemberType.ADMIN) return true;
  if (followerType === MemberType.USER) {
    return [MemberType.DOCTOR, MemberType.CLINIC].includes(
      targetType as MemberType
    );
  }
  if (followerType === MemberType.DOCTOR) {
    return [MemberType.USER, MemberType.DOCTOR, MemberType.CLINIC].includes(
      targetType as MemberType
    );
  }
  if (followerType === MemberType.CLINIC) {
    return [MemberType.DOCTOR, MemberType.CLINIC].includes(
      targetType as MemberType
    );
  }
  return false;
};
