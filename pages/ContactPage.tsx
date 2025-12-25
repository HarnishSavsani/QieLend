
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Get in Touch</h1>
            <p className="text-lg text-white/50 leading-relaxed mb-10">
              Have questions about your account or interested in a partnership? Our team is available 24/7.
            </p>
            
            <div className="space-y-8">
              <ContactInfo icon="mail" label="Email Us" value="support@qielend.io" />
              <ContactInfo icon="hub" label="Social Channels" value="Twitter, Telegram, Discord" />
              <ContactInfo icon="location_on" label="Headquarters" value="Grand Cayman, Cayman Islands" />
            </div>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl border-white/10">
            <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-[#0f0518] border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:border-pink-500/50 transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-[#0f0518] border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
              <select className="w-full bg-[#0f0518] border border-white/10 rounded-xl py-4 px-6 text-white/50 outline-none focus:border-pink-500/50 transition-all">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership Proposal</option>
                <option>Bug Report</option>
              </select>
              <textarea 
                placeholder="How can we help?" 
                rows={4}
                className="w-full bg-[#0f0518] border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:border-pink-500/50 transition-all"
              ></textarea>
              <button className="w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-xl hover:shadow-pink-500/40 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactInfo = ({ icon, label, value }: any) => (
  <div className="flex gap-5 items-center">
    <div className="size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
      <span className="material-symbols-outlined text-pink-500">{icon}</span>
    </div>
    <div>
      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{label}</p>
      <p className="text-white font-medium text-lg">{value}</p>
    </div>
  </div>
);

export default ContactPage;
