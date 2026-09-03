import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { billService } from '../../services/billService';
import { tenantService } from '../../services/tenantService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode, getTodayString } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';

export default function PaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const initialBillId = searchParams.get('bill_id') || '';

  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    room_bill_id: initialBillId,
    payer_tenant_id: '',
    jumlah_bayar: 0,
    tanggal_bayar: getTodayString(),
    keterangan: '',
  });

  const [selectedBill, setSelectedBill] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billRes, tenantRes] = await Promise.all([
          billService.getBills({ status: 'belum_bayar', per_page: 100 }),
          tenantService.getTenants({ status: 'aktif', per_page: 100 }),
        ]);
        setBills(billRes.data.data || []);
        setTenants(tenantRes.data.data || []);

        if (initialBillId) {
          const found = (billRes.data.data || []).find(b => String(b.id) === String(initialBillId));
          if (found) {
            setSelectedBill(found);
            setForm(prev => ({
              ...prev,
              room_bill_id: found.id,
              jumlah_bayar: found.jumlah_tagihan,
              keterangan: `Pembayaran kos ${formatPeriode(found.periode)}`,
            }));
          }
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Gagal memuat data pilihan.', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [initialBillId, addToast]);

  const handleBillChange = (e) => {
    const billId = e.target.value;
    const found = bills.find(b => String(b.id) === String(billId));
    setSelectedBill(found || null);
    setForm(prev => ({
      ...prev,
      room_bill_id: billId,
      jumlah_bayar: found ? found.jumlah_tagihan : 0,
      keterangan: found ? `Pembayaran kos ${formatPeriode(found.periode)}` : '',
    }));
    if (errors.room_bill_id) setErrors(prev => ({ ...prev, room_bill_id: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.room_bill_id) errs.room_bill_id = ['Tagihan wajib dipilih.'];
    if (!form.payer_tenant_id) errs.payer_tenant_id = ['Tenant pembayar wajib dipilih.'];
    if (!form.tanggal_bayar) errs.tanggal_bayar = ['Tanggal bayar wajib diisi.'];
    if (!form.jumlah_bayar || form.jumlah_bayar <= 0) errs.jumlah_bayar = ['Jumlah bayar tidak valid.'];

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setErrors({});
    try {
      await paymentService.createPayment({
        room_bill_id: parseInt(form.room_bill_id),
        payer_tenant_id: parseInt(form.payer_tenant_id),
        jumlah_bayar: parseInt(form.jumlah_bayar),
        tanggal_bayar: form.tanggal_bayar,
        keterangan: form.keterangan,
      });
      addToast('Pembayaran berhasil dicatat.', 'success');
      setShowConfirmModal(false);
      navigate('/payments');
    } catch (err) {
      setShowConfirmModal(false);
      if (err.response?.status === 422) {
        const errData = err.response.data;
        if (errData.errors) setErrors(errData.errors);
        else setErrors({ general: errData.message });
      } else {
        setErrors({ general: err.response?.data?.message || 'Gagal mencatat pembayaran.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <PageLoader />;

  const selectedTenant = tenants.find(t => String(t.id) === String(form.payer_tenant_id));

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Catat Pembayaran"
        subtitle="Mencatat pembayaran tagihan kamar kos"
        action={<Link to="/payments" className="btn btn-secondary">Kembali</Link>}
      />

      <div className="card p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="room_bill_id">Pilih Tagihan Belum Lunas *</label>
            <select
              id="room_bill_id"
              name="room_bill_id"
              value={form.room_bill_id}
              onChange={handleBillChange}
              className={`input ${errors.room_bill_id ? 'input-error' : ''}`}
            >
              <option value="">Pilih Tagihan...</option>
              {bills.map(b => (
                <option key={b.id} value={b.id}>
                  Kamar {b.room?.nomor_kamar || b.room_id} - Periode {formatPeriode(b.periode)} ({formatCurrency(b.jumlah_tagihan)})
                </option>
              ))}
            </select>
            <FieldError error={errors.room_bill_id?.[0]} />
          </div>

          <div>
            <label className="label" htmlFor="payer_tenant_id">Tenant Pembayar *</label>
            <select
              id="payer_tenant_id"
              name="payer_tenant_id"
              value={form.payer_tenant_id}
              onChange={handleChange}
              className={`input ${errors.payer_tenant_id ? 'input-error' : ''}`}
            >
              <option value="">Pilih Tenant...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.no_hp})
                </option>
              ))}
            </select>
            <FieldError error={errors.payer_tenant_id?.[0]} />
          </div>

          <div>
            <label className="label" htmlFor="jumlah_bayar">Jumlah Bayar (Rp) *</label>
            <input
              id="jumlah_bayar"
              name="jumlah_bayar"
              type="text"
              readOnly
              value={selectedBill ? formatCurrency(selectedBill.jumlah_tagihan) : 'Rp 0'}
              className="input bg-slate-100 font-bold text-slate-800 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Nominal pembayaran terkunci otomatis sesuai tagihan.</p>
            <FieldError error={errors.jumlah_bayar?.[0]} />
          </div>

          <div>
            <label className="label" htmlFor="tanggal_bayar">Tanggal Bayar *</label>
            <input
              id="tanggal_bayar"
              name="tanggal_bayar"
              type="date"
              value={form.tanggal_bayar}
              onChange={handleChange}
              className={`input ${errors.tanggal_bayar ? 'input-error' : ''}`}
            />
            <FieldError error={errors.tanggal_bayar?.[0]} />
          </div>

          <div>
            <label className="label" htmlFor="keterangan">Keterangan</label>
            <textarea
              id="keterangan"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows={2}
              className="input resize-none"
              placeholder="Catatan tambahan (opsional)..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/payments" className="btn btn-secondary">Batal</Link>
            <button type="submit" disabled={loading} className="btn-primary" id="btn-submit-payment">
              Lanjutkan Pembayaran
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Pembayaran Tunai"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <p className="text-sm font-semibold text-emerald-800">
              Apakah Anda yakin mencatat pembayaran ini?
            </p>
            <div className="text-xs text-emerald-700 space-y-1">
              <p>• <strong>Kamar:</strong> Kamar {selectedBill?.room?.nomor_kamar}</p>
              <p>• <strong>Penghuni:</strong> {selectedTenant?.name}</p>
              <p>• <strong>Periode:</strong> {selectedBill && formatPeriode(selectedBill.periode)}</p>
              <p>• <strong>Nominal:</strong> {formatCurrency(form.jumlah_bayar)}</p>
              <p>• <strong>Tanggal:</strong> {formatDate(form.tanggal_bayar)}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Pembayaran dilakukan secara tunai sebesar <strong>{formatCurrency(form.jumlah_bayar)}</strong>?
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleConfirmPayment}
              className="btn btn-success"
              disabled={loading}
              id="btn-confirm-payment"
            >
              {loading ? 'Memproses...' : 'Ya, Bayar Tunai'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
