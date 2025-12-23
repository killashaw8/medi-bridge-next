"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Member } from "@/libs/types/member/member";
import { getImageUrl } from "@/libs/imageHelper";
import { Location } from "@/libs/enums/appointment.enum";
import Button from "@mui/material/Button";

interface ClinicCardProps {
  clinic: Member;
  location?: Location;
  reviews?: number;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, location, reviews = 0 }) => {
  const imageSrc = clinic.memberImage
    ? getImageUrl(clinic.memberImage)
    : "/images/hospital.png";

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

  const rating = clinic.memberLikes ?? 0;

  return (
    <div className="doctor-card wrap2">
      <div className="image">
        <Link href={`/clinics/details?${clinic._id || ""}`}>
          <Image
            src={imageSrc}
            alt={clinic.memberFullName || clinic.memberNick || "Clinic"}
            width={340}
            height={340}
            style={{ borderRadius: "10%" }}
          />
        </Link>
      </div>
      <div className="content">
        <h3>
          <Link href={`/clinics/details?${clinic._id || ""}`}>
            {clinic.memberFullName || clinic.memberNick || "Clinic"}
          </Link>
        </h3>
        {location && (
          <span className="tag"> {location.replace(/_/g, " ")}</span>
        )}
        <div className="rating-info">
          <ul className="list">{renderRatingStars(rating)}</ul>
          <b>{rating}</b>
          <span>({reviews.toLocaleString()} Reviews)</span>
        </div>
        <div className="doctor-btn">
          <Button 
            variant="contained"
            size="large"
            href={`/clinics/details?${clinic._id || ""}`}
            sx={{
              borderRadius: '50px'
            }}
          >
            View Clinic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;
