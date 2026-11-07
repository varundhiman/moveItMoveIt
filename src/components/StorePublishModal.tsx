import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, Copy, Check, Globe } from 'lucide-react';

interface StorePublishModalProps {
  onClose: () => void;
}

export const StorePublishModal: React.FC<StorePublishModalProps> = ({ onClose }) => {
  const [activeStoreTab, setActiveStoreTab] = useState<'netlify' | 'google' | 'apple' | 'capacitor'>('netlify');
  const [copiedCode, setCopiedCode] = useState(false);

  const capacitorConfigSnippet = `{
  "appId": "com.movemates.app",
  "appName": "MoveMates",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "Camera": {
      "permissions": ["camera"]
    }
  }
}`;

  const copySnippet = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(capacitorConfigSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-neutral-900 dark:text-white transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Hosting & App Stores Deployment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition modern-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 mt-4 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-750">
          <button
            type="button"
            onClick={() => setActiveStoreTab('netlify')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition modern-press ${
              activeStoreTab === 'netlify'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Netlify
          </button>
          <button
            type="button"
            onClick={() => setActiveStoreTab('google')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition modern-press ${
              activeStoreTab === 'google'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Google Play
          </button>
          <button
            type="button"
            onClick={() => setActiveStoreTab('apple')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition modern-press ${
              activeStoreTab === 'apple'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            App Store
          </button>
          <button
            type="button"
            onClick={() => setActiveStoreTab('capacitor')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition modern-press ${
              activeStoreTab === 'capacitor'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Capacitor
          </button>
        </div>

        {/* Tab details */}
        <div className="mt-4 space-y-3 text-xs leading-relaxed">
          {activeStoreTab === 'netlify' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-750">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  GitHub to Netlify Hosting (Ready)
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Pre-configured with <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-neutral-200/60 dark:bg-neutral-900 px-1 py-0.5 rounded">netlify.toml</code> and <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-neutral-200/60 dark:bg-neutral-900 px-1 py-0.5 rounded">public/_redirects</code>:
                </p>
                <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>Push this codebase to <strong className="text-neutral-900 dark:text-white">GitHub</strong>.</li>
                  <li>In Netlify, click <strong className="text-neutral-900 dark:text-white">Add new site &gt; Import an existing project</strong>.</li>
                  <li>Select your repository. Netlify detects <code className="font-mono">npm run build</code> and <code className="font-mono">dist</code> automatically.</li>
                  <li>Click <strong className="text-neutral-900 dark:text-white">Deploy Site</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50">
                <div className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Firebase Google Auth on Netlify Domain
                </div>
                <p className="text-amber-800/90 dark:text-amber-300/80">
                  In Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains, add your Netlify address (e.g. <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">your-site.netlify.app</code>).
                </p>
              </div>
            </div>
          )}

          {activeStoreTab === 'google' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-750">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  PWABuilder · Trusted Web Activity (TWA)
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Google Play natively accepts PWAs packaged as Android App Bundles (<code className="font-mono text-emerald-600 dark:text-emerald-400">.aab</code>):
                </p>
                <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>Enter your live URL into <strong className="text-neutral-900 dark:text-white">PWABuilder.com</strong>.</li>
                  <li>Click <strong className="text-neutral-900 dark:text-white">Package for Store &gt; Android</strong>.</li>
                  <li>Download the signed <code className="font-mono">.aab</code> package and submit to Google Play Console.</li>
                </ol>
              </div>
            </div>
          )}

          {activeStoreTab === 'apple' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-750">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Capacitor for iOS
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">
                  To publish native iOS on the Apple App Store, package with Capacitor:
                </p>
                <div className="mt-2.5 p-3.5 bg-neutral-950 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1 border border-neutral-800">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/ios</div>
                  <div>npx cap init MoveMates com.movemates.app</div>
                  <div>npm run build && npx cap add ios</div>
                  <div>npx cap open ios</div>
                </div>
              </div>
            </div>
          )}

          {activeStoreTab === 'capacitor' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">capacitor.config.json</span>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs modern-press flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {capacitorConfigSnippet}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs modern-press"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
