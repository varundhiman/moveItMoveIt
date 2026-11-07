import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, Copy, Check } from 'lucide-react';

interface StorePublishModalProps {
  onClose: () => void;
}

export const StorePublishModal: React.FC<StorePublishModalProps> = ({ onClose }) => {
  const [activeStoreTab, setActiveStoreTab] = useState<'google' | 'apple' | 'capacitor'>('google');
  const [copiedCode, setCopiedCode] = useState(false);

  const capacitorConfigSnippet = `{
  "appId": "com.shiftmove.app",
  "appName": "ShiftMove",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">App Store & Play Store Deployment</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 mt-4 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveStoreTab('google')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              activeStoreTab === 'google'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Google Play
          </button>
          <button
            type="button"
            onClick={() => setActiveStoreTab('apple')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              activeStoreTab === 'apple'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            App Store (iOS)
          </button>
          <button
            type="button"
            onClick={() => setActiveStoreTab('capacitor')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              activeStoreTab === 'capacitor'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Config
          </button>
        </div>

        {/* Tab details */}
        <div className="mt-4 space-y-3 text-xs leading-relaxed">
          {activeStoreTab === 'google' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  PWABuilder · Trusted Web Activity (TWA)
                </div>
                <p className="text-slate-300">
                  Google Play natively accepts PWAs packaged as Android App Bundles (<code className="font-mono text-emerald-400">.aab</code>):
                </p>
                <ol className="mt-2.5 list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Enter this URL into <strong className="text-white">PWABuilder.com</strong>.</li>
                  <li>Click <strong className="text-white">Package for Store</strong> &gt; Android.</li>
                  <li>Download the signed <code className="text-emerald-400 font-mono">.aab</code> package.</li>
                  <li>Upload directly to Google Play Console.</li>
                </ol>
              </div>
            </div>
          )}

          {activeStoreTab === 'apple' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-white flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Capacitor for iOS
                </div>
                <p className="text-slate-300">
                  To publish to the Apple App Store, package with Capacitor:
                </p>
                <div className="mt-2.5 p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-emerald-400 space-y-1">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/ios</div>
                  <div>npx cap init ShiftMove com.shiftmove.app</div>
                  <div>npm run build && npx cap add ios</div>
                  <div>npx cap open ios</div>
                </div>
                <p className="mt-2 text-slate-400">
                  Ensure <code className="text-slate-300 font-mono">NSCameraUsageDescription</code> is added to <code className="text-slate-300 font-mono">Info.plist</code> for camera rep tracking approval.
                </p>
              </div>
            </div>
          )}

          {activeStoreTab === 'capacitor' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">capacitor.config.json</span>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="flex items-center gap-1 text-xs text-emerald-400 font-semibold"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {capacitorConfigSnippet}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
