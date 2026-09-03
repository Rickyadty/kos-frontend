import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import PageHeader from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await paymentService.getPayment(id);
        setPayment(res.data.data);
      } catch (err) {
        addToast(err.response?.data?.message || 'Data pembayaran tidak ditemukan.', 'error');
        navigate('/payments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, addToast, navigate]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Detail Pembayaran"
        subtitle={`Bukti Pembayaran #${payment.id}`}
        action={<Link to="/payments" className="btn btn-secondary">Kembali</Link>}
      />

      <div className="card p-6 divide-y divide-slate-100 space-y-6">
        {/* Receipt Header */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              PEMBAYARAN DITERIMA
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {formatCurrency(payment.jumlah_bayar)}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tanggal: {formatDate(payment.tanggal_bayar)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">ID Transaksi</p>
            <p className="font-mono text-sm font-semibold text-slate-700">#PAY-{payment.id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="pt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
            <Link to="/rooms" className="font-semibold text-navy-800 hover:underline">
              Kamar {payment.room_bill?.room?.nomor_kamar || '-'}
            </Link>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-0.5">Periode Tagihan</p>
            <p className="font-semibold text-slate-700">{formatPeriode(payment.room_bill?.periode)}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pembayar (Tenant)</p>
            <Link to={`/tenants/${payment.payer_tenant_id}`} className="font-semibold text-navy-800 hover:underline">
              {payment.payer?.name || '-'}
            </Link>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-0.5">Diterima Oleh</p>
            <p className="font-semibold text-slate-700">{payment.receiver?.name || '-'}</p>
          </div>

          {payment.keterangan && (
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-0.5">Keterangan</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {payment.keterangan}
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 flex justify-between items-center">
          <Link to={`/bills/${payment.room_bill_id}`} className="btn btn-ghost btn-sm text-navy-800">
            ← Lihat Tagihan Terkait
          </Link>
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
    </div>
  );
}
