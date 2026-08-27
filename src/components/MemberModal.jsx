import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Portal from './Portal';
import { useAuth } from '../context/AuthContext';

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`;

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
);

const ToggleGroup = ({ options, value, onChange }) => (
  <div className={`grid grid-cols-${options.length} gap-2`}>
    {options.map(o => (
      <button key={o} type="button" onClick={() => onChange(o)}
        className={`py-2 text-xs font-semibold rounded-xl border-2 transition-all capitalize
          ${value === o
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
          }`}>
        {o}
      </button>
    ))}
  </div>
);

const MemberModal = ({ member, onClose, onSuccess }) => {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', role: 'member', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) setForm({ name: member.name, mobile: member.mobile, email: member.email || '', password: '', role: member.role, status: member.status });
  }, [member]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) { toast.error('Only administrators can manage members'); return; }
    if (!member && !form.password) { toast.error('Password is required'); return; }
    setLoading(true);
    try {
      const data = { ...form };
      if (member && !form.password) delete data.password;
      if (member) { await axios.put(`/api/members/${member.id}`, data); toast.success('Member updated'); }
      else        { await axios.post('/api/members', data); toast.success('Member created'); }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary-600 dark:bg-primary-700">
          <h2 className="text-base font-bold text-white">{member ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-primary-500 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Full Name *</Label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Enter full name" className={inp} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mobile *</Label>
              <input type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                placeholder="10-digit number" pattern="[0-9]{10}" className={inp} required />
            </div>
            <div>
              <Label>Email</Label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="optional" className={inp} />
            </div>
          </div>

          <div>
            <Label>Password {!member && '*'}</Label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder={member ? 'Leave blank to keep current' : 'Set a password'}
              className={inp} required={!member} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Role *</Label>
              <ToggleGroup options={['member', 'admin']} value={form.role} onChange={v => set('role', v)} />
            </div>
            <div>
              <Label>Status *</Label>
              <ToggleGroup options={['active', 'inactive']} value={form.status} onChange={v => set('status', v)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2
                         border-gray-200 dark:border-gray-700
                         text-gray-700 dark:text-gray-300
                         hover:border-gray-300 dark:hover:border-gray-600
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                         bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                         text-white shadow-sm hover:shadow-md
                         disabled:opacity-50 transition-all">
              {loading ? 'Saving…' : member ? 'Update' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default MemberModal;
