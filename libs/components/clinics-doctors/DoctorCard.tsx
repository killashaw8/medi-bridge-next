"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Member } from "@/libs/types/member/member";
import { getImageUrl } from "@/libs/imageHelper";
import { Location } from "@/libs/enums/appointment.enum";
import { Button, IconButton, Stack } from "@mui/material";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { canFollowMemberType } from "@/libs/utils/follow";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";

interface DoctorCardProps {
  doctor: Member;
  clinicName?: string;
  clinicLocation?: Location;
  reviews?: number;
  isFollowing?: boolean;
  onFollow?: (memberId: string) => void;
  onUnfollow?: (memberId: string) => void;
  isLiked?: boolean;
  onLike?: (memberId: string) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  clinicName,
  clinicLocation,
  reviews = 0,
  isFollowing = false,
  onFollow,
  onUnfollow,
  isLiked = false,
  onLike,
}) => {
  const currentUser = useReactiveVar(userVar);
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

  const rating = doctor.memberRatingAvg ?? 0;

  const canStartFollow =
    !!currentUser?._id &&
    currentUser._id !== doctor._id &&
    canFollowMemberType(currentUser?.memberType, doctor.memberType);
  const showFollow = !!onFollow && canStartFollow && !isFollowing;
  const showUnfollow = !!onUnfollow && isFollowing;

  return (
    <div className="doctor-card wrap2">
      <div className="image">
        <Link href={`/doctors/details?${doctor._id || ""}`}>
          <Image
            src={imageSrc}
            alt={doctor.memberFullName || doctor.memberNick || "Doctor"}
            width={340}
            height={340}
            className="u-radius-10"
          />
        </Link>
      </div>
      <div className="content">
        <h3>
          <Link href={`/doctors/details?${doctor._id || ""}`}>
            {doctor.memberFullName || doctor.memberNick || "Doctor"}
          </Link>
        </h3>
        {clinicName && (
          <span className="sub">
            <Link href={`/clinics/details?${doctor.clinicId || ""}`}>{clinicName}</Link>
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
          <b>{rating.toFixed(1)}</b>
          <span>({reviews?.toLocaleString()} Reviews)</span>
        </div>
        <div className="doctor-btn">
          <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
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
            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
              <IconButton
                aria-label={isLiked ? "Unlike" : "Like"}
                onClick={() => onLike?.(doctor._id)}
                color={isLiked ? "error" : "default"}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              {showFollow && (
                <IconButton
                  aria-label="Follow"
                  onClick={() => onFollow?.(doctor._id)}
                  color="primary"
                >
                  <PersonAddAlt1Icon />
                </IconButton>
              )}
              {showUnfollow && (
                <IconButton
                  aria-label="Unfollow"
                  onClick={() => onUnfollow?.(doctor._id)}
                  color="error"
                >
                  <PersonRemoveAlt1Icon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
