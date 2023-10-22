export default function About() {
  return (
    <article className="prose p-4">
      <h2>About Blockto</h2>

      <h3>Our Mission</h3>
      <p>
        Blockto is dedicated to creating a trustworthy digital landscape. We aim
        to ensure that every content uploaded is genuine and can be verified by
        its audience, empowering creators to showcase their authentic work
        confidently.
      </p>

      <h3>How It Works</h3>
      <ol>
        <li>
          <strong>Upload to IPFS</strong>: Content uploaded on Blockto is
          securely stored on the InterPlanetary File System (IPFS) which is a
          decentralized storage solution.
        </li>
        <li>
          <strong>Digital Signature</strong>: With the help of the Sui
          Wallet, each piece of content is signed, creating a unique digital
          signature for authenticity.
        </li>
        <li>
          <strong>Storage on Sui Blockchain</strong>: The IPFS Content
          Identifier, Creator's Address, and the Digital Signature are then
          stored on the Sui Blockchain.
        </li>
        <li>
          <strong>Unique Verification Link</strong>: For every piece of content,
          Blockto generates a unique verification link. This link can be
          attached with the content on other social media platforms, allowing
          anyone to directly verify the content's authenticity.
        </li>
      </ol>
    </article>
  );
}
