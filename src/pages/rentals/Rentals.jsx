import { useState, useEffect, useCallback } from 'react';
import { rentalService } from '../../services/rentalService';
import { tenantService } from '../../services/tenantService';
import { roomService } from '../../services/roomService';
import { formatDate, getTodayString } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Modal from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { FieldError } from '../../components/ui/ErrorAlert';
import { PageLoader } from '../../components/ui/Spinner';

export default function Rentals() {
  const { addToast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(getTodayString());
  const [checkingOut, setCheckingOut] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [form, setForm] = useState({ tenant_id: '', room_id: '', tanggal_masuk: getTodayString() });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Detail modal
  const [detailId, setDetailId] = useState(null);
  const [detailRental, setDetailRental] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRentals = useCallback(async (s = statusFilter, p = page) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (s) params.status = s;
      const res = await rentalService.getRentals(params);
      setRentals(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal memuat data hunian.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, addToast]);

  useEffect(() => { fetchRentals(); }, [fetchRentals]);

  const openCreate = async () => {
    setForm({ tenant_id: '', room_id: '', tanggal_masuk: getTodayString() });
    setErrors({});
    setShowCreate(true);
    setLoadingOptions(true);
    try {
      const [tRes, rRes] = await Promise.all([
        tenantService.getTenants({ status: 'aktif', per_page: 100 }),
        roomService.getRooms(),
      ]);
      setTenants(tRes.data.data);
      setRooms(rRes.data.data.filter((r) => r.status_kamar !== 'penuh'));
    } catch {
      addToast('Gagal memuat data. Coba lagi.', 'error');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await rentalService.createRental({
        ...form,
        tenant_id: parseInt(form.tenant_id),
        room_id: parseInt(form.room_id),
      });
      addToast('Data hunian berhasil ditambahkan.', 'success');
      setShowCreate(false);
      fetchRentals();
    } catch (err) {
      if (err.response?.status === 422) {
        const errData = err.response.data;
        if (errData.errors) setErrors(errData.errors);
        else setErrors({ general: errData.message });
      } else {
        setErrors({ general: err.response?.data?.message || 'Gagal menyimpan data hunian.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await rentalService.getRental(id);
      setDetailRental(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setDetailId(null); setDetailRental(null); };

  const handleCheckout = async () => {
    if (!checkoutTarget) return;
    setCheckingOut(true);
    try {
      await rentalService.checkoutRental(checkoutTarget.id, { tanggal_keluar: checkoutDate });
      addToast(`Checkout berhasil untuk ${checkoutTarget.tenant?.name}.`, 'success');
      const wasDetail = detailId === checkoutTarget.id;
      setCheckoutTarget(null);
      if (wasDetail) openDetail(checkoutTarget.id);
      fetchRentals();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal checkout.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rentalService.deleteRental(deleteTarget.id);
      addToast('Data hunian berhasil dihapus.', 'success');
      const wasDetail = detailId === deleteTarget.id;
      setDeleteTarget(null);
      if (wasDetail) closeDetail();
      fetchRentals();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const selectedRoom = rooms.find((r) => String(r.id) === String(form.room_id));

  return (
    <div>
      <PageHeader
        title="Hunian"
        subtitle="Kelola data hunian kamar"
        action={
          <button onClick={openCreate} className="btn-primary" id="btn-create-rental">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Hunian
          </button>
        }
      />

      <div className="flex gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchRentals(e.target.value, 1); }}
          className="input w-auto"
          id="filter-rental-status"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      <div className="table-wrapper bg-white">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : rentals.length === 0 ? (
          <EmptyState title="Belum ada data hunian" description="Tambahkan hunian baru untuk mendaftarkan penghuni ke kamar." />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Penghuni</th>
                  <th>Kamar</th>
                  <th>Masuk</th>
                  <th>Keluar</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental, idx) => (
                  <tr key={rental.id}>
                    <td className="text-slate-400 text-xs">{((meta?.current_page - 1) * meta?.per_page) + idx + 1}</td>
                    <td>
                      <p className="font-medium text-slate-800">{rental.tenant?.name || '-'}</p>
                      <p className="text-xs text-slate-400">{rental.tenant?.no_hp}</p>
                    </td>
                    <td>
                      <span className="font-medium text-slate-700">Kamar {rental.room?.nomor_kamar || '-'}</span>
                      <p className="text-xs text-slate-400">Lantai {rental.room?.lantai}</p>
                    </td>
                    <td className="text-sm">{formatDate(rental.tanggal_masuk)}</td>
                    <td className="text-sm">{rental.tanggal_keluar ? formatDate(rental.tanggal_keluar) : <span className="text-slate-400">—</span>}</td>
                    <td><Badge status={rental.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(rental.id)} className="btn btn-ghost btn-sm text-blue-600" id={`btn-detail-rental-${rental.id}`}>Detail</button>
                        {rental.status === 'aktif' && (
                          <button
                            onClick={() => { setCheckoutTarget(rental); setCheckoutDate(getTodayString()); }}
                            className="btn btn-ghost btn-sm text-amber-600"
                            id={`btn-checkout-rental-${rental.id}`}
                          >
                            Checkout
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(rental)} className="btn btn-ghost btn-sm text-red-500" id={`btn-delete-rental-${rental.id}`}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={(p) => { setPage(p); fetchRentals(statusFilter, p); }} />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tambah Hunian" size="lg">
        {loadingOptions ? (
          <PageLoader />
        ) : (
          <>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{errors.general}</div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="tenant_id">Penghuni *</label>
                <select id="tenant_id" name="tenant_id" value={form.tenant_id} onChange={handleFormChange}
                  className={`input ${errors.tenant_id ? 'input-error' : ''}`}>
                  <option value="">Pilih penghuni...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.no_hp}</option>
                  ))}
                </select>
                <FieldError error={errors.tenant_id?.[0]} />
              </div>

              <div>
                <label className="label" htmlFor="room_id">Kamar *</label>
                <select id="room_id" name="room_id" value={form.room_id} onChange={handleFormChange}
                  className={`input ${errors.room_id ? 'input-error' : ''}`}>
                  <option value="">Pilih kamar...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.nomor_kamar} (Lantai {r.lantai}) — {r.status_kamar} — {r.jumlah_penghuni_aktif}/{r.kapasitas} orang
                    </option>
                  ))}
                </select>
                <FieldError error={errors.room_id?.[0]} />
              </div>

              {selectedRoom && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                  <p className="font-medium text-blue-800">Info Kamar {selectedRoom.nomor_kamar}</p>
                  <p className="text-blue-600">Harga: {formatCurrency(selectedRoom.harga_bulanan)}/bulan · Lantai {selectedRoom.lantai}</p>
                </div>
              )}

              <div>
                <label className="label" htmlFor="tanggal_masuk">Tanggal Masuk *</label>
                <input id="tanggal_masuk" name="tanggal_masuk" type="date" value={form.tanggal_masuk}
                  onChange={handleFormChange} className={`input ${errors.tanggal_masuk ? 'input-error' : ''}`} />
                <FieldError error={errors.tanggal_masuk?.[0]} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" id="btn-save-rental">
                  {saving ? 'Menyimpan...' : 'Simpan Hunian'}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailId} onClose={closeDetail} title="Detail Hunian" size="lg">
        {detailLoading || !detailRental ? (
          <PageLoader />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">{detailRental.tenant?.name} — Kamar {detailRental.room?.nomor_kamar}</h2>
              <Badge status={detailRental.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Penghuni</p>
                <p className="font-semibold text-slate-700">{detailRental.tenant?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
                <p className="font-semibold text-slate-700">Kamar {detailRental.room?.nomor_kamar}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Harga Bulanan</p>
                <p className="font-semibold text-slate-700">{formatCurrency(detailRental.room?.harga_bulanan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Lantai</p>
                <p className="font-semibold text-slate-700">Lantai {detailRental.room?.lantai}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tanggal Masuk</p>
                <p className="font-semibold text-slate-700">{formatDate(detailRental.tanggal_masuk)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tanggal Keluar</p>
                <p className="font-semibold text-slate-700">{detailRental.tanggal_keluar ? formatDate(detailRental.tanggal_keluar) : '—'}</p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-2">
              {detailRental.status === 'aktif' && (
                <button onClick={() => { setCheckoutTarget(detailRental); setCheckoutDate(getTodayString()); }} className="btn btn-success btn-sm" id={`btn-checkout-detail-${detailRental.id}`}>
                  Checkout
                </button>
              )}
              <button onClick={() => setDeleteTarget(detailRental)} className="btn btn-danger btn-sm" id={`btn-delete-rental-detail-${detailRental.id}`}>
                Hapus
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Checkout Modal */}
      <Modal isOpen={!!checkoutTarget} onClose={() => setCheckoutTarget(null)} title="Proses Checkout" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              Checkout <strong>{checkoutTarget?.tenant?.name}</strong> dari Kamar <strong>{checkoutTarget?.room?.nomor_kamar}</strong>
            </p>
          </div>
          <div>
            <label className="label" htmlFor="checkout-date">Tanggal Keluar</label>
            <input id="checkout-date" type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} className="input" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setCheckoutTarget(null)} className="btn btn-secondary" disabled={checkingOut}>Batal</button>
            <button onClick={handleCheckout} className="btn btn-success" disabled={checkingOut} id="btn-confirm-checkout">
              {checkingOut ? 'Memproses...' : 'Konfirmasi Checkout'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Hunian"
        message="Apakah Anda yakin ingin menghapus data hunian ini?"
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  );
}