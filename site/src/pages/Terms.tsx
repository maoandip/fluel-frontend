import LegalPage, { Section } from "../components/LegalPage";
import { useCanonical } from "../lib/seo";

export default function Terms() {
  document.title = "Terms of Service — fluel";
  useCanonical("/terms");
  return (
    <LegalPage title="Terms of Service" updated="April 2026">
      <Section title="1. About Us">
        <p>Fluel is a trading name of MAD Protocol Ltd, a company registered in England and Wales (Company No. 11232367). Our registered office is at Apollo House, Hallam Way, Whitehills Business Park, Blackpool, England, FY4 5FS. You can contact us at <a href="mailto:contact@fluel.io">contact@fluel.io</a>.</p>
      </Section>

      <Section title="2. Acceptance of Terms">
        <p>By accessing or using Fluel ("Service"), including the Telegram bot, mini-app, and website, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
      </Section>

      <Section title="3. Description of Service">
        <p>Fluel is a non-custodial technical interface that allows users to interact with third-party decentralised protocols to swap USDC stablecoins for native blockchain gas tokens (such as ETH, BNB, MATIC, AVAX) across EVM-compatible networks. The Service relays user instructions to the LI.FI cross-chain protocol, which finds optimal swap routes and executes transactions on-chain.</p>
        <p>Fluel is not an exchange, broker, custodian, financial institution, or money services business. We do not take custody, possession, or control of your crypto-assets at any point. All wallet keys are generated and held exclusively by Privy, a third-party wallet infrastructure provider, within hardware-secured enclaves (TEE). All swap execution is performed by third-party decentralised protocols via LI.FI. Fluel acts solely as a software interface that relays your instructions to these third-party services.</p>
        <p><strong>This service is not regulated by the Financial Conduct Authority (FCA). Crypto-assets are high risk. You may lose all your money. You will not have access to the Financial Ombudsman Service or the Financial Services Compensation Scheme.</strong></p>
      </Section>

      <Section title="4. Eligibility">
        <p>You must be at least 18 years old to use the Service. By using Fluel, you represent that you are legally permitted to use cryptocurrency services in your jurisdiction and that your use does not violate any applicable laws or regulations.</p>
        <p>The Service is not available to persons located in, or residents of, jurisdictions where crypto-asset services are prohibited or require licensing that we do not hold.</p>
      </Section>

      <Section title="5. Account and Wallet">
        <p>When you use Fluel, an embedded wallet is created for you by Privy, a third-party wallet infrastructure provider. Fluel does not create, control, or have access to this wallet. You acknowledge that:</p>
        <ul>
          <li>The wallet is created, secured, and operated by Privy, not by Fluel. Private keys are held exclusively within Privy's hardware-secured enclaves (TEE) and are not accessible to Fluel.</li>
          <li>Fluel relays your instructions to Privy to initiate transactions. Fluel cannot unilaterally access, move, or spend funds in your wallet.</li>
          <li>You are responsible for setting a correct destination wallet address for receiving gas tokens.</li>
          <li>Fluel is not responsible for funds sent to incorrect or incompatible addresses.</li>
          <li>You can withdraw your deposited USDC at any time to your designated destination wallet.</li>
        </ul>
      </Section>

      <Section title="6. Automated Features">
        <p>Fluel offers optional automated features such as auto-refill and gas price alerts. These features operate based on standing instructions that you configure and can modify or delete at any time. You acknowledge that:</p>
        <ul>
          <li>Auto-refill rules are pre-configured standing instructions set by you. When triggered, Fluel relays your pre-authorised swap instruction to third-party protocols. Fluel does not exercise discretion over these transactions.</li>
          <li>Gas price alerts are notifications only and do not trigger any transaction without your further action.</li>
          <li>You are solely responsible for the parameters you configure (thresholds, amounts, chains) and for monitoring your active rules.</li>
          <li>Automated transactions are subject to the same fees, risks, and finality as manual swaps.</li>
        </ul>
      </Section>

      <Section title="7. Fees and Charges">
        <p>Fluel charges a service fee on each swap transaction. Fees are volume-based and range from approximately 0.75% to 2.5% of the swap amount. The fee is applied to the transaction amount before the swap is submitted to the underlying protocol.</p>
        <p>Additional costs may apply including network gas fees, bridge protocol fees, and liquidity provider fees, which are determined by the underlying protocols and blockchain networks. These are not set or controlled by Fluel and are displayed in the swap quote before you confirm.</p>
      </Section>

      <Section title="8. Transaction Finality">
        <p>Blockchain transactions are irreversible once confirmed. Fluel cannot reverse, cancel, or modify a transaction after it has been submitted to the network. You are solely responsible for reviewing swap quotes and confirming transactions.</p>
      </Section>

      <Section title="9. Risks">
        <p><strong>You should carefully consider whether crypto-assets are suitable for you in light of your personal circumstances and financial position. You should not engage in transactions using the Service unless you understand the nature of the transactions and the extent of your exposure to loss.</strong></p>
        <p>You acknowledge and accept the following risks associated with using the Service:</p>
        <ul>
          <li><strong>Price Volatility:</strong> Cryptocurrency prices are highly volatile. The value of gas tokens received may change significantly between the time a quote is provided and when tokens arrive in your wallet.</li>
          <li><strong>Smart Contract Risk:</strong> Cross-chain bridges and decentralised exchanges operate via smart contracts that may contain bugs or vulnerabilities.</li>
          <li><strong>Network Risk:</strong> Blockchain networks may experience congestion, forks, or outages that delay or prevent transactions.</li>
          <li><strong>Third-Party Risk:</strong> Fluel is a technical interface that depends on third-party services (LI.FI, Privy, RPC providers) that may experience downtime, errors, or security incidents. Fluel does not control these services and is not liable for their performance.</li>
          <li><strong>Regulatory Risk:</strong> Cryptocurrency regulations vary by jurisdiction and may change. You are responsible for understanding and complying with applicable laws.</li>
          <li><strong>Loss of Funds:</strong> You may lose some or all of the crypto-assets you use with this Service. There is no guarantee that you will be able to recover any funds.</li>
        </ul>
      </Section>

      <Section title="10. Prohibited Uses">
        <p>You agree not to use the Service for:</p>
        <ul>
          <li>Any activity that violates applicable laws or regulations, including anti-money laundering (AML) and counter-terrorism financing (CTF) laws.</li>
          <li>Attempting to circumvent geographic restrictions or sanctions.</li>
          <li>Interfering with, disrupting, or overloading the Service infrastructure.</li>
          <li>Automated abuse, botting, or denial-of-service attacks.</li>
          <li>Fraudulent activity or misrepresentation.</li>
        </ul>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>The Service is a non-custodial technical interface provided "as is" and "as available" without warranties of any kind, express or implied. Fluel does not hold, control, or insure your crypto-assets. To the maximum extent permitted by law, MAD Protocol Ltd and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to loss of funds, loss of profits, or loss of data arising from your use of the Service or the third-party protocols it interfaces with.</p>
        <p>Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by English law.</p>
      </Section>

      <Section title="12. Indemnification">
        <p>You agree to indemnify and hold harmless MAD Protocol Ltd and its operators from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any applicable law.</p>
      </Section>

      <Section title="13. Complaints">
        <p>If you have a complaint about the Service, please contact us at <a href="mailto:contact@fluel.io">contact@fluel.io</a>. We will acknowledge your complaint within 5 working days and aim to resolve it within 8 weeks. As this service is not regulated by the FCA, you do not have access to the Financial Ombudsman Service.</p>
      </Section>

      <Section title="14. Modifications">
        <p>We reserve the right to modify these Terms at any time. Material changes will be communicated through the Service or via the contact details you have provided. Your continued use of Fluel after any modification constitutes acceptance of the updated Terms.</p>
      </Section>

      <Section title="15. Termination">
        <p>We may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms. Upon termination, you may still withdraw any USDC balance remaining in your wallet, as Fluel does not hold or control your funds.</p>
      </Section>

      <Section title="16. Governing Law and Jurisdiction">
        <p>These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </Section>

      <Section title="17. Contact">
        <p>For questions about these Terms, contact us at:</p>
        <ul>
          <li>Email: <a href="mailto:contact@fluel.io">contact@fluel.io</a></li>
          <li>Telegram: via the Fluel bot</li>
          <li>Post: MAD Protocol Ltd, Apollo House, Hallam Way, Whitehills Business Park, Blackpool, England, FY4 5FS</li>
        </ul>
      </Section>
    </LegalPage>
  );
}
