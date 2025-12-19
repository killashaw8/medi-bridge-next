import { NextPage } from "next";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import FeedbackLists from "@/libs/components/common/FeedbackLists";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";



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

      <FeedbackLists/>
    </>
  );
}

export default withLayoutBasic(Feedbacks);