import { NextPage } from "next";
import AboutUsContent from "@/libs/components/aboutUs/AboutUsContent";
import Benefits from "@/libs/components/homepage/Benefits";
import Cta from "@/libs/components/homepage/Cta";
import Feedbacks from "@/libs/components/homepage/Feedbacks";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import HowItWorks from "@/libs/components/homepage/HowItWorks";
import WhatDrivesUs from "@/libs/components/homepage/WhatDrivesUs";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const AboutUs: NextPage = () => {
  return (
    <>


      
      <PageBanner
        pageTitle="About MediBridge"
        shortText="We are dedicated to transforming healthcare by making expert medical care accessible, affordable, and compassionate—wherever you are"
        homePageUrl="/"
        homePageText="Home"
        activePageText="About MediBridge"
        image="/images/page-banner.png"
      />

      <Benefits />

      <AboutUsContent />

      <HowItWorks />

      <WhatDrivesUs />

      <Feedbacks />

      <div className="pt-140">
        <FrequentlyAskedQuestions />
      </div>

      <Cta />
    </>
  );
}

export default withLayoutBasic(AboutUs);
