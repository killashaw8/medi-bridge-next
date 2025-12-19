"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Member } from "@/libs/types/member/member";
import { getImageUrl } from "@/libs/imageHelper";
import { Location } from "@/libs/enums/appointment.enum";
import { Button } from "@mui/material";

interface DoctorCardProps {
  doctor: Member;
  clinicName?: string;
  clinicLocation?: Location;
  reviews?: number;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  clinicName,
  clinicLocation,
  reviews = 0,
}) => {
  const imageSrc = doctor.memberImage
    ? getImageUrl(doctor.memberImage)
    : "/images/users/defaultUser.svg";

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <li key={i}>
            <i className="ri-star-fill"></i>
          </li>
        ))}
        {hasHalfStar && (
          <li>
            <i className="ri-star-half-fill"></i>
          </li>
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <li key={i + fullStars}>
            <i className="ri-star-line"></i>
          </li>
        ))}
      </>
    );
  };

  const rating = doctor.memberLikes ?? 0;

  return (
    <div className="doctor-card wrap2">
      <div className="image">
        <Link href={`/member/${doctor._id || ""}`}>
          <Image
            src={imageSrc}
            alt={doctor.memberFullName || doctor.memberNick || "Doctor"}
            width={340}
            height={340}
            style={{ borderRadius: "10%" }}
          />
        </Link>
      </div>
      <div className="content">
        <h3>
          <Link href={`/member/${doctor._id || ""}`}>
            {doctor.memberFullName || doctor.memberNick || "Doctor"}
          </Link>
        </h3>
        {clinicName && (
          <span className="sub">
            <Link href={`/member/${doctor.clinicId || ""}`}>{clinicName}</Link>
          </span>
        )}
        {doctor.specialization && (
          <span className="tag">{doctor.specialization}</span>
        )}
        {clinicLocation && (
          <span className="experience">
            Location: {clinicLocation.replace(/_/g, " ")}
          </span>
        )}
        <div className="rating-info">
          <ul className="list">{renderRatingStars(rating)}</ul>
          <b>{rating}</b>
          <span>({reviews?.toLocaleString()} Reviews)</span>
        </div>
        <div className="doctor-btn">
          <Button
            variant="contained"
            href="/bookAppointment"
            size="large"
            sx={{
              borderRadius: '50px',
              color: 'primary'
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
