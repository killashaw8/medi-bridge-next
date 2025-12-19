import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import { NextPage } from "next";


const Feedbacks: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="What Our Patients Say"
        shortText="We value every voice. Hear real stories and experiences from patients who trusted MediBridge with their healthcare journey."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Feedbacks"
        image="/images/page-banner.png"
      />


      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(Feedbacks);