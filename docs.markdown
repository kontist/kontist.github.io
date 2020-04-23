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

Confirm a Standing Order cancelation

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
<td colspan="2" valign="top"><strong>updateSubscriptionPlan</strong></td>
<td valign="top"><a href="#updatesubscriptionplanresult">UpdateSubscriptionPlanResult</a>!</td>
<td>

Update user's subscription plan

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">newPlan</td>
<td valign="top"><a href="#purchasetype">PurchaseType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>whitelistCard</strong></td>
<td valign="top"><a href="#whitelistcardresponse">WhitelistCardResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">fraudCaseId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmFraud</strong></td>
<td valign="top"><a href="#confirmfraudresponse">ConfirmFraudResponse</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">fraudCaseId</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
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
<td colspan="2" valign="top"><strong>categorizeTransaction</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
<td>

Categorize a transaction with an optional custom booking date for VAT or Tax categories

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
<td colspan="2" valign="top"><strong>requestOverdraft</strong></td>
<td valign="top"><a href="#overdraft">Overdraft</a></td>
<td>

Create Overdraft Application  - only available for Kontist Application

</td>
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
<td colspan="2" valign="top"><strong>dismissBanner</strong></td>
<td valign="top"><a href="#mutationresult">MutationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#bannername">BannerName</a>!</td>
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
<td colspan="2" valign="top"><strong>balance</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardHolderRepresentations</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
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
<td colspan="2" valign="top"><strong>taxPastYearAmount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

The amount of tax that was owed last year

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
<td colspan="2" valign="top"><strong>cardPresentLimits</strong></td>
<td valign="top"><a href="#cardlimits">CardLimits</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardNotPresentLimits</strong></td>
<td valign="top"><a href="#cardlimits">CardLimits</a></td>
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
<td valign="top"><a href="#string">String</a>!</td>
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
<td valign="top"><a href="#string">String</a>!</td>
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
<td colspan="2" valign="top"><strong>newTransaction</strong></td>
<td valign="top"><a href="#transaction">Transaction</a>!</td>
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
<td colspan="2" valign="top"><strong>userSelectedBookingDate</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td>

When a transaction corresponds to a tax or vat payment, the user may specify at which date it should be considered booked

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
<td valign="top"><a href="#int">Int</a></td>
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
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurencetype">StandingOrderReoccurenceType</a></td>
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
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#datetime">DateTime</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatCutoffLine</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxCutoffLine</strong></td>
<td valign="top"><a href="#datetime">DateTime</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatPaymentFrequency</strong></td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxPaymentFrequency</strong></td>
<td valign="top"><a href="#paymentfrequency">PaymentFrequency</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>taxRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>vatRate</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>identificationStatus</strong></td>
<td valign="top"><a href="#identificationstatus">IdentificationStatus</a></td>
<td>

The user's IDNow identification status

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>identificationLink</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The link to use for IDNow identification

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
<td colspan="2" valign="top"><strong>companyType</strong></td>
<td valign="top"><a href="#companytype">CompanyType</a></td>
<td></td>
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
<td colspan="2" valign="top"><strong>vatNumber</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>referralCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The user's referral code to use for promotional purposes

</td>
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
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>whitelisted_until</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Inputs

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
<td valign="top"><a href="#cardlimitinput">CardLimitInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>monthly</strong></td>
<td valign="top"><a href="#cardlimitinput">CardLimitInput</a>!</td>
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
<td colspan="2" valign="top"><strong>cardPresentLimits</strong></td>
<td valign="top"><a href="#cardlimitsinput">CardLimitsInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>cardNotPresentLimits</strong></td>
<td valign="top"><a href="#cardlimitsinput">CardLimitsInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contactlessEnabled</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
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
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the SEPA Transfer

</td>
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
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the transfer

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurencetype">StandingOrderReoccurenceType</a></td>
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
<td colspan="2" valign="top"><strong>e2eId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The end to end ID of the Standing Order, if not specified with the update, it will be set to null

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reoccurrence</strong></td>
<td valign="top"><a href="#standingorderreoccurencetype">StandingOrderReoccurenceType</a></td>
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

### Enums

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
<td valign="top"><strong>YEARLY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NONE</strong></td>
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

#### StandingOrderReoccurenceType

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
<td valign="top"><strong>VAT_7</strong></td>
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
<td valign="top"><strong>CREDIT_PRESENTMENT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CASH_MANUAL</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>ATM</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CANCEL_MANUAL_LOAD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CARD_USAGE</strong></td>
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

#### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.


<!-- END graphql-markdown -->
