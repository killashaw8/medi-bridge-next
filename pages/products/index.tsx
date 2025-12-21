import { NextPage } from "next";
import BookAppointment from "@/libs/components/appointment/BookAppointment";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const Products: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Welcome to our shopping platform"
        shortText="Explore wide range of product lines"
        homePageUrl="/"
        homePageText="Home"
        activePageText="Products"
        image="/images/page-banner.png"
      />



    </>
  );
}

export default withLayoutBasic(Products);
