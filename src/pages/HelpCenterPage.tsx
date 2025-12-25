
import React, { useState } from 'react';

const HelpCenterPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const faqs = [
    { q: "How do I get started with QieLend?", a: "Connect your wallet, deposit your chosen collateral, and select the amount you'd like to borrow. It's instant.", cat: "General" },
    { q: "What happens if the price of my collateral drops?", a: "If your LTV exceeds the safety threshold (typically 85%), your collateral may be partially liquidated to cover the loan.", cat: "Borrowing" },
    { q: "Is my crypto safe on QieLend?", a: "Yes. All funds are held in audited smart contracts. We do not have access to your private keys.", cat: "Security" },
    { q: "What are the fees for borrowing?", a: "QieLend charges a small protocol fee (0.5%) and gas fees on the QIE network are near-zero.", cat: "Fees" },
  ];

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-background-dark pb-24">
      <section className="pt-20 pb-12 px-4 md:px-10 lg:px-40 bg-[#1e0b2e]/30 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8">How can we help?</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30">search</span>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for articles, guides, and FAQs..." 
              className="w-full bg-background-dark border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-pink-500/50 transition-all"
            />
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-40 py-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Categories</h3>
             <CategoryBtn icon="payments" label="Borrowing" />
             <CategoryBtn icon="savings" label="Lending" />
             <CategoryBtn icon="security" label="Security" />
             <CategoryBtn icon="account_balance_wallet" label="Wallet" />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white text-lg">{faq.q}</h4>
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-wider">{faq.cat}</span>
                </div>
                <p className="text-white/50 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoryBtn = ({ icon, label }: any) => (
  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-medium border border-white/5">
    <span className="material-symbols-outlined text-pink-400">{icon}</span>
    {label}
  </button>
);

export default HelpCenterPage;
