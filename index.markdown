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


## Kontist SDK

Our JavaScript SDK helps you to easily connect to our services. It was developed for Node.js and browser environments and contains TypeScript type definitions. Please run `npm install @kontist/client` to install the latest version.

For details, please refer to our [GitHub repository](https://github.com/kontist/sdk).


## GraphQL Playground

The [Playground](/playground) is an interactive, in-browser application that can be used to explore the GraphQL interface we provide. You may authorize the application with the same credentials that you use for the Kontist mobile app.

![Playground Screenshot](/assets/playground.png){:class="img-responsive"}
