import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, TrendingDown, Wallet, Users, Receipt, UserCheck, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const StatCard = ({ title, value, icon: Icon, gradient, textColor, isCount, link }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => link && navigate(link)}
      className={`relative overflow-hidden rounded-2xl p-5 ${link ? 'cursor-pointer' : ''}
                  bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                  shadow-card hover:shadow-card-hover transition-all duration-200 group`}
    >
      {/* Subtle background glow on hover */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <p className={`mt-2 text-2xl sm:text-3xl font-extrabold currency ${textColor} leading-tight`}>
            {isCount ? value : fmt(value)}
          </p>
          {link && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-primary-500 transition-colors">
              View all <ArrowUpRight size={12} />
            </p>
          )}
        </div>
        <div className={`${gradient} p-3 rounded-xl shadow-sm flex-shrink-0 ml-3`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [summary, setSummary]             = useState(null);
  const [recentDonations, setDonations]   = useState([]);
  const [recentExpenses, setExpenses]     = useState([]);
  const [memberExpenses, setMemberExp]    = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, d, e, m] = await Promise.all([
        axios.get('/api/dashboard/summary'),
        axios.get('/api/dashboard/recent-donations'),
        axios.get('/api/dashboard/recent-expenses'),
        axios.get('/api/dashboard/member-expenses'),
      ]);
      setSummary(s.data);
      setDonations(d.data);
      setExpenses(e.data);
      setMemberExp(m.data);
    } catch { /* silent */ }
  };

  if (!summary) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm animate-pulse">
      Loading dashboard…
    </div>
  );

  const cards = [
    { title: 'Total Donations',   value: summary.totalDonations,   icon: DollarSign,  gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',    textColor: 'text-emerald-600 dark:text-emerald-400', link: '/donations' },
    { title: 'Total Expenses',    value: summary.totalExpenses,    icon: TrendingDown, gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',       textColor: 'text-rose-600 dark:text-rose-400',       link: '/expenses' },
    { title: 'Remaining Balance', value: summary.remainingBalance, icon: Wallet,       gradient: 'bg-gradient-to-br from-primary-600 to-saffron-500', textColor: summary.remainingBalance >= 0 ? 'text-primary-700 dark:text-primary-400' : 'text-rose-600', link: null },
    { title: 'Total Donors',      value: summary.totalDonors,      icon: Users,        gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',   textColor: 'text-violet-600 dark:text-violet-400', isCount: true },
    { title: 'Expense Entries',   value: summary.totalExpenseEntries, icon: Receipt,   gradient: 'bg-gradient-to-br from-saffron-400 to-orange-500',  textColor: 'text-saffron-600 dark:text-saffron-400', isCount: true },
    { title: 'Active Members',    value: summary.totalMembers,     icon: UserCheck,    gradient: 'bg-gradient-to-br from-sky-500 to-blue-600',        textColor: 'text-sky-600 dark:text-sky-400', isCount: true, link: '/members' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Financial overview of your Ganesh Mahotsav</p>
      </div>

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8
                      bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5" />
        <p className="text-sm font-medium text-purple-200 uppercase tracking-wide">Remaining Balance</p>
        <p className="mt-1 text-4xl sm:text-5xl font-extrabold currency tracking-tight">
          {fmt(summary.remainingBalance)}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />
            Donations: {fmt(summary.totalDonations)}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-300 inline-block" />
            Expenses: {fmt(summary.totalExpenses)}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Donations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Donations</h3>
            <span className="text-xs px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
              Income
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/80">
            {recentDonations.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No donations yet</p>
            )}
            {recentDonations.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                  {d.donor_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{d.donor_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(d.donation_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 currency">+{fmt(d.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Expenses</h3>
            <span className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full font-medium">
              Expense
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/80">
            {recentExpenses.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No expenses yet</p>
            )}
            {recentExpenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold text-sm flex-shrink-0">
                  {e.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.member_name}
                    {e.category && <span className="ml-1.5 px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded text-[10px] font-medium">{e.category}</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 currency">-{fmt(e.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Member Expense Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Mobile</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Entries</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {memberExpenses.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No data</td></tr>
              )}
              {memberExpenses.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{m.mobile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-sm hidden sm:table-cell">{m.mobile}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-semibold">{m.expense_count}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-extrabold text-rose-600 dark:text-rose-400 currency text-sm">
                    {fmt(m.total_expenses)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
