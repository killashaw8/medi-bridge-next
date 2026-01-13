import type { AppProps } from "next/app";
import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { useApollo } from '@/apollo/client';
import { appWithTranslation } from "next-i18next";
import type { UserConfig } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "../styles/animate.min.css";
import "swiper/css";
import "swiper/css/bundle";
import "../styles/style.scss";
import "../styles/responsive.scss";

function App({ Component, pageProps }: AppProps) {
	const client = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={client}>
        <CssBaseline />
        <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default appWithTranslation(App, nextI18nextConfig as UserConfig);
