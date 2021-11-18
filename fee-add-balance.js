import { Server } from 'stellar-sdk'
import { Keypair, TransactionBuilder, Account, Networks, Operation, Asset } from 'stellar-base'
import fetch from 'node-fetch'

/**
 * Transfers XLM from the fee-paying account to a single Turret's account
 *
 * Requirements:
 *   - STELLAR_SECRET_KEY environment variable is set to the secret key of the fee-paying account
 *
 * To do:
 *   - Credit amount is hardcoded to the minimum fee a turret will accept
 *   - Turret is currently hardcoded to the alpha SDF one
 */
(async function() {
    const horizon = new Server('https://horizon.stellar.org')

    // Stellar address of the turret to send XLM to
    const turretBaseUrl = 'http://stellar-turrets-alpha.sdf-ecosystem.workers.dev/tx-fees/'
    const turretPublicKey = 'GAWZGM6BD6J7SZVKHV64I6VSQ5YSNNFAX67ML75IPURGYOV65JW3XX3I'

    const keypair = Keypair.fromSecret(process.env['STELLAR_SECRET_KEY'])
    //const account = new Account(keypair)
    const account = await horizon.loadAccount(keypair.publicKey())

    // This can be dynamically calculated based on the smart contract and how the turret is configured
    const creditAmountXlm = '0.1'

    console.log("Crediting %o XLM to account %o", creditAmountXlm, keypair.publicKey().toString())

    // Build a transaction that will pay the turret
    const stellarNetworkFee = await horizon.fetchBaseFee();

    const transaction = new TransactionBuilder(
        account,
        {
            fee: stellarNetworkFee,
            networkPassphrase: Networks['PUBLIC'],
        })
        .addOperation(Operation.payment( {
            destination: turretPublicKey,
            asset: Asset.native(),
            amount: creditAmountXlm
        }))
        .setTimeout(30)
        .build()

    transaction.sign(keypair)


    // Send the transaction to the turret (NOT the Stellar network! the Turret will submit it itself)
    console.log("Sending transaction to the turret...");
    const body = {
        txFunctionFee: transaction.toXDR()
    }

    await fetch(turretBaseUrl + keypair.publicKey().toString(), {
        method: 'post',
        body:    JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then(res => res.json())
        .then(json => console.log(json))
})()
