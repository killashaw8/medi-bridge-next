import type { AppProps } from "next/app";
import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { useApollo } from '@/apollo/client';
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "../styles/animate.min.css";
import "swiper/css";
import "swiper/css/bundle";
import "../styles/style.scss";
import "../styles/responsive.scss";

export default function App({ Component, pageProps }: AppProps) {
	const client = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={client}>
        <CssBaseline />
        <Component {...pageProps} />
    </ApolloProvider>
  );
}
