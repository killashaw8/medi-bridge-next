import React from "react";
import Image from "next/image";

// Define the type for contact info items
type ContactInfoItem = {
  id: number;
  icon: string;
  title: string;
  content: string;
  link?: string;
  linkType?: "email" | "phone" | "none";
};

const ContactInfo = () => {
  // Dynamic contact data
  const contactData: ContactInfoItem[] = [
    {
      id: 1,
      icon: "/images/mail.svg",
      title: "Email Support",
      content: "medibridgeapp@gmail.com",
      link: "mailto:medibridgeapp@gmail.com",
      linkType: "email",
    },
    {
      id: 2,
      icon: "/images/phone.svg",
      title: "Phone Support (24/7)",
      content: "+82 (010) 5689-9698",
      link: "tel:01045899698",
      linkType: "phone",
    },
    {
      id: 3,
      icon: "/images/map.svg",
      title: "Head Office (Virtual)",
      content: "192-12 Seoljukro, Bukgu, Gwangju, South Korea (61185)",
      linkType: "none",
    },
  ];

  // Function to render content based on link type
  const renderContent = (item: ContactInfoItem) => {
    if (item.linkType === "email") {
      return <a href={item.link}>{item.content}</a>;
    } else if (item.linkType === "phone") {
      return <a href={item.link}>{item.content}</a>;
    } else {
      return <strong>{item.content}</strong>;
    }
  };

  return (
    <>
      <div className="contact-info-area pt-140">
        <div className="container">
          <div className="row justify-content-center g-4">
            {contactData.map((item) => (
              <div key={item.id} className="col-lg-4 col-sm-6">
                <div className="contact-info-card">
                  <div className="icon">
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={30}
                      height={30}
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <div className="content">
                    <span>{item.title}</span>
                    {renderContent(item)}
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

export default ContactInfo;
