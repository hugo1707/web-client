import type { AppProps, AppContext } from 'next/app'
import { ChakraProvider } from "@chakra-ui/react"

import cookie from 'cookie'
import type { IncomingMessage } from "http"
import { SSRKeycloakProvider, SSRCookies } from '@react-keycloak/ssr';

import theme from "theme"


const keycloakCfg = {
  realm: 'auth-realm',
  url: 'http://localhost:8080/auth',
  clientId: 'auth-app'
}

interface InitialProps {
  cookies: unknown
}

function MyApp({ Component, pageProps, cookies }: AppProps & InitialProps) {
  return (
    <SSRKeycloakProvider keycloakConfig={keycloakCfg} persistor={SSRCookies(cookies)}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SSRKeycloakProvider>
  )
}

function parseCookies(req?: IncomingMessage) {
  if (!req || !req.headers) {
    return {}
  }
  return cookie.parse(req.headers.cookie || '')
}

MyApp.getInitialProps = async (context: AppContext) => {
  // Extract cookies from AppContext
  return {
    cookies: parseCookies(context?.ctx?.req)
  }
}

export default MyApp