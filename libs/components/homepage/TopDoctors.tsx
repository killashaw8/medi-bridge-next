import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { DoctorsInquiry } from "@/libs/types/member/member.input";
import { useQuery, useApolloClient } from "@apollo/client";
import { GET_DOCTORS, GET_MEMBER } from "@/apollo/user/query";
import { Member } from "@/libs/types/member/member";
import { T } from "@/libs/types/common";
import { useRouter } from "next/router";


interface TopDoctorsProps {
  initialInput?: DoctorsInquiry;
}

const TopDoctors = (props: TopDoctorsProps = {}) => {
  const { initialInput } = props;
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [topDoctors, setTopDoctors] = useState<Member[]>([]);
  const [clinicNames, setClinicNames] = useState<Record<string, string>>({});

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
    onCompleted: (data: T) => {
      setTopDoctors(data?.getDoctors?.list || []);
    },
  });

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

  // Function to render star ratings
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
                        fill="#336AEA"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {topDoctors.map((doctor: Member) => (
              <div key={doctor._id} className="col-xl-3 col-md-6">
                <div className="doctor-card">
                  <div className="image">
                    <Link href={doctor._id}>
                      <Image
                        src={doctor.memberImage}
                        alt={doctor.memberNick}
                        width={340}
                        height={340}
                        style={{ borderRadius: "10%" }}
                      />
                    </Link>
                  </div>
                  <div className="content">
                    <h3>
                      <Link href={doctor._id}>{doctor.memberFullName}</Link>
                    </h3>
                    <span className="sub">
                      {doctor.clinicId ? (clinicNames[doctor.clinicId] || doctor.clinicId) : 'No Clinic'}
                    </span>
                    <span className="tag">{doctor.specialization}</span>

                    <div className="rating-info">
                      <ul className="list">
                        {renderRatingStars(doctor.memberLikes)}
                      </ul>

                      <b>{doctor.memberLikes}</b>
                      <span>({doctor.memberLikes.toLocaleString()} Reviews)</span>
                    </div>

                    <div className="doctor-btn">
                      <Link href="/book-an-appointment" className="default-btn">
                        <span className="left">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                              fill="#336AEA"
                            />
                          </svg>
                        </span>
                        Book Now
                        <span className="right">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M11.5385 0H0.461538C0.206769 0 0 0.206769 0 0.461538C0 0.716308 0.206769 0.923077 0.461538 0.923077H10.4241L0.135231 11.2122C-0.045 11.3924 -0.045 11.6845 0.135231 11.8648C0.225462 11.955 0.343385 12 0.461538 12C0.579692 12 0.697846 11.955 0.787846 11.8648L11.0769 1.57569V11.5385C11.0769 11.7932 11.2837 12 11.5385 12C11.7932 12 12 11.7932 12 11.5385V0.461538C12 0.206769 11.7932 0 11.5385 0Z"
                              fill="#336AEA"
                            />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopDoctors;
