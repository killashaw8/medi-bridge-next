import { NextPage } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

const ThankYou: NextPage = () => {
  return (
    <div className="profile-authentication-area pt-140">
      <div className="container">
        <div className="profile-authentication-inner" style={{ textAlign: "center" }}>
          <h2>Thank You</h2>
          <p>Your appointment has been booked successfully. We'll be in touch soon.</p>
          <div style={{ marginTop: 24 }}>
            <Link href="/" className="link-btn">
              Return Home
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="14"
                viewBox="0 0 13 14"
                fill="none"
              >
                <path
                  d="M12.5 0.0117188H0.5C0.224 0.0117188 0 0.235719 0 0.511719C0 0.787719 0.224 1.01172 0.5 1.01172H11.2928L0.1465 12.1582C-0.04875 12.3535 -0.04875 12.67 0.1465 12.8652C0.24425 12.963 0.372 13.0117 0.5 13.0117C0.628 13.0117 0.756 12.963 0.8535 12.8652L12 1.71872V12.5117C12 12.7877 12.224 13.0117 12.5 13.0117C12.776 13.0117 13 12.7877 13 12.5117V0.511719C13 0.235719 12.776 0.0117188 12.5 0.0117188Z"
                  fill="white"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withLayoutBasic(ThankYou);
