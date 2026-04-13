import LegalPage, { Section } from "../components/LegalPage";

export default function Privacy() {
  document.title = "Privacy Policy — fluel";
  return (
    <LegalPage title="Privacy Policy" updated="April 2026">
      <Section title="1. Data Controller">
        <p>Fluel is a trading name of MAD Protocol Ltd, a company registered in England and Wales (Company No. 11232367). Fluel is a non-custodial technical interface for interacting with third-party decentralised protocols. We are the data controller for the personal data processed through this Service.</p>
        <p>Registered address: Apollo House, Hallam Way, Whitehills Business Park, Blackpool, England, FY4 5FS.</p>
        <p>Contact: <a href="mailto:contact@fluel.io">contact@fluel.io</a></p>
      </Section>

      <Section title="2. Information We Collect">
        <p>Fluel collects the minimum data necessary to operate the Service:</p>
        <ul>
          <li><strong>Telegram User ID:</strong> A numeric identifier provided by Telegram when you interact with our bot. We do not access your Telegram username, phone number, or profile information.</li>
          <li><strong>Wallet Addresses:</strong> Your deposit wallet address (created by Privy) and your destination wallet address (provided by you).</li>
          <li><strong>Transaction Data:</strong> Swap amounts, source and destination chains, transaction hashes, timestamps, and status. This data is necessary to execute and track your transactions.</li>
          <li><strong>Preferences:</strong> Gas alert thresholds, auto-refill rules, and referral relationships.</li>
        </ul>
      </Section>

      <Section title="3. Lawful Basis for Processing">
        <p>Under the UK General Data Protection Regulation (UK GDPR), we process your personal data on the following legal bases:</p>
        <ul>
          <li><strong>Contract:</strong> Processing necessary to provide the Service to you (e.g., executing swaps, managing your wallet).</li>
          <li><strong>Legitimate Interest:</strong> Processing necessary for fraud prevention, security monitoring, and service improvement, where our interests do not override your rights.</li>
          <li><strong>Legal Obligation:</strong> Processing required to comply with applicable laws, including tax and anti-money laundering requirements.</li>
        </ul>
      </Section>

      <Section title="4. Information We Do Not Collect">
        <ul>
          <li>We do not collect your name, email address, phone number, or physical address.</li>
          <li>We do not collect or store private keys or seed phrases. Keys are managed exclusively by Privy using hardware-backed security enclaves (TEE).</li>
          <li>We do not use cookies, tracking pixels, or analytics scripts on the Telegram mini-app.</li>
          <li>We do not sell, rent, or share your personal data with advertisers or data brokers.</li>
        </ul>
      </Section>

      <Section title="5. How We Use Your Information">
        <p>Your data is used solely to provide and improve the Service:</p>
        <ul>
          <li>Facilitate the creation of your embedded wallet via Privy (a third-party wallet infrastructure provider).</li>
          <li>Relay your swap and withdrawal instructions to third-party protocols (Privy and LI.FI).</li>
          <li>Display your balances and transaction history.</li>
          <li>Send gas price alert notifications you have configured.</li>
          <li>Process referral rewards and gas gift features.</li>
          <li>Monitor for abuse, fraud, and security incidents.</li>
        </ul>
      </Section>

      <Section title="6. Third-Party Services">
        <p>Fluel integrates with the following third-party services that may process your data in accordance with their own privacy policies:</p>
        <ul>
          <li><strong>Privy (Privy Inc.):</strong> Creates and secures embedded wallets. Processes wallet creation requests, transaction signing, and gas sponsorship. All private keys are generated and held exclusively by Privy within hardware-backed enclaves (TEE) — Fluel does not have access to private keys at any point. See <a href="https://www.privy.io/privacy" target="_blank" rel="noopener">Privy's Privacy Policy</a>.</li>
          <li><strong>LI.FI Protocol:</strong> Cross-chain swap aggregator. Receives transaction parameters (wallet addresses, token amounts, chain IDs) to find optimal routes and execute swap transactions on-chain. All swap execution is performed by LI.FI and the underlying decentralised protocols, not by Fluel.</li>
          <li><strong>Telegram:</strong> Messaging platform through which the bot operates. See <a href="https://telegram.org/privacy" target="_blank" rel="noopener">Telegram's Privacy Policy</a>.</li>
          <li><strong>Blockchain Networks:</strong> All transactions are recorded on public blockchains. Transaction data (addresses, amounts, timestamps) is permanently visible on-chain.</li>
        </ul>
      </Section>

      <Section title="7. International Data Transfers">
        <p>Some of our third-party service providers (including Privy and LI.FI) are based outside the United Kingdom. Where your data is transferred outside the UK, we ensure that appropriate safeguards are in place, such as standard contractual clauses approved by the Information Commissioner's Office (ICO), or transfers to countries with an adequate level of data protection as determined by the UK government.</p>
      </Section>

      <Section title="8. Data Storage and Retention">
        <p>Your data is stored in an encrypted server-side database. Retention periods:</p>
        <ul>
          <li><strong>Session data:</strong> Active sessions are retained while you use the Service. Inactive sessions without a wallet are removed after 90 days.</li>
          <li><strong>Transaction history:</strong> Retained for up to six years to comply with UK tax and accounting obligations.</li>
          <li><strong>Rate limit data:</strong> Automatically purged after 2 minutes.</li>
        </ul>
      </Section>

      <Section title="9. Data Security">
        <p>We implement appropriate technical and organisational measures to protect your personal data, including:</p>
        <ul>
          <li>HTTPS encryption for all communications.</li>
          <li>Telegram initData cryptographic validation on all API requests.</li>
          <li>Rate limiting to prevent abuse.</li>
          <li>No storage of private keys — delegated to hardware-secured third-party providers.</li>
        </ul>
        <p>However, no system is completely secure. We cannot guarantee absolute protection against all potential security threats.</p>
      </Section>

      <Section title="10. Your Rights Under UK GDPR">
        <p>Under the UK General Data Protection Regulation, you have the following rights:</p>
        <ul>
          <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Rectification:</strong> You can request correction of inaccurate personal data.</li>
          <li><strong>Right to Erasure:</strong> You can request deletion of your personal data, subject to legal obligations. Note that on-chain transaction data cannot be deleted as it is part of the public blockchain record.</li>
          <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data.</li>
          <li><strong>Right to Data Portability:</strong> You can request your data in a structured, commonly used format. Your transaction history is also available on-chain via blockchain explorers.</li>
          <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests.</li>
          <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:contact@fluel.io">contact@fluel.io</a>. We will respond within one month of receiving your request.</p>
      </Section>

      <Section title="11. Complaints">
        <p>If you are unhappy with how we handle your personal data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):</p>
        <ul>
          <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a></li>
          <li>Telephone: 0303 123 1113</li>
        </ul>
        <p>We would appreciate the opportunity to address your concerns before you contact the ICO, so please reach out to us first at <a href="mailto:contact@fluel.io">contact@fluel.io</a>.</p>
      </Section>

      <Section title="12. Children's Privacy">
        <p>Fluel is not intended for use by anyone under the age of 18. We do not knowingly collect data from minors. If we become aware that we have collected personal data from a child, we will take steps to delete it.</p>
      </Section>

      <Section title="13. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated through the Service. The "Last updated" date at the top of this page indicates when this policy was last revised. Continued use after changes constitutes acceptance.</p>
      </Section>

      <Section title="14. Contact">
        <p>For privacy-related questions or data requests, contact us at:</p>
        <ul>
          <li>Email: <a href="mailto:contact@fluel.io">contact@fluel.io</a></li>
          <li>Telegram: via the Fluel bot</li>
          <li>Post: MAD Protocol Ltd, Apollo House, Hallam Way, Whitehills Business Park, Blackpool, England, FY4 5FS</li>
        </ul>
      </Section>
    </LegalPage>
  );
}
