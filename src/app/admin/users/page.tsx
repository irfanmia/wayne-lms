'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const tabs = ['All Users', 'Students', 'Instructors', 'Admins'] as const;

type UserItem = { id: number; name: string; email: string; role: string; courses: number; joined: string; status: string; avatar: string; password: string };

const roleColor: Record<string, string> = {
  Student: 'bg-blue-100 text-blue-700',
  Instructor: 'bg-purple-100 text-purple-700',
  Admin: 'bg-orange-100 text-orange-700',
};

const rolePermissions: Record<string, Record<string, boolean>> = {
  Admin: { 'Manage Users': true, 'Manage Courses': true, 'Manage Content': true, 'View Analytics': true, 'Manage Payments': true, 'Manage Settings': true, 'Manage Certificates': true, 'Send Emails': true, 'Manage Bundles': true, 'Grade Assignments': true },
  Instructor: { 'Manage Users': false, 'Manage Courses': true, 'Manage Content': true, 'View Analytics': true, 'Manage Payments': false, 'Manage Settings': false, 'Manage Certificates': false, 'Send Emails': false, 'Manage Bundles': false, 'Grade Assignments': true },
  Student: { 'Manage Users': false, 'Manage Courses': false, 'Manage Content': false, 'View Analytics': false, 'Manage Payments': false, 'Manage Settings': false, 'Manage Certificates': false, 'Send Emails': false, 'Manage Bundles': false, 'Grade Assignments': false },
};

const studentPerms: Record<string, boolean> = { 'Enroll in Courses': true, 'Submit Assignments': true, 'View Own Progress': true, 'Earn Certificates': true, 'View Course Content': true };

type User = UserItem;

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('All Users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showDelete, setShowDelete] = useState<User | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(rolePermissions);
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setPageLoading(true);
    api.getUsers().then(res => {
      const list = res.results || res;
      if (Array.isArray(list)) {
        setUsers(list.map((u: Record<string, unknown>) => ({
          id: (u.id as number) || 0,
          name: (u.display_name as string) || (u.username as string) || '',
          email: (u.email as string) || '',
          role: (u.role as string) || 'Student',
          courses: (u.courses_enrolled as number) || 0,
          joined: u.date_joined ? new Date(u.date_joined as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          status: (u.is_active as boolean) !== false ? 'Active' : 'Suspended',
          avatar: ((u.display_name as string) || (u.username as string) || '').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
          password: '',
        })));
      }
    }).catch(err => setPageError(err.message || 'Failed to load users'))
      .finally(() => setPageLoading(false));
  }, []);

  const allPermissions = [
    { key: 'manage_users', label: 'Manage Users', group: 'Administration' },
    { key: 'manage_courses', label: 'Manage Courses', group: 'Administration' },
    { key: 'manage_content', label: 'Manage Content Library', group: 'Administration' },
    { key: 'manage_exercises', label: 'Manage Exercises', group: 'Administration' },
    { key: 'manage_settings', label: 'Platform Settings', group: 'Administration' },
    { key: 'view_analytics', label: 'View Analytics', group: 'Insights' },
    { key: 'manage_payments', label: 'Manage Payments & Revenue', group: 'Insights' },
    { key: 'manage_coupons', label: 'Manage Coupons', group: 'Commerce' },
    { key: 'manage_bundles', label: 'Manage Bundles', group: 'Commerce' },
    { key: 'manage_certificates', label: 'Manage Certificates', group: 'Commerce' },
    { key: 'send_emails', label: 'Send Emails', group: 'Communication' },
    { key: 'grade_assignments', label: 'Grade Assignments', group: 'Teaching' },
    { key: 'create_courses', label: 'Create / Edit Own Courses', group: 'Teaching' },
    { key: 'view_enrolled_students', label: 'View Enrolled Students', group: 'Teaching' },
    { key: 'enroll_courses', label: 'Enroll in Courses', group: 'Student' },
    { key: 'submit_assignments', label: 'Submit Assignments', group: 'Student' },
    { key: 'earn_certificates', label: 'Earn Certificates', group: 'Student' },
    { key: 'view_progress', label: 'View Own Progress', group: 'Student' },
  ];

  const roleDefaults: Record<string, string[]> = {
    Admin: allPermissions.map(p => p.key),
    Instructor: ['create_courses', 'view_enrolled_students', 'grade_assignments', 'manage_content', 'manage_exercises', 'view_analytics', 'enroll_courses', 'submit_assignments', 'earn_certificates', 'view_progress'],
    Student: ['enroll_courses', 'submit_assignments', 'earn_certificates', 'view_progress'],
  };

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student', avatarUrl: '', status: 'Active' });
  const [userPerms, setUserPerms] = useState<string[]>(roleDefaults['Student']);

  const filtered = users.filter(u => {
    const matchTab = activeTab === 'All Users' || u.role === activeTab.slice(0, -1);
    return matchTab && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const openCreate = () => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'Student', avatarUrl: '', status: 'Active' }); setUserPerms(roleDefaults['Student']); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, avatarUrl: '', status: u.status }); setUserPerms(roleDefaults[u.role] || roleDefaults['Student']); setShowModal(true); };

  const saveUser = () => {
    if (!form.name || !form.email) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: form.name, email: form.email, role: form.role, status: form.status, avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() } : u));
      showSuccess('User updated successfully!');
    } else {
      const newUser: User = { id: Date.now(), name: form.name, email: form.email, role: form.role, courses: 0, joined: 'Feb 26, 2026', status: form.status, avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), password: form.password };
      setUsers(prev => [newUser, ...prev]);
      showSuccess('User created successfully!');
    }
    setShowModal(false);
  };

  const deleteUser = () => { if (showDelete) { setUsers(prev => prev.filter(u => u.id !== showDelete.id)); setShowDelete(null); showSuccess('User deleted.'); } };
  const toggleStatus = (id: number) => { setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u)); };
  const changeRole = (id: number, role: string) => { setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u)); showSuccess('Role changed.'); };

  const togglePermission = (role: string, perm: string) => {
    if (role === 'Admin') return;
    setPermissions(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
  };

  return (
    <div className="space-y-8">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">{successMsg}</div>}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Users</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowPermissions(!showPermissions)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">🔐 Role Permissions</button>
          <button onClick={() => setShowImport(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">📥 Bulk Import</button>
          <button onClick={openCreate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">➕ Add User</button>
        </div>
      </div>

      {/* Role Permissions */}
      {showPermissions && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
            <button onClick={() => setShowPermissions(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-4 py-3">Permission</th>
                  {['Admin', 'Instructor', 'Student'].map(r => <th key={r} className="px-4 py-3 text-center">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.keys(permissions.Admin).map(perm => (
                  <tr key={perm} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-700">{perm}</td>
                    {['Admin', 'Instructor', 'Student'].map(role => (
                      <td key={role} className="px-4 py-3 text-center">
                        <input type="checkbox" checked={permissions[role][perm]} onChange={() => togglePermission(role, perm)} disabled={role === 'Admin'} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2">Student-specific permissions:</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(studentPerms).map(([p, v]) => (
                <label key={p} className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={v} readOnly className="w-4 h-4 text-orange-500 rounded" /> {p}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }} className={`pb-3 px-1 text-sm font-medium transition border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      <input type="text" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Courses</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{u.avatar}</div>
                    <div><p className="text-sm font-medium text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${roleColor[u.role]}`}>
                    <option>Student</option><option>Instructor</option><option>Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{u.courses}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{u.joined}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${u.id}`} className="text-xs text-blue-600 hover:underline font-medium">View</Link>
                    <button onClick={() => openEdit(u)} className="text-xs text-orange-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => toggleStatus(u.id)} className="text-xs text-gray-500 hover:underline">{u.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                    <button onClick={() => setShowDelete(u)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900 font-heading">{editUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <div><label className="text-sm text-gray-600 block mb-1 font-medium">Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1 font-medium">Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" /></div>
                <div><label className="text-sm text-gray-600 block mb-1 font-medium">Password {editUser ? '(leave blank to keep)' : '*'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1 font-medium">Role</label>
                    <select value={form.role} onChange={e => { setForm(f => ({ ...f, role: e.target.value })); setUserPerms(roleDefaults[e.target.value] || []); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 cursor-pointer">
                      <option>Student</option><option>Instructor</option><option>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1 font-medium">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 cursor-pointer">
                      <option>Active</option><option>Suspended</option>
                    </select>
                  </div>
                  <div><label className="text-sm text-gray-600 block mb-1 font-medium">Avatar URL</label><input value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" /></div>
                </div>
              </div>

              {/* Permissions */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Permissions</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Customize what this user can access. Changing role resets to defaults.</p>
                  </div>
                  <button
                    onClick={() => setUserPerms(roleDefaults[form.role] || [])}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                  >
                    Reset to {form.role} defaults
                  </button>
                </div>

                {['Administration', 'Insights', 'Commerce', 'Communication', 'Teaching', 'Student'].map(group => {
                  const groupPerms = allPermissions.filter(p => p.group === group);
                  if (groupPerms.length === 0) return null;
                  return (
                    <div key={group} className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {groupPerms.map(p => (
                          <label key={p.key} className="flex items-center gap-2.5 cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={userPerms.includes(p.key)}
                              onChange={() => {
                                setUserPerms(prev =>
                                  prev.includes(p.key) ? prev.filter(x => x !== p.key) : [...prev, p.key]
                                );
                              }}
                              className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button onClick={saveUser} className="px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition cursor-pointer">
                {editUser ? 'Save Changes' : 'Create User'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer">Cancel</button>
              <span className="flex-1" />
              <span className="text-xs text-gray-400 self-center">{userPerms.length} of {allPermissions.length} permissions enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{showDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={deleteUser} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Delete</button>
              <button onClick={() => setShowDelete(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Import Users</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition cursor-pointer">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm text-gray-600">Drag & drop a CSV file here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Format: name, email, role, password</p>
              <input type="file" accept=".csv" className="hidden" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowImport(false); showSuccess('CSV imported! 0 users added (demo).'); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Import</button>
              <button onClick={() => setShowImport(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
