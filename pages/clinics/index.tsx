import { NextPage } from "next";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import Cta from "@/libs/components/homepage/Cta";
import HowItWorks2 from "@/libs/components/common/HowItWorks2";
import ClinicsList from "@/libs/components/clinics-doctors/ClinicsList";

const Clinics: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Trusted Clinics"
        shortText="Find out about clinics"
        homePageUrl="/"
        homePageText="Home"
        activePageText="Clinics"
        image="/images/page-banner.png"
      />

      <ClinicsList />

      <HowItWorks2 />

      <Cta />
    </>
  );
}

export default withLayoutBasic(Clinics);
