"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { Pagination, Stack } from "@mui/material";
import { ClinicsInquiry } from "@/libs/types/member/member.input";
import { GET_CLINICS, GET_MEMBER } from "@/apollo/user/query";
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import { Location } from "@/libs/enums/appointment.enum";
import ClinicCard from "./ClinicCard";
import { userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { useRouter } from "next/router";

const ClinicsList = () => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const currentUser = useReactiveVar(userVar);
  const clinicsInput: ClinicsInquiry = {
    page: 1,
    limit: 200,
    sort: "createdAt",
    direction: "DESC",
    search: {},
  };

  const { data, refetch } = useQuery(GET_CLINICS, {
    variables: { input: clinicsInput },
    fetchPolicy: "cache-and-network",
  });
  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

  const clinics: Member[] = data?.getClinics?.list || [];
  const [clinicLocations, setClinicLocations] = useState<
    Record<string, { location?: Location }>
  >({});
  const [localFollowingIds, setLocalFollowingIds] = useState<Set<string>>(new Set());

  const locationOptions = useMemo(() => Object.values(Location), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("0");
  const [selectedLocation, setSelectedLocation] = useState<Location | "">("");
  const [selectedRating, setSelectedRating] = useState<number | "">("");

  useEffect(() => {
    const fetchLocations = async () => {
      const missingIds = clinics
        .map((clinic) => clinic._id)
        .filter((id) => id && !clinicLocations[id]);

      if (missingIds.length === 0) return;

      const results: Record<string, { location?: Location }> = {};

      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const { data: clinicData } = await apolloClient.query({
              query: GET_MEMBER,
              variables: { targetId: id, includeLocation: true },
              fetchPolicy: "cache-first",
            });
            const clinic = clinicData?.getMember;
            if (clinic?.location) {
              results[id] = { location: clinic.location };
            } else {
              results[id] = { location: undefined };
            }
          } catch (err) {
            results[id] = { location: undefined };
          }
        })
      );

      if (Object.keys(results).length > 0) {
        setClinicLocations((prev) => ({ ...prev, ...results }));
      }
    };

    fetchLocations();
  }, [clinics, apolloClient, clinicLocations]);

  const clinicsData = useMemo(() => {
    return clinics.map((clinic, index) => {
      const location = clinicLocations[clinic._id]?.location;
      return {
        id: index + 1,
        clinic,
        name: clinic.memberFullName || clinic.memberNick || "Clinic",
        location,
        rating: clinic.memberLikes ?? 0,
        reviews: clinic.memberComments ?? 0,
        createdAt: clinic.createdAt,
      };
    });
  }, [clinics, clinicLocations]);

  const filteredClinics = clinicsData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchLower) ||
      (item.clinic.memberAddress || "").toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (selectedLocation && item.location !== selectedLocation) {
      return false;
    }

    if (selectedRating !== "" && item.rating < selectedRating) {
      return false;
    }

    return true;
  });

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (sortOption === "0") {
      return b.reviews - a.reviews;
    } else if (sortOption === "1") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === "2") {
      return b.rating - a.rating;
    }
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const topRef = useRef<HTMLDivElement>(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedClinics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedClinics.length / itemsPerPage);

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
  }, [searchTerm, sortOption, selectedLocation, selectedRating]);

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

  const startResult = sortedClinics.length > 0 ? indexOfFirstItem + 1 : 0;
  const endResult = Math.min(indexOfLastItem, sortedClinics.length);

  return (
    <>
      <div className="doctors-area wrap-style2 ptb-140" ref={topRef}>
        <div className="container">
          <div className="row justify-content-center g-4">
            <div className="col-xl-3 col-md-12">
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
                    value={selectedLocation}
                    onChange={(e) =>
                      setSelectedLocation((e.target.value as Location) || "")
                    }
                  >
                    <option value="">All Locations</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <select
                    className="form-select"
                    value={selectedRating}
                    onChange={(e) =>
                      setSelectedRating(e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">All Ratings</option>
                    <option value={5}>⭐⭐⭐⭐⭐ 5</option>
                    <option value={4}>⭐⭐⭐⭐ 4</option>
                    <option value={3}>⭐⭐⭐ 3</option>
                    <option value={2}>⭐⭐ 2</option>
                    <option value={1}>⭐ 1</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="col-xl-9 col-md-12">
              <div className="showing-doctors-bar">
                <div className="results-text">
                  Showing <span>{startResult}-{endResult}</span> of{" "}
                  <span>{sortedClinics.length}</span> Results
                </div>
                <div className="search-sort-wrapper">
                  <div className="search-box">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search clinics"
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
                          style={{ maskType: "luminance" }}
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
                          <path d="M0 0H24V24H0V0Z" fill="#336AEA" />
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
                  currentItems.map((item) => {
                    const isFollowing =
                      localFollowingIds.has(item.clinic._id) ||
                      item.clinic.meFollowed?.some((follow) => follow.myFollowing);
                    return (
                    <div key={item.id} className="col-xl-4 col-md-6">
                      <ClinicCard
                        clinic={item.clinic}
                        location={item.location}
                        reviews={item.reviews}
                        isFollowing={!!isFollowing}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                        isLiked={item.clinic.meLiked?.some((like) => like.myFavorite)}
                        onLike={handleLike}
                      />
                    </div>
                  );
                  })
                ) : (
                  <div className="col-12 text-center py-5 border">
                    <p>No clinics found matching your search criteria.</p>
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

export default ClinicsList;
