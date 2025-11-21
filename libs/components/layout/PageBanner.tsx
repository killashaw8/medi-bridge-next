import React from "react";
import Image from "next/image";
import Link from "next/link";

interface PageBannerProps {
  pageTitle: string;
  shortText: string;
  homePageUrl: string;
  homePageText: string;
  activePageText: string;
  image?: string;
}

function PageBanner({
  pageTitle,
  homePageUrl,
  homePageText,
  activePageText,
  shortText,
  image = "/images/page-banner.png",
}: PageBannerProps) {
  return (
    <>
      <div className="page-banner-area">
        <div className="container">
          <div className="row justify-content-center align-items-center g-0">
            <div className="col-lg-10 col-md-12">
              <div className="page-banner-content section-title-animation animation-style2">
                <ul className="meta">
                  <li>
                    <Link href={homePageUrl}>{homePageText}</Link>
                  </li>
                  <li>{activePageText}</li>
                </ul>
                <h2>{pageTitle}</h2>
                <p>{shortText}</p>
              </div>
            </div>
            <div className="col-lg-2 col-md-12">
              <div className="page-banner-image">
                <Image
                  src={image}
                  alt="Page Banner Image"
                  width={428}
                  height={562}
                  onError={(e) => {
                    if (image !== "/images/page-banner.png") {
                      e.currentTarget.src = "/images/page-banner.png";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PageBanner;
