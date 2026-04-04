'use client';
import { useState } from 'react';
import { useCourseBuilder } from './CourseBuilderLayout';
import api from '@/lib/api';

type PricingModel = 'free' | 'one-time' | 'offline' | 'membership' | 'installment' | 'bundle' | 'pay-what-you-want' | 'waitlist' | 'scholarship';

const pricingModels: { key: PricingModel; icon: string; label: string; desc: string }[] = [
  { key: 'free', icon: '🎁', label: 'Free', desc: 'No payment, open enrollment' },
  { key: 'one-time', icon: '💳', label: 'One-time Payment', desc: 'Fixed price, one-time purchase' },
  { key: 'offline', icon: '🏛️', label: 'Offline Payment (Institute)', desc: 'Pay at physical location' },
  { key: 'membership', icon: '👑', label: 'Membership / Subscription', desc: 'Access via subscription plan' },
  { key: 'installment', icon: '📅', label: 'Installment', desc: 'Pay in parts over time' },
  { key: 'bundle', icon: '📦', label: 'Bundle Pricing', desc: 'Part of a course bundle' },
  { key: 'pay-what-you-want', icon: '💝', label: 'Pay What You Want', desc: 'Minimum + suggested price' },
  { key: 'waitlist', icon: '⏳', label: 'Waitlist', desc: 'Collect emails, notify on launch' },
  { key: 'scholarship', icon: '🎓', label: 'Scholarship / Financial Aid', desc: 'Application form for aid' },
];

const existingPlans = ['Monthly Basic ($9.99/mo)', 'Monthly Pro ($19.99/mo)', 'Yearly Basic ($99/yr)', 'Yearly Pro ($199/yr)', 'Lifetime All-Access ($499)'];
const existingBundles = ['Web Dev Starter Pack', 'AI & ML Complete', 'Full Stack Bootcamp', 'Python Mastery Bundle'];
const allCoursesForBundle = ['Introduction to Python', 'Advanced Python', 'Web Development Basics', 'JavaScript Mastery', 'React for Beginners', 'Node.js Backend', 'Database Design', 'Machine Learning 101'];

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

export default function PricingEditor() {
  const { courseData } = useCourseBuilder();
  const [model, setModel] = useState<PricingModel>('one-time');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // One-time
  const [price, setPrice] = useState('49.99');
  const [salePrice, setSalePrice] = useState('29.99');
  const [comparePrice, setComparePrice] = useState('79.99');
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');

  // Offline
  const [offlineInstructions, setOfflineInstructions] = useState('Please visit our campus office at Building A, Room 102 to complete payment. Bring your student ID.');
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [paymentVerification, setPaymentVerification] = useState(true);

  // Membership
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showInlinePlan, setShowInlinePlan] = useState(false);
  const [inlinePlanName, setInlinePlanName] = useState('');
  const [inlineMonthly, setInlineMonthly] = useState('');
  const [inlineYearly, setInlineYearly] = useState('');
  const [inlineLifetime, setInlineLifetime] = useState('');
  const [allAccess, setAllAccess] = useState(false);

  // Installment
  const [totalPrice, setTotalPrice] = useState('149.99');
  const [numInstallments, setNumInstallments] = useState('4');
  const [installmentType, setInstallmentType] = useState('monthly');
  const [gracePeriod, setGracePeriod] = useState('7');
  const [lateFee, setLateFee] = useState(false);
  const [lateFeeAmount, setLateFeeAmount] = useState('5.00');

  // Bundle
  const [selectedBundle, setSelectedBundle] = useState('');
  const [showInlineBundle, setShowInlineBundle] = useState(false);
  const [bundleName, setBundleName] = useState('');
  const [bundleCourses, setBundleCourses] = useState<string[]>([]);
  const [bundlePrice, setBundlePrice] = useState('');
  const [separatePrice, setSeparatePrice] = useState('49.99');

  // Pay What You Want
  const [minPrice, setMinPrice] = useState('5.00');
  const [suggestedPrice, setSuggestedPrice] = useState('25.00');

  // Waitlist
  const [launchDate, setLaunchDate] = useState('');
  const [waitlistMessage, setWaitlistMessage] = useState('This course is launching soon! Join the waitlist to be notified.');

  // Scholarship
  const [scholarshipEnabled, setScholarshipEnabled] = useState(true);
  const [scholarshipQuestions, setScholarshipQuestions] = useState('Why do you need financial aid for this course?');

  const perInstallment = numInstallments ? (parseFloat(totalPrice) / parseInt(numInstallments)).toFixed(2) : '0.00';

  return (
    <div className="w-[70%] mx-auto p-8 space-y-10">
      {/* ─── PRICING MODEL ─── */}
      <div>
        <h3 className="text-xl font-semibold font-heading mb-2">Pricing</h3>
        <p className="text-sm text-gray-400 mb-5">Choose how students pay for this course.</p>

        <div className="grid grid-cols-3 gap-3">
          {pricingModels.map(pm => (
            <button
              key={pm.key}
              onClick={() => setModel(pm.key)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                model === pm.key
                  ? 'border-orange-500 bg-orange-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{pm.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{pm.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pm.desc}</p>
                </div>
              </div>
              {model === pm.key && (
                <div className="mt-2 flex justify-end">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MODEL-SPECIFIC OPTIONS ─── */}
      {model === 'one-time' && (
        <Section title="One-time Payment Details">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel>Price (USD)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Sale Price</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Compare at Price</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={comparePrice} onChange={e => setComparePrice(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Shown as <span className="line-through">${comparePrice}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Sale Start Date</FieldLabel>
              <input type="date" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={saleStart} onChange={e => setSaleStart(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Sale End Date</FieldLabel>
              <input type="date" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={saleEnd} onChange={e => setSaleEnd(e.target.value)} />
            </div>
          </div>
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mt-2">
            <p className="text-xs text-gray-400 mb-1">Price Preview:</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-600">${salePrice || price}</span>
              {salePrice && <span className="text-lg text-gray-400 line-through">${comparePrice || price}</span>}
              {salePrice && price && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">{Math.round((1 - parseFloat(salePrice) / parseFloat(price)) * 100)}% OFF</span>}
            </div>
          </div>
        </Section>
      )}

      {model === 'offline' && (
        <Section title="Offline Payment Details">
          <div>
            <FieldLabel>Payment Instructions</FieldLabel>
            <textarea className="w-full px-3 py-2.5 border rounded-lg text-sm min-h-[100px]" value={offlineInstructions} onChange={e => setOfflineInstructions(e.target.value)} />
          </div>
          <Toggle checked={autoInvoice} onChange={setAutoInvoice} label="Auto-generate Reference/Invoice Number" desc="System will create a unique reference for each enrollment request" />
          <Toggle checked={paymentVerification} onChange={setPaymentVerification} label="Payment Verification Required" desc="Admin must manually approve enrollment after confirming payment" />
        </Section>
      )}

      {model === 'membership' && (
        <Section title="Membership / Subscription">
          <div>
            <FieldLabel>Link to Existing Plan</FieldLabel>
            <select className="w-full px-3 py-2.5 border rounded-lg text-sm" value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
              <option value="">Select a plan...</option>
              {existingPlans.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="text-center text-xs text-gray-400 py-2">— or —</div>

          <button onClick={() => setShowInlinePlan(!showInlinePlan)} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            {showInlinePlan ? '▾ Hide' : '▸ Create'} Inline Plan
          </button>

          {showInlinePlan && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <FieldLabel>Plan Name</FieldLabel>
                <input className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" placeholder="e.g. Python Pro Plan" value={inlinePlanName} onChange={e => setInlinePlanName(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <FieldLabel>Monthly ($)</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" placeholder="9.99" value={inlineMonthly} onChange={e => setInlineMonthly(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Yearly ($)</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" placeholder="99.00" value={inlineYearly} onChange={e => setInlineYearly(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Lifetime ($)</FieldLabel>
                  <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" placeholder="299.00" value={inlineLifetime} onChange={e => setInlineLifetime(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <Toggle checked={allAccess} onChange={setAllAccess} label="Include in All-Access Pass" desc="Members with All-Access get this course automatically" />
        </Section>
      )}

      {model === 'installment' && (
        <Section title="Installment Payment">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Total Price ($)</FieldLabel>
              <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Number of Installments</FieldLabel>
              <select className="w-full px-3 py-2.5 border rounded-lg text-sm" value={numInstallments} onChange={e => setNumInstallments(e.target.value)}>
                {Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n} installments</option>)}
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>Installment Type</FieldLabel>
            <div className="flex gap-2">
              {['monthly', 'per-module', 'custom'].map(t => (
                <button
                  key={t}
                  onClick={() => setInstallmentType(t)}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    installmentType === t ? 'bg-orange-50 border-orange-400 text-orange-700 font-medium' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {t === 'monthly' ? 'Monthly' : t === 'per-module' ? 'Per Module' : 'Custom Dates'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-calculated preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-600 mb-1">💡 Per-installment amount</p>
            <p className="text-2xl font-bold text-blue-700">${perInstallment} <span className="text-sm font-normal">× {numInstallments}</span></p>
          </div>

          <div>
            <FieldLabel>Grace Period (days)</FieldLabel>
            <input type="number" className="w-32 px-3 py-2.5 border rounded-lg text-sm" value={gracePeriod} onChange={e => setGracePeriod(e.target.value)} />
          </div>

          <Toggle checked={lateFee} onChange={setLateFee} label="Late Fee" desc="Charge additional fee for late payments" />
          {lateFee && (
            <div className="pl-4 border-l-2 border-orange-300">
              <FieldLabel>Late Fee Amount ($)</FieldLabel>
              <input type="number" className="w-32 px-3 py-2.5 border rounded-lg text-sm" value={lateFeeAmount} onChange={e => setLateFeeAmount(e.target.value)} />
            </div>
          )}
        </Section>
      )}

      {model === 'bundle' && (
        <Section title="Bundle Pricing">
          <div>
            <FieldLabel>Link to Existing Bundle</FieldLabel>
            <select className="w-full px-3 py-2.5 border rounded-lg text-sm" value={selectedBundle} onChange={e => setSelectedBundle(e.target.value)}>
              <option value="">Select a bundle...</option>
              {existingBundles.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="text-center text-xs text-gray-400 py-2">— or —</div>

          <button onClick={() => setShowInlineBundle(!showInlineBundle)} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            {showInlineBundle ? '▾ Hide' : '▸ Create'} New Bundle
          </button>

          {showInlineBundle && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <FieldLabel>Bundle Name</FieldLabel>
                <input className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" placeholder="e.g. Python Complete Bundle" value={bundleName} onChange={e => setBundleName(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Courses in Bundle</FieldLabel>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {allCoursesForBundle.map(c => (
                    <label key={c} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-orange-500"
                        checked={bundleCourses.includes(c)}
                        onChange={e => setBundleCourses(e.target.checked ? [...bundleCourses, c] : bundleCourses.filter(x => x !== c))}
                      />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Bundle Price ($)</FieldLabel>
                <input type="number" className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white" value={bundlePrice} onChange={e => setBundlePrice(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <FieldLabel>Individual Price (if bought separately)</FieldLabel>
            <div className="relative w-40">
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
              <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={separatePrice} onChange={e => setSeparatePrice(e.target.value)} />
            </div>
          </div>
        </Section>
      )}

      {model === 'pay-what-you-want' && (
        <Section title="Pay What You Want">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Minimum Price ($)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Suggested Price ($)</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input type="number" className="w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm" value={suggestedPrice} onChange={e => setSuggestedPrice(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Student will see:</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Pay: $</span>
              <input type="number" className="w-32 px-3 py-2 border rounded-lg text-sm" defaultValue={suggestedPrice} />
              <span className="text-xs text-gray-400">(min ${minPrice})</span>
            </div>
          </div>
        </Section>
      )}

      {model === 'waitlist' && (
        <Section title="Waitlist">
          <div>
            <FieldLabel>Expected Launch Date</FieldLabel>
            <input type="date" className="w-full px-3 py-2.5 border rounded-lg text-sm" value={launchDate} onChange={e => setLaunchDate(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Waitlist Message</FieldLabel>
            <textarea className="w-full px-3 py-2.5 border rounded-lg text-sm min-h-[80px]" value={waitlistMessage} onChange={e => setWaitlistMessage(e.target.value)} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-700">⏳ Students who join the waitlist will be notified via email when the course launches.</p>
          </div>
        </Section>
      )}

      {model === 'scholarship' && (
        <Section title="Scholarship / Financial Aid">
          <Toggle checked={scholarshipEnabled} onChange={setScholarshipEnabled} label="Enable Scholarship Applications" desc="Students can apply for financial aid or free enrollment" />
          {scholarshipEnabled && (
            <div>
              <FieldLabel>Application Questions</FieldLabel>
              <textarea className="w-full px-3 py-2.5 border rounded-lg text-sm min-h-[80px]" value={scholarshipQuestions} onChange={e => setScholarshipQuestions(e.target.value)} placeholder="Questions the student must answer..." />
              <p className="text-xs text-gray-400 mt-1">Admin will review applications manually.</p>
            </div>
          )}
        </Section>
      )}

      {/* Save */}
      {saveMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
        </div>
      )}
      <button
        disabled={saving}
        onClick={async () => {
          if (!courseData?.slug) return;
          setSaving(true);
          setSaveMsg(null);
          try {
            const payload: Record<string, unknown> = {
              is_free: model === 'free',
              price: model === 'one-time' ? Number(price) || 0 : 0,
            };
            await api.updateCourse(courseData.slug, payload);
            setSaveMsg({ type: 'success', text: 'Pricing saved successfully!' });
            setTimeout(() => setSaveMsg(null), 3000);
          } catch (err: unknown) {
            setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save pricing' });
          } finally {
            setSaving(false);
          }
        }}
        className="px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm disabled:opacity-50"
      >
        {saving ? '⏳ Saving...' : '💾 Save Pricing'}
      </button>

    </div>
  );
}
