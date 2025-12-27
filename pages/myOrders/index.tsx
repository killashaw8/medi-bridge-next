import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { getJwtToken, updateUserInfo } from "@/libs/auth";
import MyOrders from "@/libs/components/order/MyOrders";
import PageBanner from "@/libs/components/layout/PageBanner";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";


const Orders: NextPage = () => {
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
