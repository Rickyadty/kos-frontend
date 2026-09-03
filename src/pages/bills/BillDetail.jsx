import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { billService } from '../../services/billService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await billService.getBill(id);
        setBill(res.data.data);
      } catch (err) {
        addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
        navigate('/bills');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, addToast, navigate]);

  if (loading) return <PageLoader />;

  const isOverdue = new Date(bill.jatuh_tempo) < new Date() && bill.status === 'belum_bayar';

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Detail Tagihan"
        subtitle={`Kamar ${bill.room?.nomor_kamar} — ${formatPeriode(bill.periode)}`}
        action={<Link to="/bills" className="btn btn-secondary">Kembali</Link>}
      />

      <div className="card divide-y divide-slate-100">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Info Tagihan</h2>
            <Badge status={bill.status} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
              <Link to="/rooms" className="font-semibold text-navy-800 hover:underline">
                Kamar {bill.room?.nomor_kamar}
              </Link>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Periode</p>
              <p className="font-semibold text-slate-700">{formatPeriode(bill.periode)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Jumlah Tagihan</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(bill.jumlah_tagihan)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Jatuh Tempo</p>
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                {formatDate(bill.jatuh_tempo)}
                {isOverdue && <span className="ml-1 text-xs">(Terlambat)</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        {bill.payment ? (
          <div className="p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sudah Dibayar
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Dibayar Oleh</p>
                <p className="font-medium text-slate-700">{bill.payment.payer?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Jumlah Bayar</p>
                <p className="font-semibold text-emerald-700">{formatCurrency(bill.payment.jumlah_bayar)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tanggal Bayar</p>
                <p className="font-medium text-slate-700">{formatDate(bill.payment.tanggal_bayar)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Diterima Oleh</p>
                <p className="font-medium text-slate-700">{bill.payment.receiver?.name || '-'}</p>
              </div>
              {bill.payment.keterangan && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-0.5">Keterangan</p>
                  <p className="text-sm text-slate-700">{bill.payment.keterangan}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link to={`/payments/${bill.payment.id}`} className="btn btn-secondary btn-sm" id={`btn-view-payment-detail-${id}`}>
                Lihat Detail Pembayaran
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">Tagihan belum dibayar.</p>
            <Link to={`/payments/create?bill_id=${bill.id}`} className="btn-primary btn-sm" id={`btn-pay-bill-detail-${id}`}>
              Catat Pembayaran
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
