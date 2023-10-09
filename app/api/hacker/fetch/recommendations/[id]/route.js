import { connectToDB } from '@/utils/database';
import Recommendation from '@/models/recommendation';
import { providers, Contract } from 'ethers';
import User from '@/models/user';
import Repo from '@/models/repo';

const contractABI = [
  {
    "inputs": [],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_subscriptionPrice",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "Subscribed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newPrice",
        "type": "uint256"
      }
    ],
    "name": "updateSubscriptionPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isSubscribed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "subscribers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "subscriptionPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = '0x5855B90fccf839c74F7807E9eb2782f517E006E1';

const providerUrl = 'https://evm.ngd.network:32332';

const provider = new providers.JsonRpcProvider(providerUrl);

const contract = new Contract(contractAddress, contractABI, provider);

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const users = await User.find({ subscribeAddress: { $exists: true, $ne: null } }).exec();

    const subscribedUsers = [];
    for (let user of users) {
      if (user.subscribeAddress) {
        const isUserSubscribed = await contract.isSubscribed(user.subscribeAddress);
        if (isUserSubscribed) {
          subscribedUsers.push(user._id);
        }
      }
    }

    const allRecommendations = await Recommendation.find({ creator: params.id })
                                                    .populate('repo_id')
                                                    .exec();

    allRecommendations.forEach(recommendation => {
      if (subscribedUsers.includes(recommendation.repo_id.creator)) {
        recommendation.similarity_distance *= 0.8;
      }
    });

    const topRecommendations = allRecommendations
      .sort((a, b) => a.similarity_distance - b.similarity_distance)
      .slice(0, 5);

    return new Response(JSON.stringify(topRecommendations), { status: 200 });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return new Response("Failed to fetch recommendations", { status: 500 });
  }
}
