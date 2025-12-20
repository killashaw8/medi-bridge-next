import { NextPage } from "next";
import BookAppointment from "@/libs/components/appointment/BookAppointment";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const Appointment: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Schedule Your Visit"
        shortText="Get expert care at your convenience—book a virtual consultation in minutes."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Book An Appointment"
        image="/images/page-banner.png"
      />

      <BookAppointment />

      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(Appointment);
