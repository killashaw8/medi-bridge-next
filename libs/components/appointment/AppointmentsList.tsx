'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import AppointmentCard from "./AppointmentCard";
import { Appointment } from "@/libs/types/appointment/appointment";
import { AppointmentsInquiry } from "@/libs/types/appointment/appointment.input";
import { GET_APPOINTMENTS } from "@/apollo/user/query";
import { userVar } from "@/apollo/store";
import { MemberType } from "@/libs/enums/member.enum";
import { Direction } from "@/libs/enums/common.enum";
import { Pagination, Stack } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

interface AppointmentsListProps {
  appointments?: Appointment[];
  title?: string;
  description?: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments = [],
  title = "Your Appointments",
  description = "Review your booked visits and upcoming sessions.",
}) => {
  const user = useReactiveVar(userVar);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const shouldFetch = appointments.length === 0;

  const appointmentsInput = useMemo<AppointmentsInquiry | null>(() => {
    if (!user?._id) {
      return null;
    }
    const baseInput: AppointmentsInquiry = {
      page: currentPage,
      limit: itemsPerPage,
      sort: "createdAt",
      direction: "DESC",
    };

    if (user.memberType === MemberType.DOCTOR) {
      return { ...baseInput, doctorId: user._id };
    }
    if (user.memberType === MemberType.CLINIC) {
      return { ...baseInput, clinicId: user._id };
    }

    return { ...baseInput, patientId: user._id };
  }, [user?._id, user?.memberType, currentPage]);

  const { data, loading, refetch } = useQuery(GET_APPOINTMENTS, {
    variables: { input: appointmentsInput as AppointmentsInquiry },
    skip: !shouldFetch || !appointmentsInput,
    fetchPolicy: "cache-and-network",
  });

  const appointmentItems: Appointment[] = shouldFetch
    ? (data?.getAppointments?.list ?? [])
    : appointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  const totalItems = shouldFetch
    ? data?.getAppointments?.total ?? 0
    : appointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [appointments.length, shouldFetch]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="appointment-area ptb-140">
      <div className="container">
        <div className="appointment-form-inner">
          <div className="content">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="row justify-content-center g-4">
            {loading ? (
              <div className="col-12">
                <div className="row g-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={`appointment-skeleton-${index}`} className="col-lg-6 col-md-6">
                      <div style={{ border: "1px solid #eef1f6", borderRadius: 12, padding: 16 }}>
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : appointmentItems.length === 0 ? (
              <div className="col-12">
                <p>No booked appointments yet.</p>
              </div>
            ) : (
              appointmentItems.map((appointment) => (
                <div className="col-lg-6 col-md-6" key={appointment._id}>
                  <AppointmentCard appointment={appointment} onUpdated={refetch} />
                </div>
              ))
            )}
            {totalPages > 0 && (
              <div className="col-lg-12 col-md-12">
                <Stack className="mypage-pagination">
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      shape="rounded"
                      variant="outlined"
                      size="large"
                      color="primary"
                      onChange={handlePageChange}
                      sx={{ "& .MuiPaginationItem-root": { marginX: "6px" } }}
                    />
                  </Stack>
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
