---
layout: page
title: Docs
permalink: /docs/
sidebar: true
---

## Authentication

To manage the data via our API your application needs to gain access on behalf of the user. This is done through obtaining an access token via [OAuth2](https://tools.ietf.org/html/rfc6749). The access token must then be send in each request in the HTTP header like this: "Authorization: Bearer TOKEN".

If you just want to explore the API you can use the [Playground](/playground) which will automatically create and insert such an access token to the HTTP header.

When you want to create your own application you need two kinds of credentials to get such a token: The first part is a fixed pair of client id and client secret. They identify your client application which connects to the API. Each application has its own pair of client id and secret, please use the [API Client Management](/client-management) to create your own client credentials.

The second part is obtained through the user and can be done in several ways, here we describe the preferred way through the "Authorization Code" grant type. If you want to develop a pure web application you must use PKCE to not expose the client secret.

### Authorization Code

In general, the process looks like this:

1. You redirect the user in a browser to an url on our end.
2. The user is required to login and needs to accept your application's authorization request. The browser redirects back to your application with a `code` parameter.
3. Your application can then exchange this `code` together with the `client_secret` into an `access_token` through a backend request to our API.

<div class="mermaid">
sequenceDiagram
    participant Your App
    participant Kontist API
    participant User
    
    Note over Your App,User: Request via GET (Browser)
    Your App->>Kontist API: Authorization Request
    Kontist API->>User: Login mask
    User->>Kontist API: Username, Password, MFA
    Kontist API->>Your App: Code
    
    Note over Your App, Kontist API: Request via POST (Server)
    Your App->>Kontist API: Code + Client Secret
    Kontist API->>Your App: Access Token (+ Refresh Token)
</div>

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
| skip_mfa         | Optional, defaults to false. If you skip the MFA process during login you need to do it later manually before you can access most parts of the API.|

*Response case 1: The user denied giving access to your application:*

The browser is being redirected to your url with an error parameter attached.

`https://your-application/callback?state=OPAQUE_VALUE&error=%7B%22type%22%3A%22AccessDeniedError%22%7D`

Your application might then inform the user that you can not continue without granting access.

*Response case 2: The user accepted giving access to your application:*

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

### Refresh Token

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


### PKCE Extension for Authorization Code

The standarad [Authorization Code](#authorization-code) flow uses client secrets to grant access tokens, however this is not always practical: some environments can't securely store such a secret (e.g. a single page web application).

For these environments, we can use the Proof Key for Code Exchange (PKCE) extension for the Authorization Code flow.

<div class="mermaid">
sequenceDiagram
    participant Your App
    participant Kontist API
    participant User
    
    Note over Your App: Build verifier <br>and challenge
    Your App->>Kontist API: Authorization Request (includes challenge)
    Kontist API->>User: Login mask
    User->>Kontist API: Username, Password, MFA
    Kontist API->>Your App: Code
    
    Your App->>Kontist API: Code + verifier (POST Request)
    Note over Kontist API: Validate challenge <br>with verifier
    Kontist API->>Your App: Access Token
</div>

The PKCE-enhanced Authorization Code flow is very similar to the standard Authorization Code flow and uses a concept of Code Verifier which we will have to generate client side. This code verifier will be hashed and sent as a `code_challenge` parameter to the `/authorize` endpoint, and then sent in plain along with the authorization code when requesting the access token.

To generate the code verifier, it is recommended to use the output of a random number generator.

Once the code verifier has been generated, we will need to transform it to a code challenge:

* First hash it using the SHA256 hash function
* Then encode it to a base64 string
* And finally, remove padding from the base64 encoded string (as defined in: https://tools.ietf.org/html/rfc7636#appendix-A)

Here is sample javascript code to perform the transformation:

```javascript
const code_challenge = base64encode(sha256(code_verifier))
  .split("=")[0]
  .replace("+", "-")
  .replace("/", "_");
```

We will then take users to the authorization url, providing `code_challenge` and `code_challenge_method`:

```
https://api.kontist.com/api/oauth/authorize
  ?scope=transactions
  &response_type=code
  &client_id=78b5c170-a600-4193-978c-e6cb3018dba9
  &redirect_uri=https://your-application/callback
  &state=OPAQUE_VALUE
  &code_challenge_method=S256
  &code_challenge=xc3uY4-XMuobNWXzzfEqbYx3rUYBH69_zu4EFQIJH8w
```

The parameters are the same as for the standard Authorization Code flow, with these additional parameters:

| Parameter              | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| code_challenge         | Code challenge generated from the code verifier.                      |
| code_challenge_method  | Code challenge method, only "S256" is supported.                      |

After the user has accepted the access request, you will be able to obtain an access token with the code you received and the code verifier you used to generate the code challenge (without specifying the `client_secret`):

```shell
curl https://api.kontist.com/api/oauth/token \
  -X POST \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d grant_type=authorization_code \
  -d code=59f53e7cfcf12f1d36e2fb56bb46b8d116fb8406 \
  -d client_id=78b5c170-a600-4193-978c-e6cb3018dba9 \
  -d redirect_uri=https://your-application/callback \
  -d code_verifier=7963393253896189
```

*Note*: Using the PKCE flow will not grant you refresh tokens, even if you specify the `offline` scope. In order to renew an access token when using this authorization flow, you can use the [method described below](#renewing-access-tokens-with-pkce).
The above restriction does not apply if you are using a custom scheme for your application (and thus for your `redirect_uri`, e.g. `my-app://callback-uri`).


### Refresh with PKCE

As you will not get refresh tokens when using the PKCE authorization method, you can use an alternative method leveraging session cookies.

If a user has granted access with the PKCE authorization flow, the successful authorization will be saved to this user's session, and you will be able to obtain a new access token without prompting the user by specifying `prompt=none` when accessing the authorization url:

```
https://api.kontist.com/api/oauth/authorize
  ?scope=transactions
  &response_type=code
  &client_id=78b5c170-a600-4193-978c-e6cb3018dba9
  &redirect_uri=https://your-application/callback
  &state=OPAQUE_VALUE
  &code_challenge_method=S256
  &code_challenge=xc3uY4-XMuobNWXzzfEqbYx3rUYBH69_zu4EFQIJH8w
  &prompt=none
```

The user will be redirected directly to your application with a new authorization code that you can use to request a new access token.

### Web Message Response Mode

While the above method will work for Single Page Applications (SPA), it has the downside of doing redirects, and SPA client application state will be lost.

To work around this issue, we can use the web message response type by following these steps:

1. Setup a web message listener to get the authorization code:
```javascript
  window.addEventListener("message", event => {
    if (event.origin === "https://api.kontist.com") {
      const { code } = event.data.response;
    }
  });
```
2. Create an iframe and set its source to the authorization url, specifying `response_mode=web_message`:
```javascript
const iframe = document.createElement("iframe");
iframe.style.display = "none";
document.body.appendChild(iframe);
iframe.src = "https://api.kontist.com/api/oauth/authorize?scope=transactions&response_type=code&client_id=78b5c170-a600-4193-978c-e6cb3018dba9&redirect_uri=https://your-application/callback&state=OPAQUE_VALUE&code_challenge_method=S256&code_challenge=xc3uY4-XMuobNWXzzfEqbYx3rUYBH69_zu4EFQIJH8w&prompt=none&response_mode=web_message"
```
3. The server will then send a web message with the new authorization code that we can use to get a new access token

### Multi-Factor Authentication

To have access to Kontist API endpoints that require strong customer authentication, you need to pass Multi-Factor Authentication (MFA).

We provide a simplified push notification MFA flow for users who have installed the Kontist Application and paired their device in it.

<div class="mermaid">
sequenceDiagram
    participant Your App
    participant Kontist API
    participant Kontist App
    
    Your App->>Kontist API: Create Challenge
    Kontist API->>Your App: Challenge ID
    Kontist API->>+Kontist App: MFA Request

    loop Poll
      Your App->>Kontist API: Get challenge status
      Kontist API->>Your App: PENDING
    end

    Note over Kontist App: User clicks "confirm"

    Kontist App->>-Kontist API: MFA Confirmation

    Your App->>Kontist API: Get challenge status
    Kontist API->>Your App: VERIFIED

    Your App->>Kontist API: Get Token
    Kontist API->>Your App: Access Token
</div>

#### Creating a challenge

To initiate the MFA procedure, you will need to create an MFA Challenge:

```shell
curl "https://api.kontist.com/api/user/mfa/challenges" \
  -H "Authorization: Bearer ey..." \
  -X POST
```


> The above command returns JSON structured like this:
```json
{
  "id": "5f7c36e2-e0bf-4755-8376-ac6d0711192e",
  "status": "PENDING",
  "expiresAt": "2019-12-02T16:25:15.933+00:00"
}
```

##### HTTP Request

`POST https://api.kontist.com/api/user/mfa/challenges`

##### Response

| Field      | Description                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- |
| id         | ID of the challenge.                                                                           |
| status     | Status of the challenge. One of PENDING, VERIFIED, DENIED. When created, it will be "PENDING". |
| expiresAt  | Time at which the challenge will expire.                                                       |


#### Verifying a challenge

The next step to pass MFA is to verify the challenge that was just created.

The Kontist user will receive a push notification on his device prompting him to "Confirm login".
After logging into the application and confirming, the challenge will be verified (its status will be updated to `VERIFIED`).


#### Polling for challenge verification

Once a challenge has been created and you are waiting for its verification, you can periodically access the below endpoint until the status changes to `VERIFIED` or `DENIED`:

```shell
curl "https://api.kontist.com/api/user/mfa/challenges/5f7c36e2-e0bf-4755-8376-ac6d0711192e" \
  -H "Authorization: Bearer ey..." \
  -X GET
```

> The above command returns JSON structured like this:
```json
{
  "id": "5f7c36e2-e0bf-4755-8376-ac6d0711192e",
  "status": "VERIFIED",
  "expiresAt": "2019-12-02T16:25:15.933+00:00"
}
```

##### HTTP Request

`GET https://api.kontist.com/api/user/mfa/challenges/{challenge_id}`

##### Response

| Field      | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| id         | ID of the challenge.                                         |
| status     | Status of the challenge. One of PENDING, VERIFIED, DENIED.   |
| expiresAt  | Time at which the challenge will expire.                     |


#### Getting a confirmed token

Once the challenge has been verified (status updated to `VERIFIED`), you can obtain one (and only one) confirmed access token.

If the OAuth2 client involved uses refresh tokens, you will also obtain a confirmed refresh token with the response. Such a refresh token can be used to renew confirmed access tokens. This will allow you to perform the MFA procedure only once for the whole lifetime of your refresh token.

```shell
curl "https://api.kontist.com/api/user/mfa/challenges/5f7c36e2-e0bf-4755-8376-ac6d0711192e/token" \
  -H "Authorization: Bearer ey..." \
  -X POST
```

> The above command returns JSON structured like this:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODNjNTc4ZS01M2QwLTRhYmEtOTBiNC02MmRmZmFkNTE5NTMiLCJzY29wZSI6ImF1dGgiLCJjbmYiOnsia2lkIjoiMmExNjRlYzYtZTJkNC00OTI4LTk5NDItZDU5YWI2Yzc4ZDU5In0sImlhdCI6MTU2NzQwOTExNSwiZXhwIjoxNTY3NDEyNzE1fQ.m35NDpQMAB5DMebXUxEzWupP3i-iAwoyVy2sGF1zp_8",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIwMmUwZi0yOWE4LTRlNDgtODcyNi01OGFiMDAxNDBiNTgiLCJzY29wZSI6InJlZnJlc2ggYWNjb3VudHMgb2ZmbGluZSIsImNsaWVudF9pZCI6IjU4NjcwYmRhLWQxZDEtNGJlOC1hZGEyLTcwNjFkZWVhYjMxNyIsImNuZiI6eyJraWQiOiJlNTA3NTQ5NC1iNWM0LTRjYTEtYjE4MC01ZjNjNTBhNjA2OWMifSwiaWF0IjoxNTc2ODM2MDU5LCJleHAiOjE1NzY4NDMyNTl9.DydSAzxAFncGlWQMNZZp4q48EjAoz6FR6IboxTPx2j4"
}
```

##### HTTP Request

`POST https://api.kontist.com/api/user/mfa/challenges/{challenge_id}/token`

##### Response

| Field           | Description                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| token           | Auth token with confirmation claim that should be used for endpoints that require strong customer authentication.    |
| refresh_token   | Refresh token with confirmation claim that can be used to renew confirmed access tokens.                             |


### Scopes

- accounts
- clients (manage OAuth2 clients, usually not required)
- offline (required for refresh token)
- statements
- subscriptions
- transactions
- transfers
- users

### Logout
During login, we do create a browser-based session and store which clients and scopes already have been authenticated by the user. So next time the user wants to access the application we do not require the user to enter his credentials again.
This session is automatically destroyed once the browser is closed. If you want to explicitly logout the user you can redirect him to the `/oauth/logout` endpoint. This should be done inside the browser context and in a hidden iframe.

### Limits
To ensure our API is available to all of our users, we do apply some limits. Depending on the situation, the actual limits may vary. Please make sure to stay below the following values to be on the safe side. For single requests these values might be exceeded.

| Limit           | Description                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| Requests           | <100 per minute    |
| Query size   | <10,000 characters |
| Query complexity   | limited, i.e. <500 different fields |
| Errors   | <= 3 errors are returned |


### Advanced Topics
Some clients might use device binding with certificates as MFA or make use of other OAuth2 grant types. This depends on the environment where this application will run. Please see our [advanced topics](/docs/advanced-authentication) on authentication.


## Using the GraphQL API
### Fetch transactions

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

### Create a new transfer

Creating transfers consist of two steps. First the transfer is created with `createTransfer` which will return the `confirmationId` of the new transfer. Then we send a SMS to the user that contains a code and we need to call `confirmTransfer`.


<div class="mermaid">
sequenceDiagram
    participant Your App
    participant Kontist API
    participant User
    
    Your App->>Kontist API: createTransfer
    Kontist API->>Your App: confirmationId
    Kontist API->>User: SMS with code

    User->>Your App: Code from SMS

    Your App->>Kontist API: confirmTransfer (with confirmationId, code)
</div>

#### 1. Step - add a new transfer

```graphql
mutation {
  createTransfer(
    transfer: { iban: "DE1234....", recipient: "Johnny Cash", amount: 1234 }
  ) {
    confirmationId
  }
}
```

#### 2. Step - verify the transfer

```graphql
mutation {
  confirmTransfer(confirmationId: "1234", authorizationToken: "4567") {
    id
    recipient
  }
}
```


## Schema Reference

<!-- START graphql-markdown -->


### Query
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bankIntegrationBankList</strong></td>
<td valign="top">[<a href="#bankintegrationbank">bankIntegrationBank</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxAccount</strong></td>
<td valign="top"><a href="#banktaxaccount">bankTaxAccount</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxAccounts</strong></td>
<td valign="top">[<a href="#banktaxaccount">bankTaxAccount</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">offset</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">limit</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">userId</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxTransaction</strong></td>
<td valign="top"><a href="#banktaxtransaction">bankTaxTransaction</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">accountId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxTransactions</strong></td>
<td valign="top">[<a href="#banktaxtransaction">bankTaxTransaction</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">accountId</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">externalTransactionId</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">bookingDate</td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">valueDate</td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">amount</td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">creditorName</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">debtorName</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">debtorIban</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">status</td>
<td valign="top"><a href="#banktaxtransactionstatus">bankTaxTransactionStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sortField</td>
<td valign="top"><a href="#banktaxtransactionsortfield">bankTaxTransactionSortField</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sortOrder</td>
<td valign="top"><a href="#banktaxtransactionsortorder">bankTaxTransactionSortOrder</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>viewer</strong></td>
<td valign="top"><a href="#user">User</a></td>
<td>

The current user information

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#systemstatus">SystemStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>genericFeatures</strong></td>
<td valign="top">[<a href="#genericfeature">GenericFeature</a>!]!</td>
<td>

Get all released generic features, that are needed before user creation

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasDeviceRestrictedKey</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Determines if user device has restricted key added

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>draftTransactions</strong></td>
<td valign="top">[<a href="#drafttransaction">DraftTransaction</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### Mutation
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bankIntegrationLinkAccount</strong></td>
<td valign="top"><a href="#bankintegrationrequisition">bankIntegrationRequisition</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">redirect</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">institutionId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">agreement</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankIntegrationCreateExternalAccount</strong></td>
<td valign="top"><a href="#bankintegrationexternalaccount">bankIntegrationExternalAccount</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">requisitionId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxAddAccount</strong></td>
<td valign="top"><a href="#banktaxaccount">bankTaxAccount</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">newAccountData</td>
<td valign="top"><a href="#banktaxcreateaccountdto">bankTaxCreateAccountDto</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxRemoveAccount</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankTaxImportAccountTransactions</strong></td>
<td valign="top">[<a href="#banktaxtransaction">bankTaxTransaction</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createTransactionAsset</strong></td>
<td valign="top"><a href="#createassetresponse">CreateAssetResponse</a>!</td>
<td>

Create a transaction Asset and obtain an upload config

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">uploadPlatform</td>
<td valign="top"><a href="#requestplatform">RequestPlatform</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetableType</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filetype</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>finalizeTransactionAssetUpload</strong></td>
<td valign="top"><a href="#transactionasset">TransactionAsset</a>!</td>
<td>

Confirm and validate an Asset upload as completed

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteTransactionAsset</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Remove an Asset from the Transaction

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>finalizeAssetUpload</strong></td>
<td valign="top"><a href="#asset">Asset</a>!</td>
<td>

Confirm and validate an Asset upload as completed

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteAsset</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Remove an Asset

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cancelTransfer</strong></td>
<td valign="top"><a href="#confirmationrequestortransfer">ConfirmationRequestOrTransfer</a>!</td>
<td>

Cancel an existing Timed Order or Standing Order

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#transfertype">TransferType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmCancelTransfer</strong></td>
<td valign="top"><a href="#transfer">Transfer</a>!</td>
<td>

Confirm a Standing Order cancellation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">authorizationToken</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The confirmation token received by SMS on the user's phone

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">confirmationId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#transfertype">TransferType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createClient</strong></td>
<td valign="top"><a href="#client">Client</a>!</td>
<td>

Create an OAuth2 client

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">client</td>
<td valign="top"><a href="#createclientinput">CreateClientInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateClient</strong></td>
<td valign="top"><a href="#client">Client</a>!</td>
<td>

Update an OAuth2 client

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">client</td>
<td valign="top"><a href="#updateclientinput">UpdateClientInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteClient</strong></td>
<td valign="top"><a href="#client">Client</a>!</td>
<td>

Delete an OAuth2 client

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateTaxYearSettings</strong></td>
<td valign="top">[<a href="#taxyearsetting">TaxYearSetting</a>!]!</td>
<td>

Update individual tax-related settings per year

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">taxYearSettings</td>
<td valign="top">[<a href="#taxyearsettinginput">TaxYearSettingInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createTransfer</strong></td>
<td valign="top"><a href="#confirmationrequest">ConfirmationRequest</a>!</td>
<td>

Create a transfer. The transfer's type will be determined based on the provided input

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transfer</td>
<td valign="top"><a href="#createtransferinput">CreateTransferInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateTransfer</strong></td>
<td valign="top"><a href="#confirmationrequestortransfer">ConfirmationRequestOrTransfer</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transfer</td>
<td valign="top"><a href="#updatetransferinput">UpdateTransferInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmTransfer</strong></td>
<td valign="top"><a href="#transfer">Transfer</a>!</td>
<td>

Confirm a transfer creation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">authorizationToken</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The confirmation token received by SMS on the user's phone

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">confirmationId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createTransfers</strong></td>
<td valign="top"><a href="#confirmationrequest">ConfirmationRequest</a>!</td>
<td>

Create multiple transfers at once. Only regular SEPA Transfers are supported

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transfers</td>
<td valign="top">[<a href="#createsepatransferinput">CreateSepaTransferInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmTransfers</strong></td>
<td valign="top"><a href="#batchtransfer">BatchTransfer</a>!</td>
<td>

Confirm the transfers creation

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">authorizationToken</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The confirmation token received by SMS on the user's phone

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">confirmationId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>whitelistCard</strong></td>
<td valign="top"><a href="#whitelistcardresponse">WhitelistCardResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmFraud</strong></td>
<td valign="top"><a href="#confirmfraudresponse">ConfirmFraudResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>authorizeChangeRequest</strong></td>
<td valign="top"><a href="#authorizechangerequestresponse">AuthorizeChangeRequestResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">changeRequestId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmChangeRequest</strong></td>
<td valign="top"><a href="#confirmchangerequestresponse">ConfirmChangeRequestResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">signature</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">changeRequestId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createCard</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Create a new card

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#cardtype">CardType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">cardHolderRepresentation</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>activateCard</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Activate a card

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">verificationToken</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>addGooglePayCardToken</strong></td>
<td valign="top"><a href="#googlepaycardtoken">GooglePayCardToken</a>!</td>
<td>

Adds Google Pay card token reference id for given wallet id

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">tokenRefId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">walletId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardPushProvisioning</strong> ⚠️</td>
<td valign="top"><a href="#pushprovisioningoutput">PushProvisioningOutput</a>!</td>
<td>

Adds card to given wallet

<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

Please use more secure requestCardPushProvisioning and confirmCardPushProvisioning

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">android</td>
<td valign="top"><a href="#pushprovisioningandroidinput">PushProvisioningAndroidInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">ios</td>
<td valign="top"><a href="#pushprovisioningiosinput">PushProvisioningIosInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">cardId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>requestCardPushProvisioning</strong></td>
<td valign="top"><a href="#authorizechangerequestresponse">AuthorizeChangeRequestResponse</a>!</td>
<td>

Adds card to Apple/Google Pay wallet

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">android</td>
<td valign="top"><a href="#pushprovisioningandroidinput">PushProvisioningAndroidInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">ios</td>
<td valign="top"><a href="#pushprovisioningiosinput">PushProvisioningIosInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">cardId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmCardPushProvisioning</strong></td>
<td valign="top"><a href="#pushprovisioningoutput">PushProvisioningOutput</a>!</td>
<td>

Confirms adding card to Apple/Google Pay wallet

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#confirmchangerequestargs">ConfirmChangeRequestArgs</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">cardId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteGooglePayCardToken</strong></td>
<td valign="top"><a href="#googlepaycardtoken">GooglePayCardToken</a>!</td>
<td>

Deletes Google Pay card token reference id for given wallet id

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">tokenRefId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">walletId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateCardSettings</strong></td>
<td valign="top"><a href="#cardsettings">CardSettings</a>!</td>
<td>

Update settings (e.g. limits)

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">settings</td>
<td valign="top"><a href="#cardsettingsinput">CardSettingsInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeCardStatus</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Block or unblock or close a card

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">action</td>
<td valign="top"><a href="#cardaction">CardAction</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeCardPIN</strong></td>
<td valign="top"><a href="#confirmationrequest">ConfirmationRequest</a>!</td>
<td>

Set a new PIN, needs to be confirmed

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">pin</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmChangeCardPIN</strong></td>
<td valign="top"><a href="#confirmationstatus">ConfirmationStatus</a>!</td>
<td>

Confirm a PIN change request

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">authorizationToken</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">confirmationId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeCardPINEncrypted</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Encrypted card PIN change

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#changecardpinencryptedinput">ChangeCardPINEncryptedInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeCardPINWithChangeRequest</strong></td>
<td valign="top"><a href="#confirmationrequest">ConfirmationRequest</a>!</td>
<td>

Encrypted card PIN change with Change Request

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#changecardpinwithchangerequestinput">ChangeCardPINWithChangeRequestInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>replaceCard</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Call when customer's card is lost or stolen

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reorderCard</strong></td>
<td valign="top"><a href="#card">Card</a>!</td>
<td>

Close and order new card. Call when customer's card is damaged

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setCardHolderRepresentation</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Set the card holder representation for the customer

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">cardHolderRepresentation</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>virtualCardDetails</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Returns encrypted card details for virtual card

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">args</td>
<td valign="top"><a href="#virtualcarddetailsargs">VirtualCardDetailsArgs</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateTransaction</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td>

Categorize a transaction with an optional custom booking date for VAT or Tax categories, and add a personal note

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">category</td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">userSelectedBookingDate</td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">personalNote</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The personal note of the transaction - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>requestOverdraft</strong></td>
<td valign="top"><a href="#overdraft">Overdraft</a></td>
<td>

Create Overdraft Application  - only available for Kontist Application

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>activateOverdraft</strong></td>
<td valign="top"><a href="#overdraft">Overdraft</a></td>
<td>

Activate Overdraft Application  - only available for Kontist Application

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateOverdraft</strong></td>
<td valign="top"><a href="#overdraft">Overdraft</a></td>
<td>

Updates overdraft application timestamps for rejected and offered overdraft screens - only available for Kontist Application

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">offeredScreenShown</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">rejectionScreenShown</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createTransactionSplits</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td>

Create transaction splits

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">splits</td>
<td valign="top">[<a href="#createtransactionsplitsinput">CreateTransactionSplitsInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateTransactionSplits</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td>

Update transaction splits

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">splits</td>
<td valign="top">[<a href="#updatetransactionsplitsinput">UpdateTransactionSplitsInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteTransactionSplits</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td>

Delete transaction splits

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscribeToPlan</strong></td>
<td valign="top"><a href="#usersubscription">UserSubscription</a>!</td>
<td>

Subscribe user to a plan

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">couponCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#purchasetype">PurchaseType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateSubscriptionPlan</strong></td>
<td valign="top"><a href="#updatesubscriptionplanresult">UpdateSubscriptionPlanResult</a>!</td>
<td>

Update user's subscription plan

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">couponCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">newPlan</td>
<td valign="top"><a href="#purchasetype">PurchaseType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dismissBanner</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#bannername">BannerName</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>connectIntegration</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Connect user to a bookkeeping partner

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#integrationtype">IntegrationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">authorizationData</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Authorization data sent by the bookkeeping partner to allow a user to connect to it

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserTaxDetails</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Update user's tax details

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#usertaxdetailsinput">UserTaxDetailsInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateDocument</strong></td>
<td valign="top"><a href="#document">Document</a>!</td>
<td>

Updates document meta

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>

Document id

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a></td>
<td>

Document's name

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">metadata</td>
<td valign="top"><a href="#updatedocumentmetadata">UpdateDocumentMetadata</a></td>
<td>

Document's metadata

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteDocument</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Deletes document

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>requestIdentification</strong></td>
<td valign="top"><a href="#identificationdetails">IdentificationDetails</a>!</td>
<td>

Create a new identification if applicable

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserSignupInformation</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Update user signup information

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#userupdateinput">UserUpdateInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateSolarisUser</strong></td>
<td valign="top"><a href="#authorizechangerequestresponse">AuthorizeChangeRequestResponse</a>!</td>
<td>

Update user fields on solaris

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#updatesolarisuserinput">UpdateSolarisUserInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmUpdateSolarisUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Confirms update of user fields on solaris

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#confirmchangerequestargs">ConfirmChangeRequestArgs</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createUserEmailAlias</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">hash</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">alias</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userConfirmation</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">confirmation</td>
<td valign="top"><a href="#userconfirmation">UserConfirmation</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createUser</strong></td>
<td valign="top"><a href="#publicmutationresult">PublicMutationResult</a>!</td>
<td>

Create a new user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#createuserinput">CreateUserInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserNotifications</strong></td>
<td valign="top">[<a href="#notification">Notification</a>!]!</td>
<td>

Update the push-notifications a user should receive

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">active</td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#notificationtype">NotificationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>refundDirectDebit</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createReview</strong></td>
<td valign="top"><a href="#createreviewresponse">CreateReviewResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">platform</td>
<td valign="top"><a href="#reviewtriggerplatform">ReviewTriggerPlatform</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">triggerName</td>
<td valign="top"><a href="#reviewtriggername">ReviewTriggerName</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateReview</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">status</td>
<td valign="top"><a href="#userreviewstatus">UserReviewStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">reviewId</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>clearPreselectedPlan</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Clear preselected plan

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assignKontaxCouponCodeToDeclinedUser</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Assign a secret coupon code to the user who is rejected from kontax onboarding

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateInvoiceSettings</strong></td>
<td valign="top"><a href="#invoicesettingsoutput">InvoiceSettingsOutput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#invoicesettingsinput">InvoiceSettingsInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createInvoiceLogo</strong></td>
<td valign="top"><a href="#createinvoicelogoresponse">CreateInvoiceLogoResponse</a>!</td>
<td>

The logo a user can add to his invoice. The path to it is stored in invoiceSettings

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filetype</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteInvoiceLogo</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Deletes the logo of a user's settings entry

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>signPOA</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Allow user to sign Power of Attorney

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">dependents</td>
<td valign="top">[<a href="#userdependentinput">UserDependentInput</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">signature</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateInvoiceCustomer</strong></td>
<td valign="top"><a href="#invoicecustomeroutput">InvoiceCustomerOutput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#invoicecustomerinput">InvoiceCustomerInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateInvoice</strong></td>
<td valign="top"><a href="#invoiceoutput">InvoiceOutput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#invoiceinput">InvoiceInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteInvoice</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>duplicateInvoice</strong></td>
<td valign="top"><a href="#invoiceoutput">InvoiceOutput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>matchEmailDocumentToTransaction</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">transactionId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">emailDocumentId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteEmailDocument</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>upsertProducts</strong></td>
<td valign="top">[<a href="#product">Product</a>!]!</td>
<td>

Create or update user products that can be linked to the user's invoice(s)

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top">[<a href="#userproductinput">UserProductInput</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categorizeTransactionForDeclaration</strong></td>
<td valign="top"><a href="#categorizetransactionfordeclarationresponse">CategorizeTransactionForDeclarationResponse</a>!</td>
<td>

Categorize transaction for VAT declaration

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">categoryCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">category</td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">date</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">isSplit</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submitDeclaration</strong></td>
<td valign="top"><a href="#declaration">Declaration</a>!</td>
<td>

Submits UStVA declaration

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">period</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateTaxNumber</strong></td>
<td valign="top"><a href="#taxnumber">TaxNumber</a>!</td>
<td>

Updates user's taxNumber

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#updatetaxnumberinput">UpdateTaxNumberInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createTaxNumber</strong></td>
<td valign="top"><a href="#taxnumber">TaxNumber</a>!</td>
<td>

Create user's taxNumber

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#createtaxnumberinput">CreateTaxNumberInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteTaxNumber</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Delete user's taxNumber

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createBusinessAddress</strong></td>
<td valign="top"><a href="#businessaddress">BusinessAddress</a>!</td>
<td>

Creates an user's business address

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#createbusinessaddressinput">CreateBusinessAddressInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>startQuestionnaire</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#questionnairetype">QuestionnaireType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submitQuestionnaireAnswer</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">value</td>
<td valign="top"><a href="#json">JSON</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionName</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postponeQuestionnaireAnswer</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionName</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>resetLastQuestionnaireAnswer</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submitBookkeepingQuestionnaire</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>upsertQuestionnaireDocument</strong></td>
<td valign="top"><a href="#questionnairedocument">QuestionnaireDocument</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#questionnairedocumentinput">QuestionnaireDocumentInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createQuestionnaireDocumentAsset</strong></td>
<td valign="top"><a href="#createassetresponse">CreateAssetResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filetype</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireDocumentId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteQuestionnaireDocument</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireDocumentId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>finalizeTaxCase</strong></td>
<td valign="top"><a href="#taxcase">TaxCase</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">shouldFinalizeIncomeTax</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">shouldFinalizeBusinessTax</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">taxCaseId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>approveDeclaration</strong></td>
<td valign="top"><a href="#declarationapproval">DeclarationApproval</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#createdeclarationapprovalinput">CreateDeclarationApprovalInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declineDeclaration</strong></td>
<td valign="top"><a href="#declarationdecline">DeclarationDecline</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#createdeclarationdeclineinput">CreateDeclarationDeclineInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>agerasLeadRedirect</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Send Lead data to designated Zap to redirect lead to Agreas

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createConsentForDeviceMonitoring</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Records consent from the given person to collect device fingerprints on their registered device

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">eventType</td>
<td valign="top"><a href="#deviceconsenteventtype">DeviceConsentEventType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateConsentForDeviceMonitoring</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a></td>
<td>

Records change of consent to collect device fingerprints on their registered device

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">eventType</td>
<td valign="top"><a href="#deviceconsenteventtype">DeviceConsentEventType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceConsentId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createActivityForDeviceMonitoring</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Creates user activity for device monitoring

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">activityType</td>
<td valign="top"><a href="#deviceactivitytype">DeviceActivityType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>addDeviceKey</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Add restricted key to selected device

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">signature</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">key</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">deviceId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createDraftTransaction</strong></td>
<td valign="top"><a href="#createdrafttransactionresponse">CreateDraftTransactionResponse</a>!</td>
<td>

Creates a draft external transaction entry

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">fileName</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateDraftTransaction</strong></td>
<td valign="top"><a href="#drafttransaction">DraftTransaction</a></td>
<td>

Updates draft external transaction entry. Returns null if finalized transaction was created

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">payload</td>
<td valign="top"><a href="#updatedrafttransactioninput">UpdateDraftTransactionInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteDraftTransaction</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td>

Deletes draft transaction

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Objects

#### Account

The bank account of the current user

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>publicId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardHolderRepresentation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>availableBalance</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bic</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>canCreateOverdraft</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardHolderRepresentations</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPendingCardFraudCase</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pendingTransactionVerification</strong></td>
<td valign="top"><a href="#pendingtransactionverification">PendingTransactionVerification</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transfers</strong></td>
<td valign="top"><a href="#transfersconnection">TransfersConnection</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">where</td>
<td valign="top"><a href="#transfersconnectionfilter">TransfersConnectionFilter</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#transfertype">TransferType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The number of items to return after the provided cursor up to 50

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">last</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The number of items to return before the provided cursor up to 50

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The cursor of the item to start from. Use in conjunction with 'first'

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">before</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The cursor of the item to start from. Use in conjunction with 'last'

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transaction</strong></td>
<td valign="top"><a href="#transaction">Transaction</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactions</strong></td>
<td valign="top"><a href="#transactionsconnection">TransactionsConnection</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">preset</td>
<td valign="top"><a href="#filterpresetinput">FilterPresetInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#transactionfilter">TransactionFilter</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The number of items to return after the provided cursor up to 50

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">last</td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The number of items to return before the provided cursor up to 50

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The cursor of the item to start from. Use in conjunction with 'first'

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">before</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The cursor of the item to start from. Use in conjunction with 'last'

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionFilterPresets</strong></td>
<td valign="top">[<a href="#filterpreset">FilterPreset</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionsCSV</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">to</td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">from</td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transfer</strong></td>
<td valign="top"><a href="#transfer">Transfer</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#transfertype">TransferType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>stats</strong></td>
<td valign="top"><a href="#accountstats">AccountStats</a>!</td>
<td>

Different information about account balances, e.g. taxes, VAT, ...

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxYearSettings</strong></td>
<td valign="top">[<a href="#taxyearsetting">TaxYearSetting</a>!]!</td>
<td>

Individual tax-related settings per year

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transferSuggestions</strong></td>
<td valign="top">[<a href="#transfersuggestion">TransferSuggestion</a>!]</td>
<td>

A list of iban/name combinations based on existing user's transactions, provided to assist users when creating new transfers

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cards</strong></td>
<td valign="top">[<a href="#card">Card</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>card</strong></td>
<td valign="top"><a href="#card">Card</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#cardfilter">CardFilter</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>overdraft</strong></td>
<td valign="top"><a href="#overdraft">Overdraft</a></td>
<td>

Overdraft Application - only available for Kontist Application

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>balance</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>solarisBalance</strong></td>
<td valign="top"><a href="#solarisaccountbalance">SolarisAccountBalance</a>!</td>
<td>

Retrieve account balance from Solaris

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarations</strong></td>
<td valign="top">[<a href="#declaration">Declaration</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#declarationtype">DeclarationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationPdfUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationStats</strong></td>
<td valign="top"><a href="#declarationstats">DeclarationStats</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">period</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### AccountBalance

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currency</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unit</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### AccountStats

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>accountBalance</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount that is currently available on the bank account

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>yours</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount that can be spent after VAT and taxes calculation

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unknown</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount that is not categorized

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>main</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount that can be spent plus the amount from uknown

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatTotal</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of VAT that is owed (current + last years)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatAmount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of VAT that is owed in the current year

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatMissing</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The difference between vatTotal and accountBalance, if vatTotal > accountBalance

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxTotal</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of tax that is owed (current + last years)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxCurrentYearAmount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of tax that is owed in the current year

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxPastYearsAmount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The amount of tax that was owed for all past years combined

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxMissing</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The difference between taxTotal and accountBalance, if taxTotal > accountbalance

</td>
</tr>
</tbody>
</table>

#### Asset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>filetype</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assetableId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>path</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>thumbnail</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fullsize</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### AuthorizeChangeRequestResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>stringToSign</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeRequestId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### AvailableStatements

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>months</strong></td>
<td valign="top">[<a href="#int">Int</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### Banner

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#bannername">BannerName</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dismissedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isVisible</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### BatchTransfer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#batchtransferstatus">BatchTransferStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transfers</strong></td>
<td valign="top">[<a href="#sepatransfer">SepaTransfer</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### BusinessAddress

Business Address of a Kontax User

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>street</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>movingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deletedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Card

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#cardstatus">CardStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#cardtype">CardType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pinSet</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>addedToApplePay</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>newCardOrdered</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>holder</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>formattedExpirationDate</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>maskedPan</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>settings</strong></td>
<td valign="top"><a href="#cardsettings">CardSettings</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>googlePayTokens</strong></td>
<td valign="top">[<a href="#googlepaycardtoken">GooglePayCardToken</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pinKey</strong></td>
<td valign="top"><a href="#cardpinkey">CardPINKey</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CardLimit

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>maxAmountCents</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>maxTransactions</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CardLimits

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>daily</strong></td>
<td valign="top"><a href="#cardlimit">CardLimit</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>monthly</strong></td>
<td valign="top"><a href="#cardlimit">CardLimit</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CardPINKey

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>kid</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>kty</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>use</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>alg</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>n</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CardSettings

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>contactlessEnabled</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardSpendingLimits</strong></td>
<td valign="top"><a href="#cardspendinglimits">CardSpendingLimits</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CardSpendingLimits

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>atm</strong></td>
<td valign="top"><a href="#cardlimits">CardLimits</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purchase</strong></td>
<td valign="top"><a href="#cardlimits">CardLimits</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CategorizeTransactionForDeclarationResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>date</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CategoryGroup

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCodeTranslation</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactions</strong></td>
<td valign="top">[<a href="#transactionforaccountingview">TransactionForAccountingView</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### Client

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>redirectUri</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The URL to redirect to after authentication

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the OAuth2 client displayed when users log in

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>grantTypes</strong></td>
<td valign="top">[<a href="#granttype">GrantType</a>!]</td>
<td>

The grant types (i.e. ways to obtain access tokens) allowed for the client

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>scopes</strong></td>
<td valign="top">[<a href="#scopetype">ScopeType</a>!]</td>
<td>

The scopes the client has access to, limiting access to the corresponding parts of the API

</td>
</tr>
</tbody>
</table>

#### ConfirmChangeRequestResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>success</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ConfirmFraudResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>resolution</strong></td>
<td valign="top"><a href="#caseresolution">CaseResolution</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ConfirmationRequest

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>confirmationId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ConfirmationStatus

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateAssetResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>assetId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>formData</strong></td>
<td valign="top">[<a href="#formdatapair">FormDataPair</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CreateDraftTransactionResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assetData</strong></td>
<td valign="top"><a href="#createassetresponse">CreateAssetResponse</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateInvoiceLogoResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>formData</strong></td>
<td valign="top">[<a href="#invoicelogoformdatapair">InvoiceLogoFormDataPair</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateReviewResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>error</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Customer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>address</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### DashboardInvoice

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#invoicestatustype">InvoiceStatusType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceNumber</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>paidAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Declaration

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>period</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### DeclarationApproval

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>jointDeclaration</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>delaySubmission</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### DeclarationDecline

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reason</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### DeclarationStats

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryGroups</strong></td>
<td valign="top">[<a href="#categorygroup">CategoryGroup</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uncategorized</strong></td>
<td valign="top">[<a href="#transactionforaccountingview">TransactionForAccountingView</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### DirectDebitFee

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#transactionfeetype">TransactionFeeType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>usedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceStatus</strong></td>
<td valign="top"><a href="#invoicestatus">InvoiceStatus</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Discount

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>couponIsValid</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subtitle</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Document

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>downloadUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>metadata</strong></td>
<td valign="top"><a href="#documentmetadata">DocumentMetadata</a></td>
<td></td>
</tr>
</tbody>
</table>

#### DocumentCategory

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>folderName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### DocumentMetadata

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#documentcategory">DocumentCategory</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### DraftTransaction

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>paymentDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isCashTransaction</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#categorycode">CategoryCode</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#vatrate">VatRate</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets</strong></td>
<td valign="top">[<a href="#asset">Asset</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### EmailDocument

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currency</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>date</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>matchStatus</strong></td>
<td valign="top"><a href="#documentmatchstatus">DocumentMatchStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>filename</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>matches</strong></td>
<td valign="top">[<a href="#transaction">Transaction</a>!]</td>
<td>

Returns an array of transactions which potential match with an email document. Note that just a subset of transaction fields gets returned

</td>
</tr>
</tbody>
</table>

#### FibuFinalCheckTask

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#fibufinalchecktaskstatus">FibuFinalCheckTaskStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#fibufinalchecktasktype">FibuFinalCheckTaskType</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### FormDataPair

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>key</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### GenericFeature

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### GenericFilterPreset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### GooglePayCardToken

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>walletId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>tokenRefId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Icon

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>uri</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### IdentificationDetails

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>link</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The link to use for IDNow identification

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#identificationstatus">IdentificationStatus</a></td>
<td>

The user's IDNow identification status

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>attempts</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The number of identifications attempted by the user

</td>
</tr>
</tbody>
</table>

#### Invoice

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceSettingsId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>customer</strong></td>
<td valign="top"><a href="#customer">Customer</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceNumber</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>products</strong></td>
<td valign="top">[<a href="#invoiceproductoutput">InvoiceProductOutput</a>!]</td>
<td>

A list of products from the invoice

</td>
</tr>
</tbody>
</table>

#### InvoiceCustomerOutput

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>address</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceLogoFormDataPair

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>key</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceOutput

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>invoiceSettingsId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>customerId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>customer</strong></td>
<td valign="top"><a href="#invoicecustomeroutput">InvoiceCustomerOutput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceNumber</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>products</strong></td>
<td valign="top">[<a href="#invoiceproductoutput">InvoiceProductOutput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### InvoicePageInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>hasNextPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPreviousPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currentPage</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceProductOutput

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vat</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quantity</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceSettingsOutput

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>senderName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>companyName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>streetLine</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDateDefaultOffset</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td>

Number of days which get added to today's date to create a default value for due date on invoice creation form

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nextInvoiceNumber</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>logoUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

If a user's setting has a logoPath, we calculate a url to the thumbnail from it

</td>
</tr>
</tbody>
</table>

#### InvoicingDashboardData

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#invoicepageinfo">InvoicePageInfo</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>data</strong></td>
<td valign="top">[<a href="#dashboardinvoice">DashboardInvoice</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### MissingTaxAssetsFilterPreset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Money

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount the user pays

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>discountAmount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount the user saves

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fullAmount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The amount plus discount amount

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>discountPercentage</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The amount the user saves in percentage

</td>
</tr>
</tbody>
</table>

#### MutationResult

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>success</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Notification

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#notificationtype">NotificationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>active</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Overdraft

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#overdraftapplicationstatus">OverdraftApplicationStatus</a>!</td>
<td>

Overdraft status

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>limit</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Available overdraft limit

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>requestedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td>

Overdraft request date

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>offeredScreenShown</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Indicates if offered screen for overdraft was shown

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>rejectionScreenShown</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Indicates if rejection screen for overdraft was shown

</td>
</tr>
</tbody>
</table>

#### PageInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>startCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>endCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasNextPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPreviousPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### PendingTransactionVerification

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Transaction merchant name

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Transaction amount

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>expiresAt</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

When verification gets expired

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declineChangeRequestId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Change request id to decline verification

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>authenticateChangeRequestId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Change request id to authenticate verification

</td>
</tr>
</tbody>
</table>

#### Product

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vat</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### PublicMutationResult

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>success</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### PushProvisioningOutput

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>walletPayload</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>activationData</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>encryptedPassData</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ephemeralPublicKey</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Questionnaire

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#questionnairetype">QuestionnaireType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>context</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>startedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>completedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>syncedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#questionnairestatus">QuestionnaireStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nextQuestion</strong></td>
<td valign="top"><a href="#questionnairequestion">QuestionnaireQuestion</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">includePostponed</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastAnswer</strong></td>
<td valign="top"><a href="#questionnaireanswer">QuestionnaireAnswer</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documents</strong></td>
<td valign="top">[<a href="#questionnairedocument">QuestionnaireDocument</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireAnswer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>questionName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postponedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submittedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>syncedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentsStatus</strong></td>
<td valign="top"><a href="#questionnaireanswerdocumentsstatus">QuestionnaireAnswerDocumentsStatus</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireDocument

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#questionnairedocumenttype">QuestionnaireDocumentType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inputs</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isLastYearSuggestion</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>syncedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets</strong></td>
<td valign="top">[<a href="#asset">Asset</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireQuestion

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>topic</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inputConfig</strong></td>
<td valign="top"><a href="#jsonobject">JSONObject</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postponable</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>allowExit</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>suggestLastYearAnswer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastYearAnswer</strong></td>
<td valign="top"><a href="#questionnaireanswer">QuestionnaireAnswer</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>previousQuestionsAnswers</strong></td>
<td valign="top">[<a href="#questionnaireanswer">QuestionnaireAnswer</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>defaultAnswer</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireTask

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#questionnairetaskstatus">QuestionnaireTaskStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#questionnairetype">QuestionnaireType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### RecurlyAccount

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recurlyAccountId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>balance</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pastDue</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pastDueSince</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accountManagementUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ReferralDetails

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>code</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>link</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bonusAmount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

Amount in euros granted to user and their referee

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>copy</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### SeizureProtection

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>currentBlockedAmount</strong></td>
<td valign="top"><a href="#accountbalance">AccountBalance</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>protectedAmount</strong></td>
<td valign="top"><a href="#accountbalance">AccountBalance</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>protectedAmountExpiring</strong></td>
<td valign="top"><a href="#accountbalance">AccountBalance</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>protectedAmountExpiringDate</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### SepaTransfer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#sepatransferstatus">SepaTransferStatus</a>!</td>
<td>

The status of the SEPA Transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of the SEPA Transfer in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The purpose of the SEPA Transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>recipient</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the SEPA Transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The IBAN of the SEPA Transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the SEPA Transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets</strong></td>
<td valign="top">[<a href="#asset">Asset</a>!]!</td>
<td>

List of uploaded Asset files for this transfer

</td>
</tr>
</tbody>
</table>

#### SolarisAccountBalance

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>balance</strong></td>
<td valign="top"><a href="#accountbalance">AccountBalance</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>availableBalance</strong></td>
<td valign="top"><a href="#accountbalance">AccountBalance</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>seizureProtection</strong></td>
<td valign="top"><a href="#seizureprotection">SeizureProtection</a></td>
<td></td>
</tr>
</tbody>
</table>

#### Subscription

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bankTaxAccountAdded</strong></td>
<td valign="top"><a href="#banktaxaccount">bankTaxAccount</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>newTransaction</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### SubscriptionFeature

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>icon</strong></td>
<td valign="top"><a href="#icon">Icon</a></td>
<td></td>
</tr>
</tbody>
</table>

#### SubscriptionFeatureGroup

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>icon</strong></td>
<td valign="top"><a href="#icon">Icon</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>features</strong></td>
<td valign="top">[<a href="#subscriptionfeature">SubscriptionFeature</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### SubscriptionPlan

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#purchasetype">PurchaseType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subtitle</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fee</strong></td>
<td valign="top"><a href="#money">Money</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>button</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>featuresToggleLabel</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>featureGroups</strong></td>
<td valign="top">[<a href="#subscriptionfeaturegroup">SubscriptionFeatureGroup</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### SubscriptionPlansResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>plans</strong></td>
<td valign="top">[<a href="#subscriptionplan">SubscriptionPlan</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>couponCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>couponValidFor</strong></td>
<td valign="top">[<a href="#purchasetype">PurchaseType</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### SystemStatus

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#status">Status</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxCase

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deadline</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxOfficeDeadline</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>finalizedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>incomeTaxFinalizedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessTaxFinalizedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userFinalizedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#taxcasestatus">TaxCaseStatus</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclaration

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationType</strong></td>
<td valign="top"><a href="#taxdeclarationtype">TaxDeclarationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#taxdeclarationstatus">TaxDeclarationStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>statusUpdatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationApproval</strong></td>
<td valign="top"><a href="#declarationapproval">DeclarationApproval</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>previewForms</strong></td>
<td valign="top"><a href="#taxdeclarationsaveddraftinfo">TaxDeclarationSavedDraftInfo</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>finalForms</strong></td>
<td valign="top"><a href="#taxdeclarationsubmissioninfo">TaxDeclarationSubmissionInfo</a></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclarationExternalAsset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>filetype</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclarationSavedDraftInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>pdfUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdBy</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>externalAssets</strong></td>
<td valign="top">[<a href="#taxdeclarationexternalasset">TaxDeclarationExternalAsset</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclarationSubmissionInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>pdfUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submissionAgent</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>submissionDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>externalAssets</strong></td>
<td valign="top">[<a href="#taxdeclarationexternalasset">TaxDeclarationExternalAsset</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### TaxNumber

Tax numbers of users

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#taxnumbertype">TaxNumberType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>validFrom</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isMainBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deletedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxYearSetting

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

Tax year the individual settings apply to

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Tax rate that should be applied in the corresponding year

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>excluded</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Flag if the corresponding year should be excluded from the tax calculations completely

</td>
</tr>
</tbody>
</table>

#### Transaction

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of the transaction in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#transactionprojectiontype">TransactionProjectionType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the transaction was processed and the amount deducted from the user's account

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mandateNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>merchantCountryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>merchantCategoryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>receiptName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fees</strong></td>
<td valign="top">[<a href="#transactionfee">TransactionFee</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>splits</strong></td>
<td valign="top">[<a href="#transactionsplit">TransactionSplit</a>!]!</td>
<td>

Metadata of separate pseudo-transactions created when splitting the parent transaction

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets</strong></td>
<td valign="top">[<a href="#transactionasset">TransactionAsset</a>!]!</td>
<td>

List of uploaded Asset files for this transaction

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td>

The date at which the transaction was booked (created)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>directDebitFees</strong></td>
<td valign="top">[<a href="#directdebitfee">DirectDebitFee</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>paymentMethod</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categorizationType</strong></td>
<td valign="top"><a href="#categorizationtype">CategorizationType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>predictedCategory</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>predictedUserSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

Date predicted for tax/vat payment/refund predicted category

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentPreviewUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentDownloadUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentType</strong></td>
<td valign="top"><a href="#documenttype">DocumentType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>foreignCurrency</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalAmount</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>actionReason</strong></td>
<td valign="top"><a href="#actionreason">ActionReason</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>canBeRecategorized</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>verified</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCodeTranslation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>recurlyInvoiceNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionAssets</strong></td>
<td valign="top">[<a href="#asset">Asset</a>!]!</td>
<td>

List Assets for a transaction

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>asset</strong></td>
<td valign="top"><a href="#transactionasset">TransactionAsset</a></td>
<td>

View a single Asset for a transaction

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionAsset</strong></td>
<td valign="top"><a href="#asset">Asset</a></td>
<td>

View a single Asset for a transaction

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">assetId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionAsset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>filetype</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assetableId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>path</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>thumbnail</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fullsize</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionFee

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#transactionfeetype">TransactionFeeType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#transactionfeestatus">TransactionFeeStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unitAmount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>usedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionForAccountingView

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>selectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatAmount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isSplit</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionSplit

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uuid</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categorizationType</strong></td>
<td valign="top"><a href="#categorizationtype">CategorizationType</a></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionsConnection

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#transactionsconnectionedge">TransactionsConnectionEdge</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionsConnectionEdge

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### Transfer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uuid</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>recipient</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The IBAN of the transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of the transfer in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#transferstatus">TransferStatus</a></td>
<td>

The status of the transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>executeAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the payment will be executed for Timed Orders or Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastExecutionDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the last payment will be executed for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The purpose of the transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The personal note of the transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurrencetype">StandingOrderReoccurrenceType</a></td>
<td>

The reoccurrence type of the payments for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nextOccurrence</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the next payment will be executed for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td>

The user selected category for the SEPA Transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets</strong></td>
<td valign="top">[<a href="#asset">Asset</a>!]</td>
<td>

List of uploaded Asset files for this transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

</td>
</tr>
</tbody>
</table>

#### TransferSuggestion

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransfersConnection

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#transfersconnectionedge">TransfersConnectionEdge</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TransfersConnectionEdge

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#transfer">Transfer</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UnfinishedTransfer

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>recipient</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateSubscriptionPlanResult

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>newPlan</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>previousPlans</strong></td>
<td valign="top">[<a href="#purchasetype">PurchaseType</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasOrderedPhysicalCard</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateActiveAt</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasCanceledDowngrade</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>couponCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### User

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong> ⚠️</td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatPaymentFrequency</strong> ⚠️</td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.taxDetails.vatPaymentFrequency"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxPaymentFrequency</strong> ⚠️</td>
<td valign="top"><a href="#taxpaymentfrequency">TaxPaymentFrequency</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.taxDetails.taxPaymentFrequency"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong> ⚠️</td>
<td valign="top"><a href="#uservatrate">UserVatRate</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.taxDetails.vatRate"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxRate</strong> ⚠️</td>
<td valign="top"><a href="#int">Int</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.taxDetails.taxRate"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>identificationStatus</strong> ⚠️</td>
<td valign="top"><a href="#identificationstatus">IdentificationStatus</a></td>
<td>

The user's IDNow identification status

<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.identification.status"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>identificationLink</strong> ⚠️</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The link to use for IDNow identification

<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.identification.link"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>screeningStatus</strong> ⚠️</td>
<td valign="top"><a href="#screeningstatus">ScreeningStatus</a></td>
<td>

The user's Solaris screening status

<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "screeningProgress"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>screeningProgress</strong></td>
<td valign="top"><a href="#screeningprogress">ScreeningProgress</a></td>
<td>

The user's Solaris screening progress

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>riskClassificationStatus</strong></td>
<td valign="top"><a href="#riskclassificationstatus">RiskClassificationStatus</a></td>
<td>

The user's Solaris risk clarification status

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>customerVettingStatus</strong></td>
<td valign="top"><a href="#customervettingstatus">CustomerVettingStatus</a></td>
<td>

The user's Solaris customer vetting status

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gender</strong></td>
<td valign="top"><a href="#gender">Gender</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>firstName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>birthPlace</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>birthDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nationality</strong></td>
<td valign="top"><a href="#nationality">Nationality</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>street</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mobileNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>untrustedPhoneNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isUSPerson</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates whether the user pays taxes in the US

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>companyType</strong> ⚠️</td>
<td valign="top"><a href="#companytype">CompanyType</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release. You should now rely on "isSelfEmployed" instead.

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>publicId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>language</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessPurpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Business description provided by the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>economicSector</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The economic sector of the user's business

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>otherEconomicSector</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Business economic sector provided by the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong> ⚠️</td>
<td valign="top"><a href="#string">String</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.taxDetails.vatNumber"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>referralCode</strong> ⚠️</td>
<td valign="top"><a href="#string">String</a></td>
<td>

The user's referral code to use for promotional purposes

<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release and should now be queried from "viewer.referral.code"

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accountState</strong></td>
<td valign="top"><a href="#accountstate">AccountState</a></td>
<td>

The current state of user's Kontist account based on his subscription plan

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessTradingName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>couponCodeOffer</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Coupon code assigned to the user that can be redeemed during subscription update

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isSelfEmployed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxServiceOnboardingCompletedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>poaSignedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>poaExportedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoicePdf</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceAsset</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">isBase64</td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">invoiceId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatDeclarationBannerDismissedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoice</strong></td>
<td valign="top"><a href="#invoice">Invoice</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasBusinessTaxNumberUpdatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingBusinessTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPersonalTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPersonalTaxNumberUpdatedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingPersonalTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>receiptMatchingIntroDismissedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>workAsHandyman</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amlFollowUpDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amlConfirmedOn</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>clients</strong></td>
<td valign="top">[<a href="#client">Client</a>!]!</td>
<td>

The list of all OAuth2 clients for the current user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>client</strong></td>
<td valign="top"><a href="#client">Client</a></td>
<td>

The details of an existing OAuth2 client

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mainAccount</strong></td>
<td valign="top"><a href="#account">Account</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscriptions</strong></td>
<td valign="top">[<a href="#usersubscription">UserSubscription</a>!]!</td>
<td>

The plans a user has subscribed to

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscriptionPlans</strong></td>
<td valign="top"><a href="#subscriptionplansresponse">SubscriptionPlansResponse</a>!</td>
<td>

The available subscription plans

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">couponCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>banners</strong></td>
<td valign="top">[<a href="#banner">Banner</a>!]</td>
<td>

The state of banners in mobile or web app for the user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">isWebapp</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>integrations</strong></td>
<td valign="top">[<a href="#userintegration">UserIntegration</a>!]!</td>
<td>

Bookkeeping partners information for user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>availablePlans</strong></td>
<td valign="top">[<a href="#subscriptionplan">SubscriptionPlan</a>!]!</td>
<td>

Information about the plans a user can subscribe to

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">couponCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxDetails</strong></td>
<td valign="top"><a href="#usertaxdetails">UserTaxDetails</a>!</td>
<td>

Tax details for user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>features</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td>

Active user features

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documents</strong></td>
<td valign="top">[<a href="#document">Document</a>!]!</td>
<td>

User's documents

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">categoryIds</td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>documentCategories</strong></td>
<td valign="top">[<a href="#documentcategory">DocumentCategory</a>!]!</td>
<td>

User's documents

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">categoryNames</td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>referral</strong></td>
<td valign="top"><a href="#referraldetails">ReferralDetails</a>!</td>
<td>

Referral details for user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>identification</strong></td>
<td valign="top"><a href="#identificationdetails">IdentificationDetails</a>!</td>
<td>

IDNow identification details for user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>metadata</strong></td>
<td valign="top"><a href="#usermetadata">UserMetadata</a>!</td>
<td>

User metadata. These fields are likely to get frequently updated or changed.

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">platform</td>
<td valign="top"><a href="#platform">Platform</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unfinishedTransfers</strong></td>
<td valign="top">[<a href="#unfinishedtransfer">UnfinishedTransfer</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>notifications</strong></td>
<td valign="top">[<a href="#notification">Notification</a>!]!</td>
<td>

All push-notification types and their state

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>recurlyAccount</strong></td>
<td valign="top"><a href="#recurlyaccount">RecurlyAccount</a></td>
<td>

The user's associated Recurly Account

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>premiumSubscriptionDiscount</strong></td>
<td valign="top"><a href="#discount">Discount</a>!</td>
<td>

Premium subscription discount for user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">couponCode</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceSettings</strong></td>
<td valign="top"><a href="#invoicesettingsoutput">InvoiceSettingsOutput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>poaUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Retrieves signed POA PDF for user.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoices</strong></td>
<td valign="top"><a href="#invoicingdashboarddata">InvoicingDashboardData</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">pageNumber</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>emailDocuments</strong></td>
<td valign="top">[<a href="#emaildocument">EmailDocument</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filterByUnmatched</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">uploadSources</td>
<td valign="top">[<a href="#documentuploadsource">DocumentUploadSource</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>emailDocument</strong></td>
<td valign="top"><a href="#emaildocument">EmailDocument</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>invoiceCustomers</strong></td>
<td valign="top">[<a href="#invoicecustomeroutput">InvoiceCustomerOutput</a>!]</td>
<td>

The list of all customers of the current user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumbers</strong></td>
<td valign="top">[<a href="#taxnumber">TaxNumber</a>!]!</td>
<td>

User's tax numbers

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessAddresses</strong></td>
<td valign="top">[<a href="#businessaddress">BusinessAddress</a>!]!</td>
<td>

User's business addresses

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastBusinessAddress</strong></td>
<td valign="top"><a href="#businessaddress">BusinessAddress</a>!</td>
<td>

User's last business address before a specific date

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>questionnaire</strong></td>
<td valign="top"><a href="#questionnaire">Questionnaire</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">questionnaireId</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#questionnairetype">QuestionnaireType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>questionnaires</strong></td>
<td valign="top">[<a href="#questionnaire">Questionnaire</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>questionnaireTasks</strong></td>
<td valign="top">[<a href="#questionnairetask">QuestionnaireTask</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxCase</strong></td>
<td valign="top"><a href="#taxcase">TaxCase</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fibuFinalCheckTasks</strong></td>
<td valign="top">[<a href="#fibufinalchecktask">FibuFinalCheckTask</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>euerDeclaration</strong></td>
<td valign="top"><a href="#taxdeclaration">TaxDeclaration</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>incomeTaxDeclaration</strong></td>
<td valign="top"><a href="#taxdeclaration">TaxDeclaration</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>tradeTaxDeclaration</strong></td>
<td valign="top"><a href="#taxdeclaration">TaxDeclaration</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatAnnualDeclaration</strong></td>
<td valign="top"><a href="#taxdeclaration">TaxDeclaration</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">year</td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UserDependent

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#userdependenttype">UserDependentType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>firstName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>birthDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deTaxId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marriageStartDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marriageEndDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UserIntegration

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#integrationtype">IntegrationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasAccount</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isConnected</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UserMetadata

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>currentTermsAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>acceptedTermsVersion</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastTermsVersionAcceptedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastTermsVersionRejectedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>newTermsDeadlineDate</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastTermsVersionSkippedAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>availableStatements</strong></td>
<td valign="top">[<a href="#availablestatements">AvailableStatements</a>!]</td>
<td>

List of months user can request a bank statement for

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isAccountClosed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Is user's Kontist account closed

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currentTermsVersion</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>intercomDigest</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>directDebitMandateAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marketingConsentAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumberVerificationRequired</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>signupCompleted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categorizationScreenShown</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxAdvisoryTermsVersionAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>emailFetchSetupUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>emailConnections</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### UserSubscription

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#purchasetype">PurchaseType</a>!</td>
<td>

The type of the plans a user has subscribed to

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>state</strong></td>
<td valign="top"><a href="#purchasestate">PurchaseState</a>!</td>
<td>

The state of the subscription

</td>
</tr>
</tbody>
</table>

#### UserTaxDetails

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>adjustAdvancePayments</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastTaxPaymentDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastVatPaymentDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatPaymentFrequency</strong></td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxPaymentFrequency</strong> ⚠️</td>
<td valign="top"><a href="#taxpaymentfrequency">TaxPaymentFrequency</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

This field will be removed in an upcoming release. Do not rely on it for any new features

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#uservatrate">UserVatRate</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalTaxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deTaxId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>needsToProvideTaxIdentification</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>permanentExtensionStatus</strong></td>
<td valign="top"><a href="#permanentextensionstatus">PermanentExtensionStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingBusinessTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingPersonalTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dependents</strong></td>
<td valign="top">[<a href="#userdependent">UserDependent</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### WhitelistCardResponse

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>resolution</strong></td>
<td valign="top"><a href="#caseresolution">CaseResolution</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>whitelistedUntil</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankIntegrationAccountDetails

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>resourceId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currency</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ownerName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankIntegrationBank

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>logo</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bic</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>transactionTotalDays</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>countries</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankIntegrationExternalAccount

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bankName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankLogo</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>agreementDays</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accounts</strong></td>
<td valign="top">[<a href="#bankintegrationaccountdetails">bankIntegrationAccountDetails</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankIntegrationRequisition

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>created</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>redirect</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#bankintegrationrequisitionstatus">bankIntegrationRequisitionStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>institutionId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>agreement</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reference</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accounts</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userLanguage</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>link</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankIntegrationRequisitionStatus

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>short</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>long</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxAccount

account

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>externalAccountId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxTransaction

transaction

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accountId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>externalTransactionId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valueDate</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>currency</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>creditorName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>debtorName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>debtorIban</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>remittanceInformationUnstructured</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#banktaxtransactionstatus">bankTaxTransactionStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#banktaxdatetime">bankTaxDateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Inputs

#### AttributionData

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>platform</strong></td>
<td valign="top"><a href="#platform">Platform</a></td>
<td>

Platform used for signup

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>trackingId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>preselected_plan</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>utm_source</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>irclickid</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CardFilter

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#cardtype">CardType</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CardLimitInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>maxAmountCents</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>maxTransactions</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CardLimitsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>daily</strong></td>
<td valign="top"><a href="#cardlimitinput">CardLimitInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>monthly</strong></td>
<td valign="top"><a href="#cardlimitinput">CardLimitInput</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CardSettingsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>contactlessEnabled</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purchaseLimits</strong></td>
<td valign="top"><a href="#cardlimitsinput">CardLimitsInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>atmLimits</strong></td>
<td valign="top"><a href="#cardlimitsinput">CardLimitsInput</a></td>
<td></td>
</tr>
</tbody>
</table>

#### ChangeCardPINEncryptedInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>encryptedPin</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>keyId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deviceId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>signature</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ChangeCardPINWithChangeRequestInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>encryptedPin</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>keyId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### ConfirmChangeRequestArgs

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>deviceId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>signature</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>changeRequestId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateBusinessAddressInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>street</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>movingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateClientInput

The available fields to create an OAuth2 client

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the OAuth2 client displayed when users log in

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>secret</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The OAuth2 client secret

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>redirectUri</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The URL to redirect to after authentication

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>grantTypes</strong></td>
<td valign="top">[<a href="#granttype">GrantType</a>!]!</td>
<td>

The grant types (i.e. ways to obtain access tokens) allowed for the client

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>scopes</strong></td>
<td valign="top">[<a href="#scopetype">ScopeType</a>!]!</td>
<td>

The scopes the client has access to, limiting access to the corresponding parts of the API

</td>
</tr>
</tbody>
</table>

#### CreateDeclarationApprovalInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>declarationId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationType</strong></td>
<td valign="top"><a href="#taxdeclarationtype">TaxDeclarationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>jointDeclaration</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>delaySubmission</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CreateDeclarationDeclineInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>declarationId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>declarationType</strong></td>
<td valign="top"><a href="#taxdeclarationtype">TaxDeclarationType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reason</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateSepaTransferInput

The available fields to create a SEPA Transfer

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recipient</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the SEPA Transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The IBAN of the SEPA Transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of the SEPA Transfer in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The purpose of the SEPA Transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The personal note of the SEPA Transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the SEPA Transfer

</td>
</tr>
</tbody>
</table>

#### CreateTaxNumberInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#taxnumbertype">TaxNumberType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>validFrom</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isMainBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### CreateTransactionSplitsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### CreateTransferInput

The available fields to create a transfer

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>recipient</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The IBAN of the transfer recipient

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The amount of the transfer in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>executeAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the payment will be executed for Timed Orders or Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastExecutionDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the last payment will be executed for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The purpose of the transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The personal note of the transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurrencetype">StandingOrderReoccurrenceType</a></td>
<td>

The reoccurrence type of the payments for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td>

The user selected category for the SEPA Transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

</td>
</tr>
</tbody>
</table>

#### CreateUserInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

User's email. This will be used as their username.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>password</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>language</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>attribution</strong></td>
<td valign="top"><a href="#attributiondata">AttributionData</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>impactAttribution</strong></td>
<td valign="top"><a href="#attributiondata">AttributionData</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marketingConsentAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>terms</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

User has accepted latest Kontist terms when signing up

</td>
</tr>
</tbody>
</table>

#### DependentsTaxIds

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deTaxId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### FilterPresetInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceCustomerInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>address</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>invoiceSettingsId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>customerId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>products</strong></td>
<td valign="top">[<a href="#invoiceproductinput">InvoiceProductInput</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceProductInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vat</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quantity</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceSettingsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>senderName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>companyName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>streetLine</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>phoneNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dueDateDefaultOffset</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td>

Number of days which get added to today's date to create a default value for due date on invoice creation form

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nextInvoiceNumber</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### JWE

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>alg</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>enc</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### JWK

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>kty</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>n</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### PushProvisioningAndroidInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>deviceId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Stable identifier for a physical Android device Google refers to this atribute as a Stable hardware ID in their SDK documentation the method getStableHardwareId describes how you can retrieve this value.

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>walletAccountId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Unique 24-byte identifier for each instance of a [Android user, Google account] pair wallet. ID is computed as a keyed hash of the Android user ID and the Google account ID. The key to this hash lives on Google servers, meaning the wallet ID is created during user setup as an RPC.

</td>
</tr>
</tbody>
</table>

#### PushProvisioningIosInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>nonce</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

A one-time-use nonce in Base64 encoded format provided by Apple

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nonceSignature</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Nonce signature in Base64 encoded format provided by Apple

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>certificates</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td>

An array of leaf and sub-CA certificates in Base64 encoded format provided by Apple. Each object contains a DER encoded X.509 certificate, with the leaf first and followed by sub-CA

</td>
</tr>
</tbody>
</table>

#### QuestionnaireDocumentInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#questionnairedocumenttype">QuestionnaireDocumentType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>inputs</strong></td>
<td valign="top"><a href="#jsonobject">JSONObject</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### TaxYearSettingInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>year</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

Tax year the individual settings apply to

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

Tax rate that should be applied in the corresponding year

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>excluded</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Flag if the corresponding year should be excluded from the tax calculations completely

</td>
</tr>
</tbody>
</table>

#### TransactionCondition

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>operator</strong></td>
<td valign="top"><a href="#baseoperator">BaseOperator</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_lt</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_gt</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_gte</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_lte</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_eq</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_ne</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_in</strong></td>
<td valign="top">[<a href="#int">Int</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_eq</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_ne</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_gt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_lt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_gte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_lte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets_exist</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatAssets_exist</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_eq</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_ne</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_gt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_lt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_gte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_lte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category_eq</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category_in</strong></td>
<td valign="top">[<a href="#transactioncategory">TransactionCategory</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionFilter

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>operator</strong></td>
<td valign="top"><a href="#baseoperator">BaseOperator</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_lt</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_gt</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_gte</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_lte</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_eq</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_ne</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount_in</strong></td>
<td valign="top">[<a href="#int">Int</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_eq</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_ne</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_gt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_lt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_gte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>valutaDate_lte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assets_exist</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatAssets_exist</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_eq</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_ne</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_gt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_lt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_gte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookingDate_lte</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name_in</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category_eq</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category_in</strong></td>
<td valign="top">[<a href="#transactioncategory">TransactionCategory</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_eq</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_ne</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_like</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose_likeAny</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>conditions</strong></td>
<td valign="top">[<a href="#transactioncondition">TransactionCondition</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### TransfersConnectionFilter

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#transferstatus">TransferStatus</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateClientInput

The available fields to update an OAuth2 client

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The name of the OAuth2 client displayed when users log in

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>secret</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The OAuth2 client secret

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>redirectUri</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The URL to redirect to after authentication

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>grantTypes</strong></td>
<td valign="top">[<a href="#granttype">GrantType</a>!]</td>
<td>

The grant types (i.e. ways to obtain access tokens) allowed for the client

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>scopes</strong></td>
<td valign="top">[<a href="#scopetype">ScopeType</a>!]</td>
<td>

The scopes the client has access to, limiting access to the corresponding parts of the API

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The id of the OAuth2 client to update

</td>
</tr>
</tbody>
</table>

#### UpdateDocumentMetadata

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>documentCategoryId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Document's category Id

</td>
</tr>
</tbody>
</table>

#### UpdateDraftTransactionInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>assetUploaded</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>paymentDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>note</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categoryCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#vatrate">VatRate</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isCashTransaction</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateSolarisUserInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>amlConfirmed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateTaxNumberInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#taxnumbertype">TaxNumberType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>validFrom</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isMainBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateTransactionSplitsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UpdateTransferInput

The available fields to update a transfer

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The ID of the transfer to update

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#transfertype">TransferType</a>!</td>
<td>

The type of transfer to update, currently only Standing Orders are supported

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>amount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The amount of the Standing Order payment in cents

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastExecutionDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

The date at which the last payment will be executed

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>purpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The purpose of the Standing Order - 140 max characters, if not specified with the update, it will be set to null

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The personal note of the transfer - 140 max characters

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the Standing Order, if not specified with the update, it will be set to null

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurrencetype">StandingOrderReoccurrenceType</a></td>
<td>

The reoccurrence type of the payments for Standing Orders

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>category</strong></td>
<td valign="top"><a href="#transactioncategory">TransactionCategory</a></td>
<td>

The user selected category for the SEPA Transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

</td>
</tr>
</tbody>
</table>

#### UserDependentInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deTaxId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>firstName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastName</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>birthDate</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marriageStartDate</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marriageEndDate</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#userdependenttype">UserDependentType</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### UserProductInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>price</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vat</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

#### UserTaxDetailsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>deTaxId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>personalTaxNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasBusinessTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPersonalTaxNumber</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingBusinessTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>missingPersonalTaxNumberNote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatPaymentFrequency</strong></td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>permanentExtensionStatus</strong></td>
<td valign="top"><a href="#permanentextensionstatus">PermanentExtensionStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>dependentsTaxIds</strong></td>
<td valign="top">[<a href="#dependentstaxids">DependentsTaxIds</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

#### UserUpdateInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>birthDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>city</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>firstName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>lastName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>country</strong></td>
<td valign="top"><a href="#nationality">Nationality</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nationality</strong></td>
<td valign="top"><a href="#nationality">Nationality</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>street</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>birthPlace</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>untrustedPhoneNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

Sets a mobile number for the user to be verified later

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatPaymentFrequency</strong></td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>language</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>gender</strong></td>
<td valign="top"><a href="#gender">Gender</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isUSPerson</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates whether the user pays taxes in the US

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>acceptedTermsVersion</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The version of terms user has accepted

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessPurpose</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>economicSector</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>otherEconomicSector</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>businessTradingName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>adjustAdvancePayments</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>companyType</strong></td>
<td valign="top"><a href="#companytype">CompanyType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isSelfEmployed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>directDebitMandateAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates user has accepted Kontist direct debit mandate

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ownEconomicInterestConfirmed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates user has confirmed he is opening their account in their name, for the use of their business

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>nonConsumerConfirmed</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates user has confirmed he is acting as a business and not a consumer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>marketingConsentAccepted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates user has accepted to receive Kontist marketing communication

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>categorizationScreenShown</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>profession</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accountingTool</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasSecondBusinessAccount</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>maximumCashTransactionsPercentage</strong></td>
<td valign="top"><a href="#maximumcashtransactionspercentage">MaximumCashTransactionsPercentage</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasEmployees</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>internationalCustomers</strong></td>
<td valign="top"><a href="#internationalcustomers">InternationalCustomers</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>permanentExtensionStatus</strong></td>
<td valign="top"><a href="#permanentextensionstatus">PermanentExtensionStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxAdvisoryTermsVersionAccepted</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subjectToAccounting</strong></td>
<td valign="top"><a href="#threestateanswer">ThreeStateAnswer</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>workingInEcommerce</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>workAsHandyman</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasMoreThanOneBusiness</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>idnowReminderType</strong></td>
<td valign="top"><a href="#idnowremindertype">IdnowReminderType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>idnowReminderTime</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>accountingOnboardingStarted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates if user started upgrading to accounting plan

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxServiceOnboardingStarted</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>

Indicates if user started upgrading to Kontax plan

</td>
</tr>
</tbody>
</table>

#### VirtualCardDetailsArgs

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>signature</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deviceId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>jwk</strong></td>
<td valign="top"><a href="#jwk">JWK</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>jwe</strong></td>
<td valign="top"><a href="#jwe">JWE</a>!</td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxCreateAccountDto

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>externalAccountId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bankId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>iban</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Enums

#### AccountState

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FREE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRIAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PREMIUM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BLOCKED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FREE_OLD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PREMIUM_OLD</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ActionReason

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>SMALL_BUSINESS_MISSING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WRONG_TAXRATE_ANCILLARY_SERVICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MISSING_TAX_EXEMPT_SALES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO_REDUCED_TAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REVERSE_CHARGE_MISSING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OBLIGED_TAXES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOMING_AMOUNT_WRONG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVALID_RECEIPT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO_HOSPITALITY_RECEIPT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OUTGOING_AMOUNT_WRONG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REVERSE_CHARGE_INFORMATION</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### BannerName

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>OVERDRAFT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKKEEPING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FRIEND_REFERRAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PRIMARY_WEBAPP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_SERVICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_DECLARATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RECEIPT_MATCHING</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### BaseOperator

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>OR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AND</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### BatchTransferStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>AUTHORIZATION_REQUIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONFIRMATION_REQUIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCEPTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FAILED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUCCESSFUL</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CardAction

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CLOSE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BLOCK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNBLOCK</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CardStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PROCESSING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INACTIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACTIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BLOCKED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BLOCKED_BY_SOLARIS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACTIVATION_BLOCKED_BY_SOLARIS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLOSED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLOSED_BY_SOLARIS</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CardType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>VIRTUAL_VISA_BUSINESS_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VISA_BUSINESS_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VISA_BUSINESS_DEBIT_2</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MASTERCARD_BUSINESS_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VIRTUAL_MASTERCARD_BUSINESS_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VIRTUAL_VISA_FREELANCE_DEBIT</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CaseResolution

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONFIRMED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WHITELISTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TIMED_OUT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TIMEOUT</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CategorizationType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>AUTOMATIC_KONTIST_ML</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUGGESTED_BY_ML</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKKEEPING_PARTNER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KONTAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVOICING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_OVERWRITE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCRIPT</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CategoryCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PRIVATE_IN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOME_GERMANY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOME_EU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOME_INTL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_REFUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_REFUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRADE_TAX_REFUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CORONA_HELP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONSTRUCTION_REVENUE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REVENUE_SB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_ON_UNPAID_ITEMS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OTHER_USAGE_AND_SERVICE_WITHDRAWALS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OTHER_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRAVEL_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ADVERTISING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PRIVATE_OUT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TELECOMMUNICATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IT_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LEASING_MOVABLES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OFFICE_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LEGAL_TAX_CONSULTING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EDUCATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXTERNAL_FREELANCER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ENTERTAINMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCOMMODATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GOODS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAYROLL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ASSETS_LESS_THAN_EUR_250</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ASSETS_GREATER_THAN_EUR_250</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ASSETS_GREATER_THAN_EUR_800</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MAINTENANCE_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SHIPPING_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTERESTS_ASSETS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTERESTS_CAR_ASSETS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTERESTS_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GIFTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DAILY_ALLOWANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LEASING_CAR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CAR_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WASTE_DISPOSALS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRADE_TAX_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PRIVATE_WITHDRAWAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CAR_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PUBLIC_TRANSPORT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LIMITED_DEDUCTIBLE_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LIMITED_NOT_DEDUCTIBLE_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BANK_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INSURANCES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SOFTWARE_AND_LICENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DOWN_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IMPORT_VAT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DEPOSIT</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CompanyType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>SELBSTAENDIG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EINZELUNTERNEHMER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FREIBERUFLER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GEWERBETREIBENDER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LIMITED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>E_K</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PARTGG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GBR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OHG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KGAA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GMBH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GMBH_UND_CO_KG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UG</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### CustomerVettingStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_VETTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POTENTIAL_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INFORMATION_REQUESTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INFORMATION_RECEIVED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RISK_ACCEPTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RISK_REJECTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CUSTOMER_UNRESPONSIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VETTING_NOT_REQUIRED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DeclarationType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UStVA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EUER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USt</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GewSt</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DeviceActivityType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>APP_START</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PASSWORD_RESET</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONSENT_PROVIDED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DeviceConsentEventType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>APPROVED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REJECTED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DocumentMatchStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TOO_MANY_MATCHES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO_MATCHES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LATER_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ALREADY_HAS_ASSET</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OTHER_PROVIDER_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WRONG_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MANUAL_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MANUAL_MATCH_USER</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DocumentType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>VOUCHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVOICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXPENSE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### DocumentUploadSource

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>EMAIL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BACKOFFICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EMAIL_FETCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MOBILE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### FibuFinalCheckTaskStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TODO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMPLETED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### FibuFinalCheckTaskType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TAX_RECEIPTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPLOAD_ADVISOR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPLOAD_TOOL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPLOAD_MANUAL</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### Gender

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>MALE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FEMALE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### GrantType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PASSWORD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AUTHORIZATION_CODE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REFRESH_TOKEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLIENT_CREDENTIALS</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### IdentificationStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING_SUCCESSFUL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING_FAILED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUCCESSFUL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FAILED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXPIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ABORTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### IdnowReminderType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>EMAIL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SMS</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### IntegrationType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>LEXOFFICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FASTBILL</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### InternationalCustomers

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NONE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WORLDWIDE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>OPEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLOSED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REJECTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### InvoiceStatusType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>DRAFT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAID</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### MaximumCashTransactionsPercentage

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NULL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HUNDRED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### Nationality

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>DE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AQ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BJ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DJ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ET</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FJ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GQ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ID</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IQ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>JE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>JM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>JO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>JP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ML</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MQ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>QA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SJ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TJ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TV</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>US</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UZ</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VU</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>XK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>YE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>YT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ZA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ZM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ZW</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### NotificationType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CARD_TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOMING_TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DIRECT_DEBIT_TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ATM_WITHDRAWAL_TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>STATEMENTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PRODUCT_INFO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RECEIPT_SCANNING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ALL</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### OverdraftApplicationStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INITIAL_SCORING_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCOUNT_SNAPSHOT_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCOUNT_SNAPSHOT_VERIFICATION_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OFFERED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REJECTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OVERDRAFT_CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXPIRED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### PaymentFrequency

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>MONTHLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>QUARTERLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NONE_QUARTERLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>YEARLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NONE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### PermanentExtensionStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>DOES_HAVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DOES_NOT_HAVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DOES_NOT_KNOW</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### Platform

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>IOS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ANDROID</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEB</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### PurchaseState

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PROCESSED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### PurchaseType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BASIC_INITIAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BASIC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PREMIUM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CARD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LEXOFFICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KONTAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KONTAX_SB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KONTAX_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCOUNTING</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireAnswerDocumentsStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_REQUIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DELETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPLOADED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireDocumentType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE_PURCHASE_CONTRACT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE_PRIVATELY_PAID_CAR_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE_LOGBOOK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE_TRAVELED_KM_WITH_PRIVATE_CAR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_RENT_OR_INTEREST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_PHONE_OR_INTERNET</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_ELECTRICITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_HEATING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_UTILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_UTILITY_AFTER_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_FLOOR_PLAN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_TRAVEL_EXPENSES_BUSINESS_TRIPS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_TRAVEL_EXPENSES_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_PROOF_OF_DISABILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_RENTAL_AND_LEASE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_PARTNER_PROOF_OF_DISABILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_PARTNER_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_PROOF_OF_DISABILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_CHILDCARE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_SCHOOL_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_ADDITIONAL_HEALTH_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_EXTENSIVE_MEDICAL_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_DISABILITY_COSTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_UNIVERSITY_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_SALE_OF_PROPERTY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_ADDL_SELF_EMPLOYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_INTERNATIONAL_INCOME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_CRYPTO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PENSIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_CAPITAL_ASSETS_INTL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_EMPLOYED_WORK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_EMPLOYMENT_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_SALE_OF_PROPERTY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_ADDL_SELF_EMPLOYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_INTERNATIONAL_INCOME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_CRYPTO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_PENSIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_CAPITAL_ASSETS_INTL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_EMPLOYED_WORK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER_EMPLOYMENT_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_HEALTH_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_RURUP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_REISTER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_UNEMPLOYMENT_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PENSION_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_VEHICLE_LIABILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_ACCIDENT_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_LIFE_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_DISABILITY_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_EXTRAORDINARY_BURDENS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PRIVATE_DONATIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_HOUSEHOLD_SERVICES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_ALIMENTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_UNIVERSITY_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_HEALTH_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_RURUP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_REISTER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_UNEMPLOYMENT_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_PENSION_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_VEHICLE_LIABILITY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_ACCIDENT_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_LIFE_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_DISABILITY_INSURANCE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_EXTRAORDINARY_BURDENS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_PRIVATE_DONATIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_HOUSEHOLD_SERVICES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_ALIMENTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_UNIVERSITY_FEES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER_OTHER</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_STARTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>STARTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMPLETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DOCUMENTS_UPLOADED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireTaskStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TO_DO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_PROGRESS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_REVIEW</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMPLETED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### QuestionnaireType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>START_OF_THE_YEAR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_BASIC_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_CAR_USAGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_OFFICE_USAGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_TRAVEL_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_BOOKKEEPING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_CHILD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_BASIC_DATA_PARTNER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_PRIVATE_EXPENSES_PARTNER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EOY_INCOME_TAX_ADDITIONAL_INCOME_PARTNER</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### RequestPlatform

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>MOBILE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEB</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GIOVANNI</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BACKOFFICE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EMAIL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVOICING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BACKEND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NATIVE_SHARE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ReviewTriggerName

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>GOOGLEPAY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OVERDRAFT_OFFERED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VIRTUAL_CARD_ACTIVATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PHYSICAL_CARD_ACTIVATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OUTGOING_TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RECEIPTS_SCANNED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BATCH_TRANSFERS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SETTINGS_BUTTON_CLICKED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ReviewTriggerPlatform

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>MOBILE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEBAPP</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### RiskClassificationStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_SCORED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POTENTIAL_RISK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NORMAL_RISK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INFORMATION_REQUESTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INFORMATION_RECEIVED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RISK_ACCEPTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RISK_REJECTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CUSTOMER_UNRESPONSIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCORING_NOT_REQUIRED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ScopeType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>OFFLINE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACCOUNTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USERS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRANSACTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRANSFERS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUBSCRIPTIONS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>STATEMENTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ADMIN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLIENTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OVERDRAFT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BANNERS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SIGNUP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CARD_FRAUD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CHANGE_REQUEST</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ScreeningProgress

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_SCREENED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POTENTIAL_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCREENED_ACCEPTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCREENED_DECLINED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ScreeningStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_SCREENED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POTENTIAL_MATCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCREENED_ACCEPTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCREENED_DECLINED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### SepaTransferStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>AUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONFIRMED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### StandingOrderReoccurrenceType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>MONTHLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>QUARTERLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EVERY_SIX_MONTHS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ANNUALLY</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### Status

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ERROR</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxCaseStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_STARTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_PROGRESS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DONE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclarationStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_RELEVANT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OPEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_PROGRESS_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONSULTATION_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMPLETED_BY_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_PROGRESS_OPS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMPLETED_BY_OPS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>IN_PROGRESS_TAX_CONSULTANT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>APPROVED_BY_TAX_CONSULTANT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OBJECTED_BY_TAX_CONSULTANT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WAITING_FOR_USER_APPROVAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>APPROVED_BY_USER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OBJECTED_BY_USER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUBMITTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OBJECTED_BY_FINANZAMT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RECEIVED_TAX_BILL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CLOSED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>APPEAL_PROCESS_STARTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>APPEAL_PROCESS_COMPLETED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxDeclarationType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>EUER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_ANNUAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRADE_TAX</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INCOME_TAX</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxNumberType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PERSONAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BUSINESS</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TaxPaymentFrequency

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>QUARTERLY</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### ThreeStateAnswer

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>YES</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NO</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_SURE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionCategory

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PRIVATE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_0</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_5</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_7</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_16</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_19</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_REFUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_REFUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_SAVING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TAX_SAVING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REVERSE_CHARGE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionFeeStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CHARGED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REFUNDED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REFUND_INITIATED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionFeeType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ATM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FOREIGN_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DIRECT_DEBIT_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SECOND_REMINDER_EMAIL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CARD_REPLACEMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>KONTIST_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FREE_KONTIST_TRANSACTION</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransactionProjectionType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CARD_USAGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ATM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CASH_MANUAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREDIT_PRESENTMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CASH_ATM_REVERSAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CASH_MANUAL_REVERSAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PURCHASE_REVERSAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OCT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORCE_POST_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DEBIT_PRESENTMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DISPUTE_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCEL_MANUAL_LOAD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DIRECT_DEBIT_AUTOMATIC_TOPUP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DIRECT_DEBIT_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DISPUTE_CLEARING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MANUAL_LOAD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WIRE_TRANSFER_TOPUP</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRANSFER_TO_BANK_ACCOUNT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_BOOKING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_DOUBLE_BOOKING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREDIT_TRANSFER_CANCELLATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CURRENCY_TRANSACTION_CANCELLATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DIRECT_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FOREIGN_PAYMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>OTHER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SEPA_CREDIT_TRANSFER_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SEPA_CREDIT_TRANSFER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SEPA_DIRECT_DEBIT_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SEPA_DIRECT_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TRANSFER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTERNATIONAL_CREDIT_TRANSFER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_SEPA_DIRECT_DEBIT_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REBOOKING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_DIRECT_DEBIT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_SEPA_CREDIT_TRANSFER_RETURN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CARD_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTEREST_ACCRUED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_INTEREST_ACCRUED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>COMMISSION_OVERDRAFT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CHARGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DEPOSIT_FEE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VERIFICATION_CODE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_CARD_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELLATION_CHARGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INTRA_CUSTOMER_TRANSFER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SEPAInstantCreditTransfer</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>Target2CreditTransfer</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CorrectionCardTransaction</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RebookedSEPADirectDebitCoreReturn</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>RebookedSEPACreditTransferReturn</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ChargeRecallRequest</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CorrectionSEPACreditTransfer</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>InterestExcessDeposit</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>InterestOverdraft</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>InterestOverdraftExceeded</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ReimbursementCustomer</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXTERNAL_TRANSACTION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXTERNAL_TRANSACTION_CASH</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransferStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>AUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONFIRMED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ACTIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INACTIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCELED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AUTHORIZATION_REQUIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONFIRMATION_REQUIRED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCHEDULED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXECUTED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FAILED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### TransferType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>SEPA_TRANSFER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>STANDING_ORDER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TIMED_ORDER</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### UserConfirmation

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TAX_DECLARATION_NOT_NEEDED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>TOOLS_DOCUMENTS_UPLOADED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ADVISOR_DOCUMENTS_UPLOADED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>MANUAL_DOCUMENTS_UPLOADED</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### UserDependentType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PARTNER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CHILD</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### UserReviewStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>REVIEWED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POSITIVE_REMINDER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POSITIVE_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NEGATIVE_PENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NEGATIVE_REMINDER</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FEEDBACK</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### UserVatRate

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>VAT_0</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_19</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### VatRate

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>VAT_0</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_5</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_7</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_16</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VAT_19</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>REVERSE_CHARGE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxTransactionSortField

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>AMOUNT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOKING_DATE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CREATED_BY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DEBTOR_IBAN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DEBTOR_NAME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ID</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>STATUS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>VALUE_DATE</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxTransactionSortOrder

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ASC</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DESC</strong></td>
<td></td>
</tr>
</tbody>
</table>

#### bankTaxTransactionStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BOOKED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PENDING</strong></td>
<td></td>
</tr>
</tbody>
</table>

### Scalars

#### Boolean

The `Boolean` scalar type represents `true` or `false`.

#### DateTime

The javascript `Date` as string. Type represents date and time as the ISO Date string.

#### Float

The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).

#### ID

The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.

#### Int

The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.

#### JSON

The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).

#### JSONObject

The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).

#### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.

#### bankTaxDateTime

A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format.


### Interfaces


#### FilterPreset

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

<!-- END graphql-markdown -->
