import {Keypair, TransactionBuilder, Account, Networks, Operation, Asset, Memo, MemoHash} from 'stellar-base'
import fetch from 'node-fetch'
import crypto from "crypto";

/**
 * This function demonstrates getting a fee balance from a single turret
 *
 * Requirements:
 *  - STELLAR_SECRET_KEY environment variable is set to the secret key of the fee-paying account
 */
(async function() {
    const keypair = Keypair.fromSecret(process.env['STELLAR_SECRET_KEY'])

    // Build an Account that starts at sequence 0 (pass '-1' because it's automatically incremented)
    const zeroSequenceAccount = new Account(keypair.publicKey(), '-1')

    // Start building a transaction for the turret server to validate
    // Note that this transaction is never submitted to the network, it's to prove we know the secret key
    var transaction = new TransactionBuilder(
        zeroSequenceAccount,
        {
            fee: '0',
            networkPassphrase: Networks['PUBLIC'],
            // This needs to be a random value so the server can enforce "singleUse" below
            memo: new Memo(MemoHash, crypto.randomBytes(32).toString('hex'))
        }
    )

    // This indicates that the token can only be used for one request
    transaction.addOperation(Operation.manageData({
        name: 'singleUse',
        value: 'true'
    }))
    // Token will be valid for 10 seconds
    transaction.setTimeout(10);

    // Sign the transaction and output the XDR
    var envelope = transaction.build()
    envelope.sign(keypair)

    const url = 'http://stellar-turrets-alpha.sdf-ecosystem.workers.dev/tx-fees';
    console.log("Getting fee balance...")
    await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + envelope.toXDR(),
            },
        })
        .then(res => res.json())
        .then(json => console.log(json))
})()
