export interface AdminVisitorStats {
  total: number;
  memberVisitors: number;
  nonMemberVisitors: number;
}

export interface AdminMemberStats {
  total: number;
  active: number;
  blocked: number;
}

export interface AdminSalesStats {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
}

export interface AdminAppointmentLeader {
  memberId: string;
  name?: string | null;
  count: number;
}

export interface AdminAppointmentStats {
  count: number;
  topClinics: AdminAppointmentLeader[];
  topDoctors: AdminAppointmentLeader[];
}

export type AdminStatsPeriod = "DAILY" | "MONTHLY" | "YEARLY";

export interface AdminDashboardStats {
  period: AdminStatsPeriod;
  visitors: AdminVisitorStats;
  members: AdminMemberStats;
  sales: AdminSalesStats;
  appointments: AdminAppointmentStats;
}
