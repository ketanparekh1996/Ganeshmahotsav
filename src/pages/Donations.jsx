import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import DonationModal from '../components/DonationModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const PAYMENT_COLORS = {
  Cash: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPI:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Bank Transfer': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const Donations = () => {
  const [donations, setDonations]         = useState([]);
  const [total, setTotal]                 = useState(0);
  const [showModal, setShowModal]         = useState(false);
  const [selected, setSelected]           = useState(null);
  const [search, setSearch]               = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [filters, setFilters] = useState({ payment_method: '', start_date: '', end_date: '' });

  useEffect(() => { fetch(); }, [search, filters]);

  const fetch = async () => {
    try {
      const res = await axios.get('/api/donations', { params: { search, ...filters } });
      setDonations(res.data);
      setTotal(res.data.reduce((s, d) => s + parseFloat(d.amount), 0));
    } catch { toast.error('Failed to load donations'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
    try { await axios.delete(`/api/donations/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (d) => { setSelected(d); setShowModal(true); };
  const openAdd  = () => { setSelected(null); setShowModal(true); };

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Total collected: <span className="text-emerald-600 dark:text-emerald-400 font-bold currency">{fmt(total)}</span>
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold
                     bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white
                     rounded-xl shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
          <Plus size={18} /> Add Donation
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search donor name…"
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
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
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
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              {['Donor Name','Amount','Payment','Date','Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${h === 'Amount' || h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {donations.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No donations found</td></tr>
            )}
            {donations.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">{d.donor_name}</td>
                <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 currency">
                  {fmt(d.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PAYMENT_COLORS[d.payment_method] || PAYMENT_COLORS.Other}`}>
                    {d.payment_method}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                  {new Date(d.donation_date).toLocaleDateString('en-IN')}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(d)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(d.id)}
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
      <div className="md:hidden space-y-3">
        {donations.length === 0 && (
          <p className="text-center py-10 text-sm text-gray-400">No donations found</p>
        )}
        {donations.map(d => (
          <div key={d.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base flex-shrink-0">
                    {d.donor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{d.donor_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(d.donation_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${PAYMENT_COLORS[d.payment_method] || PAYMENT_COLORS.Other}`}>
                  {d.payment_method}
                </span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 currency">+{fmt(d.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <DonationModal donation={selected}
          onClose={() => { setShowModal(false); setSelected(null); }}
          onSuccess={() => { fetch(); setShowModal(false); setSelected(null); }} />
      )}
    </div>
  );
};

export default Donations;
