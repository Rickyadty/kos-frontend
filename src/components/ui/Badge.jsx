/**
 * Status badge for rooms, tenants, rentals, bills
 */
export default function Badge({ status }) {
  const map = {
    // Room status
    kosong: { label: 'Kosong', className: 'badge-green' },
    terisi: { label: 'Terisi', className: 'badge-yellow' },
    penuh: { label: 'Penuh', className: 'badge-red' },
    // Tenant / Rental status
    aktif: { label: 'Aktif', className: 'badge-blue' },
    tidak_aktif: { label: 'Tidak Aktif', className: 'badge-gray' },
    selesai: { label: 'Selesai', className: 'badge-gray' },
    // Bill status
    belum_bayar: { label: 'Belum Bayar', className: 'badge-red' },
    lunas: { label: 'Lunas', className: 'badge-green' },
    // Role
    admin: { label: 'Admin', className: 'badge-navy' },
    pemilik: { label: 'Pemilik', className: 'badge-blue' },
  };

  const config = map[status] || { label: status, className: 'badge-gray' };

  return <span className={config.className}>{config.label}</span>;
}
