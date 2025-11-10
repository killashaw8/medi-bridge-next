import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="robots" content="index,follow" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        {/* SEO */}
				<meta name="keyword" content={'medibridge, medibridge.uz, medi-bridge, appointment, clinic appointment'} />
				<meta
					name={'description'}
					content={
						'Make appointments in clinics from anywhere and everywhere in South Korea. The best and the easiest platform in the sector. | ' +
						'Записывайтесь на приём в клиники из любой точки Южной Кореи. Лучшая и самая удобная платформа в отрасли. | ' +
						'대한민국 어디에서나 병원 예약을 간편하게 하세요. 업계 최고이자 가장 편리한 플랫폼입니다.'
					}
				/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
