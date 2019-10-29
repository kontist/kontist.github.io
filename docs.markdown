---
layout: page
title: Docs
permalink: /docs/
sidebar: true
---

## GraphQL API

### Authorization

To manage the data via our API your application needs to gain access on behalf of the user. This is done through obtaining an access token via [OAuth2](https://tools.ietf.org/html/rfc6749). The access token must then be send in each request in the HTTP header like this: "Authorization: Bearer TOKEN".

If you just want to explore the API you can use the [Playground](/playground) to create and insert such an access token to the HTTP header.

When you want to create your own application you need two kinds of credentials to get such a token: The first part is a fixed pair of client id and client secret. They identify your client application which connects to the API. Each application has its own pair of client id and secret, please use the [API Console](/console) to create your own client credentials.

The second part is obtained through the user and can be done in several ways, here we describe the preferred way through the "Authorization Code" grant type. If you want to develop a pure web application you must use PKCE to not expose the client secret.

#### Authorization Code

In general, the process looks like this:

1. You redirect the user in a browser to an url on our end.
2. The user is required to login and needs to accept your application's authorization request. The browser redirects back to your application with a `code` parameter.
3. Your application can then exchange this `code` together with the `client_secret` into an `access_token` through a backend request to our API.

Let us go through the process step by step. At first we need to send the user to a special url in the browser:

`https://api.kontist.com/api/oauth/authorize?scope=offline&response_type=code&client_id=78b5c170-a600-4193-978c-e6cb3018dba9&redirect_uri=https://your-application/callback&state=OPAQUE_VALUE`

Adjust the parameters like this:

| Parameter     | Description                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| scope         | Space delimited list of scopes your application is going to access. Please see the list below.                       |
| response_type | Set fixed as "code".                                                                                                 |
| client_id     | This is your client id you got from us. Do not include the secret here.                                              |
| redirect_uri  | This is your application's callback url which is bound to your client id.                                            |
| state         | Can be used to verify our response. You can put in anything here and we will send it back to your application later. |

#### Response case 1: The user denied giving access to your application:

The browser is being redirected to your url with an error parameter attached.

`https://your-application/callback?state=OPAQUE_VALUE&error=%7B%22type%22%3A%22AccessDeniedError%22%7D`

Your application might then inform the user that you can not continue without granting access.

#### Response case 2: The user accepted giving access to your application:

The browser is being redirected to your url with a code parameter attached.

`https://your-application/callback?code=59f53e7cfcf12f1d36e2fb56bb46b8d116fb8406&state=OPAQUE_VALUE`

You can now create a request in the backend to exchange the code into an access token.

```shell
curl https://api.kontist.com/api/oauth/token \
  -X POST \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d grant_type=authorization_code \
  -d code=59f53e7cfcf12f1d36e2fb56bb46b8d116fb8406 \
  -d client_id=78b5c170-a600-4193-978c-e6cb3018dba9 \
  -d client_secret=my-secret \
  -d redirect_uri=https://your-application/callback
```

This request needs to contain the client secret and should be done from your backend and not in the frontend to keep the secret confidential.

The result is a JSON object which will look like this:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6Im9mZmxpbmUiLCJjbGllbnRfaWQiOiI3OGI1YzE3MC1hNjAwLTQxOTMtOTc4Yy1lNmNiMzAxOGRiYTkiLCJpYXQiOjE1NjkyMjY3MDksImV4cCI6MTU2OTIzMDMwOX0.XwkfN1jJ_0C5gSIlzvOHRovmbzbpOXRpZ6HCOg1I7j0",
  "token_type": "Bearer",
  "expires_in": 3599,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6InJlZnJlc2ggb2ZmbGluZSIsImNsaWVudF9pZCI6Ijc4YjVjMTcwLWE2MDAtNDE5My05NzhjLWU2Y2IzMDE4ZGJhOSIsImlhdCI6MTU2OTIyNjcwOSwiZXhwIjoxNTY5MjMzOTA5fQ.GggO8EQznEH70PTRvicEYxj40oF_RQdHZlJw0jf41xQ",
  "scope": "offline"
}
```

Extract the `access_token` and use it in your requests by adding the `Authorization: Bearer access_token` header to your requests.
See this example:

```shell
curl --request POST \
  --url https://api.kontist.com/api/graphql \
  --header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6Im9mZmxpbmUiLCJjbGllbnRfaWQiOiI3OGI1YzE3MC1hNjAwLTQxOTMtOTc4Yy1lNmNiMzAxOGRiYTkiLCJpYXQiOjE1NjkyMjY3MDksImV4cCI6MTU2OTIzMDMwOX0.XwkfN1jJ_0C5gSIlzvOHRovmbzbpOXRpZ6HCOg1I7j0' \
  --header 'content-type: application/json' \
  --data '{ "query": "{viewer{id}}" }'
```

#### Refresh Token

The access token obtained in the previous section does expire after some time. If you did specify the "offline" scope you can use the `refresh_token` from the first response to create a new access token.

```shell
curl https://api.kontist.com/api/oauth/token \
  -X POST \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d grant_type=refresh_token \
  -d client_id=78b5c170-a600-4193-978c-e6cb3018dba9 \
  -d client_secret=my-secret \
  -d refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6InJlZnJlc2ggb2ZmbGluZSIsImNsaWVudF9pZCI6Ijc4YjVjMTcwLWE2MDAtNDE5My05NzhjLWU2Y2IzMDE4ZGJhOSIsImlhdCI6MTU2OTIyNjcwOSwiZXhwIjoxNTY5MjMzOTA5fQ.GggO8EQznEH70PTRvicEYxj40oF_RQdHZlJw0jf41xQ
```

Response is again a JSON object, similar to the original one:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6Im9mZmxpbmUiLCJjbGllbnRfaWQiOiI3OGI1YzE3MC1hNjAwLTQxOTMtOTc4Yy1lNmNiMzAxOGRiYTkiLCJpYXQiOjE1NjkyMjY5MTksImV4cCI6MTU2OTIzMDUxOX0.CkxIJ2OmXMovqhJhNjQJvI7FMlSMdFTRgheWYTcLMUQ",
  "token_type": "Bearer",
  "expires_in": 3599,
  "scope": "offline"
}
```

You can use the refresh token multiple times until the refresh token expires itself and you need to go through the process again.

#### Scopes

- accounts
- clients
- offline (required for refresh token)
- statements
- subscriptions
- transactions
- transfers
- users

### Fetching transactions

Transactions are returned using the [Connection pattern](https://relay.dev/graphql/connections.htm) to allow pagination. A simple query showing the first 3 transactions may look like this:

```graphql
{
  viewer {
    mainAccount {
      transactions(first: 3) {
        edges {
          node {
            name
            amount
            iban
          }
        }
      }
    }
  }
}
```

Just send the query inside of a POST request to `/api/graphl` and wrap it into a `query` property.

```shell
curl --request POST \
  --url https://api.kontist.com/api/graphql \
  --header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6Im9mZmxpbmUiLCJjbGllbnRfaWQiOiI3OGI1YzE3MC1hNjAwLTQxOTMtOTc4Yy1lNmNiMzAxOGRiYTkiLCJpYXQiOjE1NjkyMjY3MDksImV4cCI6MTU2OTIzMDMwOX0.XwkfN1jJ_0C5gSIlzvOHRovmbzbpOXRpZ6HCOg1I7j0' \
  --header 'content-type: application/json' \
  --data '{ "query": "{viewer{mainAccount{...}}}" }'
```

Result:

```json
{
  "data": {
    "viewer": {
      "mainAccount": {
        "transactions": {
          "edges": [
            {
              "node": {
                "name": "Autoservice Gmbh",
                "amount": -16700,
                "iban": "DE89370400440532013000"
              }
            },
            {
              "node": {
                "name": "John Doe",
                "amount": 84609,
                "iban": "DE89370400440532013000"
              }
            },
            {
              "node": {
                "name": "John Doe",
                "amount": 13900,
                "iban": "DE89370400440532013000"
              }
            }
          ]
        }
      }
    }
  }
}
```

{::comment}

### Creating a new transfer

Creating transfers consist of two steps. First the transfer is created with `addTransfer` which will return the `id` of the new transfer. Then we send a SMS to the user that contains a code and we need to call `verifyTransfer`.

#### 1. Step - add a new transfer

```graphql
mutation {
    addTransfer(...) {
        id
    }
}
```

Result:

```json

```

#### 2. Step - verify the transfer

```graphql
mutation {
    verifyTransfer(...) {
        id
        status
    }
}
```

Result:

```json

```

{:/comment}
