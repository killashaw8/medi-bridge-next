import type { AppProps } from "next/app";
import { ApolloProvider, useMutation } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { useApollo } from '@/apollo/client';
import { appWithTranslation } from "next-i18next";
import type { UserConfig } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { TRACK_VISIT } from "@/apollo/user/mutation";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "../styles/animate.min.css";
import "swiper/css";
import "swiper/css/bundle";
import "../styles/style.scss";
import "../styles/responsive.scss";

const VisitTracker = () => {
  const router = useRouter();
  const [trackVisit] = useMutation(TRACK_VISIT);

  useEffect(() => {
    const getVisitorId = () => {
      if (typeof window === "undefined") return "";
      const key = "mb_visitor_id";
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;

      const id =
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(key, id);
      return id;
    };

    const sendVisit = (path: string) => {
      const visitorId = getVisitorId();
      const referrer = typeof document === "undefined" ? "" : document.referrer || "";
      const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent || "";

      trackVisit({
        variables: {
          input: {
            visitorId,
            path,
            referrer,
            userAgent,
          },
        },
      }).catch(() => undefined);
    };

    sendVisit(router.asPath);

    const handleRouteChange = (url: string) => sendVisit(url);
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.asPath, router.events, trackVisit]);

  return null;
};

function App({ Component, pageProps }: AppProps) {
	const client = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={client}>
        <CssBaseline />
        <VisitTracker />
        <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default appWithTranslation(App, nextI18nextConfig as UserConfig);
