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
    uri: "http://localhost:4000"
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
                // const businessId = readField<string>("businessId");
                // return businessId ? starredVar().includes(businessId) : false
                // @ts-ignore
                return starredVar().includes(readField("businessId"));
              },
            },
          },
        },
      },
    }),
    // uri: "http://localhost:4000/"
  })

  return (
    <ApolloProvider client={client}>
      <App/>
    </ApolloProvider>
  )
}



// client.query({
//   query: gql(`{
//     businesses{
//       name
//     }
//   }`)
// })
//   .then((result) => console.log(result))

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-xe4efgq85eubuz2t.us.auth0.com"
      clientId="m8vwSixpfNfwHSNHRHQVggIO2yIsOtYs"
      redirectUri={window.location.origin}
      // audience="https://reviews.grandstack.io"
    >
      <AppWithApollo/>
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function 
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();