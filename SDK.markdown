---
layout: page
title: SDK
permalink: /sdk/
sidebar: true
---

We provide you with a NPM package for Node.js and Browser environments, please see our [GitHub page for details](https://github.com/kontist/sdk).

## Installation

### Node.js
Please install the SDK via `npm install kontist --save`. Depending on your application type you can then import it with

```typescript
import { Client } from "kontist";
```

### Browser
For your web application you can install the SDK via `npm install kontist --save` and then just load the bundle via

```html
<script src="node_modules/kontist/dist/bundle.js"></script>
```

If you prefer you can skip the `npm install` and just use the latest version from our CDN with

```html
<script src="https://cdn.kontist.com/sdk.min.js"></script>
```

## Authentication

### Node.js

If you are developing an application where you can store a `clientSecret` you can authorize with regular OAuth2. In this example we will use `express`.

TypeScript users should add `"lib": ["es2015", "dom"]` to their `tsconfig.json`.

```typescript
import express from "express";
import { Client } from "kontist";
const app = express();
```

We need to provide the values for our app from the [API Console](/console) and set the state to a random number. If did not open an account with Kontist yet you [should do so now](https://start.kontist.com/?utm_campaign=kontist_dev).

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
app.listen(3000, function() {
  console.log("Listening on port 3000!");
});
```

If you now visit `http://localhost:3000/auth` you will be directed to the Kontist login and then back to your application. The token will then be printed at the console and you can start using the client.

### Browser
In some environments we cannot store a client secret without exposing it (e.g. a web application without a backend). To authorize the client we will use OAuth2 with the PKCE extension. During initialization of the client you just need to provide a `verifier` and persist it across page reloads. Next to that you need to provide your `clientId`, a `state` and `redirectUri`. You can setup all of this in the [API Console](/console). If did not open an account with Kontist yet you [should do so now](https://start.kontist.com/?utm_campaign=kontist_dev).

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

### Using an existing token

If you already obtained an access token previously (either with a previous SDK authentication or with any other method like using Kontist's REST API directly), you can configure your SDK client instance to use this token with this method:

```typescript
const token = kontistClient.auth.setToken(accessToken);
```

All SDK requests will then be performed with this new access token.

Optionally, you can also provide a refresh token if you have one:

```typescript
const token = kontistClient.auth.setToken(accessToken, refreshToken);
```

### Renewing access tokens

After the initial authentication steps described above, renewing access tokens can be done using this simple method:

```typescript
const token = await kontistClient.auth.refresh();
```

Optionally, this method accepts a number as an argument to specify after how many milliseconds the refresh request should timeout (default is 10000):

```typescript
// abort after 20 seconds
const token = await kontistClient.auth.refresh(20000);
```

The method is the same for both Node.js and Browser environments (it uses refresh tokens or PKCE with `response_mode=web_message` respectively).

### Multi-Factor Authentication

Accessing Kontist banking APIs require Multi-Factor Authentication (MFA).

MFA is available once you have installed the Kontist application and paired your device in it.

The following steps are necessary to complete the MFA procedure:
1. initiate the procedure by creating a challenge (Kontist SDK exposes a method to do that)
2. click the push notification you received on your phone, it will open the Kontist application
3. login (if applicable) and confirm the MFA by clicking on the corresponding button

Kontist SDK exposes a method to initiate the MFA flow after you successfully received the initial access token:

```typescript
// fetch a regular access token
const token = await client.auth.fetchToken(callbackUrl);
try {
  // create an MFA challenge and wait for confirmation
  const confirmedToken = await client.auth.getMFAConfirmedToken();
  // once it has been verified, your `client` instance will have a confirmed access token
  // the confirmed token is also returned in case you want to store it
} catch (err) {
  // if the challenge expires, a `ChallengeExpiredError` will be thrown
  // if the challenge is denied, a `ChallengeDeniedError` will be thrown
  console.log(err);
}
```

After obtaining a confirmed auth token with this method, you will have access to all banking APIs.

If you want to cancel a pending MFA confirmation, you can call the following method:

```typescript
client.auth.cancelMFAConfirmation();
```

The Promise returned by `getMFAConfirmedToken` will then reject with a `MFAConfirmationCanceledError`.


### Advanced Topics
Some clients might use device binding with certificates as MFA or make use of other OAuth2 grant types. This depends on the environment where this application will run. Please see our [advanced topics](/sdk/advanced-authentication) on authentication.

## Using the SDK

### Fetch transactions

You can use the `fetch` method to fetch the last 50 transactions:

```typescript
const result = await client.models.transaction.fetch();
```

`result` then has following structure:

```javascript
{
  items: [
    {
      id: "08995f8f-1f87-42ab-80d2-6e73a3db40e8",
      amount: 4711,
      name: "Example",
      iban: null,
      type: "SEPA_CREDIT_TRANSFER",
      bookingDate: "1570399200000",
      valutaDate: "2019-10-06T22:00:00.000+00:00",
      originalAmount: null,
      foreignCurrency: null,
      e2eId: null,
      mandateNumber: null,
      paymentMethod: "bank_account",
      category: null,
      userSelectedBookingDate: null,
      purpose: "kauf+dir+was",
      bookingType: "SEPA_CREDIT_TRANSFER",
      documentNumber: null,
      documentPreviewUrl: null,
      documentDownloadUrl: null,
      documentType: null
    }
    // ...
  ];
}
```

If there are more than 50 transactions, `result` will contain also `nextPage` method. When called, `nextPage` will return another `result` object.

Another way would be to just iterator over `client.models.transaction`. It implements the `AsyncIterator` interface, so you can do this to fetch all transactions:
```typescript
let transactions = [];
for await (const transaction of client.models.transaction) {
  transactions = transactions.concat(transaction);
}
```

### Create a new transfer

To create and confirm a transfer:

```typescript
const confirmationId = await client.models.transfer.createOne({
  amount: 1234,
  recipient: "<recipent_name>",
  iban: "<recipent_iban>",
  purpose: "<optional_description>",
  e2eId: "<optional_e2eId>",
});

// wait for sms
const smsToken = "...";

const result = await client.models.transfer.confirmOne(
  confirmationId,
  smsToken
);
```

### Create multiple transfers

To create and confirm multiple transfers (with only one confirmation):

```typescript
const confirmationId = await client.models.transfer.createMany([{
  amount: 1234,
  recipient: "<recipent_name>",
  iban: "<recipent_iban>",
  purpose: "<optional_description>",
  e2eId: "<optional_e2eId>",
}, {
  amount: 4567,
  recipient: "<recipent_name>",
  iban: "<recipent_iban>",
  purpose: "<optional_description>",
  e2eId: "<optional_e2eId>",
}]);

// wait for sms
const smsToken = "...";

const result = await client.models.transfer.confirmMany(
  confirmationId,
  smsToken
);
```

### Create a standing order
See "Create a new transfer", but please include these additional fields:
```
executeAt: "<execution_date>" // e.g. 2017-03-30T12:56:54+00:00
lastExecutionDate: "<optional_date>" // optional, e.g. 2019-05-28T12:56:54+00:00
reoccurrence: "<StandingOrderReoccurenceType>" // e.g. StandingOrderReoccurenceType.Monthly
```

For `reoccurrence` please see `StandingOrderReoccurenceType` enum: `Monthly, Quarterly, EverySixMonths, Annually`


Please note that you can only create one (not many) standing orders at the same time.


### Create a timed order
See "Create a new transfer", but please include this additional field:
```
executeAt: "<execution_date>" // e.g. 2017-03-30T12:56:54+00:00
```

Please note that you can only create one (not many) timed orders at the same time.


### Plain GraphQL requests

You can use the `rawQuery` method to send plain requests to the GraphQL endpoint like this:

```typescript
const query = `{
  viewer {
    mainAccount {
      iban
      balance
    }
  }
}`;

const result = await client.graphQL.rawQuery(query);
```
