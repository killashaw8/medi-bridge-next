import { NextPage } from "next";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import Shopping from "@/libs/components/product/Shopping";


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



      <Shopping />

    </>
  );
}

export default withLayoutBasic(Products);
