'use client';
import Button from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n';

type CertificateProps = {
  id: string;
  name: string;
  track: string;
  date: string;
  userName: string;
};

export default function CertificateView({ id, name, track, date, userName }: CertificateProps) {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border-2 border-orange-300 rounded-2xl p-12 text-center relative overflow-hidden shadow-lg">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 300">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F97316" strokeWidth="0.5"/>
          </pattern>
          <rect width="400" height="300" fill="url(#grid)" />
        </svg>

        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />

        <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-orange-300 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-orange-300 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-orange-300 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-orange-300 rounded-br-lg" />

        <div className="relative">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">M</div>
          <p className="text-orange-500 font-bold text-sm font-heading mb-6">{t('certificate.millionCoders')}</p>

          <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mb-3">{t('certificate.certOfCompletion')}</p>

          <div className="w-16 h-px bg-orange-300 mx-auto mb-6" />

          <h1 className="text-4xl font-medium text-gray-900 mb-2 font-heading">{name}</h1>
          <p className="text-gray-500 mb-8">{t('certificate.completedBy')}</p>

          <h2 className="text-5xl font-medium text-orange-500 mb-2 font-heading">{userName}</h2>
          <p className="text-gray-500 text-sm mb-8">
            {t('certificate.proficiency')} <span className="text-gray-900 font-semibold">{track}</span> {t('certificate.track')}
          </p>

          <div className="w-16 h-px bg-orange-300 mx-auto mb-6" />

          <p className="text-gray-400 text-sm mb-2">
            {t('certificate.issuedOn')} {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="border-t border-gray-200 mt-6 pt-4 flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono">ID: {id}</span>
            <span>wayne-lms.example.com/certificates/{id}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <Button variant="primary">{t('certificate.downloadPdf')}</Button>
        <Button variant="secondary">{t('certificate.shareLinkedin')}</Button>
        <Button variant="outline">{t('certificate.verifyCert')}</Button>
      </div>
    </div>
  );
}
