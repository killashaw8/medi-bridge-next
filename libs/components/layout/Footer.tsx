import React from "react";
import Image from "next/image";
import Link from "next/link";

// Define interfaces for our data structure
interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterLink {
  text: string;
  url: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface AppButton {
  name: string;
  url: string;
  image: string;
  alt: string;
}

interface FooterData {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  description: string;
  socialLinks: SocialLink[];
  sections: FooterSection[];
  appButtons: AppButton[];
  copyright: {
    text: string;
    owner: string;
    ownerUrl: string;
  };
  complianceBadges: string[];
}

// Dynamic data object
const footerData: FooterData = {
  logo: {
    src: "/images/mdbrdg_large.png",
    alt: "logo",
    width: 134,
    height: 35,
  },
  description:
    "MediBridge is a modern telemedicine platform committed to making high-quality healthcare accessible, affordable, and patient-centered.",
  socialLinks: [
    {
      platform: "facebook",
      url: "https://www.facebook.com/",
      icon: "/images/icons/facebook.svg",
    },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/",
      icon: "/images/icons/linkedin.svg",
    },
    {
      platform: "instagram",
      url: "https://www.instagram.com/",
      icon: "/images/icons/instagram.svg",
    },
    {
      platform: "x",
      url: "https://x.com/",
      icon: "/images/icons/x.svg",
    },
  ],
  sections: [
    {
      title: "Company",
      links: [
        { text: "About Us", url: "/about-us" },
        { text: "Our Doctors", url: "/doctors" },
        { text: "Services", url: "/services" },
        { text: "Our Blog", url: "/blogs" },
        { text: "Contact Us", url: "/contact-us" },
      ],
    },
    {
      title: "Support",
      links: [
        { text: "FAQs", url: "/faq" },
        { text: "Contact Us", url: "/contact-us" },
        { text: "Insurance Info", url: "/login" },
        { text: "Technical Help", url: "/login" },
        { text: "Privacy Policy", url: "/privacy-policy" },
      ],
    },
    {
      title: "Contact",
      links: [
        {
          text: "Email: medibridgeapp@gmail.com",
          url: "mailto:medibridgeapp@gmail.com",
          isExternal: true,
        },
        {
          text: "Phone: +82 (010) 5689-9698",
          url: "tel: 010-5689-9698",
          isExternal: true,
        },
      ],
    },
  ],
  appButtons: [
    {
      name: "Google Play",
      url: "https://play.google.com/store/apps",
      image: "/images/app/google-play.svg",
      alt: "google-play",
    },
    {
      name: "App Store",
      url: "https://www.apple.com/app-store/",
      image: "/images/app/app-store.svg",
      alt: "app-store",
    },
  ],
  copyright: {
    text: "MediBridge",
    owner: "Rahimjon Halimov",
    ownerUrl: "https://linktr.ee/killashaw8",
  },
  complianceBadges: ["HIPAA Compliant", "GDPR Ready", "SSL Secured"],
};

function Footer() {
  return (
    <>
      <footer className="footer-area">
        <div className="ptb-140">
          <div className="container">
            <div className="footer-top-content">
              <div className="row justify-content-center align-items-center g-4">
                <div className="col-lg-9 col-md-12">
                  <div className="left">
                    <div className="widget-logo">
                      <Link href="/">
                        <Image
                          src={footerData.logo.src}
                          alt={footerData.logo.alt}
                          width={footerData.logo.width}
                          height={footerData.logo.height}
                        />
                      </Link>
                    </div>
                    <p>{footerData.description}</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <ul className="right-social">
                    {footerData.socialLinks.map((link, index) => (
                      <li key={index}>
                        <a href={link.url} target="_blank">
                          <Image
                            src={link.icon}
                            alt={link.platform}
                            width={25}
                            height={25}
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="row justify-content-center g-4">
              <div className="col-lg-9 col-md-12">
                <div className="row justify-content-center g-4">
                  {footerData.sections.map((section, index) => (
                    <div className="col-lg-3 col-sm-6" key={index}>
                      <div className="single-footer-widget">
                        <h3>{section.title}</h3>
                        <ul className="links">
                          {section.links.map((link, linkIndex) => (
                            <li key={linkIndex}>
                              {link.isExternal ? (
                                <a href={link.url}>{link.text}</a>
                              ) : (
                                <Link href={link.url}>{link.text}</Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-3 col-md-12">
                <div className="single-footer-widget end-style">
                  <h3>Download Our App</h3>
                  <ul className="apps-btn">
                    {footerData.appButtons.map((button, index) => (
                      <li key={index}>
                        <Link href={button.url} target="_blank">
                          <Image
                            src={button.image}
                            alt={button.alt}
                            width={196}
                            height={56}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="copyright-area">
            <div className="row justify-content-center align-items-center g-4">
              <div className="col-lg-6 col-md-12">
                <p>
                  © <span>{footerData.copyright.text}</span> is owned by{" "}
                  <a href={footerData.copyright.ownerUrl} target="_blank">
                    {footerData.copyright.owner}
                  </a>
                </p>
              </div>
              <div className="col-lg-6 col-md-12">
                <ul className="lists">
                  {footerData.complianceBadges.map((badge, index) => (
                    <li key={index}>{badge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
