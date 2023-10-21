import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { genAddressSeed, getZkLoginSignature } from '@mysten/zklogin';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';

export const POST = async (req) => {
  function base64ToUint8Array(base64String) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function decodeJwtPayload(jwt) {
    const parts = jwt.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT');
    }

    const payloadBase64 = parts[1];
    const payloadStr = atob(payloadBase64);

    return JSON.parse(payloadStr);
  }

  try {
    const { payload, zklogin, privatekey } = await req.json();
    console.log('zklogin: ', zklogin);

    const jwtPayload = decodeJwtPayload(payload.jwt);
    console.log('Decoded JWT Payload:', jwtPayload);

    const response = await fetch('https://prover.mystenlabs.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const partialZkLoginSignature = await response.json();

    const client = new SuiClient({ url: getFullnodeUrl('devnet') });

    try {
      await requestSuiFromFaucetV0({
        host: getFaucetHost('devnet'),
        recipient: zklogin,
      });
      // const balance = await client.getCoins({
      //   owner: zklogin,
      // });
    } catch (error) {
      console.log(
        'Error with requestSuiFromFaucetV0 or getCoins, but proceeding:',
        error
      );
    }

    console.log('privatekey: ', privatekey);
    const privateKeyUint8Array = base64ToUint8Array(privatekey);
    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyUint8Array);
    console.log('ephemeralKeyPair 2', ephemeralKeyPair);

    const txb = new TransactionBlock();

    txb.setSender(zklogin);

    const { bytes, signature: userSignature } = await txb.sign({
      client,
      signer: ephemeralKeyPair,
    });

    console.log('bytes', bytes);
    console.log('userSignature', userSignature);

    const addressSeed = genAddressSeed(
      BigInt('0'),
      'sub',
      jwtPayload.sub,
      jwtPayload.aud
    ).toString();
    console.log('addressSeed', addressSeed);

    const maxEpoch = payload.maxEpoch;

    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...partialZkLoginSignature,
        addressSeed,
      },
      maxEpoch,
      userSignature,
    });
    console.log('zkLoginSignature', zkLoginSignature);

    const final = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature: zkLoginSignature,
    });

    console.log('FINAL', final);

    if (response.ok) {
      return new Response(
        JSON.stringify({
          final,
          zklogin,
          username: jwtPayload.email.split('@')[0],
        }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify(final), { status: response.status });
    }
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
};
