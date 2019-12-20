---
layout: page
permalink: /docs/advanced-authentication
---

The features described here require special environments and/or extended settings for your OAuth2 client. Please [get in touch with us](mailto:developer@kontist.com) if you want to discuss your requirements.

## Advanced Authentication


### Device Binding
Some entities require strong customer authentication, so you need to pass multi-factor authentication (MFA) and get a confirmed access token. To avoid repeating push notifications some clients may use device binding.

**Device Binding will only be possible if you can store a private key in a secure location (like e.g. a hardware-backed keystore).**

To pass device binding authentication you need to generate a pair of private and public keys by using elliptic curve algorithm (secp256r1). To create and verify your device you need to pass your public key and then sign OTP from SMS received on your phone.

After that, you can use your device id and your private key to get your confirmed auth token by creating and verifying device challenge.


### Create device

To initiate the device binding you need to create a device by providing your **public key**.

Please, make sure that you **never share your private key** and it's stored in a secure place.

After a successful request, you will receive an SMS with OTP that you will need during device verification.

```shell
curl "https://api.kontist.com/api/user/devices" \
  -H "Authorization: Bearer ey..." \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
        "name": "iPhone XS",
        "key": "0402e86575939cd541f016b69b1bc6ee97736f7a6d32c0ad375695ffdc03acf21a3b54224fd164ad6f9cfdfb42b74f49f3d34a41f95d62e893be4977c7ec154f29"
      }'
```

> The above command returns JSON structured like this:
```json
{
  "deviceId": "4e310a55-1b1a-4efb-b9a5-fd04491bdd21",
  "challengeId": "4e310a55-1b1a-4efb-b9a5-fd04491bdd21"
}
```

#### HTTP Request

`POST https://api.kontist.com/api/user/devices`

#### Request body

| Parameter | Mandatory | Description                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------ |
| name      | yes       | The name of the device                                                         |
| key       | yes       | The hex-encoded public key without header                                      |

#### Response

| Field       | Description                                                                    |
| ----------- | ------------------------------------------------------------------------------ |
| deviceId    | ID of the device                                                               |
| challengeId | ID of the challenge                                                            |

### Verify device

To verify device you need to provide a signature of OTP received on your mobile phone.

```shell
curl "https://api.kontist.com/api/user/devices/4e310a55-1b1a-4efb-b9a5-fd04491bdd21/verify" \
  -H "Authorization: Bearer ey..." \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
        "challengeId": "4e310a55-1b1a-4efb-b9a5-fd04491bdd21",
        "signature": "30440220220B71BA03178A43B6CFA766F1B520CA1A626777F76B21253F9EC5039F4A0EB3022043CF2685C8F695F434862EADD1D5F5D6F68C29E875F755D058070A71E8338E11"
      }'
```

> The above command returns `204 No Content` in case of success.
#### HTTP Request

`POST https://api.kontist.com/api/user/devices/{device_id}/verify`

#### Request body

| Parameter   | Mandatory | Description                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------ |
| challengeId | yes       | ID of the challenge recieved during device creation                            |
| signature   | yes       | The hex-encoded signature for the OTP recived in SMS                           |

### Create device challenge

After the device is created and verified, you need to create a device challenge. As a response, you will receive `stringToSign` that should be used during verification of device challenge.

```shell
curl "https://api.kontist.com/api/user/devices/4e310a55-1b1a-4efb-b9a5-fd04491bdd21/challenges" \
  -H "Authorization: Bearer ey..." \
  -X POST
```

> The above command returns JSON structured like this:
```json
{
  "id": "5f7c36e2-e0bf-4755-8376-ac6d0711192e",
  "stringToSign": "9e2d45df-9b00-49d3-9064-29b86374fe67"
}
```

#### HTTP Request

`POST https://api.kontist.com/api/user/devices/{device_id}/challenges`

#### Response

| Field         | Description                                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| id            | ID of the challenge                                                            |
| stringToSign  | Challenge string that should be signed by device private key                   |


### Verify device challenge

To verify device challenge you need to provide a signature of `stringToSign` received after challenge creation. Performing this verification will grant you a confirmed access token giving you access to all banking APIs.

If the OAuth2 client involved uses refresh tokens, you will also obtain a confirmed refresh token with the response. Such a refresh token can be used to renew confirmed access tokens. This will allow you to perform the device challenge verification procedure only once for the whole lifetime of your refresh token.

```shell
curl "https://api.kontist.com/api/user/devices/4e310a55-1b1a-4efb-b9a5-fd04491bdd21/challenges/5f7c36e2-e0bf-4755-8376-ac6d0711192e/verify" \
  -H "Authorization: Bearer ey..." \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
        "signature": "FF93DF062DB808E35AB9D28D80E0B261C7313C69785471954C05A474156BA7A7F07F2F0E7E805513754A8119BBF172E1E6D0103901249CE8DE012E5E61FDA36AD06405341043"
      }'
```

> The above command returns JSON structured like this:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODNjNTc4ZS01M2QwLTRhYmEtOTBiNC02MmRmZmFkNTE5NTMiLCJzY29wZSI6ImF1dGgiLCJjbmYiOnsia2lkIjoiMmExNjRlYzYtZTJkNC00OTI4LTk5NDItZDU5YWI2Yzc4ZDU5In0sImlhdCI6MTU2NzQwOTExNSwiZXhwIjoxNTY3NDEyNzE1fQ.m35NDpQMAB5DMebXUxEzWupP3i-iAwoyVy2sGF1zp_8",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTIwMmUwZi0yOWE4LTRlNDgtODcyNi01OGFiMDAxNDBiNTgiLCJzY29wZSI6InJlZnJlc2ggYWNjb3VudHMgb2ZmbGluZSIsImNsaWVudF9pZCI6IjU4NjcwYmRhLWQxZDEtNGJlOC1hZGEyLTcwNjFkZWVhYjMxNyIsImNuZiI6eyJraWQiOiJlNTA3NTQ5NC1iNWM0LTRjYTEtYjE4MC01ZjNjNTBhNjA2OWMifSwiaWF0IjoxNTc2ODM2MDU5LCJleHAiOjE1NzY4NDMyNTl9.DydSAzxAFncGlWQMNZZp4q48EjAoz6FR6IboxTPx2j4"
}
```

#### HTTP Request

`POST https://api.kontist.com/api/user/devices/{device_id}/challenges/{challenge_id}/verify`

#### Request body

| Parameter   | Mandatory | Description                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------ |
| signature   | yes       | The hex-encoded signature for the `stringToSign`                                |

#### Response

| Field           | Description                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| token           | Auth token with confirmation claim that should be used for endpoints that require strong customer authentication    |
| refresh_token   | Refresh token with confirmation claim that can be used to renew confirmed access tokens                             |

### Setting up your own Multi-Factor Authentication flow

If you have implemented [Device Binding](#device-binding), you can also setup your own Multi-Factor Authentication on top of it for environments not allowing you to store private keys (e.g. a web application).

You can follow all the steps of the [push notification MFA flow](/docs#multi-factor-authentication) that we provide, and setup your own challenge verification procedure.


#### Getting pending challenges

In your application with Device Binding, you can get all pending challenges for the current user:

```shell
curl "https://api.kontist.com/api/user/mfa/challenges" \
  -H "Authorization: Bearer ey..." \
  -H "Content-Type: application/json" \
  -X GET
```

> The above command returns JSON structured like this:
```json
[
  {
    "id": "b1ed17e9-2944-4c14-9780-57dce7f01ca8",
    "status": "PENDING",
    "expiresAt": "2019-12-05T09:02:22.319+00:00"
  },
  {
    "id": "08e9429c-5e21-4b1d-959d-c435a0f1cd99",
    "status": "PENDING",
    "expiresAt": "2019-12-05T09:02:24.641+00:00"
  }
]
```

#### HTTP Request

`GET https://api.kontist.com/api/user/mfa/challenges`


#### Verifying challenges

Then, if you are in possession of a *confirmed* token obtained with Device Binding, the MFA challenges can be verified by accessing this endpoint:

```shell
curl "https://api.kontist.com/api/user/mfa/challenges/b1ed17e9-2944-4c14-9780-57dce7f01ca8" \
  -H "Authorization: Bearer ey..." \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{
        "status": "VERIFIED"
      }'
```

> The above command returns `204 No Content` in case of success.


##### HTTP Request

`PATCH https://api.kontist.com/api/user/mfa/challenges/{challenge_id}`

##### Request body

| Parameter   | Mandatory | Description                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------ |
| status      | yes       | The status to update the challenge to. `VERIFIED` and `DENIED` are valid       |

