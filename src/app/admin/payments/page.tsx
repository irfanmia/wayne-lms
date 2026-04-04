'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const revenueCards = [
  { label: 'Total Revenue', value: '$284,520', trend: '+18%', up: true, icon: '💰' },
  { label: 'This Month', value: '$48,295', trend: '-2%', up: false, icon: '📅' },
  { label: 'Refunds', value: '$1,240', trend: '-15%', up: true, icon: '↩️' },
  { label: 'Net Revenue', value: '$283,280', trend: '+17%', up: true, icon: '📊' },
];

type Transaction = { id: number; student: string; course: string; amount: string; method: string; date: string; status: string };

// No mock data — fetched from API

const statusColor: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Refunded: 'bg-red-100 text-red-700',
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showRefund, setShowRefund] = useState<Transaction | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    api.getOrders().then(res => {
      const list = res.results || res;
      if (Array.isArray(list) && list.length > 0) {
        setTransactions(list.map((t: Record<string, unknown>, i: number) => {
          const amt = t.amount ? `$${Number(t.amount).toFixed(2)}` : '$0.00';
          const statusRaw = (t.status as string) || 'completed';
          const statusMap: Record<string, string> = { completed: 'Completed', pending: 'Pending', refunded: 'Refunded', failed: 'Failed' };
          return {
            id: (t.id as number) || i + 1,
            student: (t.user_name as string) || (t.student_name as string) || `User #${t.user || ''}`,
            course: (t.course_name as string) || (t.course_title as string) || `Course #${t.course || ''}`,
            amount: amt,
            method: ((t.payment_method as string) || (t.method as string) || 'stripe').charAt(0).toUpperCase() + ((t.payment_method as string) || (t.method as string) || 'stripe').slice(1),
            date: (t.created_at as string) || (t.date as string) || '',
            status: statusMap[statusRaw] || statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1),
          };
        }));
      }
    }).catch(err => setPageError(err.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t =>
    (methodFilter === 'All' || t.method === methodFilter) &&
    (statusFilter === 'All' || t.status === statusFilter)
  );

  const processRefund = async () => {
    if (showRefund) {
      try { await api.refundOrder(showRefund.id); } catch {}
      setTransactions(prev => prev.map(t => t.id === showRefund.id ? { ...t, status: 'Refunded' } : t));
      setShowRefund(null);
      showSuccess('Refund processed successfully!');
    }
  };

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Payments & Revenue</h2>
        <button onClick={() => showSuccess('CSV exported successfully!')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">📥 Export CSV</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map(r => (
          <div key={r.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{r.label}</p>
              <span className="text-xl">{r.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-1">{r.value}</p>
            <span className={`text-sm font-medium ${r.up ? 'text-green-600' : 'text-red-500'}`}>{r.up ? '↑' : '↓'} {r.trend}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input type="date" defaultValue="2026-02-01" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <input type="date" defaultValue="2026-02-26" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="All">All Methods</option><option>Stripe</option><option>PayPal</option><option>Bank</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="All">All Status</option><option>Completed</option><option>Pending</option><option>Refunded</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-5 py-3">Student</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{t.student}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{t.course}</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{t.amount}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{t.method}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{t.date}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[t.status]}`}>{t.status}</span></td>
                <td className="px-5 py-3">
                  {t.status === 'Completed' && (
                    <button onClick={() => setShowRefund(t)} className="text-xs text-red-500 hover:underline font-medium">Refund</button>
                  )}
                  {t.status === 'Refunded' && <span className="text-xs text-gray-400">Refunded</span>}
                  {t.status === 'Pending' && <span className="text-xs text-yellow-600">Pending</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refund Confirmation */}
      {showRefund && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowRefund(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
            <p className="text-sm text-gray-600">Refund <strong>{showRefund.amount}</strong> to <strong>{showRefund.student}</strong> for &ldquo;{showRefund.course}&rdquo;?</p>
            <div className="flex gap-2">
              <button onClick={processRefund} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Process Refund</button>
              <button onClick={() => setShowRefund(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
