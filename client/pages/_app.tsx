import Head from 'next/head'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Staking</title>
        <meta property="og:title" content="Buffer" key="title" />
        <meta
          property="og:image"
          content="https://astrogallery.io/ICONO.png"
          key="image"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="icon"
          href="https://astrogallery.io/ICONO.png"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:description" key="description" content="" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />{' '}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <Component {...pageProps} />{' '}
    </>
  )
}

export default MyApp
