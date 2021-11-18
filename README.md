## Setup

```
$ npm install
```

## Paying fees and checking fee balance

In order to check your fee balance you need to be able to generate an authentication token, so before you can check the balance you must pay a fee to the turret.

First, export the secret key to an environment variable the script can read from:

```
$ export STELLAR_SECRET_KEY=S123EXAMPLE
```

Then, you can run `fee-add-balance.js` which will credit you with 0.1 XLM on the SDF alpha turret:

```
$ node fee-add-balance.js
```

Now that you have a balance on the turret, you can check what your balance is:

```
$ node fee-check-balance.js
```

## Thanks to

 * [kalepail](https://nft.kalepail.com/) for an example script that builds the authorization XdrToken
 * Stellar for running the docsprint
