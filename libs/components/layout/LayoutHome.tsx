import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Chat from '../Chat';
import Navbar from './Navbar';
import Footer from './Footer';
import GoTop from './GoTop';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const user = useReactiveVar(userVar);
		const DEFAULT_USER_IMAGE = '/images/users/defaultUser.svg'

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			const currentUser = userVar();
			if (jwt) {
				if (!currentUser?._id || !currentUser?.memberImage || currentUser.memberImage === DEFAULT_USER_IMAGE) {
					updateUserInfo(jwt);
				}
			}
		}, []);

		/** HANDLERS **/
		return (
			<>
				<Head>
					<title>MediBridge</title>
					<meta name={'title'} content={`MediBridge`} />
				</Head>
				<Stack>
					<Stack id={'top'}>
						<Navbar />
					</Stack>

					<Stack className={'header-main'}>
						<Stack className={'container'}>
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<Chat />
					<GoTop />

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	}
};

export default withLayoutMain;
