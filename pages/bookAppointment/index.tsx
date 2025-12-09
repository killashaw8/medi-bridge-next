import { NextPage } from "next";
import BookAnAppointmentForm from "@/libs/components/appointment/BookAnAppointmentForm";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import AppointmentSidebar from "@/libs/components/appointment/AppointmentSidebar";


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

      <BookAnAppointmentForm />

      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(Appointment);
