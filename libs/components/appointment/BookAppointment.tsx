import React, { useState, FormEvent, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import {
  BOOK_APPOINTMENT,
  HOLD_APPOINTMENT_SLOT,
  RELEASE_APPOINTMENT_SLOT,
  RESCHEDULE_APPOINTMENT,
} from "@/apollo/user/mutation";
import { GET_APPOINTMENT, GET_APPOINTMENTS, GET_DOCTORS, GET_AVAILABLE_SLOTS, GET_MEMBER } from "@/apollo/user/query";
import { AppointmentStatus, AppointmentTime, AppointmentType, Location } from "@/libs/enums/appointment.enum";
import { DoctorSpecialization } from "@/libs/enums/member.enum";
import { Member } from "@/libs/types/member/member";
import { DoctorSlotsInput } from "@/libs/types/appointment/appointment.input";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { DoctorsInquiry } from "@/libs/types/member/member.input";
import { 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Typography, 
  Box, 
  Chip,
  CircularProgress
} from "@mui/material";
import { getImageUrl } from "@/libs/imageHelper";
import { useApolloClient } from "@apollo/client";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { AppointmentsInquiry, HoldSlotInput } from "@/libs/types/appointment/appointment.input";
import { Appointment } from "@/libs/types/appointment/appointment";

type AppointmentTimeKey = keyof typeof AppointmentTime;

interface Slot {
  time: AppointmentTime | string;
  free: boolean;
}

const BookAppointment = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [loading, setLoading] = useState(false);
  
  // Sidebar filters
  const [selectedLocation, setSelectedLocation] = useState<Location | "">("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<DoctorSpecialization | "">("");
  
  // Selected doctor
  const [selectedDoctor, setSelectedDoctor] = useState<Member | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    channel: AppointmentType.ONLINE as AppointmentType,
    date: "",
    time: "" as AppointmentTimeKey | "",
    note: "",
    agree: false,
  });

  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [clinicData, setClinicData] = useState<Record<string, { name: string; location?: Location }>>({});
  const apolloClient = useApolloClient();
  const fetchedClinicIdsRef = useRef<Set<string>>(new Set());
  const prefillRef = useRef(false);
  const prefillSlotRef = useRef(false);
  const prefillLocationRef = useRef(false);
  const prefillAppointmentRef = useRef(false);
  const initialAppointmentRef = useRef<{
    doctorId: string;
    date: string;
    time: AppointmentTimeKey | "";
    channel: AppointmentType;
    note: string;
    location: Location | "";
  } | null>(null);

  // Fetch all doctors (backend doesn't filter by specialization, we'll filter client-side)
  const doctorsInput: DoctorsInquiry = {
    page: 1,
    limit: 100,
    sort: 'createdAt',
    direction: 'DESC' as const,
    search: {
      
    },
  };

  const { data: doctorsData, loading: doctorsLoading, refetch: refetchDoctors } = useQuery(GET_DOCTORS, {
    variables: { input: doctorsInput },
    fetchPolicy: "cache-and-network",
  });

  const allDoctors: Member[] = doctorsData?.getDoctors?.list || [];

  const appointmentsInput = useMemo<AppointmentsInquiry | null>(() => {
    if (!user?._id) {
      return null;
    }

    return {
      page: 1,
      limit: 6,
      sort: "createdAt",
      direction: "DESC",
      patientId: user._id,
    };
  }, [user?._id]);

  const { data: appointmentsData, loading: appointmentsLoading } = useQuery(
    GET_APPOINTMENTS,
    {
      variables: { input: appointmentsInput as AppointmentsInquiry },
      skip: !appointmentsInput,
      fetchPolicy: "cache-and-network",
    }
  );

  const doctorIdParam = useMemo(() => {
    const rawId = router.query.doctorId;
    if (Array.isArray(rawId)) {
      return rawId[0] || "";
    }
    if (typeof rawId === "string") {
      return rawId;
    }
    return "";
  }, [router.query.doctorId]);

  const appointmentIdParam = useMemo(() => {
    const rawId = router.query.appointmentId;
    if (Array.isArray(rawId)) {
      return rawId[0] || "";
    }
    if (typeof rawId === "string") {
      return rawId;
    }
    return "";
  }, [router.query.appointmentId]);

  const normalizeDateInput = (value: string) => {
    if (!value) {
      return "";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    if (value.includes("T")) {
      return value.split("T")[0];
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return value.slice(0, 10);
  };

  const normalizeTimeInput = (value: AppointmentTime | string | null | undefined) => {
    if (!value) {
      return "";
    }
    const stringValue = String(value);
    if (Object.keys(AppointmentTime).includes(stringValue)) {
      return stringValue as AppointmentTimeKey;
    }
    const entry = Object.entries(AppointmentTime).find(([, val]) => val === stringValue);
    return entry ? (entry[0] as AppointmentTimeKey) : "";
  };

  const getTimeLabel = (value: AppointmentTimeKey | AppointmentTime | string | null | undefined) => {
    if (!value) {
      return "";
    }
    const stringValue = String(value);
    if (Object.keys(AppointmentTime).includes(stringValue)) {
      return AppointmentTime[stringValue as AppointmentTimeKey];
    }
    if (Object.values(AppointmentTime).includes(stringValue as AppointmentTime)) {
      return stringValue;
    }
    return stringValue;
  };

  const dateParam = useMemo(() => {
    const rawDate = router.query.date;
    if (Array.isArray(rawDate)) {
      return rawDate[0] || "";
    }
    if (typeof rawDate === "string") {
      return rawDate;
    }
    return "";
  }, [router.query.date]);

  const timeParam = useMemo(() => {
    const rawTime = router.query.time;
    if (Array.isArray(rawTime)) {
      return rawTime[0] || "";
    }
    if (typeof rawTime === "string") {
      return rawTime;
    }
    return "";
  }, [router.query.time]);

  const { data: appointmentData } = useQuery(GET_APPOINTMENT, {
    variables: { appointmentId: appointmentIdParam },
    skip: !appointmentIdParam,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!router.isReady || allDoctors.length === 0 || !doctorIdParam) {
      return;
    }

    const preselectedDoctor = allDoctors.find(
      (doctor) => doctor._id === doctorIdParam
    );
    if (!preselectedDoctor) {
      return;
    }

    prefillRef.current = true;
    if (preselectedDoctor.specialization) {
      setSelectedSpecialization(preselectedDoctor.specialization as DoctorSpecialization);
    }
    setSelectedDoctor(preselectedDoctor);

    prefillLocationRef.current = true;
    if (timeParam) {
      prefillSlotRef.current = true;
    }

    setFormData((prev) => ({
      ...prev,
      date: dateParam || prev.date,
      time: (normalizeTimeInput(timeParam) || prev.time) as AppointmentTimeKey | "",
    }));
  }, [router.isReady, allDoctors, doctorIdParam, dateParam, timeParam]);

  useEffect(() => {
    if (!appointmentIdParam || !appointmentData?.getAppointment || !allDoctors.length) {
      return;
    }
    if (prefillAppointmentRef.current) {
      return;
    }

    const appointment = appointmentData.getAppointment;
    const appointmentDoctorId = appointment.doctor?._id || appointment.doctorId;
    const preselectedDoctor = allDoctors.find(
      (doctor) => doctor._id === appointmentDoctorId
    );
    if (preselectedDoctor) {
      prefillRef.current = true;
      setSelectedDoctor(preselectedDoctor);
      if (preselectedDoctor.specialization) {
        setSelectedSpecialization(preselectedDoctor.specialization as DoctorSpecialization);
      }
    }

    const appointmentLocation =
      appointment.location || appointment.clinic?.location || "";
    const normalizedDate = normalizeDateInput(appointment.date || "");
    const normalizedTime = normalizeTimeInput(appointment.time);
    const resolvedLocation = appointmentLocation as Location;
    if (resolvedLocation) {
      prefillLocationRef.current = true;
      setSelectedLocation(resolvedLocation);
    }

    prefillSlotRef.current = true;
    prefillAppointmentRef.current = true;
    setFormData((prev) => ({
      ...prev,
      date: normalizedDate || prev.date,
      time: normalizedTime || prev.time,
      channel: appointment.channel || prev.channel,
      note: appointment.note || prev.note,
    }));
    initialAppointmentRef.current = {
      doctorId: appointmentDoctorId || "",
      date: normalizedDate || "",
      time: normalizedTime || "",
      channel: appointment.channel || AppointmentType.ONLINE,
      note: appointment.note || "",
      location: resolvedLocation || "",
    };
  }, [appointmentIdParam, appointmentData, allDoctors]);

  const isRescheduleMode = Boolean(appointmentIdParam);
  const hasRescheduleChanges = useMemo(() => {
    if (!isRescheduleMode || !initialAppointmentRef.current) {
      return true;
    }
    const currentDoctorId = selectedDoctor?._id || "";
    const currentLocation =
      selectedLocation ||
      (selectedDoctor?.clinicId
        ? clinicData[selectedDoctor.clinicId]?.location || ""
        : "");
    return !(
      currentDoctorId === initialAppointmentRef.current.doctorId &&
      formData.date === initialAppointmentRef.current.date &&
      formData.time === initialAppointmentRef.current.time &&
      formData.channel === initialAppointmentRef.current.channel &&
      formData.note === initialAppointmentRef.current.note &&
      currentLocation === initialAppointmentRef.current.location
    );
  }, [
    isRescheduleMode,
    selectedDoctor?._id,
    selectedDoctor?.clinicId,
    clinicData,
    selectedLocation,
    formData.date,
    formData.time,
    formData.channel,
    formData.note,
  ]);

  useEffect(() => {
    if (!selectedDoctor?.clinicId) {
      return;
    }
    const clinicLocation = clinicData[selectedDoctor.clinicId]?.location;
    if (!clinicLocation) {
      return;
    }
    if (!prefillLocationRef.current && selectedLocation) {
      return;
    }
    prefillLocationRef.current = false;
    setSelectedLocation(clinicLocation);
  }, [selectedDoctor?.clinicId, clinicData, selectedLocation]);

  const specializationFilteredDoctors = selectedSpecialization
    ? allDoctors.filter((doctor) => doctor.specialization === selectedSpecialization)
    : [];

  // Get unique clinic IDs from filtered doctors
  const uniqueClinicIds = useMemo(() => {
    const ids = new Set<string>();
    specializationFilteredDoctors.forEach(doctor => {
      if (doctor.clinicId) {
        ids.add(doctor.clinicId);
      }
    });
    return Array.from(ids).sort(); // Sort for stable comparison
  }, [specializationFilteredDoctors]);

  // Create a stable string key for comparison
  const uniqueClinicIdsKey = useMemo(() => uniqueClinicIds.join(','), [uniqueClinicIds]);

  // Fetch clinic data for each unique clinic ID
  useEffect(() => {
    if (uniqueClinicIds.length === 0) {
      setClinicData({});
      fetchedClinicIdsRef.current.clear();
      return;
    }

    // Find clinic IDs that haven't been fetched yet
    const missingClinicIds = uniqueClinicIds.filter(id => !fetchedClinicIdsRef.current.has(id));
    if (missingClinicIds.length === 0) {
      return; // All clinic data already loaded
    }

    let isMounted = true;

    const fetchClinicData = async () => {
      const clinics: Record<string, { name: string; location?: Location }> = {};
      
      const promises = missingClinicIds.map(async (clinicId) => {
        // Mark as being fetched to prevent duplicate requests
        fetchedClinicIdsRef.current.add(clinicId);
        
        try {
          const { data } = await apolloClient.query({
            query: GET_MEMBER,
            variables: { targetId: clinicId, includeLocation: true },
            fetchPolicy: 'cache-first',
          });
          if (isMounted && data?.getMember) {
            clinics[clinicId] = {
              name: data.getMember.memberFullName || clinicId,
              location: data.getMember.location,
            };
          } else if (isMounted) {
            clinics[clinicId] = { name: clinicId };
          }
        } catch (error) {
          if (isMounted) {
            console.error(`Failed to fetch clinic ${clinicId}:`, error);
            clinics[clinicId] = { name: clinicId };
            // Remove from ref if fetch failed so we can retry
            fetchedClinicIdsRef.current.delete(clinicId);
          }
        }
      });

      await Promise.all(promises);
      
      if (isMounted) {
        setClinicData(prev => ({ ...prev, ...clinics }));
      }
    };

    fetchClinicData();

    return () => {
      isMounted = false;
    };
  }, [uniqueClinicIdsKey]); // Only depend on the string key, apolloClient is stable

  // Fetch available slots when doctor and date are selected
  const slotsInput: DoctorSlotsInput | null = selectedDoctor?._id && formData.date
    ? { doctorId: selectedDoctor._id, date: formData.date }
    : null;

  const { data: slotsData, loading: slotsQueryLoading, refetch: refetchSlots } = useQuery(GET_AVAILABLE_SLOTS, {
    variables: { input: slotsInput! },
    skip: !slotsInput,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (slotsData?.getAvailableSlots?.list) {
      setAvailableSlots(slotsData.getAvailableSlots.list);
      setSlotsLoading(false);
    }
  }, [slotsData]);

  // Refetch slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor?._id && formData.date) {
      setSlotsLoading(true);
      if (prefillSlotRef.current) {
        prefillSlotRef.current = false;
      } else {
        setFormData(prev => ({ ...prev, time: "" as AppointmentTimeKey | "" }));
      }
      refetchSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, time: "" as AppointmentTimeKey | "" }));
    }
  }, [selectedDoctor?._id, formData.date, refetchSlots]);

  // Refetch doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      refetchDoctors();
      if (prefillRef.current) {
        prefillRef.current = false;
        return;
      }
      setSelectedDoctor(null); // Reset doctor selection
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTimeKey | "" })); // Reset date and time
    }
  }, [selectedSpecialization, refetchDoctors]);

  // Book appointment mutation
  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);
  const [rescheduleAppointment] = useMutation(RESCHEDULE_APPOINTMENT);
  const [holdSlot] = useMutation(HOLD_APPOINTMENT_SLOT);
  const [releaseSlot] = useMutation(RELEASE_APPOINTMENT_SLOT);
  const heldSlotRef = useRef<HoldSlotInput | null>(null);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value as Location | "");
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpecialization(e.target.value as DoctorSpecialization | "");
  };

  const handleDoctorSelect = (doctor: Member) => {
    if (heldSlotRef.current) {
      void releaseSlot({ variables: { input: heldSlotRef.current } });
      heldSlotRef.current = null;
    }
    // If clicking the same doctor, unselect them
    if (selectedDoctor?._id === doctor._id) {
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTimeKey | "" })); // Reset date and time
    } else {
      setSelectedDoctor(doctor);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTimeKey | "" })); // Reset date and time
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    if (nextDate) {
      const [year, month, day] = nextDate.split("-").map((value) => Number(value));
      const nextDateObj = new Date(year, month - 1, day);
      const dayOfWeek = nextDateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        void sweetMixinErrorAlert("Weekends are non-working days. Please select a weekday.");
        return;
      }
    }
    if (heldSlotRef.current) {
      void releaseSlot({ variables: { input: heldSlotRef.current } });
      heldSlotRef.current = null;
    }
    setFormData(prev => ({
      ...prev,
      date: nextDate,
      time: "" as AppointmentTimeKey | "", // Reset time when date changes
    }));
  };

  const handleTimeSlotSelect = async (time: AppointmentTime | string) => {
    if (isWeekendDate) {
      await sweetMixinErrorAlert("Weekends are non-working days. Please select a weekday.");
      return;
    }
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to reserve a slot.");
      router.push("/login");
      return;
    }
    if (!selectedDoctor?._id || !formData.date) {
      await sweetMixinErrorAlert("Please select a doctor and date first.");
      return;
    }

    const timeKey = normalizeTimeInput(time);
    if (!timeKey) {
      await sweetMixinErrorAlert("Invalid time slot. Please choose another.");
      return;
    }

    const nextHold: HoldSlotInput = {
      doctorId: selectedDoctor._id,
      date: formData.date,
      time: timeKey as AppointmentTime,
    };

    if (
      heldSlotRef.current &&
      heldSlotRef.current.doctorId === nextHold.doctorId &&
      heldSlotRef.current.date === nextHold.date &&
      heldSlotRef.current.time === nextHold.time
    ) {
      setFormData(prev => ({ ...prev, time: timeKey }));
      return;
    }

    try {
      if (heldSlotRef.current) {
        await releaseSlot({ variables: { input: heldSlotRef.current } });
        heldSlotRef.current = null;
      }
      await holdSlot({ variables: { input: nextHold } });
      heldSlotRef.current = nextHold;
      setFormData(prev => ({ ...prev, time: timeKey }));
    } catch (error) {
      console.error("Hold slot error:", error);
      await sweetMixinErrorAlert("This slot is temporarily unavailable. Please choose another.");
      await refetchSlots();
    }
  };

  useEffect(() => {
    if (!user?._id || !selectedDoctor?._id || !formData.date || !formData.time) {
      return;
    }
    const nextHold: HoldSlotInput = {
      doctorId: selectedDoctor._id,
      date: formData.date,
      time: formData.time as AppointmentTime,
    };
    if (
      heldSlotRef.current &&
      heldSlotRef.current.doctorId === nextHold.doctorId &&
      heldSlotRef.current.date === nextHold.date &&
      heldSlotRef.current.time === nextHold.time
    ) {
      return;
    }
    (async () => {
      try {
        await holdSlot({ variables: { input: nextHold } });
        heldSlotRef.current = nextHold;
      } catch (error) {
        console.error("Auto-hold slot error:", error);
        setFormData(prev => ({ ...prev, time: "" as AppointmentTimeKey | "" }));
        await sweetMixinErrorAlert("This slot is temporarily unavailable. Please choose another.");
        await refetchSlots();
      }
    })();
  }, [user?._id, selectedDoctor?._id, formData.date, formData.time, holdSlot, refetchSlots]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      agree: e.target.checked,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDoctor) {
      await sweetMixinErrorAlert("Please select a doctor");
      return;
    }

    if (!formData.date) {
      await sweetMixinErrorAlert("Please select a date");
      return;
    }

    if (!formData.time) {
      await sweetMixinErrorAlert("Please select a time slot");
      return;
    }

    const derivedLocation =
      selectedLocation ||
      (selectedDoctor?.clinicId
        ? clinicData[selectedDoctor.clinicId]?.location
        : undefined);
    if (!derivedLocation) {
      await sweetMixinErrorAlert("Please select a location");
      return;
    }

    if (!formData.agree) {
      await sweetMixinErrorAlert("Please agree to the Privacy Policy");
      return;
    }

    // Check if user is logged in
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login to book an appointment");
      router.push("/login");
      return;
    }

    if (appointmentsLoading) {
      await sweetMixinErrorAlert("Checking your existing appointments...");
      return;
    }

    const existingAppointments = (appointmentsData?.getAppointments?.list ??
      []) as Appointment[];
    const hasConflict = existingAppointments.some(
      (appointment) =>
        appointment._id !== appointmentIdParam &&
        appointment.date === formData.date &&
        appointment.time === formData.time &&
        appointment.status !== AppointmentStatus.CANCELLED
    );
    if (hasConflict) {
      await sweetMixinErrorAlert(
        "You already have an appointment for this date and time."
      );
      return;
    }

    setLoading(true);

    try {
      if (appointmentIdParam) {
        const result = await rescheduleAppointment({
          variables: {
            input: {
              appointmentId: appointmentIdParam,
              newDate: formData.date,
              newTime: formData.time as AppointmentTime,
              newLocation: derivedLocation,
              newChannel: formData.channel,
              newReason: formData.note.trim() || undefined,
            },
          },
        });
        if (result.data?.rescheduleAppointment) {
          heldSlotRef.current = null;
          await sweetMixinSuccessAlert("Appointment rescheduled successfully!");
          router.push("/bookAppointment/thank-you");
        }
      } else {
        const result = await bookAppointment({
          variables: {
            input: {
              doctorId: selectedDoctor._id,
              clinicId: selectedDoctor.clinicId || "", // Use doctor's clinic
              location: derivedLocation,
              date: formData.date,
              time: formData.time as AppointmentTime,
              channel: formData.channel,
              note: formData.note.trim(),
              patientId: user._id,
            },
          },
        });

        if (result.data?.bookAppointment) {
          heldSlotRef.current = null;
          await sweetMixinSuccessAlert("Appointment booked successfully!");
          router.push("/bookAppointment/thank-you");
        }
      }
    } catch (error: any) {
      console.error("Appointment booking error:", error);
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || "Failed to book appointment. Please try again.";
      await sweetMixinErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const locationFilteredDoctors = useMemo(() => {
    if (!selectedLocation) {
      return specializationFilteredDoctors;
    }

    return specializationFilteredDoctors.filter((doctor) => {
      if (!doctor.clinicId) return false;
      return clinicData[doctor.clinicId]?.location === selectedLocation;
    });
  }, [selectedLocation, specializationFilteredDoctors, clinicData]);

  useEffect(() => {
    if (!selectedDoctor?._id) return;
    if (selectedDoctor.clinicId && !clinicData[selectedDoctor.clinicId]) {
      return;
    }
    const stillVisible = locationFilteredDoctors.some(
      (doctor) => doctor._id === selectedDoctor._id
    );
    if (!stillVisible) {
      if (heldSlotRef.current) {
        void releaseSlot({ variables: { input: heldSlotRef.current } });
        heldSlotRef.current = null;
      }
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTimeKey | "" }));
    }
  }, [locationFilteredDoctors, selectedDoctor?._id]);

  // Location options
  const locationOptions = Object.values(Location);
  
  // Specialization options
  const specializationOptions = Object.values(DoctorSpecialization);

  const formattedDateLabel = useMemo(() => {
    if (!formData.date) return "";
    const [year, month, day] = formData.date.split("-");
    if (!year || !month || !day) return "";
    return `${year}.${month}.${day}`;
  }, [formData.date]);

  const isWeekendDate = useMemo(() => {
    if (!formData.date) return false;
    const [year, month, day] = formData.date.split("-").map((value) => Number(value));
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }, [formData.date]);

  return (
    <>
      <div className="appointment-area ptb-140">
        <div className="container">
          <div className="row">
            {/* Sidebar Filters */}
            <div className="col-xl-4 col-lg-4">
              <div className="widget-area">
                {/* Location Filter */}
                <div className="widget widget_search">
                  <h3 className="widget-title">Filter by Location</h3>
                  <select
                    className="form-control form-select"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    style={{ border: "1px solid #d0d5dd" }}
                  >
                    <option value="">All Locations</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialization Filter */}
                <div className="widget widget_search">
                  <h3 className="widget-title">Filter by Specialization</h3>
                  <select
                    className="form-control form-select"
                    value={selectedSpecialization}
                    onChange={handleSpecializationChange}
                    style={{ border: "1px solid #d0d5dd" }}
                  >
                    <option value="">Select Specialization</option>
                    {specializationOptions.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-xl-8 col-lg-8">
              {/* Doctors List - MUI Cards */}
              {!selectedSpecialization ? (
                <Box sx={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant="h5" color="text.secondary">
                    Please select a specialization to view available doctors
                  </Typography>
                </Box>
              ) : doctorsLoading ? (
                <Box sx={{ textAlign: 'center', padding: '40px' }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ marginTop: 2 }}>
                    Loading doctors...
                  </Typography>
                </Box>
              ) : locationFilteredDoctors.length === 0 ? (
                <Box sx={{ textAlign: 'center', padding: '40px' }}>
                  <Typography variant="h6" color="error">
                    No doctors available with {selectedSpecialization} specialization
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3} sx={{ marginBottom: 4 }}>
                  {locationFilteredDoctors.map((doctor) => (
                    <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: selectedDoctor?._id === doctor._id ? '2px solid #336AEA' : '1px solid #e0e0e0',
                          boxShadow: selectedDoctor?._id === doctor._id ? '0 4px 8px rgba(51, 106, 234, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                            <Image
                              src={getImageUrl(doctor.memberImage) || '/images/users/defaultUser.svg'}
                              alt={doctor.memberFullName}
                              width={80}
                              height={80}
                              style={{
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '15px',
                              }}
                            />
                            <Box>
                              <Typography variant="h6" component="div">
                                {doctor.memberFullName}
                              </Typography>
                              {doctor.specialization && (
                                <Chip 
                                  label={doctor.specialization} 
                                  size="small" 
                                  sx={{ marginTop: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                          {/* Clinic Name and Location */}
                          {doctor.clinicId && clinicData[doctor.clinicId] && (
                            <Box sx={{ marginTop: 1.5, marginBottom: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                                <BusinessIcon sx={{ fontSize: 16, color: '#5A6A85', marginRight: 0.5 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                  {clinicData[doctor.clinicId].name}
                                </Typography>
                              </Box>
                              {clinicData[doctor.clinicId].location && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationOnIcon sx={{ fontSize: 16, color: '#5A6A85', marginRight: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                    {clinicData[doctor.clinicId].location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                          {doctor.memberDesc && (
                            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
                              {doctor.memberDesc.length > 100 
                                ? `${doctor.memberDesc.substring(0, 100)}...` 
                                : doctor.memberDesc}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button
                            fullWidth
                            variant={selectedDoctor?._id === doctor._id ? "contained" : "outlined"}
                            onClick={() => handleDoctorSelect(doctor)}
                            sx={{
                              backgroundColor: selectedDoctor?._id === doctor._id ? '#E92C28' : 'transparent',
                              color: selectedDoctor?._id === doctor._id ? 'white' : '#336AEA',
                              borderColor: selectedDoctor?._id === doctor._id ? '#E92C28' : '#336AEA',
                              '&:hover': {
                                backgroundColor: selectedDoctor?._id === doctor._id ? '#d12420' : '#f0f4ff',
                              },
                            }}
                          >
                            {selectedDoctor?._id === doctor._id ? 'Unselect' : 'Book'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Appointment Form - Only shown when doctor is selected */}
              {selectedDoctor && (
                <div
                  className="appointment-form-inner"
                  data-cues="slideInUp"
                  data-duration="1000"
                >
                  <div className="content">
                    <h2>Complete Your Booking</h2>
                    <p>
                      Selected Doctor: <strong>{selectedDoctor.memberFullName}</strong>
                      {selectedDoctor.specialization && ` - ${selectedDoctor.specialization}`}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Date Selection - Calendar */}
                    <div className="form-group">
                      <label>Select Date <span>(required)</span></label>
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={loading}
                        required
                        style={{ height: '57px', border: "1px solid #d0d5dd" }}
                      />
                      {formattedDateLabel && (
                        <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#6b7280" }}>
                          Selected date: {formattedDateLabel}
                        </Typography>
                      )}
                    </div>

                    {/* Time Slots - Button Style */}
                    {formData.date && (
                      <div className="form-group">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <label>Select Time Slot <span>(required)</span></label>
                          <Button
                            size="small"
                            variant="text"
                            disabled={!slotsInput || slotsQueryLoading || isWeekendDate}
                            onClick={() => refetchSlots()}
                            sx={{ textTransform: "none" }}
                          >
                            Refresh
                          </Button>
                        </Box>
                        {isWeekendDate ? (
                          <Typography variant="body2" color="error" sx={{ padding: '10px' }}>
                            Weekends are non-working days.
                          </Typography>
                        ) : slotsQueryLoading ? (
                          <Box sx={{ textAlign: 'center', padding: '20px' }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" sx={{ marginTop: 1 }}>
                              Loading available slots...
                            </Typography>
                          </Box>
                        ) : availableSlots.length === 0 ? (
                          <Typography variant="body2" color="error" sx={{ padding: '10px' }}>
                            No available slots for this date
                          </Typography>
                        ) : (
                          <Grid container spacing={2} sx={{ marginTop: 1 }}>
                            {availableSlots.map((slot, index) => {
                              // slot.time is of type AppointmentTime (enum value like '09.00 - 09.25')
                              // If backend returns enum key (like 'T01'), convert it to value
                              const slotKey = normalizeTimeInput(slot.time);
                              const timeString = getTimeLabel(slot.time);
                              
                              return (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                  <Button
                                    fullWidth
                                    variant={formData.time === slotKey ? "contained" : "outlined"}
                                    disabled={!slot.free}
                                    onClick={() => slot.free && handleTimeSlotSelect(slot.time)}
                                    sx={{
                                      minHeight: '50px',
                                      backgroundColor: formData.time === slotKey ? '#336AEA' : 'transparent',
                                      color: formData.time === slotKey ? 'white' : slot.free ? '#336AEA' : '#999',
                                      borderColor: slot.free ? '#336AEA' : '#ccc',
                                      '&:hover': {
                                        backgroundColor: slot.free 
                                          ? (formData.time === slotKey ? '#2a5bd8' : '#f0f4ff')
                                          : 'transparent',
                                      },
                                      '&:disabled': {
                                        borderColor: '#ccc',
                                        color: '#999',
                                      },
                                    }}
                                  >
                                    {timeString}
                                    {!slot.free && ' (Booked)'}
                                  </Button>
                                </Grid>
                              );
                            })}
                          </Grid>
                        )}
                      </div>
                    )}

                    {/* Appointment Type */}
                    <div className="form-group">
                      <label>Appointment Type <span>(required)</span></label>
                      <select
                        className="form-control form-select"
                        name="channel"
                        value={formData.channel}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        style={{ border: "1px solid #d0d5dd" }}
                      >
                        <option value={AppointmentType.ONLINE}>Online Consultation</option>
                        <option value={AppointmentType.OFFLINE}>In-Person Visit</option>
                      </select>
                    </div>

                    {/* Additional Notes */}
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        name="note"
                        className="form-control"
                        placeholder="e.g. Briefly describe your symptoms"
                        value={formData.note}
                        onChange={handleChange}
                        disabled={loading}
                        rows={4}
                        style={{ border: "1px solid #d0d5dd" }}
                      ></textarea>
                    </div>

                    {/* Privacy Policy */}
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="agree"
                          checked={formData.agree}
                          onChange={handleCheckboxChange}
                          disabled={loading}
                          id="checkDefault"
                          required
                        />
                        <label className="form-check-label" htmlFor="checkDefault">
                          I confirm that I have read and agree to the{" "}
                          <Link href="/privacy-policy">Privacy Policy.</Link>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      sx={{
                        borderRadius: '50px'
                      }}
                      disabled={
                        loading ||
                        !formData.time ||
                        (isRescheduleMode && !hasRescheduleChanges)
                      }
                    >
                      {isRescheduleMode ? "Update Appointment" : "Book Appointment"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointment;
