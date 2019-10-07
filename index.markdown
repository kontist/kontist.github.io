---
layout: page
permalink: /
---

Welcome. Discover all the services of our platform so that you can build or integrate your service with Kontist.

## Getting started
We provide you with a [GraphQL API](https://graphql.org) to fetch transactions or start new transfers.

First you need to [register your own application](/console) with us as an OAuth2 client, then you can use your application to create an access token to access Kontist on behalf of a user. With that access token you can make requests to our `/api/graphql` endpoint.
For an easier start we provide you with our SDK.


## Kontist SDK
Our JavaScript SDK helps you to easily connect to our services. It was developed for Node.js and browser environments and already contains TypeScript type definitions. Please run `npm install @kontist/sdk` to install the latest version. You can then use it like this:

```typescript
import { Client } from "@kontist/sdk";

const client = new Client({ clientId: "<Insert your Client ID here>" });
// TODO 

```

Please refer to the [Documentation](/sdk) or our [GitHub repository](https://github.com/kontist/sdk) for details.


## GraphQL Playground
// TODO