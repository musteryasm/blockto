import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Post from '@/models/post';
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import idl from './idl.json';
import crypto from 'crypto';

const connection = new Connection(clusterApiUrl('devnet'), 'processed');
const programId = new PublicKey(process.env.SOLANA_PROGRAM_ID);

const privateKeyString = process.env.SOLANA_PRIVATE_KEY;
const privateKeyBytes = bs58.decode(privateKeyString);
const myWallet = Keypair.fromSecretKey(privateKeyBytes);

const provider = new AnchorProvider(connection, new Wallet(myWallet), {
  preflightCommitment: 'processed',
});

const program = new Program(idl, programId, provider);

export const POST = async (req) => {
  await connectToDB();

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: session missing' }),
      { status: 401 }
    );
  }

  if (!session.user.address) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: user.address missing' }),
      { status: 401 }
    );
  }

  const { postCreationData, signature } = await req.json();

  if (!postCreationData || !signature) {
    return new Response(
      JSON.stringify({ error: 'postCreationData and signature are required' }),
      { status: 400 }
    );
  }

  try {
    const existingPost = await Post.findOne({ signature });
    if (existingPost) {
      console.log('Post already exists!');

      postCreationData.signature = signature;
      postCreationData.verificationId = existingPost.verificationId;

      await Post.create(postCreationData);
      return new Response(
        JSON.stringify({
          success: true,
          cid: postCreationData.cid,
          verificationId: existingPost.verificationId,
        }),
        { status: 200 }
      );
    }

    const userPublicKey = new PublicKey(session.user.address);
    const _cid = postCreationData.cid;
    const _sign = signature;
    const _user = userPublicKey;

    const hash = crypto.createHash('sha256');
    hash.update(_cid + _sign + userPublicKey.toString());
    const _seed = hash.digest('hex');

    const seedBytes = Buffer.from(_seed.slice(0, 32));

    const [contentAuthPda, _] = web3.PublicKey.findProgramAddressSync(
      [seedBytes],
      programId
    );

    console.log(contentAuthPda.toString());

    const tx = await program.methods
      .createContentAuth(_seed, _cid, _sign, _user)
      .accounts({
        authority: provider.wallet.publicKey,
        contentAuth: contentAuthPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log('Transaction:', tx);

    if (tx) {
      postCreationData.signature = signature;
      postCreationData.verificationId = contentAuthPda.toString();

      await Post.create(postCreationData);
      return new Response(
        JSON.stringify({
          success: true,
          cid: postCreationData.cid,
          verificationId: contentAuthPda.toString(),
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response('Failed to save post', { status: 500 });
  }
};
