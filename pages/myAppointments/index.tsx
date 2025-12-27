import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { getJwtToken, updateUserInfo } from "@/libs/auth";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import AppointmentsList from "@/libs/components/appointment/AppointmentsList";


const MyAppointments: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked) {
      const token = getJwtToken();
      if (token && !user?._id) {
        updateUserInfo(token, true);
      }
      setAuthChecked(true);
      return;
    }

    if (!user?._id) {
      router.push("/");
    }
  }, [authChecked, user?._id, router]);

  if (!authChecked || !user?._id) {
    return null;
  }

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
