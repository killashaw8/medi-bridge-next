import { NextPage } from "next";
import MyOrders from "@/libs/components/order/MyOrders";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const Orders: NextPage = () => {
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

      <MyOrders />
      
    </>
  );
}

export default withLayoutBasic(Orders);
