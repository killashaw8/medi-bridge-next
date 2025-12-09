import { AppointmentStatus, AppointmentTime, AppointmentType, Location } from "@/libs/enums/appointment.enum";
import { Member } from "../member/member";


export interface Appointment {
  _id: string;
  date: string;
  time: AppointmentTime;
  status: AppointmentStatus;
  channel: AppointmentType;
  note: string;
  location: Location;
  doctorId: string;
  clinicId: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
  doctor?: Member;
  clinic?: Member;
  patient?: Member;
}

export interface Appointments {
  list: Appointment[];
  total: number;
}

export interface Slot {
  time: AppointmentTime;
  free: boolean;
}

export interface SlotsResult {
  list: Slot[];
}