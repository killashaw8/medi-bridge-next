import { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";

const ThankYouRedirect: NextPage = () => {
  const router = useRouter();

  // Redirect to the correct thank-you page
  useEffect(() => {
    router.replace("/bookAppointment/thank-you");
  }, [router]);

  return null; // Nothing to render, just redirect
};

export default ThankYouRedirect;

