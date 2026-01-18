import React from "react";
import Image from "next/image";

const HowItWorks2 = () => {
  const steps = [
    {
      id: 1,
      imageSrc: "/images/work1.png",
      title: "Create Account",
      description: "Sign up and complete your profile in minutes.",
    },
    {
      id: 2,
      imageSrc: "/images/work2.png",
      title: "Choose a Service",
      description: "Select from general care & mental health.",
    },
    {
      id: 3,
      imageSrc: "/images/work3.png",
      title: "Start Consultation",
      description: "Video chat with a licensed doctor anytime.",
    },
  ];

  return (
    <>
      <div className="how-it-works-area ptb-140 smoke-bg-color">
        <div className="container">
          <div className="section-title">
            <div className="left text-center u-maxw-637 u-mx-auto">
              <span className="sub wrap2">How It Works</span>
              <h2>How MediBridge Works—Signup to Consultation in Just Minutes</h2>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {steps.map((step) => (
              <div key={step.id} className="col-lg-4 col-md-6">
                <div className="how-it-work-card">
                  <div className="image">
                    <Image
                      src={step.imageSrc}
                      alt={step.title}
                      width={242}
                      height={242}
                    />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks2;
