import Head from 'next/head'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta property="og:title" content="Buffer" key="title" />
        <meta
          property="og:image"
          content="/android-chrome-192x192.png"
          key="image"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon-16x16.png" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          property="og:description"
          key="description"
          content="Buffer is an on-chain non-custodial peer-to-pool options trading protocol"
        />
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
