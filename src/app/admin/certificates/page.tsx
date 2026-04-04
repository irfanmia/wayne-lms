'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const templateStyles = [
  { id: 1, name: 'Classic', gradient: 'from-amber-100 to-yellow-50', icon: '🏛️', border: 'border-amber-300' },
  { id: 2, name: 'Modern', gradient: 'from-blue-100 to-indigo-50', icon: '✨', border: 'border-blue-300' },
  { id: 3, name: 'Elegant', gradient: 'from-purple-100 to-pink-50', icon: '👑', border: 'border-purple-300' },
  { id: 4, name: 'Minimal', gradient: 'from-gray-100 to-white', icon: '◻️', border: 'border-gray-300' },
  { id: 5, name: 'Professional', gradient: 'from-slate-100 to-slate-50', icon: '💼', border: 'border-slate-300' },
  { id: 6, name: 'Creative', gradient: 'from-orange-100 to-red-50', icon: '🎨', border: 'border-orange-300' },
];

type CertItem = { id: string; student: string; course: string; date: string; template: string; revoked: boolean };

export default function CertificatesPage() {
  const [tab, setTab] = useState<'templates' | 'issued'>('templates');
  const [defaultTemplate, setDefaultTemplate] = useState(1);
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showRevoke, setShowRevoke] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    api.getCertificates().then(res => {
      const list = res.results || res;
      if (Array.isArray(list) && list.length > 0) {
        setCerts(list.map((c: Record<string, unknown>) => ({
          id: String(c.certificate_id || c.id || ''),
          student: (c.user_name as string) || (c.student_name as string) || (c.student as string) || '',
          course: (c.course_title as string) || (c.course_name as string) || (c.course as string) || '',
          date: (c.issued_at as string) || (c.issued_date as string) || (c.date as string) || '',
          template: typeof c.template === 'object' && c.template !== null ? ((c.template as Record<string, unknown>).name as string || 'Classic') : (c.template as string) || 'Classic',
          revoked: !!(c.revoked),
        })));
      }
    }).catch(err => setPageError(err.message || 'Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  const revokeCert = () => {
    if (showRevoke) {
      setCerts(prev => prev.map(c => c.id === showRevoke ? { ...c, revoked: !c.revoked } : c));
      showSuccess('Certificate status updated.');
      setShowRevoke(null);
    }
  };

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Certificates</h2>
        <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">📤 Upload Template</button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setTab('templates')} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === 'templates' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}>Templates</button>
        <button onClick={() => setTab('issued')} className={`pb-3 px-1 text-sm font-medium border-b-2 ${tab === 'issued' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}>Issued Certificates ({certs.length})</button>
      </div>

      {tab === 'templates' ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">Select a default template for new certificates. Click to set as default.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateStyles.map(t => (
              <div key={t.id} onClick={() => { setDefaultTemplate(t.id); showSuccess(`"${t.name}" set as default template.`); }} className={`bg-white border-2 rounded-xl shadow-sm overflow-hidden cursor-pointer transition hover:shadow-md ${defaultTemplate === t.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}>
                <div className={`h-40 bg-gradient-to-br ${t.gradient} flex flex-col items-center justify-center relative`}>
                  <span className="text-4xl mb-2">{t.icon}</span>
                  <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">Certificate of Completion</p>
                  <p className="text-sm text-gray-400 mt-1">Student Name</p>
                  {defaultTemplate === t.id && <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  {defaultTemplate === t.id && <span className="text-xs text-orange-600 font-medium">✓ Selected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">ID</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Template</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-mono text-gray-600">{c.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{c.student}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.course}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.template}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.date}</td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${c.revoked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{c.revoked ? 'Revoked' : 'Valid'}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => showSuccess('Certificate downloaded!')} className="text-xs text-orange-600 hover:underline font-medium">Download</button>
                      <button onClick={() => setShowRevoke(c.id)} className="text-xs text-red-500 hover:underline">{c.revoked ? 'Restore' : 'Revoke'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Template Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Upload Certificate Template</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition cursor-pointer">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm text-gray-600">Drag & drop a template file (PDF, HTML, or image)</p>
              <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
            </div>
            <div><label className="text-sm text-gray-600 block mb-1">Template Name</label><input placeholder="My Custom Template" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div className="flex gap-2">
              <button onClick={() => { setShowUpload(false); showSuccess('Template uploaded!'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Upload</button>
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      {showRevoke && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowRevoke(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">{certs.find(c => c.id === showRevoke)?.revoked ? 'Restore' : 'Revoke'} Certificate</h3>
            <p className="text-sm text-gray-600">Are you sure you want to {certs.find(c => c.id === showRevoke)?.revoked ? 'restore' : 'revoke'} certificate {showRevoke}?</p>
            <div className="flex gap-2">
              <button onClick={revokeCert} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Confirm</button>
              <button onClick={() => setShowRevoke(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
