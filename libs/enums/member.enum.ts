

export enum MemberType {
  USER = "USER",
  DOCTOR = "DOCTOR",
  CLINIC = "CLINIC",
  ADMIN = "ADMIN"
}

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  BLOCK = "BLOCK",
  DELETE = "DELETE"
}

export enum DoctorSpecialization {
  CARDIOLOGIST = "CARDIOLOGIST",               // HEART
  DENTIST = "DENTIST",                         // TEETH
  PEDIATRICIAN = "PEDIATRICIAN",               // CHILDREN
  DERMATOLOGIST = "DERMATOLOGIST",             // SKIN
  PSYCHIATRIST = "PSYCHIATRIST",               // MIND
  NEUROLOGIST = "NEUROLOGIST",                 // BRAIN
  OPHTHALMOLOGIST = "OPHTHALMOLOGIST",         // EYES
  ORTHOPEDIC = "ORTHOPEDIC",                   // BONE
  ONCOLOGIST = "ONCOLOGIST",                   // CANCER
  GYNAECOLOGIST = "GYNAECOLOGIST",             // WOMEN
  GASTROENTEROLOGIST = "GASTROENTEROLOGIST",   // STOMACH
  OTOLARYNGOLOGIST = "OTOLARYNGOLOGIST",       // EARS
  SURGEON = "SURGEON"                          // SURGERY
}

export enum AuthProvider {
  PHONE = "PHONE",
  EMAIL = "EMAIL",
  TELEGRAM = "TELEGRAM",
  GOOGLE = "GOOGLE",
  NAVER = "NAVER",
  KAKAO = "KAKAO"
}