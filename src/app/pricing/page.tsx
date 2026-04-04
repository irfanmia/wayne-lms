'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import GridBackground from '@/components/ui/GridBackground';
import { useI18n } from '@/lib/i18n';

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const { t } = useI18n();

  const freeFeatures = t('pricing.freeFeatures') as unknown as string[];
  const freeDisabled = t('pricing.freeDisabled') as unknown as string[];
  const proFeatures = t('pricing.proFeatures') as unknown as string[];
  const enterpriseFeatures = t('pricing.enterpriseFeatures') as unknown as string[];

  return (
    <GridBackground className="min-h-screen">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <AnimatedSection><div className="text-center mb-12">
        <h1 className="text-5xl font-medium text-gray-900 mb-3 font-heading">{t('pricing.title')}</h1>
        <p className="text-gray-500 text-lg">{t('pricing.subtitle')}</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={annual ? 'text-gray-400' : 'text-gray-900'}>{t('pricing.monthly')}</span>
          <button onClick={() => setAnnual(!annual)} className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors cursor-pointer">
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-orange-500 transition-all ${annual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={annual ? 'text-gray-900' : 'text-gray-400'}>{t('pricing.annual')}</span>
          {annual && <Badge variant="success">{t('pricing.save40')}</Badge>}
        </div>
      </div></AnimatedSection>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free */}
        <StaggerItem><div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm card-hover">
          <h3 className="text-xl font-bold text-gray-900 mb-1 font-heading">{t('pricing.free')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('pricing.freeSubtitle')}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-400 text-sm">/{t('pricing.forever')}</span>
          </div>
          <Button variant="outline" className="w-full mb-8">{t('pricing.getStarted')}</Button>
          <ul className="space-y-3">
            {(Array.isArray(freeFeatures) ? freeFeatures : []).map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-600">✓</span>{f}</li>
            ))}
            {(Array.isArray(freeDisabled) ? freeDisabled : []).map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-300"><span>✗</span>{f}</li>
            ))}
          </ul>
        </div></StaggerItem>

        {/* Pro */}
        <StaggerItem><div className="bg-white border-2 border-orange-500 rounded-2xl p-8 relative shadow-md plan-glow card-hover">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="warning">{t('pricing.mostPopular')}</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 font-heading">{t('pricing.proTitle')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('pricing.proSubtitle')}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">${annual ? 9 : 15}</span>
            <span className="text-gray-400 text-sm">/{t('pricing.month')}</span>
            {annual && <span className="text-gray-400 text-xs ml-2">{t('pricing.billedAnnually')}</span>}
          </div>
          <Button className="w-full mb-8" size="lg">{t('pricing.getProMembership')}</Button>
          <ul className="space-y-3">
            {(Array.isArray(proFeatures) ? proFeatures : []).map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-600">✓</span>{f}</li>
            ))}
          </ul>
        </div></StaggerItem>

        {/* Enterprise */}
        <StaggerItem><div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm card-hover">
          <h3 className="text-xl font-bold text-gray-900 mb-1 font-heading">{t('pricing.enterpriseTitle')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('pricing.enterpriseSubtitle')}</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">{t('pricing.custom')}</span>
          </div>
          <Button variant="secondary" className="w-full mb-8">{t('pricing.contactSales')}</Button>
          <ul className="space-y-3">
            {(Array.isArray(enterpriseFeatures) ? enterpriseFeatures : []).map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-600">✓</span>{f}</li>
            ))}
          </ul>
        </div></StaggerItem>
      </StaggerContainer>

      <AnimatedSection delay={0.3}><div className="max-w-2xl mx-auto mt-12 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="text-gray-900 font-semibold mb-2 font-heading">{t('pricing.oneTimePurchaseTitle')}</h3>
        <p className="text-gray-500 text-sm mb-4">{t('pricing.oneTimePurchaseDesc')}</p>
        <a href="/courses" className="text-orange-600 text-sm hover:text-orange-700 font-medium">{t('pricing.browseCourses')}</a>
      </div>

      <div className="text-center mt-8 text-gray-400 text-sm">
        {t('pricing.guarantee')}
      </div></AnimatedSection>
    </div>
    </GridBackground>
  );
}
