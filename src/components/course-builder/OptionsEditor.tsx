'use client';
import { useState, useEffect } from 'react';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition cursor-pointer ${checked ? 'bg-orange-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{children}</label>;
}

export default function OptionsEditor() {
  const { courseData } = useCourseBuilder();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [noCertificate, setNoCertificate] = useState(false);
  const [groupPricing, setGroupPricing] = useState(false);
  const [groupRanges, setGroupRanges] = useState([
    { id: '1', min: '2', max: '5', pricePerSeat: '39.99' },
    { id: '2', min: '6', max: '10', pricePerSeat: '34.99' },
    { id: '3', min: '11', max: '25', pricePerSeat: '29.99' },
    { id: '4', min: '26', max: '50+', pricePerSeat: '24.99' },
  ]);
  const [earlyBird, setEarlyBird] = useState(false);
  const [earlyBirdPrice, setEarlyBirdPrice] = useState('19.99');
  const [earlyBirdDate, setEarlyBirdDate] = useState('');
  const [moneyBack, setMoneyBack] = useState(true);
  const [moneyBackDays, setMoneyBackDays] = useState('30');
  const [giftable, setGiftable] = useState(true);
  const [enablePractice, setEnablePractice] = useState(false);

  // Load existing course options
  useEffect(() => {
    if (courseData) {
      if (courseData.enable_certificate !== undefined) setNoCertificate(!courseData.enable_certificate);
      if (courseData.enable_group_pricing !== undefined) setGroupPricing(courseData.enable_group_pricing);
      if (courseData.money_back_guarantee !== undefined) setMoneyBack(courseData.money_back_guarantee);
      if (courseData.money_back_days !== undefined) setMoneyBackDays(String(courseData.money_back_days));
      if (courseData.giftable !== undefined) setGiftable(courseData.giftable);
      if (courseData.enable_practice !== undefined) setEnablePractice(courseData.enable_practice);
    }
  }, [courseData]);

  const handleSave = async () => {
    if (!courseData?.slug) return;
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateCourse(courseData.slug, {
        enable_certificate: !noCertificate,
        enable_group_pricing: groupPricing,
        money_back_guarantee: moneyBack,
        money_back_days: parseInt(moneyBackDays) || 30,
        giftable,
        enable_practice: enablePractice,
      });
      setFeedback({ type: 'success', message: 'Options saved successfully!' });
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save options' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="w-[70%] mx-auto p-8 space-y-10">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-1">Additional Options</h2>
        <p className="text-sm text-gray-400">Configure additional course options and policies</p>
      </div>

      <div className="space-y-4">
        {/* Certificate override */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Toggle checked={noCertificate} onChange={setNoCertificate} label="📜 Do not provide certificate" desc="Disable certificate for this course regardless of global settings" />
        </div>

        {/* Group/Corporate Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <Toggle checked={groupPricing} onChange={setGroupPricing} label="👥 Group / Corporate Pricing" desc="Volume discounts for team enrollments" />
          {groupPricing && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-400 uppercase">
                <span>Min Seats</span><span>Max Seats</span><span>Per Seat ($)</span><span></span>
              </div>
              {groupRanges.map((r, idx) => (
                <div key={r.id} className="grid grid-cols-4 gap-2">
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={r.min} onChange={e => { const n = [...groupRanges]; n[idx] = { ...r, min: e.target.value }; setGroupRanges(n); }} />
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={r.max} onChange={e => { const n = [...groupRanges]; n[idx] = { ...r, max: e.target.value }; setGroupRanges(n); }} />
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={r.pricePerSeat} onChange={e => { const n = [...groupRanges]; n[idx] = { ...r, pricePerSeat: e.target.value }; setGroupRanges(n); }} />
                  <button onClick={() => setGroupRanges(groupRanges.filter(x => x.id !== r.id))} className="text-gray-300 hover:text-red-500 justify-self-center cursor-pointer">✕</button>
                </div>
              ))}
              <button
                onClick={() => setGroupRanges([...groupRanges, { id: String(Date.now()), min: '', max: '', pricePerSeat: '' }])}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
              >
                ➕ Add range
              </button>
            </div>
          )}
        </div>

        {/* Early Bird */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <Toggle checked={earlyBird} onChange={setEarlyBird} label="🐦 Early Bird Pricing" desc="Special price before course launch date" />
          {earlyBird && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-orange-300">
              <div>
                <FieldLabel>Early Bird Price ($)</FieldLabel>
                <input type="number" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={earlyBirdPrice} onChange={e => setEarlyBirdPrice(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Valid Until</FieldLabel>
                <input type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={earlyBirdDate} onChange={e => setEarlyBirdDate(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Money-back Guarantee */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <Toggle checked={moneyBack} onChange={setMoneyBack} label="💰 Money-back Guarantee" desc="Offer a refund window" />
          {moneyBack && (
            <div className="pl-4 border-l-2 border-orange-300 flex items-center gap-2">
              <input type="number" className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:outline-none" value={moneyBackDays} onChange={e => setMoneyBackDays(e.target.value)} />
              <span className="text-sm text-gray-500">day guarantee</span>
            </div>
          )}
        </div>

        {/* Practice Exercises */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Toggle checked={enablePractice} onChange={setEnablePractice} label="🏋️ Practice Exercises" desc="Enable hands-on coding exercises for this course" />
        </div>

        {/* Gift */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Toggle checked={giftable} onChange={setGiftable} label="🎁 Gift This Course" desc="Allow purchasing as a gift for someone else" />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 justify-end pt-4">
        {feedback && (
          <span className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback.message}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Options'}
        </button>
      </div>
    </div>
  );
}
