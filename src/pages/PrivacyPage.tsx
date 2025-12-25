
import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-12">Privacy Policy</h1>
          <div className="space-y-8 text-white/60 leading-relaxed">
            <p>At QieLend, we value your privacy. This policy outlines how we handle data on our platform.</p>
            
            <h3 className="text-xl font-bold text-white">1. Data Collection</h3>
            <p>We do not collect personal identification information unless you explicitly provide it (e.g., during optional KYC or support requests). Your wallet address and transaction history are public on the QIE blockchain and are not controlled by QieLend.</p>
            
            <h3 className="text-xl font-bold text-white">2. Cookies</h3>
            <p>We use essential cookies to maintain your session and security. We do not use tracking cookies for advertising purposes.</p>

            <h3 className="text-xl font-bold text-white">3. On-Chain Data</h3>
            <p>Please be aware that all lending activities, collateral deposits, and liquidations are recorded on the public QIE blockchain ledger. This data is immutable and transparent to anyone with internet access.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
