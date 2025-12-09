

export enum AppointmentTime {
  T01 = '09.00 - 09.25',
  T02 = '09.30 - 09.55',
  T03 = '10.00 - 10.25',
  T04 = '10.30 - 10.55',
  T05 = '11.00 - 11.25',
  T06 = '11.30 - 11.55',
  T07 = '13.30 - 13.55',
  T08 = '14.00 - 14.25',
  T09 = '14.30 - 14.55',
  T10 = '15.00 - 15.25',
  T11 = '15.30 - 15.55',
  T12 = '16.00 - 16.25',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export enum AppointmentType {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
}

export enum Location {
  SEOUL = 'SEOUL',
  INCHEON = 'INCHEON',
  BUSAN = 'BUSAN',
  JEJU = 'JEJU',
  DAEGU = 'DAEGU',
  DAEJEON = 'DAEJEON',
  GWANGJU = 'GWANGJU',
  ULSAN = 'ULSAN',
  SUWON = 'SUWON',
  SEJONG = 'SEJONG'
}