import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

type Content = {
  content: string;
  files: { cid: string; fileType: string }[];
  replyingTo?: { address: string; username: string; cid: string }[];
};

const Dropdown = ({
  urlPostId,
  content,
}: {
  urlPostId: string;
  content: Content;
}) => {
  const extractCIDFromUrlPostId = (urlPostId: string): string => {
    const parts = urlPostId.split('post');
    return parts.length > 1 ? parts[1].split('|')[0] : '';
  };

  const getIpfsLink = (cid: string): string => {
    return `https://ipfs.io/ipfs/${cid}`;
  };

  // changed the link from blockto to ipfs

  return (
    <div className="ml-auto">
      <div className="dropdown-left dropdown">
        <label
          tabIndex={0}
          className="btn-ghost btn-circle btn m-1 text-neutral-500"
        >
          <EllipsisHorizontalIcon width={24} />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-40 bg-base-100 p-2 shadow-lg shadow-black"
        >
          <li>
            <button
              className="text-start text-xs"
              onClick={() =>
                navigator.clipboard.writeText(
                  getIpfsLink(extractCIDFromUrlPostId(urlPostId))
                )
              }
            >
              Copy Link
            </button>
          </li>
          <li>
            <button
              className="text-start text-xs"
              onClick={() =>
                navigator.clipboard.writeText(
                  extractCIDFromUrlPostId(urlPostId)
                )
              }
            >
              Copy CID
            </button>
          </li>
          <li>
            <button
              className="text-start text-xs"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(content))
              }
            >
              Copy Raw Data
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
