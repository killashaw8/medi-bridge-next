import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navbar from './Navbar';
import GoTop from './GoTop';

const withLayoutChat = (Component: any) => {
  return (props: any) => {
    const router = useRouter();
    const { t, i18n } = useTranslation('common');
    const user = useReactiveVar(userVar);
    const [authChecked, setAuthChecked] = useState(false);
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
      setAuthChecked(true);
    }, []);

    useEffect(() => {
      if (!authChecked) return;
      if (user?._id) return;
      const token = getJwtToken();
      if (!token) {
        router.push('/');
      }
    }, [authChecked, user?._id, router]);

    /** HANDLERS **/
    if (!authChecked || !user?._id) {
      return null;
    }

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

          <Stack id={'main'}>
            <Component {...props} />
          </Stack>

          <Chat />
          <GoTop />

        </Stack>
      </>
    );
  }
};

export default withLayoutChat;
