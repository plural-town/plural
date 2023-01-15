import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { theme } from "@plural-town/theme";
import { SwitchingModalProvider } from "@plural/ui";
import { AuthStoreProvider } from "@plural/use-auth";
import { IdentityStoreProvider } from "@plural/use-identities";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import { Heebo, Overpass } from "@next/font/google";

const heebo = Heebo({
  subsets: ["latin"],
});

const overpass = Overpass({
  subsets: ["latin"],
});

// https://coolors.co/870058-f2d0a4-a4303f-ffeccc-c8d6af

const brand = {
  "50": "#FFE5F6",
  "100": "#FFB8E6",
  "200": "#FF8AD6",
  "300": "#FF5CC6",
  "400": "#FF2EB6",
  "500": "#FF00A6",
  "600": "#CC0085",
  "700": "#990064",
  "800": "#660042",
  "900": "#330021",
};

const secondary = {
  "50": "#F9EBED",
  "100": "#EFC8CD",
  "200": "#E4A4AD",
  "300": "#DA818C",
  "400": "#D05D6C",
  "500": "#C53A4C",
  "600": "#9E2E3D",
  "700": "#76232D",
  "800": "#4F171E",
  "900": "#270C0F",
};

const accent = {
  "50": "#FCF3E9",
  "100": "#F6DFC1",
  "200": "#F0CA98",
  "300": "#EBB570",
  "400": "#E5A148",
  "500": "#DF8C20",
  "600": "#B2701A",
  "700": "#865413",
  "800": "#59380D",
  "900": "#2D1C06",
};

const customTheme = extendTheme(
  {
    fonts: {
      heading: heebo.style.fontFamily,
      body: overpass.style.fontFamily,
    },
    colors: {
      brand,
      secondary,
      accent,
    },
    styles: {
      global: (props) => ({
        body: {
          bg: mode("gray.100", "gray.800")(props),
        },
      }),
    },
  },
  theme,
);

const queryClient = new QueryClient();

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* TODO: Allow pages to have custom icons */}
        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-128.png" sizes="128x128" />
        <link rel="icon" href="/favicon-192.png" sizes="192x192" />
        <style>{"body { display: block }"}</style>
      </Head>
      <main>
        <QueryClientProvider client={queryClient}>
          <AuthStoreProvider>
            <IdentityStoreProvider>
              <ChakraProvider theme={customTheme}>
                <SwitchingModalProvider>
                  <Component {...pageProps} />
                </SwitchingModalProvider>
              </ChakraProvider>
            </IdentityStoreProvider>
          </AuthStoreProvider>
        </QueryClientProvider>
      </main>
    </>
  );
}

export default CustomApp;
