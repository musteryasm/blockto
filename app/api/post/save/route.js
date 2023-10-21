import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Post from '@/models/post';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS);
const client = new SuiClient({ url: getFullnodeUrl('devnet') });
const tx = new TransactionBlock();

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

    tx.moveCall({
      target:
        '0x725033e783f658a4625f46825e013a47f12ebed8f182220932dd3688c1af7cc7::blockto_sui::create_record',
      arguments: [
        tx.pure.string(postCreationData.cid),
        tx.pure.string(session.user.address),
        tx.pure.string(signature),
      ],
    });

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
    });
    console.log({ result });

    const txn = await client.getTransactionBlock({
      digest: result.digest,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    console.log({ txn });

    const effects = txn?.effects?.created;
    console.log(effects);

    const objectId = effects[0].reference.objectId;
    console.log(objectId);

    const contentObj = await client.getObject({
      id: objectId,
      options: { showContent: true },
    });

    console.log(contentObj);

    const content = contentObj.data.content;
    console.log(content);

    const fields = content.fields;
    console.log(fields);

    if (txn) {
      postCreationData.signature = signature;
      postCreationData.verificationId = objectId;

      await Post.create(postCreationData);
      return new Response(
        JSON.stringify({
          success: true,
          cid: postCreationData.cid,
          verificationId: objectId,
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response('Failed to save post', { status: 500 });
  }
};
