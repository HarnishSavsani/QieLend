
import React from 'react';

import blog1 from '../assets/blog-1.jpg';
import blog2 from '../assets/blog-2.jpg';
import blog3 from '../assets/blog-3.jpg';
import blog4 from '../assets/blog-4.jpg';

const BlogPage: React.FC = () => {
  const posts = [
    { title: "QieLend v2: The Road to Decentralized Governance", date: "Oct 28, 2024", cat: "Product", img: blog1 },
    { title: "Understanding LTV and Liquidation Protection", date: "Oct 15, 2024", cat: "Education", img: blog2 },
    { title: "Strategic Partnership with QIE Chain Foundation", date: "Sep 22, 2024", cat: "News", img: blog3 },
    { title: "The Rise of P2P Crypto Lending in 2024", date: "Sep 05, 2024", cat: "Industry", img: blog4 },
  ];

  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Blog & Updates</h1>
            <p className="text-white/60 text-lg">Insights, tutorials, and latest news from the QieLend ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/5 bg-[#1e0b2e]">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-pink-500 text-[10px] font-bold text-white uppercase tracking-widest">{p.cat}</div>
                </div>
                <p className="text-white/30 text-xs font-bold mb-2 uppercase tracking-widest">{p.date}</p>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors leading-tight">{p.title}</h3>
                <p className="text-white/50 text-sm line-clamp-2">Learn more about the latest developments and how we're building the future of decentralized finance on QIE.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
