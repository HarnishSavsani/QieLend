
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-12">Terms of Service</h1>
          <div className="space-y-8 text-white/60 leading-relaxed">
            <p>Last Updated: October 2025</p>
            
            <h3 className="text-xl font-bold text-white">1. Acceptance of Terms</h3>
            <p>By accessing or using the QieLend platform, you agree to be bound by these Terms of Service and all applicable laws and regulations on the QIE network. If you do not agree with any of these terms, you are prohibited from using this site.</p>
            
            <h3 className="text-xl font-bold text-white">2. Risk Acknowledgment</h3>
            <p>Crypto asset lending involves significant risk. Volatility on the QIE chain can lead to rapid changes in collateral value, potentially resulting in liquidation. QieLend is not responsible for any financial losses incurred through the use of the protocol.</p>

            <h3 className="text-xl font-bold text-white">3. Smart Contract Usage</h3>
            <p>QieLend operates via immutable smart contracts. While these have been audited, user interaction with on-chain protocols carries inherent technical risks. You assume all responsibility for verifying the security of your transactions.</p>
            
            <h3 className="text-xl font-bold text-white">4. Prohibited Jurisdictions</h3>
            <p>Users from restricted jurisdictions (including but not limited to North Korea, Iran, and certain US states where DeFi is restricted) are prohibited from using the lending pools.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
