import React from "react";
import Image from "next/image";

const Benefits = () => {
  // Dynamic data array
  const benefitsData = [
    {
      id: 1,
      icon: "/images/icons/benefit1.svg",
      title: "Convenient & Fast",
      description: "See a doctor within minutes—no waiting rooms.",
    },
    {
      id: 2,
      icon: "/images/icons/benefit2.svg",
      title: "Certified Doctors",
      description: "Licensed professionals in multiple specialties.",
    },
    {
      id: 3,
      icon: "/images/icons/benefit3.svg",
      title: "Private & Secure",
      description: "End-to-end encrypted, HIPAA-compliant platform.",
    },
    {
      id: 4,
      icon: "/images/icons/benefit4.svg",
      title: "Affordable Pricing",
      description: "Transparent pricing, with or without insurance.",
    },
  ];

  return (
    <>
      <div className="benefits-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-7 col-md-12">
                <div className="left">
                  <span className="sub">Benefits</span>
                  <h2>Discover the Life-Changing Advantages of Telemedicine</h2>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="right">
                  <p>
                    Designed to make your healthcare experience faster, easier,
                    and more reliable—wherever you are.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic rendering of benefit cards */}
          <div className="row justify-content-center g-4">
            {benefitsData.map((benefit, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="benefit-card">
                  <div className="icon">
                    <Image
                      src={benefit.icon}
                      alt={benefit.title}
                      width={60}
                      height={60}
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Benefits;
