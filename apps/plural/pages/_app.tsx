import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from 'next/app';
import Head from 'next/head';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to plural!</title>
        <style>{ "body { display: block }" }</style>
      </Head>
      <main>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </main>
    </>
  );
}

export default CustomApp;
