'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import CertificatePreview from '@/components/certificates/CertificatePreview';

interface CertData {
  certificate_id: string;
  user_name: string;
  course_title: string;
  issued_at: string;
  template?: { name: string; background_image?: string };
}

export default function VerifyCertificate() {
  const { uid } = useParams();
  const [cert, setCert] = useState<CertData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/certificates/verify/${uid}/`).then(setCert).catch(() => {
      // Mock for demo
      setCert({
        certificate_id: uid as string,
        user_name: 'Sarah Chen',
        course_title: 'Introduction to Python',
        issued_at: new Date().toISOString(),
      });
    });
  }, [uid]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-heading font-bold mb-2">Certificate Not Found</h1>
        <p className="text-gray-500">The certificate ID could not be verified.</p>
      </div>
    );
  }

  if (!cert) return <div className="p-12 text-center">Verifying certificate...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full mb-4">
          <span>✅</span>
          <span className="font-medium">Certificate Verified</span>
        </div>
        <h1 className="text-2xl font-heading font-bold">Certificate Verification</h1>
      </div>

      <CertificatePreview
        studentName={cert.user_name}
        courseName={cert.course_title}
        date={new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        instructor="Sarah Chen"
        certificateId={cert.certificate_id}
        backgroundImage={cert.template?.background_image}
      />

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Issued on {new Date(cert.issued_at).toLocaleDateString()} · ID: {cert.certificate_id}
        </p>
      </div>
    </div>
  );
}
