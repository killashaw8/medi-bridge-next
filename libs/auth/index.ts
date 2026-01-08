import jwtDecode from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, LOGIN_WITH_GOOGLE, SIGN_UP } from '@/apollo/user/mutation';
import { DoctorSpecialization } from '../enums/member.enum';
import { T } from '../types/common';


export function getRefreshToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('refreshToken');
}

export function setRefreshToken(token: string | null) {
	if (typeof window === 'undefined') return;
	if (token) localStorage.setItem('refreshToken', token);
	else localStorage.removeItem('refreshToken');
}

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { accessToken , refreshToken, userData } = await requestJwtToken({ nick, password });

		if (accessToken) {
			updateStorage({ accessToken, refreshToken });

			if(userData) {
				updateUserInfoFromResponse(userData);
			} else {
				updateUserInfo(accessToken);
			}
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
		// throw new Error('Login Err');
	}
};

export const logInWithGoogle = async (idToken: string): Promise<void> => {
	try {
		const { accessToken, refreshToken, userData } = await requestGoogleJwtToken({ idToken });

		if (accessToken) {
			updateStorage({ accessToken, refreshToken });

			if (userData) {
				updateUserInfoFromResponse(userData);
			} else {
				updateUserInfo(accessToken);
			}
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
	}
};

export const signUp = async (
	nick: string, 
	password: string, 
	phone: string, 
	type: string, 
	name: string,
	email: string,
	specialization?: DoctorSpecialization, 
	clinicId?: string,
	memberImage?: string
): Promise<void> => {
	try {
		const { accessToken, refreshToken, userData } = await requestSignUpJwtToken({ 
			nick, 
			password, 
			phone, 
			type,
			name,
			email,
			specialization, 
			clinicId,
			memberImage 
		});

		if (accessToken) {
			updateStorage({ accessToken, refreshToken });

			if(userData) {
				updateUserInfoFromResponse(userData);
			} else {
				updateUserInfo(accessToken);
			}
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
		// throw new Error('Login Err');
	}
};

export async function refreshTokens(): Promise<string> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) throw new Error('No refresh token found');

	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', // keep if server stores token in HttpOnly cookie
		body: JSON.stringify({ refreshToken }),
	});

	if (!response.ok) {
		throw new Error('Failed to refresh token');
	}

	const { accessToken, refreshToken: rotatedRefresh } = await response.json();

	if (!accessToken) {
		throw new Error('No access token returned from refresh endpoint');
	}

	setJwtToken(accessToken);
	updateUserInfo(accessToken);

	if (rotatedRefresh) {
		setRefreshToken(rotatedRefresh);
	}

	return accessToken;
}

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ 
	accessToken: string, 
	refreshToken: string | null,
	userData?: T
}> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		console.log('---------- login ----------');
		const { accessToken, refreshToken, ...userData } = result?.data?.login ?? {};

		return { 
			accessToken, 
			refreshToken: refreshToken ?? null,
			userData: userData && Object.keys(userData).length > 0 ? userData : undefined
		};
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

const requestGoogleJwtToken = async ({
	idToken,
}: {
	idToken: string;
}): Promise<{
	accessToken: string;
	refreshToken: string | null;
	userData?: T;
}> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN_WITH_GOOGLE,
			variables: { input: { idToken } },
			fetchPolicy: 'network-only',
		});

		console.log('---------- login (google) ----------');
		const { accessToken, refreshToken, ...userData } = result?.data?.loginWithGoogle ?? {};

		return {
			accessToken,
			refreshToken: refreshToken ?? null,
			userData: userData && Object.keys(userData).length > 0 ? userData : undefined,
		};
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors?.[0]?.message) {
			case 'No member with that nick!':
				await sweetMixinErrorAlert('Account not found');
				break;
			case 'You have been blocked, contact restaurant!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
			default:
				await sweetMixinErrorAlert('Google login failed');
		}
		throw new Error('token error');
	}
};


const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
	name,
	email,
	specialization,
	clinicId,
	memberImage
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
	name: string;
	email: string;
	specialization?: DoctorSpecialization;
	clinicId?: string;
	memberImage?: string;
}): Promise<{ 
	accessToken: string, 
	refreshToken: string | null,
	userData?: T 
}> => {
	const apolloClient = await initializeApollo();

	try {
		const input: T = {
			memberNick: nick,
			memberPassword: password,
			memberPhone: phone,
			memberType: type,
			memberFullName: name,
			memberEmail: email,
		};

		if (specialization) {
			input.specialization = specialization;
		}
		if (clinicId) {
			input.clinicId = clinicId;
		}
		if (memberImage) {
			input.memberImage = memberImage;
		}		

		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: input,
			},
			fetchPolicy: 'network-only',
		});

		console.log('---------- login ----------');
		const { accessToken, refreshToken, ...userData } = result?.data?.signup ?? {};

		return { 
			accessToken, 
			refreshToken: refreshToken ?? null,
			userData: userData && Object.keys(userData).length > 0 ? userData : undefined
		};
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const updateStorage = ({ accessToken, refreshToken }: { 
	accessToken: string, refreshToken: string | null
}) => {
	setJwtToken(accessToken);
	if (refreshToken) {
		setRefreshToken(refreshToken);
	}
	window.localStorage.setItem('login', Date.now().toString());
};

const DEFAULT_USER_IMAGE = '/images/users/defaultUser.svg';

const setMemberImageVersion = (userData: any) => {
	if (typeof window === 'undefined') return;
	if (!userData?._id) return;

	const storageKey = `memberImageVersion:${userData._id}`;
	const updatedAt = userData?.updatedAt ? new Date(userData.updatedAt).getTime() : null;

	if (updatedAt && !Number.isNaN(updatedAt)) {
		localStorage.setItem(storageKey, String(updatedAt));
		return;
	}

	if (userData?.memberImage) {
		localStorage.setItem(storageKey, String(Date.now()));
	}
};

export const updateUserInfo = (jwtToken: any, force: boolean = false) => {
	if (!jwtToken) return false;

	try {
		if (!force) {
			const currentUser = userVar();
			if (currentUser?._id && currentUser?.memberImage && currentUser.memberImage !== DEFAULT_USER_IMAGE) {
				console.log('userVar already has data, skipping JWT update to preserve fresh data');
				return true;
			}
		}		
		const claims = jwtDecode<any>(jwtToken);
		
		const userId = claims.sub || claims._id || '';
		
		userVar({
			_id: userId,
			memberType: claims.memberType ?? '',
			memberStatus: claims.memberStatus ?? '',
			authProvider: claims.authProvider ?? '',
			memberPhone: claims.memberPhone ?? '',
			memberNick: claims.memberNick ?? '',
			memberFullName: claims.memberFullName ?? '',
			memberImage: (!claims.memberImage || 
										claims.memberImage === null || 
										claims.memberImage === undefined ||
										String(claims.memberImage).trim() === '')
				? DEFAULT_USER_IMAGE
				: String(claims.memberImage).trim(),
			memberAddress: claims.memberAddress ?? '',
			memberEmail: claims.memberEmail ?? '',
			memberDesc: claims.memberDesc ?? '',
			memberAppointments: claims.memberAppointments ?? 0,
			memberProducts: claims.memberProducts ?? 0,
			memberRank: claims.memberRank ?? 0,
			memberArticles: claims.memberArticles ?? 0,
			memberPoints: claims.memberPoints ?? 0,
			memberLikes: claims.memberLikes ?? 0,
			memberViews: claims.memberViews ?? 0,
			memberComments: claims.memberComments ?? 0,
			memberWarnings: claims.memberWarnings ?? 0,
			memberBlocks: claims.memberBlocks ?? 0,
			clinicId: claims.clinicId ?? '',
			specialization: claims.specialization ?? ''
		});
		
		return true;
	} catch (error) {
		console.error('Error decoding JWT:', error);
		return false;
	}
};

export const updateUserInfoFromResponse = (userData: any) => {
	if (!userData) return false;

	try {
		setMemberImageVersion(userData);

		userVar({
			_id: userData._id || '',
			memberType: userData.memberType ?? '',
			memberStatus: userData.memberStatus ?? '',
			authProvider: userData.authProvider ?? '',
			memberPhone: userData.memberPhone ?? '',
			memberNick: userData.memberNick ?? '',
			memberFullName: userData.memberFullName ?? '',
			memberImage: userData.memberImage || DEFAULT_USER_IMAGE,
			memberAddress: userData.memberAddress ?? '',
			memberEmail: userData.memberEmail ?? '',
			memberDesc: userData.memberDesc ?? '',
			memberAppointments: userData.memberAppointments ?? 0,
			memberProducts: userData.memberProducts ?? 0,
			memberRank: userData.memberRank ?? 0,
			memberArticles: userData.memberArticles ?? 0,
			memberPoints: userData.memberPoints ?? 0,
			memberLikes: userData.memberLikes ?? 0,
			memberViews: userData.memberViews ?? 0,
			memberComments: userData.memberComments ?? 0,
			memberWarnings: userData.memberWarnings ?? 0,
			memberBlocks: userData.memberBlocks ?? 0,
			clinicId: userData.clinicId ?? '',
			specialization: userData.specialization ?? ''
		});
		
		return true;
	} catch (error) {
		console.error('Error updating user info from response:', error);
		return false;
	}
};

export const logOut = (options?: { reload?: boolean }) => {
	deleteStorage();
	deleteUserInfo();
	const shouldReload = options?.reload ?? true;
	if (shouldReload) {
		window.location.reload();
	}
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		authProvider: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberEmail: '',
		memberDesc: '',
		memberAppointments: 0,
		memberProducts: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberComments: 0,
		memberWarnings: 0,
		memberBlocks: 0,
		clinicId: '',
		specialization: ''
	});
};
