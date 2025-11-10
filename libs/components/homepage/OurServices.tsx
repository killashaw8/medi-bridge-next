import React from "react";
import Image from "next/image";
import Link from "next/link";

function OurServices() {
  // Dynamic data for services
  const servicesData = [
    {
      id: 1,
      icon: "/images/icons/service1.svg",
      title: "General Care",
      description:
        "Consult with doctors for non-emergency medical conditions—fast and stress-free.",
      features: ["Colds", "Flu", "Allergies", "Infections"],
      link: "/services/details",
    },
    {
      id: 2,
      icon: "/images/icons/service2.svg",
      title: "Mental Health",
      description:
        "Your emotional well-being matters—get the support you need privately and securely.",
      features: [
        "Therapy Sessions",
        "Anxiety",
        "Depression",
        "Stress Management",
      ],
      link: "/services/details",
    },
    {
      id: 3,
      icon: "/images/icons/service3.svg",
      title: "Skin Health",
      description:
        "Receive expert advice and prescriptions without waiting weeks for an in-person visit.",
      features: ["Acne", "Eczema", "Skin Rashes", "Prescriptions"],
      link: "/services/details",
    },
    {
      id: 4,
      icon: "/images/icons/service4.svg",
      title: "Child Care",
      description:
        "We care for your little ones with trusted doctors and family-friendly support.",
      features: ["Fevers", "Coughs & Colds", "Rashes", "Development Concerns"],
      link: "/services/details",
    },
    {
      id: 5,
      icon: "/images/icons/service5.svg",
      title: "Rx Refills",
      description:
        "Stay consistent with treatment—no need to revisit the clinic every time.",
      features: [
        "Blood Pressure Meds",
        "Diabetes Meds",
        "Asthma Inhalers",
        "Allergy Medications",
      ],
      link: "/services/details",
    },
    {
      id: 6,
      icon: "/images/icons/service6.svg",
      title: "Chronic Care",
      description:
        "Manage long-term conditions with routine virtual check-ins and follow-ups.",
      features: ["Diabetes", "Hypertension", "Asthma", "Thyroid Disorders"],
      link: "/services/details",
    },
  ];

  // Dynamic data for the large image section
  const largeImageData = {
    backgroundImage: "/images/services/service.jpg",
    layerImage: "/images/mdbrdg_large.png",
    description: "Explore even more ways we can support your health",
    link: {
      href: "/services",
      text: "View More Services",
    },
    shapeImage: "/images/services/shape.png",
  };

  return (
    <>
      <div className="services-area ptb-140">
        <div className="container">
          <div className="section-title">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-7 col-md-12">
                <div className="left">
                  <span className="sub">Our Services</span>
                  <h2>Comprehensive Virtual Healthcare—Tailored to You</h2>
                </div>
              </div>
              <div className="col-lg-5 col-md-12">
                <div className="right">
                  <p>
                    We offer a full suite of virtual care options designed to
                    support your well-being—because your health needs don&apos;t
                    stop, and neither do we.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center g-4">
            {servicesData.map((service, index) => (
              <div key={index} className="col-xl-3 col-md-6">
                <div className="service-card">
                  <div className="top">
                    <div className="icon">
                      <Image
                        src={service.icon}
                        alt="icon"
                        width={60}
                        height={60}
                      />
                    </div>
                    <h3>
                      <Link href={service.link}>{service.title}</Link>
                    </h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="bottom">
                    <ul className="list">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>
                          <i className="ri-check-line"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="service-btn">
                      <Link href={service.link} className="default-btn">
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
                        Learn More
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

            <div className="col-xl-6 col-md-12">
              <div
                className="services-large-image"
                style={{
                  backgroundImage: `url(${largeImageData.backgroundImage})`,
                }}
              >
                <div className="wrap-content">
                  <div className="image">
                    <Image
                      src={largeImageData.layerImage}
                      alt="layer"
                      width={116}
                      height={96}
                    />
                  </div>
                  <p>{largeImageData.description}</p>
                  <Link href={largeImageData.link.href} className="link-btn">
                    {largeImageData.link.text}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                    >
                      <path
                        d="M12.5 0.0117188H0.5C0.224 0.0117188 0 0.235719 0 0.511719C0 0.787719 0.224 1.01172 0.5 1.01172H11.2928L0.1465 12.1582C-0.04875 12.3535 -0.04875 12.67 0.1465 12.8652C0.24425 12.963 0.372 13.0117 0.5 13.0117C0.628 13.0117 0.756 12.963 0.8535 12.8652L12 1.71872V12.5117C12 12.7877 12.224 13.0117 12.5 13.0117C12.776 13.0117 13 12.7877 13 12.5117V0.511719C13 0.235719 12.776 0.0117188 12.5 0.0117188Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                  <div className="shape">
                    <Image
                      src={largeImageData.shapeImage}
                      alt="shape"
                      width={159}
                      height={135}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OurServices;
