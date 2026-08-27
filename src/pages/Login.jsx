import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Phone, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(mobile, password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-950">

      {/* Left decorative panel – hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden
                      bg-gradient-to-br from-primary-500 via-primary-700 to-primary-900 p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[500px] h-[500px] rounded-full bg-white/5" />

        <div className="relative z-10">
            <img src="/logo.png" alt="logo"
              className="w-16 h-16 object-contain shadow-xl mb-8 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Ganesh Mahotsav<br />Hisab
          </h1>
          <p className="text-purple-200 text-lg leading-relaxed max-w-sm">
            Complete financial management for your Ganesh Mahotsav — donations, expenses, and members in one place.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Track Donations', emoji: '💰' },
            { label: 'Manage Expenses', emoji: '📋' },
            { label: 'Member Records', emoji: '👥' },
          ].map(item => (
            <div key={item.label}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <p className="text-xs text-purple-100 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="logo"
              className="w-20 h-20 object-contain drop-shadow-lg" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back 🙏</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to manage your Mahotsav records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter your mobile"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6
                         bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                         text-white font-semibold text-sm rounded-xl
                         shadow-md hover:shadow-lg
                         disabled:opacity-50 transition-all duration-150"
            >
              {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
