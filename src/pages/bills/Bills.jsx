import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { billService } from '../../services/billService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode, getCurrentPeriode } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { PageLoader } from '../../components/ui/Spinner';

export default function Bills() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bills, setBills] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [periodeFilter, setPeriodeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generatePeriode, setGeneratePeriode] = useState(getCurrentPeriode());
  const [generating, setGenerating] = useState(false);

  // Detail modal
  const [detailId, setDetailId] = useState(null);
  const [detailBill, setDetailBill] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBills = useCallback(async (s = statusFilter, p = page, pr = periodeFilter) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (s) params.status = s;
      if (pr) params.periode = pr;
      const res = await billService.getBills(params);
      setBills(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal memuat tagihan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, periodeFilter, addToast]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const openDetail = useCallback(async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await billService.getBill(id);
      setDetailBill(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  }, [addToast]);

  const closeDetail = () => { setDetailId(null); setDetailBill(null); };

  // Auto-open detail modal when navigated here with ?view=<id> (e.g. from Payments)
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      openDetail(viewId);
      searchParams.delete('view');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!generatePeriode) { addToast('Pilih periode terlebih dahulu.', 'warning'); return; }
    setGenerating(true);
    try {
      const res = await billService.generateBills({ periode: generatePeriode });
      const d = res.data.data;
      addToast(`Generate berhasil! ${d.total_generated} tagihan dibuat, ${d.total_skipped} dilewati.`, 'success');
      setShowGenerate(false);
      fetchBills();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal generate tagihan.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const goToPay = (billId) => {
    navigate(`/payments?create=1&bill_id=${billId}`);
  };

  const isOverdue = (bill) => new Date(bill.jatuh_tempo) < new Date() && bill.status === 'belum_bayar';

  return (
    <div>
      <PageHeader
        title="Tagihan"
        subtitle="Kelola tagihan bulanan kamar"
        action={
          <button onClick={() => setShowGenerate(true)} className="btn-primary" id="btn-generate-bills">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Tagihan
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="month"
          value={periodeFilter}
          onChange={(e) => { setPeriodeFilter(e.target.value); setPage(1); fetchBills(statusFilter, 1, e.target.value); }}
          className="input w-auto"
          id="filter-bill-periode"
          placeholder="Filter periode"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchBills(e.target.value, 1, periodeFilter); }}
          className="input w-auto"
          id="filter-bill-status"
        >
          <option value="">Semua Status</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="lunas">Lunas</option>
        </select>
        {(periodeFilter || statusFilter) && (
          <button
            onClick={() => { setPeriodeFilter(''); setStatusFilter(''); setPage(1); fetchBills('', 1, ''); }}
            className="btn btn-ghost btn-sm text-slate-500"
          >
            Reset
          </button>
        )}
      </div>

      <div className="table-wrapper bg-white">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : bills.length === 0 ? (
          <EmptyState
            title="Belum ada tagihan"
            description="Generate tagihan bulanan untuk semua kamar menggunakan tombol di atas."
          />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kamar</th>
                  <th>Periode</th>
                  <th>Jumlah Tagihan</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, idx) => (
                  <tr key={bill.id}>
                    <td className="text-slate-400 text-xs">{((meta?.current_page - 1) * meta?.per_page) + idx + 1}</td>
                    <td className="font-medium text-slate-800">Kamar {bill.room?.nomor_kamar || '-'}</td>
                    <td>{formatPeriode(bill.periode)}</td>
                    <td className="font-semibold text-slate-800">{formatCurrency(bill.jumlah_tagihan)}</td>
                    <td className={`text-sm ${isOverdue(bill) ? 'text-red-600 font-medium' : ''}`}>
                      {formatDate(bill.jatuh_tempo)}
                    </td>
                    <td><Badge status={bill.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(bill.id)} className="btn btn-ghost btn-sm text-blue-600" id={`btn-detail-bill-${bill.id}`}>Detail</button>
                        {bill.status === 'belum_bayar' && (
                          <button
                            onClick={() => goToPay(bill.id)}
                            className="btn btn-ghost btn-sm text-emerald-600"
                            id={`btn-pay-bill-${bill.id}`}
                          >
                            Bayar
                          </button>
                        )}
                        {bill.status === 'lunas' && bill.payment && (
                          <button
                            onClick={() => navigate(`/payments?view=${bill.payment.id}`)}
                            className="btn btn-ghost btn-sm text-slate-500"
                            id={`btn-view-payment-${bill.id}`}
                          >
                            Lihat Bayar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={(p) => { setPage(p); fetchBills(statusFilter, p, periodeFilter); }} />
          </>
        )}
      </div>

      {/* Generate Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Tagihan Bulanan" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Generate tagihan untuk semua kamar pada periode yang dipilih. Tagihan yang sudah ada akan dilewati.
          </p>
          <div>
            <label className="label" htmlFor="generate-periode">Periode *</label>
            <input
              id="generate-periode"
              type="month"
              value={generatePeriode}
              onChange={(e) => setGeneratePeriode(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowGenerate(false)} className="btn btn-secondary" disabled={generating}>Batal</button>
            <button onClick={handleGenerate} className="btn-primary" disabled={generating} id="btn-confirm-generate">
              {generating ? 'Memproses...' : 'Generate Tagihan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailId} onClose={closeDetail} title="Detail Tagihan" size="lg">
        {detailLoading || !detailBill ? (
          <PageLoader />
        ) : (
          <div className="-m-8">
            <div className="divide-y divide-slate-100">
              <div className="p-8 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800">
                    Kamar {detailBill.room?.nomor_kamar} — {formatPeriode(detailBill.periode)}
                  </h2>
                  <Badge status={detailBill.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Kamar</p>
                    <p className="font-semibold text-navy-800">Kamar {detailBill.room?.nomor_kamar}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Periode</p>
                    <p className="font-semibold text-slate-700">{formatPeriode(detailBill.periode)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Jumlah Tagihan</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(detailBill.jumlah_tagihan)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Jatuh Tempo</p>
                    <p className={`font-semibold ${isOverdue(detailBill) ? 'text-red-600' : 'text-slate-700'}`}>
                      {formatDate(detailBill.jatuh_tempo)}
                      {isOverdue(detailBill) && <span className="ml-1 text-xs">(Terlambat)</span>}
                    </p>
                  </div>
                </div>
              </div>

              {detailBill.payment ? (
                <div className="p-8 py-5">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sudah Dibayar
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Dibayar Oleh</p>
                      <p className="font-medium text-slate-700">{detailBill.payment.payer?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Jumlah Bayar</p>
                      <p className="font-semibold text-emerald-700">{formatCurrency(detailBill.payment.jumlah_bayar)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Tanggal Bayar</p>
                      <p className="font-medium text-slate-700">{formatDate(detailBill.payment.tanggal_bayar)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Diterima Oleh</p>
                      <p className="font-medium text-slate-700">{detailBill.payment.receiver?.name || '-'}</p>
                    </div>
                    {detailBill.payment.keterangan && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-0.5">Keterangan</p>
                        <p className="text-sm text-slate-700">{detailBill.payment.keterangan}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => { closeDetail(); navigate(`/payments?view=${detailBill.payment.id}`); }}
                      className="btn btn-secondary btn-sm"
                      id={`btn-view-payment-detail-${detailBill.id}`}
                    >
                      Lihat Detail Pembayaran
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 py-5 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Tagihan belum dibayar.</p>
                  <button
                    onClick={() => { closeDetail(); goToPay(detailBill.id); }}
                    className="btn-primary btn-sm"
                    id={`btn-pay-bill-detail-${detailBill.id}`}
                  >
                    Catat Pembayaran
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}