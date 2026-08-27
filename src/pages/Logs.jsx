import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ClipboardList, Plus, Pencil,
  Trash2, RefreshCw, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Filter, X, RotateCcw
} from 'lucide-react';

/* ── constants ──────────────────────────────────────────── */
const ACTIONS = {
  CREATE: {
    label: 'Created',
    icon: Plus,
    ring:  'ring-emerald-400 dark:ring-emerald-600',
    dot:   'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    iconBg:'bg-emerald-500',
  },
  UPDATE: {
    label: 'Updated',
    icon: Pencil,
    ring:  'ring-blue-400 dark:ring-blue-600',
    dot:   'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    iconBg:'bg-blue-500',
  },
  DELETE: {
    label: 'Deleted',
    icon: Trash2,
    ring:  'ring-rose-400 dark:ring-rose-600',
    dot:   'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
    iconBg:'bg-rose-500',
  },
  REVERT: {
    label: 'Reverted',
    icon: RotateCcw,
    ring:  'ring-amber-400 dark:ring-amber-600',
    dot:   'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    iconBg:'bg-amber-500',
  },
};

const ENTITY = {
  donation: { label: 'Donation', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
  expense:  { label: 'Expense',  badge: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' },
  member:   { label: 'Member',   badge: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' },
};

const SKIP = ['updated_at','created_at','password','receipt_image'];

/* ── diff view ──────────────────────────────────────────── */
const Diff = ({ oldData, newData }) => {
  if (!oldData && !newData) return null;
  const o = oldData ? JSON.parse(oldData) : {};
  const n = newData ? JSON.parse(newData) : {};
  const keys = [...new Set([...Object.keys(o), ...Object.keys(n)])].filter(k => !SKIP.includes(k));
  const changed = keys.filter(k => String(o[k]) !== String(n[k]));
  if (!changed.length) return <p className="text-xs text-gray-400 italic py-2">No field changes detected.</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 mt-3">
      <div className="grid grid-cols-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <span>Field</span>
        <span className="text-rose-500">Before</span>
        <span className="text-emerald-500">After</span>
      </div>
      {changed.map(k => (
        <div key={k} className="grid grid-cols-3 px-4 py-2.5 text-xs border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
          <span className="font-semibold text-gray-500 dark:text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
          <span className="text-rose-600 dark:text-rose-400 line-through truncate pr-2">{o[k] ?? '—'}</span>
          <span className="text-emerald-600 dark:text-emerald-400 truncate">{n[k] ?? '—'}</span>
        </div>
      ))}
    </div>
  );
};

/* ── log card ────────────────────────────────────────────── */
const LogCard = ({ log }) => {
  const [open, setOpen] = useState(false);
  const style   = ACTIONS[log.action] || ACTIONS.CREATE;
  const entity  = ENTITY[log.entity_type] || { label: log.entity_type, badge: 'bg-gray-100 text-gray-600' };
  const Icon    = style.icon;
  const hasDiff = !!(log.old_data || log.new_data);

  const timeStr = new Date(log.created_at).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div className="relative pl-10 sm:pl-12">
      {/* Timeline dot + icon */}
      <div className={`absolute left-0 top-3 w-8 h-8 rounded-full ${style.iconBg}
                       flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-950 z-10`}>
        <Icon size={14} className="text-white" />
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card hover:shadow-card-hover transition-all duration-200">

        {/* Top bar — always visible */}
        <div
          className={`flex items-start gap-3 px-4 py-4 ${hasDiff ? 'cursor-pointer' : ''}`}
          onClick={() => hasDiff && setOpen(o => !o)}
        >
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
                {style.label}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${entity.badge}`}>
                {entity.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
              {log.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                  {log.user_name?.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-gray-600 dark:text-gray-300">{log.user_name}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs text-gray-400">{timeStr}</span>
              {hasDiff && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-primary-500 dark:text-primary-400 font-medium flex items-center gap-1">
                    {open ? <><ChevronUp size={12} /> Hide diff</> : <><ChevronDown size={12} /> Show diff</>}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Revert button — removed */}
        </div>

        {/* Diff panel */}
        {open && hasDiff && (
          <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3">
            <Diff oldData={log.old_data} newData={log.new_data} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ── group logs by date ──────────────────────────────────── */
const groupByDate = (logs) => {
  const groups = {};
  logs.forEach(log => {
    const d = new Date(log.created_at);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString())     label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  });
  return groups;
};

/* ── main page ───────────────────────────────────────────── */
const Logs = () => {
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters]     = useState({ entity_type: '', action: '' });
  const LIMIT = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/logs', { params: { page, limit: LIMIT, ...filters } });
      setLogs(data.logs);
      setTotal(data.total);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const grouped    = groupByDate(logs);
  const totalPages = Math.ceil(total / LIMIT);
  const hasFilter  = !!(filters.entity_type || filters.action);

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total} total action{total !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPage(1); fetchLogs(); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                       border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                       text-gray-700 dark:text-gray-300 rounded-xl
                       hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400
                       transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => setShowFilter(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all
              ${(showFilter || hasFilter)
                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600'
              }`}
          >
            <Filter size={15} />
            Filter
            {hasFilter && <span className="w-2 h-2 rounded-full bg-white ml-0.5" />}
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilter && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter logs</p>
            {hasFilter && (
              <button
                onClick={() => { setFilters({ entity_type: '', action: '' }); setPage(1); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Entity Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[{ v: '', l: 'All' }, { v: 'donation', l: 'Donation' }, { v: 'expense', l: 'Expense' }, { v: 'member', l: 'Member' }].map(o => (
                  <button
                    key={o.v}
                    onClick={() => { setFilters(f => ({ ...f, entity_type: o.v })); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-2 transition-all
                      ${filters.entity_type === o.v
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                      }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Action
              </label>
              <div className="flex flex-wrap gap-2">
                {[{ v: '', l: 'All' }, { v: 'CREATE', l: 'Created' }, { v: 'UPDATE', l: 'Updated' }, { v: 'DELETE', l: 'Deleted' }, { v: 'REVERT', l: 'Reverted' }].map(o => (
                  <button
                    key={o.v}
                    onClick={() => { setFilters(f => ({ ...f, action: o.v })); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-2 transition-all
                      ${filters.action === o.v
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                      }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend strip ── */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        {Object.entries(ACTIONS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
            {v.label}
          </div>
        ))}
      </div>

      {/* ── Log timeline ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm animate-pulse">
          <RefreshCw size={20} className="animate-spin mr-2" /> Loading activity…
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <ClipboardList size={48} className="opacity-20 mb-4" />
          <p className="text-base font-semibold">No activity yet</p>
          <p className="text-sm mt-1">Actions on donations, expenses and members will appear here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, group]) => (
            <div key={dateLabel}>
              {/* Date heading */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {dateLabel}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Timeline entries */}
              <div className="relative space-y-4">
                {/* Vertical line */}
                <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-px bg-gray-100 dark:bg-gray-800 z-0" />

                {group.map(log => (
                  <LogCard key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of <span className="font-semibold">{total}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                         text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.min(Math.max(page - 2 + i, 1), totalPages - 4 + i);
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-sm font-semibold rounded-xl border-2 transition-all
                    ${p === page
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                    }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                         text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
