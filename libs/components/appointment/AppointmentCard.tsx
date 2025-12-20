"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { Appointment } from "@/libs/types/appointment/appointment";
import { AppointmentStatus, AppointmentTime, Location } from "@/libs/enums/appointment.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { CANCEL_APPOINTMENT, RESCHEDULE_APPOINTMENT } from "@/apollo/user/mutation";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { Box, Button } from "@mui/material";
import Link from "next/link";

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdated?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdated,
}) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [cancelAppointment] = useMutation(CANCEL_APPOINTMENT);
  const [rescheduleAppointment] = useMutation(RESCHEDULE_APPOINTMENT);

  const doctorName =
    appointment.doctor?.memberFullName ||
    appointment.doctor?.memberNick ||
    "Doctor";
  const specialization = appointment.doctor?.specialization || "General";
  const clinicName =
    appointment.clinic?.memberFullName ||
    appointment.clinic?.memberNick ||
    appointment.clinicId ||
    "Clinic";
  const clinicId = appointment.clinic?._id || appointment.clinicId || "";  
  const clinicLocation =
    appointment.clinic?.location || appointment.location || "";
  const clinicLocationLabel = clinicLocation
    ? clinicLocation.replace(/_/g, " ")
    : "Location";
  const dateLabel = appointment.date
    ? new Date(appointment.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";
  const timeValue = String(appointment.time || "");
  const timeLabel = Object.values(AppointmentTime).includes(
    timeValue as AppointmentTime
  )
    ? timeValue
    : Object.keys(AppointmentTime).includes(timeValue)
      ? AppointmentTime[timeValue as keyof typeof AppointmentTime]
      : timeValue || "Time TBD";
  const imageSrc = appointment.doctor?.memberImage
    ? getImageUrl(appointment.doctor.memberImage)
    : "/images/users/defaultUser.svg";
  const doctorId = appointment.doctor?._id || appointment.doctorId || "";
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;

  const normalizeTime = (value: string): AppointmentTime | null => {
    if (!value) {
      return null;
    }
    if (Object.values(AppointmentTime).includes(value as AppointmentTime)) {
      return value as AppointmentTime;
    }
    if (Object.keys(AppointmentTime).includes(value)) {
      return AppointmentTime[value as keyof typeof AppointmentTime];
    }
    return null;
  };

  const normalizeLocation = (value: string): Location | null => {
    if (!value) {
      return null;
    }
    const normalized = value.trim().toUpperCase();
    if (Object.values(Location).includes(normalized as Location)) {
      return normalized as Location;
    }
    if (Object.keys(Location).includes(normalized)) {
      return Location[normalized as keyof typeof Location];
    }
    return null;
  };

  const handleCancel = async () => {
    if (isCancelled || isCanceling) {
      return;
    }
    const shouldCancel = window.confirm(
      "Cancel this appointment? This cannot be undone."
    );
    if (!shouldCancel) {
      return;
    }

    setIsCanceling(true);
    try {
      await cancelAppointment({
        variables: { input: { appointmentId: appointment._id } },
      });
      await sweetMixinSuccessAlert("Appointment cancelled.");
      if (onUpdated) {
        onUpdated();
      }
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to cancel appointment.";
      await sweetMixinErrorAlert(message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReschedule = async () => {
    if (isCancelled || isRescheduling) {
      return;
    }

    const newDate = window.prompt(
      "Enter new date (YYYY-MM-DD)",
      appointment.date
    );
    if (!newDate) {
      return;
    }

    const timeInput = window.prompt(
      "Enter new time (e.g., 09.00 - 09.25 or T01)",
      timeLabel
    );
    if (!timeInput) {
      return;
    }
    const newTime = normalizeTime(timeInput);
    if (!newTime) {
      await sweetMixinErrorAlert("Invalid time slot.");
      return;
    }

    const locationDefault =
      appointment.clinic?.location || appointment.location || "";
    const locationInput = window.prompt(
      "Enter location (e.g., SEOUL)",
      locationDefault ? String(locationDefault) : ""
    );
    if (locationInput === null) {
      return;
    }
    const newLocation = normalizeLocation(locationInput || locationDefault);
    if (!newLocation) {
      await sweetMixinErrorAlert("Invalid location.");
      return;
    }

    setIsRescheduling(true);
    try {
      await rescheduleAppointment({
        variables: {
          input: {
            appointmentId: appointment._id,
            newDate,
            newTime,
            newLocation,
          },
        },
      });
      await sweetMixinSuccessAlert("Appointment rescheduled.");
      if (onUpdated) {
        onUpdated();
      }
    } catch (error: any) {
      const message =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Failed to reschedule appointment.";
      await sweetMixinErrorAlert(message);
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="doctor-card wrap2">
      <div className="image">
        <Link href={`/doctors/details?${doctorId}`}>
          <Image
            src={imageSrc}
            alt={doctorName}
            width={220}
            height={220}
            style={{ borderRadius: "10%", objectFit: "cover" }}
          />
        </Link>
      </div>
      <div className="content">
        {doctorId ? (
          <Link href={`/doctors/details?${doctorId}`}>
            <h3>{doctorName}</h3>
          </Link>
        ) : (
          <h3>{doctorName}</h3>
        )}
        <span className="sub">
          <Link href={`/clinics/details?${clinicId || ""}`}>{clinicName}</Link>
        </span>
        <span className="tag">{specialization}</span>
        <span className="experience">{clinicLocationLabel}</span>
        <span className="experience">
          Date &amp; Time: <br/>
          {dateLabel} · {timeLabel}
        </span>
        <Box 
          className="doctor-btn"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around'
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={handleReschedule}
            disabled={isCancelled || isRescheduling}
          >
            Reschedule
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={isCancelled || isCanceling}
          >
            Cancel
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default AppointmentCard;
