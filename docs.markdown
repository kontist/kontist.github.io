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

The second part is obtained through the user and can be done in several ways, here we describe the preferred way through the "Authorization Code" grant type. If you want to develop an pure web application you must use PKCE to not expose the client secret.

#### Authorization Code
In general, the process looks like this:

1. You redirect the user in a browser to an url on our end.
2. The user is required to login and needs to accept your application's authorization request. The browser redirects back to your application with a `code` parameter.
3. Your application can then exchange this `code` together with the `client_secret` into an `access_token` through a backend request to our API.

Let us go through the process step by step. At first we need to send the user to a special url in the browser:

`https://api.kontist.com/api/oauth/authorize?scope=offline&response_type=code&client_id=78b5c170-a600-4193-978c-e6cb3018dba9&redirect_uri=https://your-application/callback&state=OPAQUE_VALUE`

Adjust the parameters like this:

| Parameter | Description |
| --------- | ----------- |
| scope | Space delimited list of scopes your application is going to access. Please see the list below.|
| response_type | Set fixed as "code". |
| client_id | This is your client id you got from us. Do not include the secret here.|
| redirect_uri | This is your application's callback url which is bound to your client id.|
| state | Can be used to verify our response. You can put in anything here and we will send it back to your application later.


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
curl https://api.kontist.com/api/user \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzIyODljMy1hNDk4LTQzMDItYjk3My1hNDRlYzdjZDRmZTMiLCJzY29wZSI6Im9mZmxpbmUiLCJjbGllbnRfaWQiOiI3OGI1YzE3MC1hNjAwLTQxOTMtOTc4Yy1lNmNiMzAxOGRiYTkiLCJpYXQiOjE1NjkyMjY3MDksImV4cCI6MTU2OTIzMDMwOX0.XwkfN1jJ_0C5gSIlzvOHRovmbzbpOXRpZ6HCOg1I7j0'
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
````

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

## Using the SDK
Please install the SDK via `npm install @kontist/client --save`. Depending on your application you can then either import it with
```typescript
import { Client } from "@kontist/client";
```

or just load the bundle via
```html
<script src="node_modules/@kontist/client/dist/bundle.js"></script>
```

### Login (Web Application)
In some environments we cannot store a client secret without exposing it (e.g. a web application without a backend). To authorize the client we will use OAuth2 with the PKCE extension. During initialization of the client you just need to provide a `verifer` and persist it across page reloads. Next to that you need to provide your `clientId`, a `state` and `redirectUri`. You can setup all of this in the [API Console](/console).
```javascript
      // persist two random values
      sessionStorage.setItem(
        "state",
        sessionStorage.getItem("state") || (Math.random() + "").substring(2)
      );
      sessionStorage.setItem(
        "verifier",
        sessionStorage.getItem("verifier") || (Math.random() + "").substring(2)
      );

      // initialize Kontist client
      const client = new Kontist.Client({
        clientId: "<your client id>",
        redirectUri: "<your url of the app>",
        scopes: ["transactions", "transfers"],
        state: sessionStorage.getItem("state"),
        verifier: sessionStorage.getItem("verifier")
      });
```

If the user opens the page the first time we need to redirect him to the API so that he can authorize your application.
```javascript
      const code = new URL(document.location).searchParams.get("code");
      if (!code) {
        // "code" query parameter missing, let's redirect the user to the login
        client.auth.getAuthUri().then(function(url) {
          window.location = url;
        });
      } else {
```

After the authorization of the app the user is redirected back to the app's page (which must be available at `redirectUri`). There is a `?code=xxxxx` query parameter attached to it. We can just put the whole url into the `fetchToken` method and it returns an access token.

```javascript
        // we have a code, the client now can fetch a token
        client.auth.fetchToken(document.location.href).then(function(token) {
            console.log(token);
        });
      }
```

After the successful call of `fetchToken` the client application is authorized and one can make requests to the API.


### Login (Backend Application)
If you are developing an application where you can store a `clientSecret` you can authorize with regular OAuth2. In this example we will use `express`.

TypeScript users should add `"lib": ["es2015", "dom"]` to their `tsconfig.json`.

```typescript
import express from "express";
import { Client } from "@kontist/client";
const app = express();
```

We need to provide the values for our app from the [API Console](/console) and set the state to a random number.
```typescript
const client = new Client({
  clientId: "<your client id>",
  clientSecret: "<your client secret>",
  redirectUri: "<your app url>/auth/callback",
  scopes: ["transactions", "transfers"],
  state: (Math.random() + "").substring(2)
});
```

If the user goes to "/auth" we will redirect him to the Kontist login.
```typescript
app.get("/auth", async (req, res) => {
  const uri = await client.auth.getAuthUri();
  res.redirect(uri);
});
```

After the user authorized the app he will be redirect back to the `redirectUri` which we set to the `/auth/callback` endpoint.
```typescript
app.get("/auth/callback", async (req, res) => {
  const callbackUrl = req.originalUrl;

  try {
    const token = await client.auth.fetchToken(callbackUrl);
    /* got access token, login successful */
    res.send("Successful, your token is " + token.accessToken);
  } catch (e) {
    /* handle error */
    res.send("Failed: " + JSON.stringify(e));
  }
});
```

Last thing left is to start listening on connections.
```typescript
app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
```

If you now visit `http://localhost:3000/auth` you will be directed to the Kontist login and then back to your application. The token will then be printed at the console and you can start using the client.


### Fetching transactions
You can use the `fetchAll` method to fetch the last 50 transactions:
```typescript
const result = await client.models.transaction.fetchAll();
```

`result` then contains an array like this:

```javascript
[
  {
    "id": "08995f8f-1f87-42ab-80d2-6e73a3db40e8",
    "amount": 4711,
    "name": "Example",
    "iban": null,
    "type": "SEPA_CREDIT_TRANSFER",
    "bookingDate": "1570399200000",
    "valutaDate": "2019-10-06T22:00:00.000+00:00",
    "originalAmount": null,
    "foreignCurrency": null,
    "e2eId": null,
    "mandateNumber": null,
    "paymentMethod": "bank_account",
    "category": null,
    "userSelectedBookingDate": null,
    "purpose": "kauf+dir+was",
    "bookingType": "SEPA_CREDIT_TRANSFER",
    "invoiceNumber": null,
    "invoicePreviewUrl": null,
    "invoiceDownloadUrl": null,
    "documentType": null
  },
  // ...
]
```




{::comment}
### Creating a new transfer

{:/comment}

### Plain GraphQL requests
You can use the `rawQuery` method to send plain requests to the GraphQL endpoint like this:
```typescript
const query = `{
  viewer {
    mainAccount {
      id
    }
  }
}`;

const result = await client.graphQL.rawQuery(query);
```

{::comment}
## Model Reference
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
{:/comment}
