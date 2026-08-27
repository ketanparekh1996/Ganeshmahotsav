import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import MemberModal from '../components/MemberModal';

const Members = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');

  useEffect(() => { fetchMembers(); }, [search, statusFilter]);

  const fetchMembers = async () => {
    try {
      const r = await axios.get('/api/members', { params: { search, status: statusFilter } });
      setMembers(r.data);
    } catch { toast.error('Failed to load members'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try { await axios.delete(`/api/members/${id}`); toast.success('Deleted'); fetchMembers(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed to delete'); }
  };

  // Consistent avatar colour per initial
  const avatarColors = [
    'bg-violet-600', 'bg-blue-600', 'bg-emerald-600',
    'bg-rose-600',   'bg-amber-600', 'bg-sky-600',
  ];
  const avatarColor = (name) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-5 page-enter">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {members.length} registered{!isAdmin && ' · View only'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setSelected(null); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold
                       bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white
                       rounded-xl shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
          >
            <Plus size={18} /> Add Member
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          Only administrators can add, edit, or delete members.
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or mobile…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Cards grid */}
      {members.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map(m => (
            <div
              key={m.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
                         shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              {/* Card top row: avatar + name + badges */}
              <div className="flex items-center gap-4 px-5 pt-5 pb-4 border-b border-gray-50 dark:border-gray-800">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center
                                 text-white font-extrabold text-lg shadow-sm ${avatarColor(m.name)}`}>
                  {m.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
                    {m.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {/* Role badge */}
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold
                      ${m.role === 'admin'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                      <ShieldCheck size={10} />
                      {m.role}
                    </span>
                    {/* Status badge */}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold
                      ${m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                      }`}>
                      {m.status}
                    </span>
                  </div>
                </div>

                {/* Action buttons — always visible */}
                {isAdmin && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setSelected(m); setShowModal(true); }}
                      className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50
                                 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50
                                 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Card info rows */}
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {m.mobile}
                  </span>
                </div>

                {m.email && (
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {m.email}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Joined {new Date(m.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && isAdmin && (
        <MemberModal
          member={selected}
          onClose={() => { setShowModal(false); setSelected(null); }}
          onSuccess={() => { fetchMembers(); setShowModal(false); setSelected(null); }}
        />
      )}
    </div>
  );
};

export default Members;
