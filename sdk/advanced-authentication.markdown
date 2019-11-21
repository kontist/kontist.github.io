---
layout: page
permalink: /sdk/advanced-authentication
---

The features described here require special environments and/or extended settings for your OAuth2 client. Please [get in touch with us](mailto:developer@kontist.com) if you want to discuss your requirements.

## Advanced Authentication

### Password-based authentication
If you'd rather handle the authentication UI flow in your app, and when your OAuth2 client supports `grant_type: password`, you could request an access token in exchange for a user's credentials in one step:

```javascript
const client = new Kontist.Client({
  baseUrl: "https://staging-api.konto.io",
  clientId: 'YOUR_CLIENT_ID',
  scopes: ["users", "subscriptions", "transfers", "accounts"]
});

client.auth.tokenManager.fetchTokenFromCredentials({ username, password })
	.then((tokenData) => {
	  // do something with tokenData.accessToken
	  //
	  // or start using client to make authenticated requests
	});
```

### Device Binding
To have access to Kontist API endpoints that require strong customer authentication, you need to pass multi-factor authentication (MFA). To make it seamless for you we provide a device binding authentication that leverages a digital signature algorithm.

**Device Binding will only be possible if you can store a private key in a secure location (like e.g. a hardware-backed keystore).**

To pass device binding authentication you need to generate a pair of private and public keys by using elliptic curve algorithm (secp256r1). To create and verify your device you need to pass your public key and then sign OTP from SMS received on your phone.

After that, you can use your device id and your private key to get your confirmed auth token by creating and verifying device challenge.

#### Create device
To initiate the device binding you need to create a device by providing your **public key**.

Please, make sure that you **never share your private key** and it's **stored in a secure place** (do not store it in a browser).

After a successful request, you will receive an SMS with OTP that you will need during device verification.

```typescript
const result = await client.auth.device.createDevice({
  name: "iPhone XS",
  key: "..." // The hex-encoded public key without header
});
```

`result` then has following structure:

```javascript
{
  deviceId: "daecde61-18a4-4010-a0f7-a8b21c27996a",
  challengeId: "daecde61-18a4-4010-a0f7-a8b21c27996a"
}
```

#### Verify device
To verify device you need to provide a signature (ECDSA with SHA256) of OTP received on your mobile phone.

```typescript
await client.auth.device.verifyDevice(deviceId, {
  challengeId,
  signature: "..." // The hex-encoded signature (ECDSA with SHA256) for the OTP received in SMS
});
```

The promise will be resolved if verification is successful.

#### Use device binding as MFA
After the device is created and verified, you need to create a device challenge. As a result, you will get `stringToSign` that should be used during verification of device challenge.

```typescript
const challenge = await client.auth.device.createDeviceChallenge(deviceId);
```

`challenge` then has following structure:

```javascript
{
  id: "83d1a026-dc80-48dc-bc15-4b672716050d", // ID of the challenge
  stringToSign: "7b6ad39f-1593-4f4d-a84d-b539cc25a3cf" // Challenge string that should be signed by device private key
}
```

#### Verify device challenge
To verify device challenge you need to provide a signature (ECDSA with SHA256) of `stringToSign` received after challenge creation.


```typescript
const token = await client.auth.device.verifyDeviceChallenge(
  deviceId,
  id, // ID of the device challenge
  {
    signature: "..." // The hex-encoded signature (ECDSA with SHA256) for the `stringToSign`
  }
);
```

After successful device challenge verification, SDK will automatically store recieved confirmed access token and you will have access to all banking APIs.
