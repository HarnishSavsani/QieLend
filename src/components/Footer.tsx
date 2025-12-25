
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    // Fix: Replaced invalid 'class' attributes with 'className' for React compatibility
    <footer className="mt-auto border-t border-white/5 bg-[#0a0212] pt-20 pb-10 px-4 md:px-10 lg:px-40">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
        <div className="col-span-2 lg:col-span-2 pr-8">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="size-8 flex items-center justify-center bg-gradient-primary rounded-lg shadow-md">
              <span className="material-symbols-outlined text-white text-xl">diamond</span>
            </div>
            <span className="text-xl font-bold">QieLend</span>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Revolutionizing P2P lending with the speed and security of QIE blockchain technology. We empower users to maximize their asset utility without liquidation.
          </p>
          <div className="flex gap-4">
            <a className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:bg-pink-600 hover:text-white transition-all" href="#"><span className="text-xs font-bold">X</span></a>
            <a className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:bg-purple-600 hover:text-white transition-all" href="#"><span className="text-xs font-bold">In</span></a>
            <a className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:bg-blue-500 hover:text-white transition-all" href="#"><span className="material-symbols-outlined text-sm">send</span></a>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">Platform</h4>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/borrow">Borrow</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/lend">Lend</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/staking">QIE Staking</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/rates">Rates</Link>
        </div>
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">Company</h4>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/about">About Us</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/tech">QIE Technology</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/blog">Blog</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/careers">Careers</Link>
        </div>
        <div className="flex flex-col gap-5">
          <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">Support</h4>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/help">Help Center</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/devs">Developers</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/security">Security Audit</Link>
          <Link className="text-white/60 hover:text-pink-400 transition-colors text-sm" to="/contact">Contact</Link>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/30 text-xs text-center md:text-left">© 2025 QieLend Inc. Built on QIE Chain.</p>
        <div className="flex gap-8">
          <Link className="text-white/30 hover:text-white text-xs transition-colors" to="/privacy">Privacy Policy</Link>
          <Link className="text-white/30 hover:text-white text-xs transition-colors" to="/terms">Terms of Service</Link>
          <Link className="text-white/30 hover:text-white text-xs transition-colors" to="/cookies">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
