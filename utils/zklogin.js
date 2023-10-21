'use client';

import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import Cookies from 'js-cookie';

export async function generateNonceForLogin() {
  function byteArrayToBigInt(byteArray) {
    const hex = Array.from(byteArray, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    return BigInt('0x' + hex);
  }

  function generateRandomBigInt(size) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(size));
    return BigInt(
      '0x' +
        [...randomBytes]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')
    );
  }

  const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });
  const { epoch } = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(epoch) + 2;

  const ephemeralKeyPair = new Ed25519Keypair();
  console.log('ephemeralKeyPair 1: ', ephemeralKeyPair);
  const pubkey = ephemeralKeyPair.getPublicKey();
  const pubkeyBigInt = byteArrayToBigInt(pubkey.data);

  const randomness = generateRandomBigInt(16);
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(),
    maxEpoch,
    randomness
  );

  const exportedKeypair = ephemeralKeyPair.export();
  const exportedPrivateKey = exportedKeypair.privateKey;

  Cookies.set('randomness', randomness, { path: '' });
  Cookies.set('publickey', pubkeyBigInt, { path: '' });
  Cookies.set('maxepoch', maxEpoch, { path: '' });
  Cookies.set('privatekey', exportedPrivateKey, { path: '' });

  return nonce;
}
