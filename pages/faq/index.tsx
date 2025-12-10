import Benefits from "@/libs/components/homepage/Benefits";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import { NextPage } from "next";

const FAQ: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Frequently Asked Questions"
        shortText="Find quick answers to common questions about MediBridge's services, appointments, and healthcare support."
        homePageUrl="/"
        homePageText="Home"
        activePageText="FAQ's"
        image="/images/page-banner.png"
      />

      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>

    </>
  );
}

export default withLayoutBasic(FAQ);
