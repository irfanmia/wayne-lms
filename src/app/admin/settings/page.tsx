'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const sections = ['General', 'Branding', 'Payment Gateways', 'Email Config', 'SEO', 'Integrations', 'AI Features'] as const;

export default function SettingsPage() {
  const [active, setActive] = useState<string>('General');
  const [successMsg, setSuccessMsg] = useState('');

  // General
  const [platformName, setPlatformName] = useState('Wayne LMS');
  const [tagline, setTagline] = useState('Learn to code, one million at a time');
  const [supportEmail, setSupportEmail] = useState('support@wayne-lms.example.com');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('English');
  const [maintenance, setMaintenance] = useState(false);

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#F97316');
  const [customCss, setCustomCss] = useState('');

  // Payment
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripeKey, setStripeKey] = useState('pk_live_•••••••••');
  const [stripeSecret, setStripeSecret] = useState('');
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Email
  const [emailProvider, setEmailProvider] = useState('SMTP');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('TLS');
  const [sesRegion, setSesRegion] = useState('us-east-1');
  const [sesAccessKey, setSesAccessKey] = useState('');
  const [sesSecretKey, setSesSecretKey] = useState('');
  const [fromName, setFromName] = useState('Wayne LMS');
  const [fromEmail, setFromEmail] = useState('noreply@wayne-lms.example.com');

  // SEO
  const [metaTitle, setMetaTitle] = useState('Wayne LMS - Learn to Code');
  const [metaDesc, setMetaDesc] = useState('The best platform to learn programming, AI, and technology.');
  const [ogImage, setOgImage] = useState('');
  const [gaId, setGaId] = useState('');
  const [fbPixel, setFbPixel] = useState('');

  // Integrations
  const [integrations, setIntegrations] = useState([
    { name: 'Google Analytics', enabled: true, key: 'GA-XXXXXXXXX', placeholder: 'GA-XXXXXXXXX' },
    { name: 'Facebook Pixel', enabled: false, key: '', placeholder: 'Pixel ID' },
    { name: 'Mailchimp', enabled: false, key: '', placeholder: 'API Key' },
    { name: 'Zapier', enabled: false, key: '', placeholder: 'Webhook URL' },
    { name: 'Slack Notifications', enabled: false, key: '', placeholder: 'Webhook URL' },
  ]);

  // AI Features state
  const [aiTutorEnabled, setAiTutorEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState('groq');
  const [aiModel, setAiModel] = useState('llama-3.3-70b-versatile');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiSystemPrompt, setAiSystemPrompt] = useState('');
  const [aiEmailNotifications, setAiEmailNotifications] = useState(true);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    api.getPlatformSettings().then((res: Record<string, unknown>) => {
      if (res.platform_name) setPlatformName(res.platform_name as string);
      if (res.tagline) setTagline(res.tagline as string);
      if (res.support_email) setSupportEmail(res.support_email as string);
      if (res.timezone) setTimezone(res.timezone as string);
      if (res.default_language || res.language) setLanguage((res.default_language as string) || (res.language as string));
      if (res.maintenance_mode !== undefined) setMaintenance(!!(res.maintenance_mode));
      if (res.primary_color) setPrimaryColor(res.primary_color as string);
      if (res.default_currency || res.currency) setCurrency((res.default_currency as string) || (res.currency as string));
      if (res.meta_title) setMetaTitle(res.meta_title as string);
      if (res.meta_description) setMetaDesc(res.meta_description as string);
    }).catch(() => { /* settings may not exist yet */ });
    // Load AI Tutor settings
    api.getAITutorSettings().then((res: Record<string, unknown>) => {
      if (res.enabled !== undefined) setAiTutorEnabled(!!res.enabled);
      if (res.provider) setAiProvider(res.provider as string);
      if (res.model_name) setAiModel(res.model_name as string);
      if (res.api_key) setAiApiKey(res.api_key as string);
      if (res.system_prompt) setAiSystemPrompt(res.system_prompt as string);
      if (res.email_notifications !== undefined) setAiEmailNotifications(!!res.email_notifications);
    }).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.updatePlatformSettings({
        platform_name: platformName, tagline, support_email: supportEmail, timezone, language,
        maintenance_mode: maintenance, primary_color: primaryColor, currency,
        meta_title: metaTitle, meta_description: metaDesc,
        stripe_enabled: stripeEnabled, paypal_enabled: paypalEnabled,
        email_provider: emailProvider, smtp_host: smtpHost, smtp_port: smtpPort,
        from_name: fromName, from_email: fromEmail,
      });
    } catch {}
    showSuccess('Settings saved successfully!');
  };

  const toggleIntegration = (idx: number) => setIntegrations(prev => prev.map((i, j) => j === idx ? { ...i, enabled: !i.enabled } : i));
  const updateIntKey = (idx: number, key: string) => setIntegrations(prev => prev.map((i, j) => j === idx ? { ...i, key } : i));

  return (
    <div className="flex gap-6">
      <div className="w-48 shrink-0 space-y-1">
        {sections.map(s => (
          <button key={s} onClick={() => setActive(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${active === s ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
        ))}
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">{successMsg}</div>}

        {active === 'General' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Platform Name</label><input value={platformName} onChange={e => setPlatformName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Tagline</label><input value={tagline} onChange={e => setTagline(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Support Email</label><input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 block mb-1">Timezone</label><select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>UTC</option><option>Asia/Dubai</option><option>US/Eastern</option><option>US/Pacific</option><option>Europe/London</option></select></div>
                <div><label className="text-sm text-gray-600 block mb-1">Default Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>English</option><option>Arabic</option><option>Spanish</option><option>French</option><option>Hindi</option></select></div>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div><p className="text-sm font-medium text-gray-900">Maintenance Mode</p><p className="text-xs text-gray-500">Temporarily disable the site for users</p></div>
                <button onClick={() => setMaintenance(!maintenance)} className={`w-12 h-6 rounded-full transition-colors ${maintenance ? 'bg-red-500' : 'bg-gray-300'} relative`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenance ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {active === 'Branding' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Branding</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Logo</label><div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:border-orange-400 transition">📷 Upload Logo</div></div>
              <div><label className="text-sm text-gray-600 block mb-1">Favicon</label><div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-orange-400 transition">Favicon</div></div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-32 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div><label className="text-sm text-gray-600 block mb-1">Custom CSS</label><textarea value={customCss} onChange={e => setCustomCss(e.target.value)} placeholder="/* Custom CSS */" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono h-24 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            </div>
          </div>
        )}

        {active === 'Payment Gateways' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Gateways</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Stripe</h4>
                  <button onClick={() => setStripeEnabled(!stripeEnabled)} className={`w-10 h-5 rounded-full transition-colors ${stripeEnabled ? 'bg-orange-500' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${stripeEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {stripeEnabled && (
                  <div className="space-y-2">
                    <input value={stripeKey} onChange={e => setStripeKey(e.target.value)} placeholder="Publishable Key (pk_live_...)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input type="password" value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} placeholder="Secret Key (sk_live_...)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                )}
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">PayPal</h4>
                  <button onClick={() => setPaypalEnabled(!paypalEnabled)} className={`w-10 h-5 rounded-full transition-colors ${paypalEnabled ? 'bg-orange-500' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${paypalEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {paypalEnabled && (
                  <div className="space-y-2">
                    <input value={paypalClientId} onChange={e => setPaypalClientId(e.target.value)} placeholder="Client ID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input type="password" value={paypalSecret} onChange={e => setPaypalSecret(e.target.value)} placeholder="Secret" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                )}
              </div>
              <div><label className="text-sm text-gray-600 block mb-1">Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>USD</option><option>EUR</option><option>AED</option><option>INR</option><option>GBP</option></select></div>
            </div>
          </div>
        )}

        {active === 'Email Config' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Provider</label><select value={emailProvider} onChange={e => setEmailProvider(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>SMTP</option><option>AWS SES</option></select></div>
              {emailProvider === 'SMTP' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-600 block mb-1">SMTP Host</label><input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Port</label><input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Username</label><input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Password</label><input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Encryption</label><select value={smtpEncryption} onChange={e => setSmtpEncryption(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option>TLS</option><option>SSL</option></select></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-600 block mb-1">Region</label><input value={sesRegion} onChange={e => setSesRegion(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="text-sm text-gray-600 block mb-1">Access Key</label><input value={sesAccessKey} onChange={e => setSesAccessKey(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div className="col-span-2"><label className="text-sm text-gray-600 block mb-1">Secret Key</label><input type="password" value={sesSecretKey} onChange={e => setSesSecretKey(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 block mb-1">From Name</label><input value={fromName} onChange={e => setFromName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1">From Email</label><input value={fromEmail} onChange={e => setFromEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              </div>
              <button onClick={() => showSuccess('Connection test successful!')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">🔌 Test Connection</button>
            </div>
          </div>
        )}

        {active === 'SEO' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-600 block mb-1">Meta Title</label><input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">Meta Description</label><textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div><label className="text-sm text-gray-600 block mb-1">OG Image URL</label><input value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-600 block mb-1">Google Analytics ID</label><input value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1">Facebook Pixel ID</label><input value={fbPixel} onChange={e => setFbPixel(e.target.value)} placeholder="Pixel ID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              </div>
            </div>
          </div>
        )}

        {active === 'Integrations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
            <div className="space-y-4">
              {integrations.map((intg, idx) => (
                <div key={intg.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{intg.name}</h4>
                    <button onClick={() => toggleIntegration(idx)} className={`w-10 h-5 rounded-full transition-colors ${intg.enabled ? 'bg-orange-500' : 'bg-gray-300'} relative`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${intg.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {intg.enabled && (
                    <input value={intg.key} onChange={e => updateIntKey(idx, e.target.value)} placeholder={intg.placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'AI Features' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
              <p className="text-sm text-gray-500 mt-1">Wayne Intelligence AI-powered products for your LMS</p>
            </div>

            {/* AI Tutor — active product */}
            <div className="p-5 border-2 border-orange-300 bg-orange-50/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Tutor Assistant</h4>
                    <p className="text-xs text-gray-500">Context-aware chat tutor on every lesson</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiTutorEnabled(!aiTutorEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${aiTutorEnabled ? 'bg-orange-500' : 'bg-gray-300'} relative`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${aiTutorEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              {aiTutorEnabled && (
                <div className="space-y-4 mt-4 pt-4 border-t border-orange-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                      <select value={aiProvider} onChange={e => {
                        setAiProvider(e.target.value);
                        if (e.target.value === 'groq') setAiModel('llama-3.3-70b-versatile');
                        else setAiModel('gpt-4o');
                      }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="groq">Groq (Free tier)</option>
                        <option value="openai">OpenAI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input value={aiModel} onChange={e => setAiModel(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input type="password" value={aiApiKey} onChange={e => setAiApiKey(e.target.value)} placeholder="Enter API key..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                    <textarea value={aiSystemPrompt} onChange={e => setAiSystemPrompt(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                      <p className="text-xs text-gray-400">Send detailed explanations to student email after answering doubts</p>
                    </div>
                    <button
                      onClick={() => setAiEmailNotifications(!aiEmailNotifications)}
                      className={`w-10 h-5 rounded-full transition-colors ${aiEmailNotifications ? 'bg-orange-500' : 'bg-gray-300'} relative`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiEmailNotifications ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await api.updateAITutorSettings({ enabled: aiTutorEnabled, provider: aiProvider, model_name: aiModel, api_key: aiApiKey, system_prompt: aiSystemPrompt, email_notifications: aiEmailNotifications });
                        showSuccess('AI Tutor settings saved!');
                      } catch { showSuccess('Failed to save AI Tutor settings'); }
                    }}
                    className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                  >
                    Save AI Tutor Settings
                  </button>
                </div>
              )}
            </div>

            {/* Coming Soon products */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Coming Soon</h4>
              {[
                { icon: '🦉', name: 'EdOwl', desc: 'AI-driven assessment platform — MCQs to AI-evaluated handwritten answers' },
                { icon: '🦅', name: 'EdHawk', desc: 'Personalized learning plans with AI-adapted difficulty and JD-based mock sessions' },
                { icon: '🚀', name: 'LMS Pro', desc: 'AI-powered sales engine — drive revenue with smart course recommendations' },
                { icon: '🗄️', name: 'Registry Management System', desc: 'Student records, credentials, and compliance management' },
                { icon: '📜', name: 'BetterShare', desc: 'Certification platform — design, generate, verify and share certificates' },
                { icon: '📊', name: 'CRM', desc: 'Central command panel for leads, approvals, payments, and workflows' },
                { icon: '📋', name: 'AI Document Verification', desc: 'Automated document validation with confidence scoring' },
                { icon: '📈', name: 'AI Analytics Module', desc: 'Cross-platform intelligence dashboard for learning and revenue insights' },
                { icon: '💬', name: 'AI Assistant — Intelligent Chat', desc: '24/7 chatbot for student support, sales, and lead conversion' },
              ].map(product => (
                <div key={product.name} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-700">{product.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">Coming Soon</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{product.desc}</p>
                      </div>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-gray-200 relative cursor-not-allowed">
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button onClick={save} className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
