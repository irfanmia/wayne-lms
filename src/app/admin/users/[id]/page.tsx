'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

const roleColor: Record<string, string> = { Student: 'bg-blue-100 text-blue-700', Instructor: 'bg-purple-100 text-purple-700', Admin: 'bg-orange-100 text-orange-700' };

const courseStatusColor: Record<string, string> = { Completed: 'bg-green-100 text-green-700', 'In Progress': 'bg-blue-100 text-blue-700', 'Not Started': 'bg-gray-100 text-gray-600' };

const assignmentStatusColor: Record<string, string> = { Graded: 'bg-green-100 text-green-700', Submitted: 'bg-blue-100 text-blue-700', Pending: 'bg-yellow-100 text-yellow-700', Late: 'bg-red-100 text-red-700' };

const activityIcon: Record<string, string> = { auth: '🔑', assignment: '📝', lesson: '📖', certificate: '🏆', course: '🎓', enrollment: '📚' };

const tabList = ['Overview', 'Courses', 'Assignments', 'Certificates', 'Activity'] as const;

const heatmapData: number[] = new Array(30).fill(0);
const heatColor = (v: number) => v === 0 ? 'bg-gray-100' : v <= 2 ? 'bg-green-200' : v <= 4 ? 'bg-green-400' : 'bg-green-600';

export default function AdminUserProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState({ name: '', email: '', role: 'Student', avatar: '', joined: '', lastActive: '', status: 'Active', bio: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ label: string; value: string | number; icon: string }[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<{ name: string; progress: number; enrolled: string; lastAccessed: string; status: string }[]>([]);
  const [assignments] = useState<{ name: string; course: string; submitted: string; grade: string; status: string }[]>([]);
  const [certificates, setCertificates] = useState<{ id: string; course: string; date: string; template: string }[]>([]);
  const [activityLog] = useState<{ time: string; action: string; details: string; type: string }[]>([]);

  const [tab, setTab] = useState<typeof tabList[number]>('Overview');
  const [userStatus, setUserStatus] = useState('Active');
  const [courseFilter, setCourseFilter] = useState('All');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [role, setRole] = useState('Student');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getUser(Number(id)).then(data => {
      const name = (data.display_name as string) || (data.username as string) || '';
      setUser({
        name,
        email: (data.email as string) || '',
        role: (data.role as string) || 'Student',
        avatar: name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
        joined: data.date_joined ? new Date(data.date_joined as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        lastActive: (data.last_login as string) || 'N/A',
        status: (data.is_active as boolean) !== false ? 'Active' : 'Suspended',
        bio: (data.bio as string) || '',
      });
      setRole((data.role as string) || 'Student');
      setUserStatus((data.is_active as boolean) !== false ? 'Active' : 'Suspended');
      setStats([
        { label: 'Enrolled Courses', value: (data.courses_enrolled as number) || 0, icon: '📚' },
        { label: 'Completed Courses', value: (data.courses_completed as number) || 0, icon: '✅' },
        { label: 'Certificates Earned', value: (data.certificates_count as number) || 0, icon: '🏆' },
        { label: 'Total Points', value: (data.total_points as number) || 0, icon: '⭐' },
        { label: 'Avg Quiz Score', value: data.avg_quiz_score ? `${data.avg_quiz_score}%` : '0%', icon: '📝' },
      ]);
    }).catch(err => setError(err.message || 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const filteredCourses = enrolledCourses.filter(c => courseFilter === 'All' || c.status === courseFilter);
  const filteredAssignments = assignments.filter(a => assignmentFilter === 'All' || a.status === assignmentFilter);
  const filteredActivity = activityLog.filter(a => activityFilter === 'All' || a.type === activityFilter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;
  if (error) return <div className="flex items-center justify-center h-64"><div className="text-center"><p className="text-red-500 text-lg mb-2">⚠️ Failed to load user</p><p className="text-gray-500 text-sm">{error}</p></div></div>;

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      {/* Back link */}
      <Link href="/admin/users" className="text-sm text-gray-500 hover:text-orange-600 inline-flex items-center gap-1">← Back to Users</Link>

      {/* ── Profile Header ────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">{user.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">{user.name}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor[role]}`}>{role}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${userStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{userStatus}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>Joined {user.joined}</span>
            <span>Last active {user.lastActive}</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => showSuccess('Edit profile — open modal in Users page.')} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">✏️ Edit Profile</button>
        <button onClick={() => setShowRoleModal(true)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">🔄 Change Role</button>
        <button onClick={() => setShowSendEmail(true)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">📧 Send Email</button>
        <button onClick={() => { setUserStatus(s => s === 'Active' ? 'Suspended' : 'Active'); showSuccess(userStatus === 'Active' ? 'User suspended.' : 'User activated.'); }} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">{userStatus === 'Active' ? '🚫 Suspend' : '✅ Activate'}</button>
        <button onClick={() => setShowResetPw(true)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">🔑 Reset Password</button>
        <button onClick={() => setShowDelete(true)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">🗑 Delete Account</button>
      </div>

      {/* ── Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        {tabList.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 px-1 text-sm font-medium transition border-b-2 ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {/* ══ Overview Tab ══════════════════════════════════ */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activityLog.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{activityIcon[a.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 font-medium">{a.action}</p>
                    <p className="text-xs text-gray-500 truncate">{a.details}</p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses in Progress */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Courses in Progress</h3>
            <div className="space-y-4">
              {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).map(c => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 font-medium truncate">{c.name}</span>
                    <span className="text-xs font-semibold text-gray-900 ml-2">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              ))}
              {enrolledCourses.filter(c => c.progress === 0).length > 0 && (
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">{enrolledCourses.filter(c => c.progress === 0).length} course(s) not started yet</p>
              )}
            </div>
          </div>

          {/* Learning Streak Heatmap */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Activity — Last 30 Days</h3>
            <div className="flex flex-wrap gap-1.5">
              {heatmapData.map((v, i) => (
                <div key={i} className={`w-7 h-7 rounded-md ${heatColor(v)} flex items-center justify-center`} title={`Day ${i + 1}: ${v} activities`}>
                  <span className="text-[9px] text-gray-600 font-medium">{v > 0 ? v : ''}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <span>Less</span>
              <div className="w-4 h-4 rounded bg-gray-100" />
              <div className="w-4 h-4 rounded bg-green-200" />
              <div className="w-4 h-4 rounded bg-green-400" />
              <div className="w-4 h-4 rounded bg-green-600" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {/* ══ Courses Tab ═══════════════════════════════════ */}
      {tab === 'Courses' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['All', 'In Progress', 'Completed', 'Not Started'].map(s => (
              <button key={s} onClick={() => setCourseFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${courseFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Course</th><th className="px-5 py-3">Progress</th><th className="px-5 py-3">Enrolled</th><th className="px-5 py-3">Last Accessed</th><th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c.name} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${c.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${c.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.enrolled}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.lastAccessed}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${courseStatusColor[c.status]}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ Assignments Tab ═══════════════════════════════ */}
      {tab === 'Assignments' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['All', 'Graded', 'Submitted', 'Pending', 'Late'].map(s => (
              <button key={s} onClick={() => setAssignmentFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${assignmentFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Assignment</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Grade</th><th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{a.course}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{a.submitted}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{a.grade}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${assignmentStatusColor[a.status]}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ Certificates Tab ══════════════════════════════ */}
      {tab === 'Certificates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-orange-100 to-yellow-50 flex flex-col items-center justify-center">
                <span className="text-4xl mb-1">🏆</span>
                <p className="text-xs text-gray-500 tracking-widest uppercase font-medium">Certificate of Completion</p>
                <p className="text-sm font-semibold text-gray-700 mt-1 text-center px-4">{c.course}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-500">{c.id}</span>
                  <span className="text-xs text-gray-400">{c.date}</span>
                </div>
                <button onClick={() => showSuccess(`Downloaded ${c.id}`)} className="w-full py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600">📥 Download</button>
              </div>
            </div>
          ))}
          {certificates.length === 0 && <p className="text-sm text-gray-400 col-span-3 text-center py-12">No certificates earned yet.</p>}
        </div>
      )}

      {/* ══ Activity Tab ══════════════════════════════════ */}
      {tab === 'Activity' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['All', 'enrollment', 'course', 'lesson', 'assignment', 'certificate', 'auth'].map(s => (
              <button key={s} onClick={() => setActivityFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${activityFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s === 'All' ? 'All' : s}</button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50">
                  <span className="text-xl mt-0.5">{activityIcon[a.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{a.action}</p>
                    <p className="text-sm text-gray-600">{a.details}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
              {filteredActivity.length === 0 && <p className="text-sm text-gray-400 text-center py-12">No activity found.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Change Role Modal ─────────────────────────── */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
            <p className="text-sm text-gray-600">Current role: <strong>{role}</strong></p>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Student</option><option>Instructor</option><option>Admin</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => { setShowRoleModal(false); showSuccess(`Role changed to ${role}.`); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Save</button>
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Email Modal ──────────────────────────── */}
      {showSendEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowSendEmail(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Send Email to {user.name}</h3>
            <div><label className="text-sm text-gray-600 block mb-1">To</label><input value={user.email} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" /></div>
            <div><label className="text-sm text-gray-600 block mb-1">Subject</label><input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div><label className="text-sm text-gray-600 block mb-1">Message</label><textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-28 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
            <div className="flex gap-2">
              <button onClick={() => { setShowSendEmail(false); setEmailSubject(''); setEmailBody(''); showSuccess('Email sent!'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Send</button>
              <button onClick={() => setShowSendEmail(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ──────────────────────── */}
      {showResetPw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowResetPw(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
            <p className="text-sm text-gray-600">Send a password reset link to <strong>{user.email}</strong>?</p>
            <div className="flex gap-2">
              <button onClick={() => { setShowResetPw(false); showSuccess('Password reset link sent!'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Send Reset Link</button>
              <button onClick={() => setShowResetPw(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ──────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
            <p className="text-sm text-gray-600">Are you sure you want to permanently delete <strong>{user.name}</strong>&apos;s account? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => { setShowDelete(false); showSuccess('Account deleted.'); }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
