
import React from 'react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-12">Cookie Settings</h1>
          <div className="space-y-8 text-white/60 leading-relaxed">
            <p>We use cookies to enhance your experience on the QieLend platform.</p>
            
            <h3 className="text-xl font-bold text-white">What are cookies?</h3>
            <p>Cookies are small text files stored on your device that help our application remember you and your preferences.</p>
            
            <h3 className="text-xl font-bold text-white">How we use them</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authentication: Remembering your login state.</li>
              <li>Security: Preventing cross-site request forgery attacks.</li>
              <li>Preferences: Saving your UI settings (like dark mode or chart layouts).</li>
            </ul>

            <p className="pt-8">You can manage or disable cookies through your browser settings, but please note that some features of QieLend may not function correctly without them.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;
