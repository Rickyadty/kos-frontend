import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { roomService } from '../../services/roomService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatPeriode } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import kosBuRirienImage from '../../assets/kos-bu-ririen.jpg';

const defaultRoomImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, roomsRes] = await Promise.all([
          dashboardService.getDashboard(),
          roomService.getRooms(),
        ]);
        setData(dashboardRes.data.data);
        setRooms(roomsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="card h-64 bg-slate-200 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-bold text-slate-800 mb-1">Gagal Memuat Dashboard</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary btn-sm"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  // Ruangan yang ditampilkan di showcase — langsung dari data kamar asli, tanpa fallback dummy
  const showcaseRooms = rooms.slice(0, 3);

  // Persentase okupansi kamar (real data dari DashboardController)
  const totalKamar = data?.total_kamar ?? 0;
  const kamarTerisi = (data?.kamar_terisi ?? 0) + (data?.kamar_penuh ?? 0);
  const kamarKosong = data?.kamar_kosong ?? 0;
  const terisiPct = totalKamar > 0 ? Math.round((kamarTerisi / totalKamar) * 100) : 0;
  const kosongPct = totalKamar > 0 ? 100 - terisiPct : 0;

  // Ringkasan status tagihan (real data dari DashboardController)
  const tagihanLunas = data?.tagihan_lunas ?? 0;
  const tagihanBelumLunas = data?.tagihan_belum_lunas ?? 0;
  const totalTagihan = tagihanLunas + tagihanBelumLunas;
  const lunasPct = totalTagihan > 0 ? Math.round((tagihanLunas / totalTagihan) * 100) : 0;
  const belumLunasPct = totalTagihan > 0 ? 100 - lunasPct : 0;

  // Gabungan pembayaran terbaru & tagihan belum lunas menjadi satu daftar aktivitas,
  // seluruhnya berasal dari data asli (recent_payments & unpaid_bills)
  const recentPayments = data?.recent_payments || [];
  const unpaidBills = data?.unpaid_bills || [];

  const activityItems = [
    ...recentPayments.map((p) => ({
      key: `payment-${p.id}`,
      kamar: p.room_bill?.room?.nomor_kamar,
      lantai: p.room_bill?.room?.lantai,
      periode: p.room_bill?.periode,
      tenant: p.payer?.name,
      jumlah: p.jumlah_bayar,
      tanggal: p.tanggal_bayar,
      status: 'lunas',
    })),
    ...unpaidBills.map((b) => ({
      key: `bill-${b.id}`,
      kamar: b.room?.nomor_kamar,
      lantai: b.room?.lantai,
      periode: b.periode,
      tenant: null,
      jumlah: b.jumlah_tagihan,
      tanggal: b.jatuh_tempo,
      status: 'belum_bayar',
    })),
  ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const filteredActivityItems = activityItems.filter((item) => {
    if (filterFloor !== 'all' && String(item.lantai) !== filterFloor) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      const haystack = `${item.kamar || ''} ${item.tenant || ''} ${formatPeriode(item.periode) || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* SECTION 1: TOP STATS & HERO KAMAR SHOWCASE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5/12 on LG): Metric Cards & Dual Overview Progress Bar */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Dual Bar Overview: Kamar Terisi & Kamar Kosong */}
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Kamar Terisi</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-jet">
                    {kamarTerisi} <span className="text-sm font-normal text-slate-400">/ {totalKamar} Kamar</span>
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Kamar Kosong</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-sand-500">
                    {kamarKosong} <span className="text-sm font-normal text-slate-400">Kamar Siap</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Color Horizontal Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-jet rounded-full transition-all duration-700"
                  style={{ width: `${terisiPct}%` }}
                  title={`Terisi: ${terisiPct}%`}
                />
                <div
                  className="h-full bg-sand-300 rounded-full transition-all duration-700 -ml-1"
                  style={{ width: `${kosongPct}%` }}
                  title={`Kosong: ${kosongPct}%`}
                />
              </div>
            </div>
          </div>

          {/* Row of 2 Small Stat Cards: Total Pemasukan & Tenant Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Pemasukan Card */}
            <div className="card p-5 relative group card-hover">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 tracking-wide">Total Pemasukan</p>
                <Link
                  to="/payments"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-jet hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                  title="Lihat Pembayaran"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 17L17 7m0 0H7m10 0v10" />
                  </svg>
                </Link>
              </div>

              <div className="mb-2">
                <p className="text-2xl font-bold text-jet tracking-tight">
                  {formatCurrency(data?.total_pembayaran_bulan_ini ?? 0)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Bulan ini</p>
              </div>

              {/* Decorative mini equalizer graphic */}
              <div className="absolute right-5 bottom-4 flex items-end gap-[3px] opacity-70">
                <span className="w-[3px] h-3 bg-slate-300 rounded-full" />
                <span className="w-[3px] h-5 bg-slate-800 rounded-full" />
                <span className="w-[3px] h-6 bg-slate-800 rounded-full" />
                <span className="w-[3px] h-4 bg-slate-400 rounded-full" />
                <span className="w-[3px] h-7 bg-slate-900 rounded-full" />
                <span className="w-[3px] h-5 bg-slate-600 rounded-full" />
                <span className="w-[3px] h-2 bg-slate-300 rounded-full" />
              </div>
            </div>

            {/* Tenant Aktif Card */}
            <div className="card p-5 relative group card-hover">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 tracking-wide">Tenant Aktif</p>
                <Link
                  to="/tenants"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-jet hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                  title="Lihat Tenant"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 17L17 7m0 0H7m10 0v10" />
                  </svg>
                </Link>
              </div>

              <div className="mb-2">
                <p className="text-2xl font-bold text-jet tracking-tight">
                  {data?.total_tenant_aktif ?? 0}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Tenant Aktif</p>
              </div>

              {/* Decorative mini equalizer graphic */}
              <div className="absolute right-5 bottom-4 flex items-end gap-[3px] opacity-70">
                <span className="w-[3px] h-4 bg-slate-400 rounded-full" />
                <span className="w-[3px] h-6 bg-slate-900 rounded-full" />
                <span className="w-[3px] h-5 bg-slate-700 rounded-full" />
                <span className="w-[3px] h-3 bg-slate-300 rounded-full" />
                <span className="w-[3px] h-7 bg-slate-900 rounded-full" />
                <span className="w-[3px] h-4 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Ringkasan Status Tagihan (real data, menggantikan chart dummy) */}
          <div className="card p-6 flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 tracking-wide">Ringkasan Tagihan</p>
              <p className="text-2xl font-bold text-jet mt-1 tracking-tight">{totalTagihan} Tagihan</p>
              <p className="text-xs text-slate-400">Lunas vs Belum Bayar</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-20 text-slate-500 font-medium text-right">Lunas</span>
                <div className="flex-1 h-6 bg-slate-50 rounded-full overflow-hidden flex items-center relative">
                  <div
                    className="h-full bg-emerald-500 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-semibold transition-all duration-700"
                    style={{ width: `${lunasPct}%` }}
                  >
                    {lunasPct > 0 && <span>{tagihanLunas}</span>}
                  </div>
                </div>
                <span className="w-8 text-right text-slate-400 font-mono text-[11px]">{lunasPct}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-20 text-slate-500 font-medium text-right">Belum Bayar</span>
                <div className="flex-1 h-6 bg-slate-50 rounded-full overflow-hidden flex items-center relative">
                  <div
                    className="h-full bg-sand-400 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-semibold transition-all duration-700"
                    style={{ width: `${belumLunasPct}%` }}
                  >
                    {belumLunasPct > 0 && <span>{tagihanBelumLunas}</span>}
                  </div>
                </div>
                <span className="w-8 text-right text-slate-400 font-mono text-[11px]">{belumLunasPct}%</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link to="/bills" className="text-xs font-semibold text-jet hover:underline">
                Lihat semua tagihan →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (7/12 on LG): Hero + Showcase Kamar */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="card p-6 h-full flex flex-col justify-between">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 mb-6 aspect-[16/7] shadow-inner">
              <img
                src={kosBuRirienImage}
                alt="Aurex Living"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    Aurex Living
                  </span>
                  <p className="text-lg font-bold mt-1 text-white drop-shadow-sm">Kelola properti kos Anda dengan mudah</p>
                </div>
              </div>
            </div>

            {/* Showcase Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-jet">Kamar</h2>
                <p className="text-xs text-slate-400">Ringkasan beberapa unit kamar kos</p>
              </div>
              <Link
                to="/rooms"
                className="btn-circle w-8 h-8"
                title="Buka Semua Kamar"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Link>
            </div>

            {/* Showcase Kamar Cards Grid — data asli, tanpa rating/sqft/bed/bath fiktif */}
            {showcaseRooms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada data kamar.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {showcaseRooms.map((room) => (
                  <Link
                    to="/rooms"
                    key={room.id}
                    className="bg-white rounded-2xl border border-black/[0.05] p-2.5 shadow-sm hover:shadow-float transition-all duration-200 flex flex-col justify-between group"
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={room.gambar_url || defaultRoomImage}
                        alt={`Kamar ${room.nomor_kamar}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge status={room.status_kamar} />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-semibold">
                        Lantai {room.lantai}
                      </div>
                    </div>

                    {/* Information */}
                    <div>
                      <h3 className="font-bold text-xs text-jet truncate">Kamar {room.nomor_kamar}</h3>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {room.jumlah_penghuni_aktif} / {room.kapasitas} penghuni
                      </p>

                      {/* Price */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-jet">{formatCurrency(room.harga_bulanan)}</span>
                        <span className="text-[9px] text-slate-400">/ bulan</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PILL FILTER BAR & AKTIVITAS TERBARU */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-8 card p-6">
          {/* Pill Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Floor Filter Pill */}
              <div className="relative">
                <select
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value)}
                  className="bg-white border border-black/10 text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm appearance-none pr-8"
                >
                  <option value="all">Semua Lantai</option>
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
              </div>

              {/* Status Filter Pill */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-black/10 text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm appearance-none pr-8"
                >
                  <option value="all">Semua Status</option>
                  <option value="lunas">Lunas</option>
                  <option value="belum_bayar">Belum Bayar</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
              </div>
            </div>

            {/* Right: Search Pill */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kamar / tenant..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="input py-1.5 pl-8 pr-3 text-xs w-40 sm:w-48 bg-slate-50/70 border-black/5"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <Link
                to="/bills"
                className="w-8 h-8 rounded-full bg-jet text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                title="Buka Halaman Tagihan"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 17L17 7m0 0H7m10 0v10" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Tabel Aktivitas Terbaru — gabungan pembayaran & tagihan belum lunas, seluruhnya data asli */}
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="rounded-l-2xl">Kamar</th>
                  <th>Periode</th>
                  <th>Tenant</th>
                  <th>Jumlah</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th className="rounded-r-2xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivityItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                      Tidak ada data yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredActivityItems.map((item) => (
                    <tr key={item.key} className="transition-colors">
                      <td className="font-bold text-xs text-jet">Kamar {item.kamar || '-'}</td>
                      <td className="text-xs text-slate-600 font-medium">{formatPeriode(item.periode) || '-'}</td>
                      <td className="text-xs text-slate-700 font-medium">{item.tenant || '-'}</td>
                      <td className="text-xs font-bold text-jet">{formatCurrency(item.jumlah)}</td>
                      <td className="text-xs text-slate-400">{formatDate(item.tanggal)}</td>
                      <td><Badge status={item.status} /></td>
                      <td className="text-center">
                        <Link
                          to={item.status === 'lunas' ? `/payments` : `/bills`}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-jet transition-colors inline-flex"
                          title="Lihat Detail"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 17L17 7m0 0H7m10 0v10" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}