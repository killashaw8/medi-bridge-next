import { AppointmentStatus, AppointmentTime, AppointmentType } from "@/libs/enums/appointment.enum";
import { Direction } from "@/libs/enums/common.enum";


export interface AppointmentInput {
  date: string;
  time: AppointmentTime;
  channel: AppointmentType;
  note: string;
  doctorId: string;
  clinicId: string;
  patientId: string;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  reason?: string;
}

export interface RescheduleAppointmentInput {
  appointmentId: string;
  newDate: string;
  newTime: AppointmentTime;
  reason?: string;
}

export interface AppointmentInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  clinicId?: string;
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export interface DoctorSlotsInput {
  doctorId: string;
  date: string;
}