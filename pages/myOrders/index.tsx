import { NextPage } from "next";
import FrequentlyAskedQuestions from "@/libs/components/homepage/FrequentlyAskedQuestions";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const MyOrders: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="Explore Your Orders"
        shortText="Get informed about your orders."
        homePageUrl="/"
        homePageText="Home"
        activePageText="My Orders"
        image="/images/page-banner.png"
      />



      <div className="linear-gradient-inner">
        <FrequentlyAskedQuestions />
      </div>
    </>
  );
}

export default withLayoutBasic(MyOrders);
