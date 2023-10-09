import Embed from './index';
import Link from 'next/link';

const Spotify: Embed = {
  regex: /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/track\/)([\w-]+)(?:\S+)?/g,
  Component: ({ match, index }) => {
    return (
      <iframe
        className="audio"
        scrolling="no"
        key={match + index}
        width="650"
        height="200"
        style={{ maxWidth: '100%' }}
        src={`https://open.spotify.com/embed/track/${match}?utm_source=oembed`}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
}

export default Spotify;
