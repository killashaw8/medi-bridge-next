import { AppointmentStatus, AppointmentTime, AppointmentType, Location } from "@/libs/enums/appointment.enum";
import { Direction } from "@/libs/enums/common.enum";


export interface AppointmentInput {
  date: string;
  time: AppointmentTime;
  channel: AppointmentType;
  note: string;
  location: Location;
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
  newLocation: Location;
  reason?: string;
}

export interface AppointmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction | string;
  location?: Location;
  clinicId?: string;
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export interface DoctorSlotsInput {
  doctorId: string;
  date: string;
}