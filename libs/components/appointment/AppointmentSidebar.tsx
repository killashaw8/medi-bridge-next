import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { AppointmentInquiry } from "@/libs/types/appointment/appointment.input";
import { GET_CLINICS } from "@/apollo/user/query";
import { Location } from "@/libs/enums/appointment.enum";
import { Member } from "@/libs/types/member/member";
import { IconButton, Stack, Tooltip } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';

interface AppointmentSidebarProps {
  searchFilter?: AppointmentInquiry | any;
  setSearchFilter?: any;
  initialInput?: AppointmentInquiry;
}

const AppointmentSidebar = (props: AppointmentSidebarProps) => {
  const { searchFilter, setSearchFilter, initialInput } = props;
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<Location | "">("");
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  // Fetch clinics for clinic filter
  const clinicsInput = {
    page: 1,
    limit: 100,
    sort: 'createdAt',
    direction: 'ASC' as const,
    search: {},
  };

  const { data: clinicsData, loading: clinicsLoading } = useQuery(GET_CLINICS, {
    variables: { input: clinicsInput },
    fetchPolicy: "cache-and-network",
  });

  const clinics: Member[] = clinicsData?.getClinics?.list || [];

  // Initialize filters from searchFilter prop
  useEffect(() => {
    if (searchFilter) {
      if (searchFilter.location) {
        setSelectedLocation(searchFilter.location);
      }
      if (searchFilter.clinicId) {
        setSelectedClinicId(searchFilter.clinicId);
      }
    }
  }, [searchFilter]);

  const refreshHandler = async () => {
    try {
      setSelectedLocation("");
      setSelectedClinicId("");
      if (setSearchFilter && initialInput) {
        setSearchFilter(initialInput);
      }
      if (router.pathname.includes('/appointments')) {
        await router.push(
          `/appointments?input=${JSON.stringify(initialInput)}`,
          `/appointments?input=${JSON.stringify(initialInput)}`,
          { scroll: false },
        );
      }
    } catch (err: any) {
      console.log('ERROR, refreshHandler:', err);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const location = e.target.value as Location | "";
    setSelectedLocation(location);
    
    if (setSearchFilter && searchFilter) {
      setSearchFilter({
        ...searchFilter,
        page: 1,
        location: location || undefined,
      });
    }
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clinicId = e.target.value;
    setSelectedClinicId(clinicId);
    
    if (setSearchFilter && searchFilter) {
      setSearchFilter({
        ...searchFilter,
        page: 1,
        clinicId: clinicId || undefined,
      });
    }
  };

  const locationOptions = Object.values(Location);

  const widgetBoxData = {
    image: {
      src: "/images/mdbrdg_large.png",
      alt: "Experience Virtual Care",
    },
    description: "Book Your Appointment Today",
    buttonText: "Book Appointment",
    buttonLink: "/appointment",
    shapeImage: {
      src: "/images/shape.png",
      alt: "Decorative shape",
    },
  };

  return (
    <div className="widget-area">
      {/* Filter by Location Widget */}
      <div className="widget widget_search">
        <h3 className="widget-title">
          <LocationOnIcon sx={{ fontSize: 20, marginRight: 1, verticalAlign: 'middle' }} />
          Filter by Location
        </h3>
        <Stack className="searchbar" direction="row" spacing={1} alignItems="center">
          <select
            className="form-control form-select appointment-filter-select"
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
          <Tooltip title="Reset Location Filter">
            <IconButton 
              onClick={() => {
                setSelectedLocation("");
                if (setSearchFilter && searchFilter) {
                  setSearchFilter({
                    ...searchFilter,
                    page: 1,
                    location: undefined,
                  });
                }
              }}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </div>

      {/* Filter by Clinic Widget */}
      <div className="widget widget_search">
        <h3 className="widget-title">
          <BusinessIcon sx={{ fontSize: 20, marginRight: 1, verticalAlign: 'middle' }} />
          Filter by Clinic
        </h3>
        <Stack className="searchbar" direction="row" spacing={1} alignItems="center">
          <select
            className="form-control form-select appointment-filter-select"
            value={selectedClinicId}
            onChange={handleClinicChange}
            disabled={clinicsLoading}
          >
            <option value="">All Clinics</option>
            {clinics.map((clinic) => (
              <option key={clinic._id} value={clinic._id}>
                {clinic.memberFullName}
              </option>
            ))}
          </select>
          <Tooltip title="Reset Clinic Filter">
            <IconButton 
              onClick={() => {
                setSelectedClinicId("");
                if (setSearchFilter && searchFilter) {
                  setSearchFilter({
                    ...searchFilter,
                    page: 1,
                    clinicId: undefined,
                  });
                }
              }}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {clinicsLoading && (
          <div className="appointment-filter-status">
            Loading clinics...
          </div>
        )}
      </div>

      {/* Reset All Filters */}
      <div className="widget widget_search">
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ padding: '10px' }}>
          <Tooltip title="Reset All Filters">
            <IconButton onClick={refreshHandler} color="primary" size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <span className="appointment-filter-reset">Reset All Filters</span>
        </Stack>
      </div>

      {/* Widget Box */}
      <div className="widget widget_box">
        <div className="image">
          <Image 
            src={widgetBoxData.image.src} 
            alt={widgetBoxData.image.alt} 
            width={120} 
            height={120} 
          />
        </div>
        <p>{widgetBoxData.description}</p>
        <a href={widgetBoxData.buttonLink} className="link-btn">
          {widgetBoxData.buttonText}
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
            <path
              d="M12.5 0.0117188H0.5C0.224 0.0117188 0 0.235719 0 0.511719C0 0.787719 0.224 1.01172 0.5 1.01172H11.2928L0.1465 12.1582C-0.04875 12.3535 -0.04875 12.67 0.1465 12.8652C0.24425 12.963 0.372 13.0117 0.5 13.0117C0.628 13.0117 0.756 12.963 0.8535 12.8652L12 1.71872V12.5117C12 12.7877 12.224 13.0117 12.5 13.0117C12.776 13.0117 13 12.7877 13 12.5117V0.511719C13 0.235719 12.776 0.0117188 12.5 0.0117188Z"
              fill="white"
            />
          </svg>
        </a>
        <div className="shape">
          <Image 
            src={widgetBoxData.shapeImage.src} 
            alt={widgetBoxData.shapeImage.alt} 
            width={165} 
            height={128} 
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentSidebar;
