import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rentalService } from '../../services/rentalService';
import { formatDate, getTodayString } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function RentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutDate, setCheckoutDate] = useState(getTodayString());
  const [checkingOut, setCheckingOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRental = async () => {
    try {
      const res = await rentalService.getRental(id);
      setRental(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
      navigate('/rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRental(); }, [id]); // eslint-disable-line

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await rentalService.checkoutRental(id, { tanggal_keluar: checkoutDate });
      addToast('Checkout berhasil.', 'success');
      setShowCheckout(false);
      fetchRental();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal checkout.', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await rentalService.deleteRental(id);
      addToast('Data hunian berhasil dihapus.', 'success');
      navigate('/rentals');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Detail Hunian"
        subtitle={`${rental.tenant?.name} — Kamar ${rental.room?.nomor_kamar}`}
        action={<Link to="/rentals" className="btn btn-secondary">Kembali</Link>}
      />

      <div className="card divide-y divide-slate-100">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Info Hunian</h2>
            <Badge status={rental.status} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Penghuni</p>
              <Link to={`/tenants/${rental.tenant_id}`} className="font-semibold text-navy-800 hover:underline">
                {rental.tenant?.name}
              </Link>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
              <Link to="/rooms" className="font-semibold text-navy-800 hover:underline">
                Kamar {rental.room?.nomor_kamar}
              </Link>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Harga Bulanan</p>
              <p className="font-semibold text-slate-700">{formatCurrency(rental.room?.harga_bulanan)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Lantai</p>
              <p className="font-semibold text-slate-700">Lantai {rental.room?.lantai}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tanggal Masuk</p>
              <p className="font-semibold text-slate-700">{formatDate(rental.tanggal_masuk)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tanggal Keluar</p>
              <p className="font-semibold text-slate-700">{rental.tanggal_keluar ? formatDate(rental.tanggal_keluar) : '—'}</p>
            </div>
          </div>
        </div>
        <div className="p-5 flex justify-end gap-2">
          {rental.status === 'aktif' && (
            <button onClick={() => setShowCheckout(true)} className="btn btn-success btn-sm" id={`btn-checkout-${id}`}>
              Checkout
            </button>
          )}
          <button onClick={() => setShowDelete(true)} className="btn btn-danger btn-sm" id={`btn-delete-rental-${id}`}>
            Hapus
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Proses Checkout" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="checkout-detail-date">Tanggal Keluar</label>
            <input id="checkout-detail-date" type="date" value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)} className="input" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCheckout(false)} className="btn btn-secondary" disabled={checkingOut}>Batal</button>
            <button onClick={handleCheckout} className="btn btn-success" disabled={checkingOut} id="btn-confirm-checkout-detail">
              {checkingOut ? 'Memproses...' : 'Konfirmasi Checkout'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Hunian"
        message="Apakah Anda yakin ingin menghapus data hunian ini?"
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  );
}
