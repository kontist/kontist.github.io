---
layout: page
title: SDK
permalink: /sdk/
sidebar: true
---

We provide you with a NPM package for NodeJS + Browser, please [see GitHub for details](https://github.com/kontist/sdk).

## Using the SDK

Please install the SDK via `npm install @kontist/client --save`. Depending on your application you can then either import it with

```typescript
import { Client } from "@kontist/client";
```

or just load the bundle via

```html
<script src="node_modules/@kontist/client/dist/bundle.js"></script>
```

If you prefer you can use the latest version from our CDN with

```html
<script src="https://cdn.kontist.com/sdk.min.js"></script>
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
app.listen(3000, function() {
  console.log("Listening on port 3000!");
});
```

If you now visit `http://localhost:3000/auth` you will be directed to the Kontist login and then back to your application. The token will then be printed at the console and you can start using the client.

### Fetching transactions

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

{::comment}

### Creating a new transfer

{:/comment}

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
