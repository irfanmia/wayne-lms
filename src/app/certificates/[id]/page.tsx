'use client';
import { use, useState, useEffect } from 'react';
import CertificateView from '@/components/certificates/CertificateView';
import { useI18n, tContent } from '@/lib/i18n';
import api from '@/lib/api';

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale } = useI18n();
  const [cert, setCert] = useState<Record<string, unknown> | null>(null);
  const [userName, setUserName] = useState('Student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/certificates/${id}/`);
        setCert(data);
      } catch {
        setCert({ id, track: 'Course', name: { en: 'Certificate', ar: 'شهادة', es: 'Certificado' }, date: new Date().toISOString().split('T')[0] });
      }
      try {
        const me = await api.getMe();
        setUserName(me.name || me.username || 'Student');
      } catch { /* use default */ }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="animate-pulse h-64 w-96 bg-gray-100 rounded-xl" /></div>;
  if (!cert) return <div className="min-h-[80vh] flex items-center justify-center text-red-500">Certificate not found</div>;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <CertificateView
        id={cert.id as string}
        name={tContent(cert.name, locale)}
        track={tContent(cert.track, locale)}
        date={cert.date as string}
        userName={userName}
      />
    </div>
  );
}
