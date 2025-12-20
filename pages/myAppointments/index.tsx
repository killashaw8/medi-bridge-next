import { NextPage } from "next";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import AppointmentsList from "@/libs/components/appointment/AppointmentsList";


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

      <AppointmentsList />

      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(MyAppointments);
