import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import HeroBanner from '@/libs/components/homepage/HeroBanner';
import Benefits from '@/libs/components/homepage/Benefits';
import AboutUs from '@/libs/components/homepage/AboutUs';
import HowItWorks from '@/libs/components/homepage/HowItWorks';
import OurServices from '@/libs/components/homepage/OurServices';
import OurDoctors from '@/libs/components/homepage/OurDoctors';
import OurBlog from '@/libs/components/homepage/OurBlog';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<>
			<Stack>
				<HeroBanner />
				<Benefits />
				<AboutUs />
				<OurServices />
				<OurDoctors />
				<OurBlog />
				<HowItWorks />
			</Stack>
		</>
	)
}

export default withLayoutMain(Home);