import { connectToDB } from '@/utils/database';
import Repo from '@/models/repo';

export const POST = async (req) => {
  await connectToDB();

  const { repoIds } = await req.json();
  
  try {
    const reposFromDB = await Repo.find({ _id: { $in: repoIds } });
    
    const repoDetails = await Promise.all(reposFromDB.map(async repo => {
      const githubUsername = repo.github_username;
      const repoName = repo.repo_name;
      const repoLink = `https://github.com/${repo.github_username}/${repo.repo_name}`;
      
      const pinataResponse = await fetch(`${process.env.PINATA_GATEWAY}/${repo.cid}`);

      if (!pinataResponse.ok) {
        console.error('Error fetching from Pinata:', await pinataResponse.text());
        throw new Error('Failed to fetch data from Pinata.');
      }

      const pinataData = await pinataResponse.json();

      return {
        githubUsername,
        repoName,
        repoLink,
        description: pinataData.description
      };
    }));

    return new Response(JSON.stringify(repoDetails), { status: 200 });
    
  } catch (error) {
    console.error('Error fetching repos:', error);
    return new Response("Failed to fetch repositories", { status: 500 });
  }
}
