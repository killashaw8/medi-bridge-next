"use client";

import React from "react";
import { Location } from "@/libs/enums/appointment.enum";

type ClinicOption = {
  id: string;
  name: string;
  location?: Location;
};

type DoctorFilterValues = {
  location: Location | "";
  clinicId: string;
  specialization: string;
  rating: number | "";
};

type DoctorFilterProps = {
  locations: Location[];
  clinics: ClinicOption[];
  specializations: string[];
  values: DoctorFilterValues;
  onChange: (values: DoctorFilterValues) => void;
};

const ratingOptions = [
  { value: 5, label: "⭐⭐⭐⭐⭐ 5" },
  { value: 4, label: "⭐⭐⭐⭐ 4" },
  { value: 3, label: "⭐⭐⭐ 3" },
  { value: 2, label: "⭐⭐ 2" },
  { value: 1, label: "⭐ 1" },
];

const DoctorFilter: React.FC<DoctorFilterProps> = ({
  locations,
  clinics,
  specializations,
  values,
  onChange,
}) => {
  const clinicOptions = values.location
    ? clinics.filter((clinic) => clinic.location === values.location)
    : clinics;

  return (
    <div className="filter-wrapper">
      <h3 className="title">
        Filter
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
        >
          <path
            d="M34.8327 11.0835H3.16602"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            opacity="0.5"
            d="M30.0827 19H7.91602"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M25.3327 26.917H12.666"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </h3>

      <div className="form-group">
        <label>Location</label>
        <select
          className="form-select"
          value={values.location}
          onChange={(e) =>
            onChange({
              ...values,
              location: (e.target.value as Location) || "",
              clinicId: "",
            })
          }
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Clinics</label>
        <select
          className="form-select"
          value={values.clinicId}
          onChange={(e) => onChange({ ...values, clinicId: e.target.value })}
        >
          <option value="">All Clinics</option>
          {clinicOptions.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Specialization</label>
        <select
          className="form-select"
          value={values.specialization}
          onChange={(e) =>
            onChange({ ...values, specialization: e.target.value })
          }
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Rating</label>
        <select
          className="form-select"
          value={values.rating}
          onChange={(e) =>
            onChange({
              ...values,
              rating: e.target.value ? Number(e.target.value) : "",
            })
          }
        >
          <option value="">All Ratings</option>
          {ratingOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DoctorFilter;
