import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, makeVar } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

export const starredVar = makeVar<string[]>([]);

const AppWithApollo = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const httpLink = createHttpLink({
    uri: process.env.REACT_APP_GRAPHQL_URI
  })

  const authLink = setContext(async (_, { headers }) => {
    const accessToken = isAuthenticated
      ? await getAccessTokenSilently()
      : undefined

    if (accessToken) {
      return {
        headers: {
          ...headers,
          authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      };
    } else {
      return {
        headers: {
          ...headers,
          // can set authorization headers here or a "default" authorization header if needed
        }
      }
    }
  })

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Business: {
          fields: {
            isStarred: {
              read(_, { readField }) {
                const businessId = readField<string>("businessId");
                return businessId && starredVar() ? starredVar().includes(businessId) : false
              },
            },
          },
        },
      },
    }),
  })

  return (
    <ApolloProvider client={client}>
      <App/>
    </ApolloProvider>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      redirectUri={window.location.origin}
    >
      <AppWithApollo/>
    </Auth0Provider>
  </React.StrictMode>
);
reportWebVitals();