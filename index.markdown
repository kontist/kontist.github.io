---
layout: page
permalink: /
---

Welcome. Discover all the services of our platform so that you can build or integrate your application with Kontist.

## Getting started

We provide you with a [GraphQL API](https://graphql.org) to e.g. fetch transactions or start new transfers.

For exploring the API we recommend the [Playground application](/playground).

When you are ready for implementation you first you need to [register your own application](/console) with us as an OAuth2 client. Then you can use your application to create an access token to access Kontist on behalf of a user. With that access token you then can make requests to our `/api/graphql` endpoint.

For an easier start we provide you with [our SDK](/sdk).

We suggest this steps:
* [Open you Kontist bank account](https://start.kontist.com/?pid=DeveloperProgram) (if you do not have one yet)
* Explore our API with the [Playground](/playground)
* Read the GraphQL [Docs](/docs)
* [Register](/console) your own application
* Use our [SDK](/sdk) in your application
* or directly use the `/api/graphql` endpoint

## Kontist SDK

Our [JavaScript SDK](/sdk) helps you to easily connect to our services. It was developed for Node.js and browser environments and contains TypeScript type definitions. Just run `npm install @kontist/client` to install the latest version.

The SDK supports you with Authentication and provides methods for the most common use cases, e.g. create a new transfer:
```typescript
const confirmationId = await client.models.transfer.createOne({
  amount: 1234,
  recipient: "Johnny Cash",
  iban: "DE07123412341234123412",
  purpose: "test transfer",
});

// wait for sms
const smsToken = "...";

await client.models.transfer.confirmOne(confirmationId, smsToken);
```

## GraphQL Playground

The [Playground](/playground) is an interactive, in-browser application that can be used to explore the GraphQL interface we provide. You may authorize the application with the same credentials that you use for the Kontist mobile app.

![Playground Screenshot](/assets/playground.png){:class="img-responsive"}
