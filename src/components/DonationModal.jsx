import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Portal from './Portal';

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition`;

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
    {children}
  </label>
);

const DonationModal = ({ donation, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    donor_name: '', amount: '',
    payment_method: 'Cash',
    donation_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (donation) setForm({
      donor_name: donation.donor_name, amount: donation.amount,
      payment_method: donation.payment_method,
      donation_date: donation.donation_date.split('T')[0],
    });
  }, [donation]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.amount <= 0) { toast.error('Amount must be greater than zero'); return; }
    setLoading(true);
    try {
      if (donation) { await axios.put(`/api/donations/${donation.id}`, form); toast.success('Donation updated'); }
      else          { await axios.post('/api/donations', form); toast.success('Donation added'); }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const payments = ['Cash', 'UPI', 'Bank Transfer', 'Other'];

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary-600 dark:bg-primary-700">
          <h2 className="text-base font-bold text-white">{donation ? 'Edit Donation' : 'Add Donation'}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-primary-500 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>Donor Name *</Label>
            <input type="text" value={form.donor_name} onChange={e => set('donor_name', e.target.value)}
              placeholder="Full name" className={inp} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount (₹) *</Label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0" min="1" className={inp} required />
            </div>
            <div>
              <Label>Date *</Label>
              <input type="date" value={form.donation_date} onChange={e => set('donation_date', e.target.value)}
                className={inp} required />
            </div>
          </div>

          <div>
            <Label>Payment Method *</Label>
            <div className="grid grid-cols-4 gap-2">
              {payments.map(p => (
                <button key={p} type="button" onClick={() => set('payment_method', p)}
                  className={`py-2 text-xs font-semibold rounded-xl border-2 transition-all
                    ${form.payment_method === p
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}>
                  {p}
                </button>
              ))}
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
              {loading ? 'Saving…' : donation ? 'Update' : 'Add Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
};

export default DonationModal;
