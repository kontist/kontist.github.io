---
layout: page
permalink: /
---

Discover all the services of our platform so that you can build or integrate your application with Kontist.

<!-- Begin Mailchimp Signup Form -->
<div class="center_container">
  <div id="mc_embed_signup_inline">
    <form action="https://kontist.us10.list-manage.com/subscribe/post?u=a0597b42ebb33ccf3df14bb91&amp;id=2fa43ce69c" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
        <div id="mc_embed_signup_scroll">
      <h2 class="footer-heading">Subscribe to our developer news</h2>
    <div class="mc-field-group">
      <input type="email" value="" autocomplete="home email" name="EMAIL" class="required email" placeholder="Email Address" id="mce-EMAIL">
      <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">
    </div>
      <div id="mce-responses" class="clear">
        <div class="response" id="mce-error-response" style="display:none"></div>
        <div class="response" id="mce-success-response" style="display:none"></div>
      </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
        <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_a0597b42ebb33ccf3df14bb91_2fa43ce69c" tabindex="-1" value=""></div>
        </div>
    </form>
  </div>
</div>
<!--End mc_embed_signup-->

## Getting started

We provide you with a [GraphQL API](https://graphql.org) to e.g. fetch transactions or start new transfers.

For exploring the API we recommend the [Playground application](/playground).

When you are ready for implementation you first need to [register your own application](/client-management) with us as an OAuth2 client. Then you can use your application to create an access token to access Kontist on behalf of a user. With that access token you can then make requests to our `/api/graphql` endpoint.

For an easier start we provide you with [our SDK](/sdk).

We suggest the following steps:
* [Open your Kontist bank account](https://start.kontist.com/?utm_campaign=kontist_dev) (if you do not have one yet)
* Explore our API with the [Playground](/playground)
* Read the GraphQL [Docs](/docs)
* [Register](/client-management) your own application
* Use our [SDK](/sdk) in your application
* or directly use the `/api/graphql` endpoint

## Kontist SDK

Our [JavaScript SDK](/sdk) helps you easily connect to our services. It was developed for Node.js and the browser and contains TypeScript type definitions. Just run `npm install kontist` to install the latest version.

The SDK includes authentication convenience methods and provides methods for the most common use cases, e.g. creating a new transfer:
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

## Questions? Issues?

Feel free to open a ticket if you would like to give feedback on this website or suggest changes [here](https://github.com/kontist/kontist.github.io/issues/new).
