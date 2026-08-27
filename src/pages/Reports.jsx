import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const RANGES = [
  { key: 'all',    label: 'All Time' },
  { key: 'today',  label: 'Today' },
  { key: 'week',   label: 'This Week' },
  { key: 'month',  label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

const Reports = () => {
  const [dateRange, setDateRange]   = useState('all');
  const [custom, setCustom]         = useState({ start_date: '', end_date: '' });
  const [summary, setSummary]       = useState(null);
  const [donByDate, setDonByDate]   = useState([]);
  const [expByDate, setExpByDate]   = useState([]);

  useEffect(() => { fetchAll(); }, [dateRange, custom]);

  const getParams = (range) => {
    const today = new Date();
    if (range === 'today') {
      const d = today.toISOString().split('T')[0];
      return { start_date: d, end_date: d };
    }
    if (range === 'week') {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      return { start_date: d.toISOString().split('T')[0] };
    }
    if (range === 'month') {
      const d = new Date(today); d.setMonth(d.getMonth() - 1);
      return { start_date: d.toISOString().split('T')[0] };
    }
    return {};
  };

  const fetchAll = async () => {
    try {
      const params = dateRange === 'custom' ? custom : getParams(dateRange);
      const [s, d, e] = await Promise.all([
        axios.get('/api/reports', { params }),
        axios.get('/api/reports/donations-by-date', { params }),
        axios.get('/api/reports/expenses-by-date', { params }),
      ]);
      setSummary(s.data);
      setDonByDate(d.data);
      setExpByDate(e.data);
    } catch { toast.error('Failed to load reports'); }
  };

  const spentPct = summary && summary.totalDonations > 0
    ? Math.min(100, (summary.totalExpenses / summary.totalDonations) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Financial overview and history</p>
        </div>
        <button onClick={() => toast.success('Export coming soon!')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold
                     border-2 border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800
                     text-gray-700 dark:text-gray-200 rounded-xl
                     hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400
                     shadow-card transition-all w-full sm:w-auto">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Date filter */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setDateRange(r.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border-2 transition-all
                ${dateRange === r.key
                  ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}>
              {r.label}
            </button>
          ))}
        </div>
        {dateRange === 'custom' && (
          <div className="mt-3 flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input type="date" value={custom.start_date} onChange={e => setCustom({ ...custom, start_date: e.target.value })}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="date" value={custom.end_date} onChange={e => setCustom({ ...custom, end_date: e.target.value })}
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Donations', val: fmt(summary.totalDonations),  sub: `${summary.donationCount} entries`,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Total Expenses',  val: fmt(summary.totalExpenses),   sub: `${summary.expenseCount} entries`,   color: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Remaining',       val: fmt(summary.remainingBalance), sub: summary.remainingBalance >= 0 ? 'Surplus' : 'Deficit', color: summary.remainingBalance >= 0 ? 'text-primary-700 dark:text-primary-400' : 'text-rose-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
              { label: 'Amount Spent',    val: `${spentPct}%`, sub: 'of total donations', color: 'text-saffron-600 dark:text-saffron-400', bg: 'bg-saffron-50 dark:bg-saffron-900/20' },
            ].map(c => (
              <div key={c.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{c.label}</p>
                <p className={`text-2xl font-extrabold mt-2 currency ${c.color}`}>{c.val}</p>
                <p className={`mt-2 text-xs font-medium px-2 py-1 rounded-md inline-block ${c.bg} ${c.color}`}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700 dark:text-gray-300">Budget Usage</span>
              <span className="text-gray-500">{spentPct}% spent</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-orange-500 transition-all duration-500"
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>₹0</span>
              <span>{fmt(summary.totalDonations)}</span>
            </div>
          </div>
        </>
      )}

      {/* Date-wise tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Date-wise Donations</h3>
            <span className="text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">Income</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Count</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {donByDate.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400 text-xs">No data</td></tr>}
              {donByDate.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{r.count}</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 currency">{fmt(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Date-wise Expenses</h3>
            <span className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full font-medium">Expense</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Count</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {expByDate.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400 text-xs">No data</td></tr>}
              {expByDate.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{r.count}</td>
                  <td className="px-5 py-3 text-right font-bold text-rose-600 dark:text-rose-400 currency">{fmt(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
