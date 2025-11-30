import BlogClassic from "@/libs/components/blog/BlogClassic";
import SubscribeForm from "@/libs/components/blog/SubscribeForm";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
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

const Blog: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Insights, Tips & Trusted Health Advice"
        shortText="Explore expert-written articles on telemedicine, wellness, mental health, and everyday care—designed to help you live healthier, smarter, and more confidently."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Blog"
        image="/images/page-banner.png"
      />

      <BlogClassic />

      <SubscribeForm />
    </>
  );
}

export default withLayoutBasic(Blog);
