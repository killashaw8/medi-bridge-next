import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';;
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/
		return (
			<>
				<Head>
					<title>MediBridge</title>
					<meta name={'title'} content={`MediBridge`} />
				</Head>
				<Stack id="pc-wrap">
					<Stack id={'top'}>
						<Navbar />
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<Chat />

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	}
};

export default withLayoutFull;
