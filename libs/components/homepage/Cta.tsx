import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";

const Cta = () => {
  const user = useReactiveVar(userVar);
  const isLoggedIn = user?._id && user._id !== '';

  return (
    <>
      <div className="overview-area">
        <div className="container">
          <div className="row justify-content-center align-items-center g-4">
            <div className="col-lg-6 col-md-12">
              <div className="overview-content">
                <h2>
                  Insurance or Not — You&apos;re Always Covered with MediBridge
                </h2>
                <p>
                  Whether you have full coverage, partial benefits, or no
                  insurance at all, MediBridge gives you affordable access to
                  certified doctors anytime you need care—no barriers, no hidden
                  fees.
                </p>

                <div className="overview-btn">
                  {isLoggedIn ? (
                    <Link href="/bookAppointment" className="default-btn">
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
                      <strong>Book Now</strong> - Schedule Your Appointment
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
                  ) : (
                    <Link href="/signup" className="default-btn">
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
                      <strong>Register Now</strong> - It&apos;s Free
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
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="overview-image">
                <Image
                  src="/images/overview.png"
                  alt="overview"
                  width={1230}
                  height={1025}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cta;

