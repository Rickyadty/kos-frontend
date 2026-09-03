import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { billService } from '../../services/billService';
import { tenantService } from '../../services/tenantService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode, getTodayString } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';

const emptyForm = {
  room_bill_id: '',
  payer_tenant_id: '',
  jumlah_bayar: 0,
  tanggal_bayar: getTodayString(),
  keterangan: '',
};

export default function Payments() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulanFilter, setBulanFilter] = useState('');
  const [page, setPage] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [billsOptions, setBillsOptions] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedBill, setSelectedBill] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Detail modal
  const [detailId, setDetailId] = useState(null);
  const [detailPayment, setDetailPayment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPayments = useCallback(async (b = bulanFilter, p = page) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (b) params.bulan = b;
      const res = await paymentService.getPayments(params);
      setPayments(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal memuat data pembayaran.', 'error');
    } finally {
      setLoading(false);
    }
  }, [bulanFilter, page, addToast]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const openCreate = useCallback(async (prefillBillId = '') => {
    setForm({ ...emptyForm, room_bill_id: prefillBillId });
    setSelectedBill(null);
    setErrors({});
    setShowCreate(true);
    setLoadingOptions(true);
    try {
      const [billRes, tenantRes] = await Promise.all([
        billService.getBills({ status: 'belum_bayar', per_page: 100 }),
        tenantService.getTenants({ status: 'aktif', per_page: 100 }),
      ]);
      const billList = billRes.data.data || [];
      setBillsOptions(billList);
      setTenants(tenantRes.data.data || []);

      if (prefillBillId) {
        const found = billList.find((b) => String(b.id) === String(prefillBillId));
        if (found) {
          setSelectedBill(found);
          setForm((prev) => ({
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
      setLoadingOptions(false);
    }
  }, [addToast]);

  const closeCreate = () => {
    setShowCreate(false);
    setShowConfirmModal(false);
    setForm(emptyForm);
    setSelectedBill(null);
    setErrors({});
  };

  const openDetail = useCallback(async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await paymentService.getPayment(id);
      setDetailPayment(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Data pembayaran tidak ditemukan.', 'error');
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  }, [addToast]);

  const closeDetail = () => { setDetailId(null); setDetailPayment(null); };

  // Handle deep-links from other modules: ?view=<id> or ?create=1&bill_id=<id>
  useEffect(() => {
    const viewId = searchParams.get('view');
    const createFlag = searchParams.get('create');
    const billId = searchParams.get('bill_id');

    if (viewId) {
      openDetail(viewId);
    } else if (createFlag) {
      openCreate(billId || '');
    }

    if (viewId || createFlag || billId) {
      searchParams.delete('view');
      searchParams.delete('create');
      searchParams.delete('bill_id');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBillChange = (e) => {
    const billId = e.target.value;
    const found = billsOptions.find((b) => String(b.id) === String(billId));
    setSelectedBill(found || null);
    setForm((prev) => ({
      ...prev,
      room_bill_id: billId,
      jumlah_bayar: found ? found.jumlah_tagihan : 0,
      keterangan: found ? `Pembayaran kos ${formatPeriode(found.periode)}` : '',
    }));
    if (errors.room_bill_id) setErrors((prev) => ({ ...prev, room_bill_id: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
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
    setSaving(true);
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
      closeCreate();
      fetchPayments();
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
      setSaving(false);
    }
  };

  const selectedTenant = tenants.find((t) => String(t.id) === String(form.payer_tenant_id));

  return (
    <div>
      <PageHeader
        title="Pembayaran"
        subtitle="Riwayat pembayaran tagihan kamar"
        action={
          <button onClick={() => openCreate('')} className="btn-primary" id="btn-create-payment">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Catat Pembayaran
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="month"
          value={bulanFilter}
          onChange={(e) => { setBulanFilter(e.target.value); setPage(1); fetchPayments(e.target.value, 1); }}
          className="input w-auto"
          id="filter-payment-bulan"
        />
        {bulanFilter && (
          <button onClick={() => { setBulanFilter(''); setPage(1); fetchPayments('', 1); }} className="btn btn-ghost btn-sm">
            Reset
          </button>
        )}
      </div>

      <div className="table-wrapper bg-white">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : payments.length === 0 ? (
          <EmptyState title="Belum ada pembayaran" description="Belum ada riwayat pembayaran tagihan." />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kamar</th>
                  <th>Penghuni</th>
                  <th>Periode</th>
                  <th>Jumlah Bayar</th>
                  <th>Tanggal Bayar</th>
                  <th>Diterima Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => (
                  <tr key={payment.id}>
                    <td className="text-slate-400 text-xs">{((meta?.current_page - 1) * meta?.per_page) + idx + 1}</td>
                    <td className="font-medium">Kamar {payment.room_bill?.room?.nomor_kamar || '-'}</td>
                    <td>{payment.payer?.name || '-'}</td>
                    <td>{formatPeriode(payment.room_bill?.periode)}</td>
                    <td className="font-semibold text-emerald-700">{formatCurrency(payment.jumlah_bayar)}</td>
                    <td className="text-sm">{formatDate(payment.tanggal_bayar)}</td>
                    <td className="text-sm text-slate-500">{payment.receiver?.name || '-'}</td>
                    <td>
                      <button onClick={() => openDetail(payment.id)} className="btn btn-ghost btn-sm text-blue-600" id={`btn-detail-payment-${payment.id}`}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={(p) => { setPage(p); fetchPayments(bulanFilter, p); }} />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={closeCreate} title="Catat Pembayaran" size="lg">
        {loadingOptions ? (
          <PageLoader />
        ) : (
          <>
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
                  {billsOptions.map((b) => (
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
                  {tenants.map((t) => (
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
                <button type="button" onClick={closeCreate} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" id="btn-submit-payment">
                  Lanjutkan Pembayaran
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Confirmation Modal (stacked on top of Create) */}
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
            <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary" disabled={saving}>
              Batal
            </button>
            <button onClick={handleConfirmPayment} className="btn btn-success" disabled={saving} id="btn-confirm-payment">
              {saving ? 'Memproses...' : 'Ya, Bayar Tunai'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailId} onClose={closeDetail} title="Detail Pembayaran" size="lg">
        {detailLoading || !detailPayment ? (
          <PageLoader />
        ) : (
          <div className="-m-8 divide-y divide-slate-100">
            <div className="p-8 pb-6 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  PEMBAYARAN DITERIMA
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {formatCurrency(detailPayment.jumlah_bayar)}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tanggal: {formatDate(detailPayment.tanggal_bayar)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">ID Transaksi</p>
                <p className="font-mono text-sm font-semibold text-slate-700">#PAY-{detailPayment.id}</p>
              </div>
            </div>

            <div className="p-8 py-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
                <p className="font-semibold text-navy-800">Kamar {detailPayment.room_bill?.room?.nomor_kamar || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Periode Tagihan</p>
                <p className="font-semibold text-slate-700">{formatPeriode(detailPayment.room_bill?.periode)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Pembayar (Tenant)</p>
                <p className="font-semibold text-navy-800">{detailPayment.payer?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Diterima Oleh</p>
                <p className="font-semibold text-slate-700">{detailPayment.receiver?.name || '-'}</p>
              </div>
              {detailPayment.keterangan && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-0.5">Keterangan</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {detailPayment.keterangan}
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 pt-6 flex justify-between items-center">
              <button
                onClick={() => { closeDetail(); navigate(`/bills?view=${detailPayment.room_bill_id}`); }}
                className="btn btn-ghost btn-sm text-navy-800"
              >
                ← Lihat Tagihan Terkait
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Struk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}