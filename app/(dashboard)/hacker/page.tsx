'use client';

import { memo, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import RepoCard from '@/components/RepoCard';

type Session = {
  user: {
    name: string;
    email: string;
    image: string;
    address: string;
    id: string;
  };
  expires: string;
};

const HackerFeed = () => {
  const { data: session } = useSession() as { data: Session | null };

  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const recommendationResponse = await fetch(`/api/hacker/fetch/recommendations/${session?.user.id}`);
        if (!recommendationResponse.ok) {
          console.error('Error fetching recommendations:', await recommendationResponse.text());
          return;
        }
        const recommendations = await recommendationResponse.json();

        const repoIds = recommendations.map((rec: any) => rec.repo_id);

        const repoResponse = await fetch('/api/hacker/fetch/repos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoIds })
        });
        
        if (!repoResponse.ok) {
          console.error('Error fetching repos:', await repoResponse.text());
          return;
        }
        const repoData = await repoResponse.json();        
        setRepos(repoData);

      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchRecommendations();
    }
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {repos.map((repo, idx) => (
        <RepoCard 
          key={idx}
          githubUsername={repo.githubUsername}
          repoName={repo.repoName}
          description={repo.description}
          repoLink={repo.repoLink}
        />
      ))}
    </div>
  );
};

export default HackerFeed;
