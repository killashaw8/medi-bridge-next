import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import { DoctorsInquiry } from "@/libs/types/member/member.input";
import { useMutation, useQuery, useApolloClient, useReactiveVar } from "@apollo/client";
import { GET_DOCTORS, GET_MEMBER } from "@/apollo/user/query";
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from "@/apollo/user/mutation";
import { Member } from "@/libs/types/member/member";
import { T } from "@/libs/types/common";
import DoctorCard from "@/libs/components/clinics-doctors/DoctorCard";
import { userVar } from "@/apollo/store";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";
import { useRouter } from "next/router";


interface TopDoctorsProps {
  initialInput?: DoctorsInquiry;
}

const TopDoctors = (props: TopDoctorsProps = {}) => {
  const theme = useTheme();
  const { initialInput } = props;
  const apolloClient = useApolloClient();
  const router = useRouter();
  const currentUser = useReactiveVar(userVar);
  const [topDoctors, setTopDoctors] = useState<Member[]>([]);
  const [clinicNames, setClinicNames] = useState<Record<string, string>>({});
  const [localFollowingIds, setLocalFollowingIds] = useState<Set<string>>(new Set());

  // Default input if not provided
  const defaultInput: DoctorsInquiry = {
    page: 1,
    limit: 10,
    sort: 'memberRank',
    direction: 'DESC',
    search: {},
  };

  const queryInput = initialInput || defaultInput;

  // APOLLO Requests
  const {
    loading: getDoctorsLoading,
    data: getDoctorsData,
    error: getDoctorsError,
    refetch: getDoctorsRefetch
  } = useQuery(GET_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: { input: queryInput },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    setTopDoctors(getDoctorsData?.getDoctors?.list || []);
  }, [getDoctorsData]);

  const [subscribe] = useMutation(SUBSCRIBE);
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [likeMember] = useMutation(LIKE_TARGET_MEMBER);

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
      await getDoctorsRefetch();
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
      await getDoctorsRefetch();
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
      await getDoctorsRefetch();
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || err?.message || "Failed to like.";
      await sweetMixinErrorAlert(message);
    }
  };

  // Fetch clinic names for all unique clinic IDs
  const uniqueClinicIds = useMemo(() => {
    const ids = new Set<string>();
    topDoctors.forEach(doctor => {
      if (doctor.clinicId) {
        ids.add(doctor.clinicId);
      }
    });
    return Array.from(ids);
  }, [topDoctors]);

  // Fetch clinic data for each unique clinic ID
  useEffect(() => {
    if (uniqueClinicIds.length === 0) return;

    const fetchClinicNames = async () => {
      const names: Record<string, string> = {};
      
      // Fetch each clinic's data using Apollo Client
      const promises = uniqueClinicIds.map(async (clinicId) => {
        try {
          const { data } = await apolloClient.query({
            query: GET_MEMBER,
            variables: { targetId: clinicId },
            fetchPolicy: 'cache-first', // Use cache if available
          });
          if (data?.getMember?.memberFullName) {
            names[clinicId] = data.getMember.memberFullName;
          } else {
            names[clinicId] = clinicId; // Fallback to ID if name not found
          }
        } catch (error) {
          console.error(`Failed to fetch clinic ${clinicId}:`, error);
          names[clinicId] = clinicId; // Fallback to ID if fetch fails
        }
      });

      await Promise.all(promises);
      setClinicNames(names);
    };

    fetchClinicNames();
  }, [uniqueClinicIds, apolloClient]);

  return (
    <>
      <div className="doctors-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-6 col-md-12">
                <div className="left">
                  <span className="sub wrap2">Our Doctors</span>
                  <h2>
                    Meet the Licensed Doctors Who Power MediBridge&apos;s Virtual
                    Care
                  </h2>
                </div>
              </div>

              <div className="col-lg-6 col-md-12">
                <div className="right wrap2">
                  <Link href="/doctors" className="link-btn">
                    View All Doctors
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                    >
                      <path
                        d="M12.5 0H0.5C0.224 0 0 0.224 0 0.5C0 0.776 0.224 1 0.5 1H11.2928L0.1465 12.1465C-0.04875 12.3417 -0.04875 12.6583 0.1465 12.8535C0.24425 12.9513 0.372 13 0.5 13C0.628 13 0.756 12.9513 0.8535 12.8535L12 1.707V12.5C12 12.776 12.224 13 12.5 13C12.776 13 13 12.776 13 12.5V0.5C13 0.224 12.776 0 12.5 0Z"
                        fill={theme.palette.primary.main}
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {getDoctorsLoading ? (
              [0, 1, 2, 3].map((index) => (
                <div key={`top-doctor-skeleton-${index}`} className="col-xl-3 col-md-6">
                  <div className="doctor-card">
                    <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="text" width="70%" sx={{ mt: 2 }} />
                    <Skeleton variant="text" width="50%" />
                  </div>
                </div>
              ))
            ) : (
              topDoctors.map((doctor: Member) => (
                <div key={doctor._id} className="col-xl-3 col-md-6">
                  {(() => {
                    const isFollowing =
                      localFollowingIds.has(doctor._id) ||
                      doctor.meFollowed?.some((follow) => follow.myFollowing);
                    return (
                      <DoctorCard
                        doctor={doctor}
                        clinicName={
                          doctor.clinicId
                            ? clinicNames[doctor.clinicId] || doctor.clinicId
                            : "No Clinic"
                        }
                        reviews={doctor.memberComments ?? 0}
                        isFollowing={!!isFollowing}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                        isLiked={doctor.meLiked?.some((like) => like.myFavorite)}
                        onLike={handleLike}
                      />
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopDoctors;
