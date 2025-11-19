import React from "react";
import Image from "next/image";
import Link from "next/link";

// Doctor data structure
interface Doctor {
  id: number;
  name: string;
  qualification: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  profileLink: string;
}

const OurDoctors = () => {
  // Sample doctor data - this could come from an API or CMS
  const doctorsData: Doctor[] = [
    {
      id: 1,
      name: "Dr. Kim Jeong Gi",
      qualification: "MBBS, FCPS (Medicine)",
      specialization: "Internal Medicine",
      experience: "12+ Years of Experience",
      rating: 4.9,
      reviews: 3760,
      imageUrl: "/images/doctors/doctor1.png",
      profileLink: "/doctors/profile",
    },
    {
      id: 2,
      name: "Dr. Park Yun Ah",
      qualification: "MD, Pediatrics",
      specialization: "Pediatrics",
      experience: "4+ Years of Experience",
      rating: 4.8,
      reviews: 1350,
      imageUrl: "/images/doctors/doctor2.png",
      profileLink: "/doctors/profile",
    },
    {
      id: 3,
      name: "Dr. Samuel Lee",
      qualification: "MD, FAAD",
      specialization: "Dermatology",
      experience: "3+ Years of Experience",
      rating: 4.7,
      reviews: 1375,
      imageUrl: "/images/doctors/doctor3.png",
      profileLink: "/doctors/profile",
    },
    {
      id: 4,
      name: "Dr. Lee Ji Hoon",
      qualification: "MBBS, MD",
      specialization: "Chronic Conditions",
      experience: "15+ Years of Experience",
      rating: 4.9,
      reviews: 4892,
      imageUrl: "/images/doctors/doctor4.png",
      profileLink: "/doctors/profile",
    },
  ];

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
            {doctorsData.map((doctor) => (
              <div key={doctor.id} className="col-xl-3 col-md-6">
                <div className="doctor-card">
                  <div className="image">
                    <Link href={doctor.profileLink}>
                      <Image
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        width={340}
                        height={340}
                        style={{ borderRadius: "10%" }}
                      />
                    </Link>
                  </div>
                  <div className="content">
                    <h3>
                      <Link href={doctor.profileLink}>{doctor.name}</Link>
                    </h3>
                    <span className="sub">{doctor.qualification}</span>
                    <span className="tag">{doctor.specialization}</span>
                    <span className="experience">{doctor.experience}</span>

                    <div className="rating-info">
                      <ul className="list">
                        {renderRatingStars(doctor.rating)}
                      </ul>

                      <b>{doctor.rating}</b>
                      <span>({doctor.reviews.toLocaleString()} Reviews)</span>
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

export default OurDoctors;
