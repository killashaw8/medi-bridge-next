import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import RegisterForm from "@/libs/components/layout/RegisterForm";
import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    }
  }
}

const Signup: NextPage = () => {
  return (
    <>
      <PageBanner
        pageTitle="Create Your Account"
        shortText="Join MediBridge today to book appointments, access expert medical care, and manage your health easily from anywhere."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Register"
        image="/images/page-banner.png"
      />

      <RegisterForm />
    </>
  );
}

export default withLayoutBasic(Signup);
