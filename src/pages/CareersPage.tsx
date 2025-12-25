
import React from 'react';

const CareersPage: React.FC = () => {
  const jobs = [
    { title: "Senior Smart Contract Engineer", dept: "Engineering", type: "Remote", loc: "Global" },
    { title: "Protocol Security Researcher", dept: "Engineering", type: "Full-time", loc: "Cayman Islands" },
    { title: "Head of Community & Growth", dept: "Marketing", type: "Remote", loc: "Global" },
    { title: "Full-stack Web3 Developer", dept: "Engineering", type: "Remote", loc: "Global" },
  ];

  return (
    <div className="bg-background-dark pb-24">
      <section className="py-24 px-4 md:px-10 lg:px-40 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Build the Future of Debt</h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Join a mission-driven team working at the bleeding edge of DeFi and QIE blockchain technology. We're hiring across all departments.
        </p>
      </section>

      <section className="px-4 md:px-10 lg:px-40 pb-24">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((j, i) => (
              <div key={i} className="glass-panel p-6 md:p-8 rounded-2xl border-white/5 hover:border-pink-500/30 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{j.title}</h3>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-white/30">
                    <span>{j.dept}</span>
                    <span>•</span>
                    <span>{j.type}</span>
                    <span>•</span>
                    <span>{j.loc}</span>
                  </div>
                </div>
                <button className="px-8 h-12 rounded-full border border-pink-500/30 text-pink-400 hover:bg-pink-500 hover:text-white transition-all font-bold">Apply Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
