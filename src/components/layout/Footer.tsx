'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">M</div>
              <span className="text-gray-900 font-bold font-heading">Wayne LMS</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm">𝕏</a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm">in</a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm">▶</a>
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm">📷</a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-3">{t('footer.platform')}</h4>
            <div className="space-y-2">
              <Link href="/courses" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.courses')}</Link>
              <Link href="/tracks" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.codingTracks')}</Link>
              <Link href="/pricing" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.pricing')}</Link>
              <Link href="/dashboard" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.dashboard')}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-3">{t('footer.community')}</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.collaborate')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.sponsorship')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.events')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.becomeInstructor')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.forEnterprise')}</a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-3">{t('footer.company')}</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('footer.about')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('nav.contactUs')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('footer.privacy')}</a>
              <a href="#" className="block text-gray-500 hover:text-orange-600 text-sm">{t('footer.terms')}</a>
            </div>
          </div>
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-3">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>704 City Gate Tower</p>
              <p>Al Ittihad Street</p>
              <p>Sharjah, UAE</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-sm gap-2">
          <span>{t('footer.copyright')}</span>
          <span>{t('footer.designedBy')} <a href="https://webcoffee.in" className="text-orange-500 hover:text-orange-600">Webcoffee</a></span>
        </div>
      </div>
    </footer>
  );
}
