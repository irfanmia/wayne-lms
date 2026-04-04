'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  minPurchase: number;
  scope: 'this' | 'all' | 'selected';
  active: boolean;
}

const seasonalTemplates = [
  { name: 'Black Friday', emoji: '🖤', discount: '40%' },
  { name: 'Ramadan', emoji: '🌙', discount: '25%' },
  { name: 'Back to School', emoji: '🎒', discount: '30%' },
  { name: 'New Year', emoji: '🎆', discount: '20%' },
  { name: 'Summer Sale', emoji: '☀️', discount: '35%' },
  { name: 'Teacher\'s Day', emoji: '👩‍🏫', discount: '15%' },
];

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      <div className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-orange-500' : 'bg-gray-300'}`} onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{children}</label>;
}

export default function CouponsEditor() {
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch real coupons from API
  useEffect(() => {
    api.get('/coupons/coupons/').then(res => {
      const list = res.results || res;
      if (Array.isArray(list)) {
        setCoupons(list.map((c: Record<string, unknown>) => ({
          id: String(c.id || ''),
          code: (c.code as string) || '',
          type: ((c.discount_type as string) || (c.type as string) || 'percentage') === 'fixed' ? 'fixed' : (c.discount_type === 'free' || c.type === 'free') ? 'free' : 'percentage',
          value: Number(c.discount_value || c.value || 0),
          usageLimit: Number(c.max_uses || c.usageLimit || 0),
          usedCount: Number(c.times_used || c.usedCount || 0),
          validFrom: (c.valid_from as string) || (c.validFrom as string) || '',
          validTo: (c.valid_until as string) || (c.validTo as string) || '',
          minPurchase: Number(c.min_purchase || c.minPurchase || 0),
          scope: ((c.scope as string) || 'all') as 'this' | 'all' | 'selected',
          active: c.is_active !== undefined ? !!(c.is_active) : !!(c.active),
        })));
      }
    }).catch(() => {});
  }, []);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ type: 'percentage', value: 10, usageLimit: 100, scope: 'this', code: '' });
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Smart Coupons
  const [birthdayCoupon, setBirthdayCoupon] = useState(false);
  const [birthdayDiscount, setBirthdayDiscount] = useState('15');
  const [welcomeCoupon, setWelcomeCoupon] = useState(true);
  const [welcomeDiscount, setWelcomeDiscount] = useState('10');
  const [referralCoupon, setReferralCoupon] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState('20');
  const [abandonedCart, setAbandonedCart] = useState(false);
  const [abandonedDays, setAbandonedDays] = useState('3');
  const [abandonedDiscount, setAbandonedDiscount] = useState('15');

  // Bulk generate
  const [bulkPrefix, setBulkPrefix] = useState('MC');
  const [bulkCount, setBulkCount] = useState('50');

  const saveCoupon = async () => {
    const code = newCoupon.code || `MC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const payload = {
      code,
      discount_type: newCoupon.type || 'percentage',
      discount_value: newCoupon.value || 0,
      max_uses: newCoupon.usageLimit || 100,
      valid_from: newCoupon.validFrom || new Date().toISOString(),
      valid_until: newCoupon.validTo || new Date(Date.now() + 90 * 86400000).toISOString(),
      min_purchase: newCoupon.minPurchase || 0,
      is_active: true,
    };
    try {
      const created = await api.post('/coupons/coupons/', payload);
      const c: Coupon = {
        id: String(created.id || Date.now()),
        code,
        type: newCoupon.type || 'percentage',
        value: newCoupon.value || 0,
        usageLimit: newCoupon.usageLimit || 100,
        usedCount: 0,
        validFrom: newCoupon.validFrom || '',
        validTo: newCoupon.validTo || '',
        minPurchase: newCoupon.minPurchase || 0,
        scope: newCoupon.scope || 'this',
        active: true,
      };
      setCoupons([...coupons, c]);
      setSaveMsg({ type: 'success', text: `Coupon ${code} created!` });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: unknown) {
      setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create coupon' });
    }
    setNewCoupon({ type: 'percentage', value: 10, usageLimit: 100, scope: 'this', code: '' });
    setShowCouponModal(false);
  };

  return (
    <div className="w-[70%] mx-auto p-8 space-y-10">
      {/* ─── COUPONS & DISCOUNTS ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold font-heading">Coupons & Discounts</h3>
            <p className="text-sm text-gray-400">Create and manage discount codes</p>
          </div>
          <button onClick={() => setShowCouponModal(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
            ➕ Create Coupon
          </button>
        </div>
        {saveMsg && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
          </div>
        )}

        {/* Active Coupons List */}
        <div className="bg-white border rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-1">Active Coupons ({coupons.length})</p>
            <p className="text-xs font-semibold text-gray-400 w-20">Type</p>
            <p className="text-xs font-semibold text-gray-400 w-20">Discount</p>
            <p className="text-xs font-semibold text-gray-400 w-20">Usage</p>
            <p className="text-xs font-semibold text-gray-400 w-16">Status</p>
            <p className="text-xs font-semibold text-gray-400 w-16"></p>
          </div>
          <div className="divide-y">
            {coupons.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                <div className="flex-1">
                  <code className="text-sm font-bold font-mono bg-gray-100 px-2 py-0.5 rounded">{c.code}</code>
                  <p className="text-xs text-gray-400 mt-0.5">{c.validFrom} → {c.validTo}</p>
                </div>
                <span className="text-xs w-20">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${c.type === 'percentage' ? 'bg-blue-100 text-blue-700' : c.type === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {c.type === 'percentage' ? '%' : c.type === 'fixed' ? '$' : 'FREE'}
                  </span>
                </span>
                <span className="text-sm w-20 font-medium">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `$${c.value}` : 'Free'}</span>
                <span className="text-xs text-gray-500 w-20">{c.usedCount}/{c.usageLimit}</span>
                <span className="w-16">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </span>
                <div className="w-16 flex justify-end gap-1">
                  <button onClick={() => setCoupons(coupons.map(x => x.id === c.id ? { ...x, active: !x.active } : x))} className="text-gray-400 hover:text-blue-500 text-xs" title="Toggle">
                    {c.active ? '⏸️' : '▶️'}
                  </button>
                  <button onClick={() => setCoupons(coupons.filter(x => x.id !== c.id))} className="text-gray-400 hover:text-red-500 text-xs" title="Delete">🗑️</button>
                </div>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No coupons yet</p>}
          </div>
        </div>

        {/* Smart Coupons */}
        <Section title="🧠 Smart Coupons">
          <div className="space-y-3">
            <div className={`border rounded-lg p-4 transition ${birthdayCoupon ? 'border-orange-300 bg-orange-50/50' : ''}`}>
              <Toggle checked={birthdayCoupon} onChange={setBirthdayCoupon} label="🎂 Birthday Coupon" desc="Auto-send discount on user's birthday" />
              {birthdayCoupon && (
                <div className="mt-2 pl-4 border-l-2 border-orange-300 flex items-center gap-2">
                  <input type="number" className="w-20 px-3 py-1.5 border rounded-lg text-sm" value={birthdayDiscount} onChange={e => setBirthdayDiscount(e.target.value)} />
                  <span className="text-sm text-gray-500">% off</span>
                </div>
              )}
            </div>

            <div className={`border rounded-lg p-4 transition ${welcomeCoupon ? 'border-orange-300 bg-orange-50/50' : ''}`}>
              <Toggle checked={welcomeCoupon} onChange={setWelcomeCoupon} label="👋 Welcome Coupon" desc="First-time enrollment discount" />
              {welcomeCoupon && (
                <div className="mt-2 pl-4 border-l-2 border-orange-300 flex items-center gap-2">
                  <input type="number" className="w-20 px-3 py-1.5 border rounded-lg text-sm" value={welcomeDiscount} onChange={e => setWelcomeDiscount(e.target.value)} />
                  <span className="text-sm text-gray-500">% off first course</span>
                </div>
              )}
            </div>

            <div className={`border rounded-lg p-4 transition ${referralCoupon ? 'border-orange-300 bg-orange-50/50' : ''}`}>
              <Toggle checked={referralCoupon} onChange={setReferralCoupon} label="🔗 Referral Coupon" desc="Share link — both referrer and friend get discount" />
              {referralCoupon && (
                <div className="mt-2 pl-4 border-l-2 border-orange-300 flex items-center gap-2">
                  <input type="number" className="w-20 px-3 py-1.5 border rounded-lg text-sm" value={referralDiscount} onChange={e => setReferralDiscount(e.target.value)} />
                  <span className="text-sm text-gray-500">% off each</span>
                </div>
              )}
            </div>

            <div className={`border rounded-lg p-4 transition ${abandonedCart ? 'border-orange-300 bg-orange-50/50' : ''}`}>
              <Toggle checked={abandonedCart} onChange={setAbandonedCart} label="🛒 Abandoned Cart Coupon" desc="Send discount if user doesn't complete purchase" />
              {abandonedCart && (
                <div className="mt-2 pl-4 border-l-2 border-orange-300 flex items-center gap-3">
                  <span className="text-sm text-gray-500">After</span>
                  <input type="number" className="w-16 px-2 py-1.5 border rounded-lg text-sm" value={abandonedDays} onChange={e => setAbandonedDays(e.target.value)} />
                  <span className="text-sm text-gray-500">days, send</span>
                  <input type="number" className="w-16 px-2 py-1.5 border rounded-lg text-sm" value={abandonedDiscount} onChange={e => setAbandonedDiscount(e.target.value)} />
                  <span className="text-sm text-gray-500">% off</span>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Bulk Generate */}
        <Section title="📋 Bulk Generate Codes">
          <div className="flex items-end gap-3">
            <div>
              <FieldLabel>Prefix</FieldLabel>
              <input className="w-24 px-3 py-2.5 border rounded-lg text-sm font-mono" value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Count</FieldLabel>
              <input type="number" className="w-24 px-3 py-2.5 border rounded-lg text-sm" value={bulkCount} onChange={e => setBulkCount(e.target.value)} />
            </div>
            <button
              onClick={async () => {
                setSaveMsg(null);
                try {
                  const res = await api.post('/coupons/coupons/bulk-generate/', {
                    prefix: bulkPrefix,
                    count: parseInt(bulkCount) || 10,
                    discount_type: 'percentage',
                    discount_value: 10,
                    usage_limit: 1,
                  });
                  // Add generated coupons to local list
                  const newCoupons = (res.coupons || []).map((c: Record<string, unknown>) => ({
                    id: String(c.id || ''),
                    code: (c.code as string) || '',
                    type: 'percentage' as const,
                    value: Number(c.value || 10),
                    usageLimit: Number(c.usage_limit || 1),
                    usedCount: 0,
                    validFrom: (c.valid_from as string) || '',
                    validTo: (c.valid_to as string) || '',
                    minPurchase: 0,
                    scope: 'all' as const,
                    active: true,
                  }));
                  setCoupons([...coupons, ...newCoupons]);
                  setSaveMsg({ type: 'success', text: `✅ Generated ${res.count} coupon codes!` });
                  setTimeout(() => setSaveMsg(null), 5000);
                } catch (err: unknown) {
                  setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate codes' });
                }
              }}
              className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              Generate {bulkCount} Codes
            </button>
          </div>
          <p className="text-xs text-gray-400">Codes will be generated as {bulkPrefix}-XXXXXX format</p>
        </Section>

        {/* Seasonal Templates */}
        <Section title="🎉 Seasonal / Promotional Templates">
          <div className="grid grid-cols-3 gap-3">
            {seasonalTemplates.map(st => (
              <button
                key={st.name}
                className="p-3 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition text-left"
                onClick={() => {
                  setNewCoupon({ ...newCoupon, code: st.name.toUpperCase().replace(/[^A-Z]/g, ''), value: parseInt(st.discount), type: 'percentage' });
                  setShowCouponModal(true);
                }}
              >
                <span className="text-2xl">{st.emoji}</span>
                <p className="text-sm font-medium mt-1">{st.name}</p>
                <p className="text-xs text-gray-400">{st.discount} off</p>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* ─── COUPON MODAL ─── */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCouponModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold font-heading">Create Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <FieldLabel>Coupon Code</FieldLabel>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2.5 border rounded-lg text-sm font-mono uppercase"
                    placeholder="MYCODE20"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    disabled={autoGenerate}
                  />
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" className="accent-orange-500" checked={autoGenerate} onChange={e => setAutoGenerate(e.target.checked)} />
                    Auto
                  </label>
                </div>
              </div>

              <div>
                <FieldLabel>Discount Type</FieldLabel>
                <div className="flex gap-2">
                  {[
                    { val: 'percentage', label: '% Off' },
                    { val: 'fixed', label: '$ Off' },
                    { val: 'free', label: 'Free' },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setNewCoupon({ ...newCoupon, type: t.val as Coupon['type'] })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition ${
                        newCoupon.type === t.val ? 'bg-orange-50 border-orange-400 text-orange-700 font-medium' : 'border-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {newCoupon.type !== 'free' && (
                <div>
                  <FieldLabel>Value</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Usage Limit (total)</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={newCoupon.usageLimit} onChange={e => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })} />
                </div>
                <div>
                  <FieldLabel>Min Purchase ($)</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={newCoupon.minPurchase || ''} onChange={e => setNewCoupon({ ...newCoupon, minPurchase: Number(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Valid From</FieldLabel>
                  <input type="date" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={newCoupon.validFrom || ''} onChange={e => setNewCoupon({ ...newCoupon, validFrom: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Valid To</FieldLabel>
                  <input type="date" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={newCoupon.validTo || ''} onChange={e => setNewCoupon({ ...newCoupon, validTo: e.target.value })} />
                </div>
              </div>

              <div>
                <FieldLabel>Applicable To</FieldLabel>
                <div className="flex gap-2">
                  {[
                    { val: 'this', label: 'This Course' },
                    { val: 'all', label: 'All Courses' },
                    { val: 'selected', label: 'Selected' },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setNewCoupon({ ...newCoupon, scope: t.val as Coupon['scope'] })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition ${
                        newCoupon.scope === t.val ? 'bg-orange-50 border-orange-400 text-orange-700 font-medium' : 'border-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-2">
              <button onClick={() => setShowCouponModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={saveCoupon} className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
