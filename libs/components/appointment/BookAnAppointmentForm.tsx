import React, { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import { BOOK_APPOINTMENT } from "@/apollo/user/mutation";
import { GET_DOCTORS, GET_AVAILABLE_SLOTS, GET_MEMBER } from "@/apollo/user/query";
import { AppointmentTime, AppointmentType, Location } from "@/libs/enums/appointment.enum";
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
  Stack,
  Chip,
  CircularProgress
} from "@mui/material";
import { getImageUrl } from "@/libs/imageHelper";
import { useApolloClient } from "@apollo/client";
import { useMemo } from "react";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';

interface Slot {
  time: AppointmentTime;
  free: boolean;
}

const BookAnAppointmentForm = () => {
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
    time: "" as AppointmentTime | "",
    note: "",
    agree: false,
  });

  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [clinicData, setClinicData] = useState<Record<string, { name: string; location?: Location }>>({});
  const apolloClient = useApolloClient();
  const fetchedClinicIdsRef = useRef<Set<string>>(new Set());

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
      setFormData(prev => ({ ...prev, time: "" as AppointmentTime | "" }));
      refetchSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, time: "" as AppointmentTime | "" }));
    }
  }, [selectedDoctor?._id, formData.date, refetchSlots]);

  // Refetch doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      refetchDoctors();
      setSelectedDoctor(null); // Reset doctor selection
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTime | "" })); // Reset date and time
    }
  }, [selectedSpecialization, refetchDoctors]);

  // Book appointment mutation
  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value as Location | "");
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpecialization(e.target.value as DoctorSpecialization | "");
  };

  const handleDoctorSelect = (doctor: Member) => {
    // If clicking the same doctor, unselect them
    if (selectedDoctor?._id === doctor._id) {
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTime | "" })); // Reset date and time
    } else {
      setSelectedDoctor(doctor);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTime | "" })); // Reset date and time
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value,
      time: "" as AppointmentTime | "", // Reset time when date changes
    }));
  };

  const handleTimeSlotSelect = (time: AppointmentTime) => {
    setFormData(prev => ({
      ...prev,
      time: time,
    }));
  };

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

    setLoading(true);

    try {
      const result = await bookAppointment({
        variables: {
          input: {
            doctorId: selectedDoctor._id,
            clinicId: selectedDoctor.clinicId || "", // Use doctor's clinic
            location: selectedLocation as Location,
            date: formData.date,
            time: formData.time as AppointmentTime,
            channel: formData.channel,
            note: formData.note.trim(),
            patientId: user._id,
          },
        },
      });

      if (result.data?.bookAppointment) {
        await sweetMixinSuccessAlert("Appointment booked successfully!");
        router.push("/bookAppointment/thank-you");
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
    const stillVisible = locationFilteredDoctors.some(
      (doctor) => doctor._id === selectedDoctor._id
    );
    if (!stillVisible) {
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, date: "", time: "" as AppointmentTime | "" }));
    }
  }, [locationFilteredDoctors, selectedDoctor?._id]);

  // Location options
  const locationOptions = Object.values(Location);
  
  // Specialization options
  const specializationOptions = Object.values(DoctorSpecialization);

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
                        style={{ height: '57px' }}
                      />
                    </div>

                    {/* Time Slots - Button Style */}
                    {formData.date && (
                      <div className="form-group">
                        <label>Select Time Slot <span>(required)</span></label>
                        {slotsQueryLoading ? (
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
                              const timeValue = slot.time as string;
                              const timeString = Object.values(AppointmentTime).includes(timeValue as AppointmentTime)
                                ? timeValue // Already the value string
                                : (Object.keys(AppointmentTime).includes(timeValue)
                                    ? AppointmentTime[timeValue as unknown as keyof typeof AppointmentTime]
                                    : timeValue); // Use as-is if neither key nor value
                              
                              return (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                  <Button
                                    fullWidth
                                    variant={formData.time === slot.time ? "contained" : "outlined"}
                                    disabled={!slot.free}
                                    onClick={() => slot.free && handleTimeSlotSelect(slot.time)}
                                    sx={{
                                      minHeight: '50px',
                                      backgroundColor: formData.time === slot.time ? '#336AEA' : 'transparent',
                                      color: formData.time === slot.time ? 'white' : slot.free ? '#336AEA' : '#999',
                                      borderColor: slot.free ? '#336AEA' : '#ccc',
                                      '&:hover': {
                                        backgroundColor: slot.free 
                                          ? (formData.time === slot.time ? '#2a5bd8' : '#f0f4ff')
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
                      disabled={loading || !formData.time}
                    >
                      Book Appointment
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

export default BookAnAppointmentForm;
