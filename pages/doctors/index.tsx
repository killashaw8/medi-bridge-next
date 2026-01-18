import { NextPage } from "next";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import Cta from "@/libs/components/homepage/Cta";
import HowItWorks2 from "@/libs/components/common/HowItWorks";
import DoctorsList from "@/libs/components/clinics-doctors/DoctorsList";


const Doctors: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Trusted Medical Experts"
        shortText="Connect with board-certified doctors across multiple specialties—ready to provide expert care whenever you need it."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Doctors"
        image="/images/page-banner.png"
      />

      <DoctorsList />

      <HowItWorks2 />

      <Cta />
    </>
  );
}

export default withLayoutBasic(Doctors);
