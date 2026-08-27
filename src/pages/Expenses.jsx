import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ExpenseModal from '../components/ExpenseModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const PAYMENT_COLORS = {
  Cash: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPI:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Bank Transfer': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const Expenses = () => {
  const [expenses, setExpenses]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [showModal, setShowModal]         = useState(false);
  const [selected, setSelected]           = useState(null);
  const [search, setSearch]               = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [members, setMembers]             = useState([]);
  const [filters, setFilters] = useState({ member_id: '', payment_method: '', start_date: '', end_date: '' });

  useEffect(() => { fetchMembers(); }, []);
  useEffect(() => { fetchExpenses(); }, [search, filters]);

  const fetchMembers = async () => {
    try { const r = await axios.get('/api/members', { params: { status: 'active' } }); setMembers(r.data); }
    catch { /* silent */ }
  };

  const fetchExpenses = async () => {
    try {
      const r = await axios.get('/api/expenses', { params: { search, ...filters } });
      setExpenses(r.data);
      setTotal(r.data.reduce((s, e) => s + parseFloat(e.amount), 0));
    } catch { toast.error('Failed to load expenses'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await axios.delete(`/api/expenses/${id}`); toast.success('Deleted'); fetchExpenses(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Total spent: <span className="text-rose-600 dark:text-rose-400 font-bold currency">{fmt(total)}</span>
          </p>
        </div>
        <button onClick={() => { setSelected(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold
                     bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white
                     rounded-xl shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search title or member…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all
              ${showFilters
                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <select value={filters.member_id} onChange={e => setFilters({ ...filters, member_id: e.target.value })}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Members</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={filters.payment_method} onChange={e => setFilters({ ...filters, payment_method: e.target.value })}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Payments</option>
              {['Cash','UPI','Bank Transfer','Other'].map(p => <option key={p}>{p}</option>)}
            </select>
            <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })}
              className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              {['Title / Member','Category','Amount','Date','Payment','Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${h === 'Amount' || h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No expenses found</td></tr>
            )}
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.member_name}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {e.category}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400 currency">{fmt(e.amount)}</td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{new Date(e.expense_date).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PAYMENT_COLORS[e.payment_method] || PAYMENT_COLORS.Other}`}>{e.payment_method}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {e.receipt_image && (
                      <a href={`/uploads/${e.receipt_image}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <ImageIcon size={15} />
                      </a>
                    )}
                    <button onClick={() => { setSelected(e); setShowModal(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {expenses.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No expenses found</p>}
        {expenses.map(e => (
          <div key={e.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-rose-400 to-pink-500" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold text-base flex-shrink-0">
                    {e.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.member_name}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  {e.receipt_image && (
                    <a href={`/uploads/${e.receipt_image}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                      <ImageIcon size={14} />
                    </a>
                  )}
                  <button onClick={() => { setSelected(e); setShowModal(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(e.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  {e.category}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${PAYMENT_COLORS[e.payment_method] || PAYMENT_COLORS.Other}`}>
                  {e.payment_method}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(e.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Amount */}
              <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex justify-end">
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 currency">-{fmt(e.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ExpenseModal expense={selected} members={members}
          onClose={() => { setShowModal(false); setSelected(null); }}
          onSuccess={() => { fetchExpenses(); setShowModal(false); setSelected(null); }} />
      )}
    </div>
  );
};

export default Expenses;
