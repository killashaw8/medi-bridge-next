import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import LoginForm from "@/libs/components/layout/LoginForm";
import Navbar from "@/libs/components/layout/Navbar";
import PageBanner from "@/libs/components/layout/PageBanner";
import { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common"])),
    },
  };
};

const Login: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Welcome Back"
        shortText="Log in to your MediBridge account to manage appointments, access medical records, and stay connected with your healthcare providers."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Login"
        image="/images/page-banner.png"
      />

      <LoginForm />
    </>
  );
}

export default withLayoutBasic(Login);