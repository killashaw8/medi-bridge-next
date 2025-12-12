import { NextPage } from "next";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import PageBanner from "@/libs/components/layout/PageBanner";
import ContactInfo from "@/libs/components/contactUs/ContactInfo";
import ContactForm from "@/libs/components/contactUs/ContactForm";


const ContactUs: NextPage = () => {
  return (
    <>

      <PageBanner
        pageTitle="We're Here to Help"
        shortText="Have questions about our services, need support, or want to speak with our team? Reach out—we're ready to assist you 24/7."
        homePageUrl="/"
        homePageText="Home"
        activePageText="Contact Us"
        image="/images/page-banner.png"
      />

      <ContactInfo />

      <ContactForm />

    </>
  );
}

export default withLayoutBasic(ContactUs);