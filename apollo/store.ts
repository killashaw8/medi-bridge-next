import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { CartItem } from '../libs/types/order/cart';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	authProvider: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberEmail: '',
	memberAddress: '',
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
	specialization: '',
});

export const cartVar = makeVar<CartItem[]>([]);

// @ts-ignore
export const socketVar = makeVar<WebSocket>();
