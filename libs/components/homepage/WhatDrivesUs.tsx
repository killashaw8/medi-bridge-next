import React from "react";
import Image from "next/image";

const WhatDrivesUs = () => {
  // Define the principles data
  const principles = [
    {
      id: 1,
      iconSrc: "/images/icons/check2.svg",
      iconAlt: "icon",
      title: "Our Mission",
      description:
        "To make high-quality healthcare accessible, affordable, and personalized—anytime, anywhere—through secure and compassionate virtual care.",
    },
    {
      id: 2,
      iconSrc: "/images/icons/check2.svg",
      iconAlt: "icon",
      title: "Our Vision",
      description:
        "A world where expert medical support is just a tap away, breaking down barriers of distance, cost, and availability for everyone.",
    },
    {
      id: 3,
      iconSrc: "/images/icons/check2.svg",
      iconAlt: "icon",
      title: "Our Values",
      description:
        "We are built on trust, innovation, and empathy. Every decision we make centers around real people, real care, and real outcomes.",
    },
  ];

  return (
    <>
      <div className="drive-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="left" style={{ maxWidth: "637px" }}>
              <span className="sub">What Drives Us</span>
              <h2>Our Purpose & Principles</h2>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {principles.map((principle) => (
              <div key={principle.id} className="col-lg-4 col-md-6">
                <div className="drive-card">
                  <div className="icon">
                    <Image
                      src={principle.iconSrc}
                      alt={principle.iconAlt}
                      width={30}
                      height={30}
                    />
                  </div>
                  <div className="content">
                    <h3>{principle.title}</h3>
                    <p>{principle.description}</p>
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

export default WhatDrivesUs;
