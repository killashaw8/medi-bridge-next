import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";

// Feedback data structure
interface Feedback {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

const Feedbacks = () => {
  const theme = useTheme();
  // Feedback data - this could come from an API or CMS
  const feedbacks: Feedback[] = [
    {
      id: 1,
      name: "Emily Robinson",
      location: "London, UK",
      rating: 4.5,
      text: '"I honestly didn\'t expect virtual healthcare to feel this personal. The doctor took the time to listen to every concern I had and explained things in a way I could understand. It felt just like sitting in a clinic—except I never had to leave my flat. Doutor is the future of healthcare."',
      image: "/images/users/user1.png",
    },
    {
      id: 2,
      name: "Jonas Keller",
      location: "Berlin, Germany",
      rating: 4.5,
      text: '"After struggling to get timely appointments at my local practice, I decided to try Doutor. Within 15 minutes, I was speaking to a certified physician who helped me with my chronic back pain. The experience was smooth, secure, and surprisingly personal. Highly recommended."',
      image: "/images/users/user2.png",
    },
    {
      id: 3,
      name: "Sofia Benedetti",
      location: "Milan, Italy",
      rating: 4.5,
      text: '"My daughter had a rash late in the evening and I didn\'t want to visit the ER unnecessarily. Doutor connected us to a dermatologist within minutes, and we had a prescription ready the same night. The peace of mind was priceless."',
      image: "/images/users/user3.png",
    },
    {
      id: 4,
      name: "Carlos Martínez",
      location: "Madrid, Spain",
      rating: 4.5,
      text: '"I never thought mental health services could be this accessible. Doutor matched me with a licensed therapist I truly connect with. The sessions are discreet, flexible, and I can finally prioritize my well-being without rearranging my life."',
      image: "/images/users/user4.png",
    },
  ];

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <li key={i}>
            <i className="ri-star-s-fill"></i>
          </li>
        ))}
        {hasHalfStar && (
          <li>
            <i className="ri-star-half-s-fill"></i>
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

  // Function to determine wrap class based on index
  const getWrapClass = (index: number): string => {
    const wrapClasses = ["wrap1", "wrap2", "wrap3", "wrap4"];
    return wrapClasses[index % wrapClasses.length];
  };

  return (
    <>
      <div className="feedback-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-6 col-md-12">
                <div className="left">
                  <span className="sub wrap2">Patients Feedback</span>
                  <h2>Why Patients Choose MediBridge in Their Own Words</h2>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="right wrap2">
                  <Link href="/feedbacks" className="link-btn">
                    View All Feedbacks
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

          <div className="row justify-content-center g-0 feedback-items">
            {feedbacks.map((feedback, index) => (
              <div key={feedback.id} className="col-xl-3 col-md-6">
                <div className={`feedback-card ${getWrapClass(index)}`}>
                  <div className="info">
                    <div className="image">
                      <Image
                        src={feedback.image}
                        alt={feedback.name}
                        width={46}
                        height={46}
                      />
                    </div>
                    <div className="title">
                      <h4>{feedback.name}</h4>
                      <span>— {feedback.location}</span>
                    </div>
                  </div>
                  <ul className="list">{renderStars(feedback.rating)}</ul>
                  <p>{feedback.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Feedbacks;
