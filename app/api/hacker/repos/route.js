import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";
import { connectToDB } from '@/utils/database';
import Repo from '@/models/repo';
import Recommendation from '@/models/recommendation';
import Skillset from '@/models/skillset';
import axios from 'axios';

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

export const POST = async (req) => {
  await connectToDB();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized: session.user missing' }), { status: 401 });
  }

  const { username, skillset } = await req.json();

  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), { status: 400 });
  }
  if (!skillset) {
    return new Response(JSON.stringify({ error: 'Skillset is required' }), { status: 400 });
  }

  const headers = {
    'Authorization': `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    'User-Agent': 'Xocial',
    'Accept': 'application/vnd.github+json',
  };

  try {
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, { headers });
    const reposData = reposResponse.data;

    for (const repo of reposData) {
      if (!repo.fork && (repo.description || repo.language || repo.topics.length > 0)) {
        const languagesResponse = await axios.get(repo.languages_url, { headers });
        const languagesData = languagesResponse.data;

        const project = {
          'name': repo.name,
          'description': repo.description || '',
          'languages': Object.keys(languagesData),
          'topics': repo.topics || []
        };

        const currentTime = Date.now();

        const pinataResponse = await pinata.pinJSONToIPFS(project, {
          pinataMetadata: {
            name: repo.name,
            keyvalues: {
              type: 'repo',
              address: session.user.address,
              github_username: username,
              timestamp: currentTime
            }
          }
        });

        if (pinataResponse.IpfsHash) {
          const mongodbRepo = {
            creator: session.user.id,
            cid: pinataResponse.IpfsHash,
            github_username: username,
            repo_name: repo.name,
            timestamp: currentTime
          };

          try {
            await Repo.create(mongodbRepo);
          } catch (innerError) {
            if (innerError.code === 11000) {
              console.error('Duplicate CID detected:', mongodbRepo.cid);
              continue;
            } else {
              throw innerError;
            }
          }
        }
      }
    }

    const skillsets = await Skillset.find({});

    for (const record of skillsets) {
      fetch(`${process.env.NEXTAUTH_URL}/api/hacker/recommend`, {
        method: 'POST',
        body: JSON.stringify({ skillset: record.skill, id: record.creator }),
      });
    }

    Skillset.create({ creator: session.user.id, skill: skillset });

    fetch(`${process.env.NEXTAUTH_URL}/api/hacker/recommend`, {
      method: 'POST',
      body: JSON.stringify({ skillset, id: session.user.id }),
    });

    return new Response(JSON.stringify({ message: "Repos fetched, recommendation process started" }), { status: 200 });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ message: error.message || "Server Error" }), { status: 500 });
  }
}
