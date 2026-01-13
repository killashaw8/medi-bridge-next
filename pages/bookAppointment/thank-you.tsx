import { NextPage } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import { useRouter } from "next/router";
import PageBanner from "@/libs/components/layout/PageBanner";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

const ThankYou: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <>
      <PageBanner
        pageTitle="Thank You"
        shortText="Thanks for booking with us!"
        homePageUrl="/"
        homePageText="Home"
        activePageText="Thank You"
        image="/images/page-banner.png"
      />

      <div className="thank-you-area ptb-140">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-12">
              <div className="thank-you-content text-center">
                <div className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                  >
                    <circle cx="40" cy="40" r="40" fill={theme.palette.primary.main} opacity="0.1" />
                    <path
                      d="M40 20C28.9543 20 20 28.9543 20 40C20 51.0457 28.9543 60 40 60C51.0457 60 60 51.0457 60 40C60 28.9543 51.0457 20 40 20ZM35 50L25 40L27.5 37.5L35 45L52.5 27.5L55 30L35 50Z"
                      fill={theme.palette.primary.main}
                    />
                  </svg>
                </div>
                <h2>Thank You for Booking With Us!</h2>
                <p>
                  Your appointment has been booked successfully. We'll be in touch soon.
                </p>
                <p>
                  If your inquiry is urgent, please feel free to reach out to us
                  through our live chat or call us directly.
                </p>
                <Link href="/">
                  <Button variant="contained">Return Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withLayoutBasic(ThankYou);
