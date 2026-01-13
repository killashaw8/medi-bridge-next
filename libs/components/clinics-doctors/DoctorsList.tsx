"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQuery, useApolloClient, useReactiveVar } from "@apollo/client";
import { Pagination, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DoctorsInquiry } from "@/libs/types/member/member.input";
import { GET_DOCTORS, GET_MEMBER } from "@/apollo/user/query";
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import DoctorCard from "./DoctorCard";
import DoctorFilter from "./DoctorFilter";
import { Location } from "@/libs/enums/appointment.enum";
import { DoctorSpecialization } from "@/libs/enums/member.enum";
import { userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { useRouter } from "next/router";

const DoctorsList = () => {
  const theme = useTheme();
  const apolloClient = useApolloClient();
  const router = useRouter();
  const currentUser = useReactiveVar(userVar);
  const doctorsInput: DoctorsInquiry = {
    page: 1,
    limit: 6,
    sort: "createdAt",
    direction: "DESC",
    search: {},
  };

  const { data, refetch } = useQuery(GET_DOCTORS, {
    variables: { input: doctorsInput },
    fetchPolicy: "cache-and-network",
  });
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

  const doctors: Member[] = data?.getDoctors?.list || [];
  const [clinicInfo, setClinicInfo] = useState<
    Record<string, { name: string; location?: Location }>
  >({});
  const [localFollowingIds, setLocalFollowingIds] = useState<Set<string>>(new Set());

  const clinicOptions = useMemo(() => {
    return Object.entries(clinicInfo).map(([id, info]) => ({
      id,
      name: info.name,
      location: info.location,
    }));
  }, [clinicInfo]);

  const specializationOptions = useMemo(() => {
    return Object.values(DoctorSpecialization);
  }, []);

  const locationOptions = useMemo(() => {
    return Object.values(Location);
  }, []);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  // Sort state
  const [sortOption, setSortOption] = useState("0"); // Default to Most Popular

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<Location | "">("");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | "">("");

  // Fetch clinic data for doctors (to get clinic name and location)
  useEffect(() => {
    const fetchClinics = async () => {
      const clinicIds = Array.from(
        new Set(
          doctors
            .map((doc) => doc.clinicId)
            .filter((id): id is string => !!id && !clinicInfo[id])
        )
      );
      if (clinicIds.length === 0) return;

      const results: Record<string, { name: string; location?: Location }> = {};

      await Promise.all(
        clinicIds.map(async (id) => {
          try {
            const { data: clinicData } = await apolloClient.query({
              query: GET_MEMBER,
              variables: { targetId: id, includeLocation: true },
              fetchPolicy: "cache-first",
            });
            const clinic = clinicData?.getMember;
            if (clinic) {
              results[id] = {
                name: clinic.memberFullName || clinic.memberNick || "Clinic",
                location: clinic.location || undefined,
              };
            }
          } catch (err) {
            results[id] = { name: "Clinic", location: undefined };
          }
        })
      );

      if (Object.keys(results).length > 0) {
        setClinicInfo((prev) => ({ ...prev, ...results }));
      }
    };

    fetchClinics();
  }, [doctors, apolloClient, clinicInfo]);

  const doctorsData = useMemo(() => {
    return doctors.map((doc, index) => {
      const clinic = doc.clinicId ? clinicInfo[doc.clinicId] : undefined;
      return {
        id: index + 1,
        name: doc.memberFullName || doc.memberNick || "Doctor",
        specialization: doc.specialization || "General",
        rating: doc.memberLikes ?? 0,
        reviews: doc.memberComments ?? 0,
        clinicLocation: clinic?.location,
        clinicName: clinic?.name,
        member: doc,
      };
    });
  }, [doctors, clinicInfo]);

  const filteredDoctors = doctorsData.filter((doctor) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchLower) ||
      doctor.specialization.toLowerCase().includes(searchLower) ||
      (doctor.clinicName || "").toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (selectedLocation && doctor.clinicLocation !== selectedLocation) {
      return false;
    }

    if (selectedClinicId && doctor.member.clinicId !== selectedClinicId) {
      return false;
    }

    if (selectedSpecialization && doctor.specialization !== selectedSpecialization) {
      return false;
    }

    if (selectedRating !== "" && doctor.rating < selectedRating) {
      return false;
    }

    return true;
  });

  // Sort doctors based on selected option
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortOption === "0") {
      // Most Popular - sort by number of reviews (descending)
      return b.reviews - a.reviews;
    } else if (sortOption === "1") {
      // Newest - sort by ID (descending, assuming higher ID means newer)
      return b.id - a.id;
    } else if (sortOption === "2") {
      // Top Rated - sort by rating (descending)
      return b.rating - a.rating;
    }
    return 0;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const topRef = useRef<HTMLDivElement>(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDoctors.length / itemsPerPage);

  const updateFollowCache = (memberId: string, nextFollowing: boolean) => {
    const cacheId = apolloClient.cache.identify({
      __typename: "Member",
      _id: memberId,
    });
    if (!cacheId) return;
    apolloClient.cache.modify({
      id: cacheId,
      fields: {
        meFollowed() {
          if (!nextFollowing || !currentUser?._id) return [];
          return [
            {
              __typename: "MeFollowed",
              followerId: currentUser._id,
              followingId: memberId,
              myFollowing: true,
            },
          ];
        },
        memberFollowers(existing = 0) {
          const next = Number(existing) + (nextFollowing ? 1 : -1);
          return next < 0 ? 0 : next;
        },
      },
    });
  };

  const handleFollow = async (memberId: string) => {
    if (!currentUser?._id) {
      await sweetMixinErrorAlert("Please login to follow.");
      router.push("/login");
      return;
    }
    try {
      await subscribe({ variables: { input: memberId } });
      updateFollowCache(memberId, true);
      setLocalFollowingIds((prev) => new Set(prev).add(memberId));
      await sweetMixinSuccessAlert("Followed.");
      await refetch();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to follow.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleUnfollow = async (memberId: string) => {
    if (!currentUser?._id) {
      await sweetMixinErrorAlert("Please login to unfollow.");
      router.push("/login");
      return;
    }
    try {
      await unsubscribe({ variables: { input: memberId } });
      updateFollowCache(memberId, false);
      setLocalFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
      await sweetMixinSuccessAlert("Unfollowed.");
      await refetch();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to unfollow.";
      await sweetMixinErrorAlert(message);
    }
  };

  const handleLike = async (memberId: string) => {
    if (!currentUser?._id) {
      await sweetMixinErrorAlert("Please login to like.");
      router.push("/login");
      return;
    }
    try {
      await likeMember({ variables: { input: memberId } });
      await refetch();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to like.";
      await sweetMixinErrorAlert(message);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    sortOption,
    selectedLocation,
    selectedClinicId,
    selectedSpecialization,
    selectedRating,
  ]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const startResult = sortedDoctors.length > 0 ? indexOfFirstItem + 1 : 0;
  const endResult = Math.min(indexOfLastItem, sortedDoctors.length);

  return (
    <>
      <div className="doctors-area wrap-style2 ptb-140" ref={topRef}>
        <div className="container">
          <div className="row justify-content-center g-4">
            {/** FILTER **/}
            <div className="col-xl-3 col-md-12">
              <DoctorFilter
                locations={locationOptions}
                clinics={clinicOptions}
                specializations={specializationOptions}
                values={{
                  location: selectedLocation,
                  clinicId: selectedClinicId,
                  specialization: selectedSpecialization,
                  rating: selectedRating,
                }}
                onChange={(values) => {
                  setSelectedLocation(values.location);
                  setSelectedClinicId(values.clinicId);
                  setSelectedSpecialization(values.specialization);
                  setSelectedRating(values.rating);
                }}
              />
            </div>

            <div className="col-xl-9 col-md-12">
              <div className="showing-doctors-bar">
                <div className="results-text">
                  Showing <span>{startResult}-{endResult}</span> of{" "}
                  <span>{sortedDoctors.length}</span> Results
                </div>
                <div className="search-sort-wrapper">
                  <div className="search-box">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search doctors by specialist"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <button type="submit">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <mask
                          id="mask0_10014_10966"
                          className="u-mask-luminance"
                          maskUnits="userSpaceOnUse"
                          x="1"
                          y="1"
                          width="22"
                          height="22"
                        >
                          <path
                            d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                            stroke="white"
                            strokeWidth="1.5"
                          />
                          <path
                            opacity="0.5"
                            d="M20 20L22 22"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </mask>
                        <g mask="url(#mask0_10014_10966)">
                          <path d="M0 0H24V24H0V0Z" fill={theme.palette.primary.main} />
                        </g>
                      </svg>
                    </button>
                  </div>
                  <div className="sort-dropdown">
                    <label>Sort by</label>
                    <select
                      className="form-select"
                      value={sortOption}
                      onChange={handleSortChange}
                    >
                      <option value="0">Most Popular</option>
                      <option value="1">Newest</option>
                      <option value="2">Top Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row justify-content-start g-4">
                {currentItems.length > 0 ? (
                  currentItems.map((doctor) => {
                    const isFollowing =
                      localFollowingIds.has(doctor.member._id) ||
                      doctor.member.meFollowed?.some((follow) => follow.myFollowing);
                    return (
                    <div key={doctor.id} className="col-xl-4 col-md-6">
                      <DoctorCard
                        doctor={doctor.member}
                        clinicName={doctor.clinicName}
                        clinicLocation={doctor.clinicLocation}
                        reviews={doctor.reviews}
                        isFollowing={!!isFollowing}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                        isLiked={doctor.member.meLiked?.some((like) => like.myFavorite)}
                        onLike={handleLike}
                      />
                    </div>
                  );
                  })
                ) : (
                  <div className="col-12 text-center py-5 border">
                    <p>No doctors found matching your search criteria.</p>
                  </div>
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
      </div>
    </>
  );
};

export default DoctorsList;
