import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid.';
    if (!form.password) errs.password = 'Password wajib diisi.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await login(form);
      addToast('Login berhasil! Selamat datang.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401) {
        setErrors({ general: msg || 'Email atau password salah.' });
      } else if (status === 422) {
        setErrors(err.response?.data?.errors || { general: msg });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Coba lagi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Masuk ke Sistem</h2>
        <p className="text-slate-500 text-sm mt-1">Masukkan kredensial akun Anda</p>
      </div>

      {errors.general && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.general}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@kos.test"
            className={`input ${errors.email ? 'input-error' : ''}`}
            autoComplete="email"
            autoFocus
          />
          <FieldError error={errors.email} />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <FieldError error={errors.password} />
        </div>

        <button
          id="btn-login"
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        Sistem Manajemen Kos &copy; 2026
      </p>
    </div>
  );
}
