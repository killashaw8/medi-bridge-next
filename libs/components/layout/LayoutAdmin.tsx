import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
		const [title, setTitle] = useState('admin');
		const [loading, setLoading] = useState(true);
		const DEFAULT_USER_IMAGE = '/images/users/defaultUser.svg';

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			const currentUser = userVar();
			if (jwt) {
				if (!currentUser?._id || !currentUser?.memberImage || currentUser.memberImage === DEFAULT_USER_IMAGE) {
					updateUserInfo(jwt);
				}
			}

			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="pc-wrap" className="admin">
				{/*@ts-ignore*/}
				<Component {...props} setSnackbar={setSnackbar} setTitle={setTitle} />
			</main>
		);
	};
};

export default withAdminLayout;
