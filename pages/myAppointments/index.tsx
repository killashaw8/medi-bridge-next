import { NextPage } from "next";
import BookAnAppointmentForm from "@/libs/components/appointment/BookAnAppointmentForm";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import AppointmentSidebar from "@/libs/components/appointment/AppointmentSidebar";


const MyAppointments: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Explore Your Appointments"
        shortText="Get informed about your appointments and don't miss the session"
        homePageUrl="/"
        homePageText="Home"
        activePageText="My Appointments"
        image="/images/page-banner.png"
      />



      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(MyAppointments);
