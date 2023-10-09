import { connectToDB } from '@/utils/database';
import Repo from '@/models/repo';
import Recommendation from '@/models/recommendation';

export const POST = async (req) => {
  await connectToDB();

  const { skillset, id } = await req.json();

  if (!skillset) {
    return new Response(JSON.stringify({ error: 'Skillset is required' }), { status: 400 });
  }
  if (!id) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
  }

  try {
    const reposFromDB = await Repo.find({ creator: { $ne: id } });
    let allRepos = [];

    for (let repo of reposFromDB) {
      const pinataResponse = await fetch(`${process.env.PINATA_GATEWAY}/${repo.cid}`);
      let pinataRepo = await pinataResponse.json();
      pinataRepo.repo_id = repo._id;
      allRepos.push(pinataRepo);
    }

    const requestData = {
      repos: allRepos,
      skillset: skillset
    };
  
    const response = await fetch('http://127.0.0.1:5000/api/flask/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: error.message || 'Server Error' }), { status: 500 });
    }
  
    const recommendations = await response.json();
    console.log('Recommendations:', recommendations);

    for (let rec of recommendations) {
      rec.creator = id;
      await Recommendation.create(rec);
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Server Error' }), { status: 500 });
  }
}
