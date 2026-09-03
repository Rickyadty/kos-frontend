import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function RoomDetailModal({ isOpen, onClose, room, onEdit, onDelete }) {
  if (!room) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80';
  const image = room.gambar_url || defaultImage;
  const occupancy = `${room.jumlah_penghuni_aktif} / ${room.kapasitas}`;
  const pct = (room.jumlah_penghuni_aktif / room.kapasitas) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Kamar ${room.nomor_kamar}`}
      size="lg"
    >
      {/* Hero Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-slate-100">
        <img src={image} alt={`Kamar ${room.nomor_kamar}`} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <Badge status={room.status_kamar} />
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
          Lantai {room.lantai}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-black/[0.03]">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Nomor Kamar</p>
          <p className="text-sm font-bold text-jet">{room.nomor_kamar}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5 border border-black/[0.03]">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Harga Bulanan</p>
          <p className="text-sm font-bold text-jet">{formatCurrency(room.harga_bulanan)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5 border border-black/[0.03]">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Kapasitas</p>
          <p className="text-sm font-bold text-jet">{room.kapasitas} orang</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5 border border-black/[0.03]">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Penghuni Aktif</p>
          <p className="text-sm font-bold text-jet">{room.jumlah_penghuni_aktif} orang</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-black/[0.03] mb-5">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Okupansi</span>
          <span className="font-bold text-jet">{occupancy} orang</span>
        </div>
        <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 0 ? 'bg-emerald-500' : pct < 100 ? 'bg-sand-400' : 'bg-rose-500'
              }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Keterangan */}
      {room.keterangan && (
        <div className="bg-slate-50 rounded-xl p-3.5 border border-black/[0.03] mb-5">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Keterangan</p>
          <p className="text-sm text-slate-700">{room.keterangan}</p>
        </div>
      )}

      {/* Dates */}
      <div className="text-[11px] text-slate-400 mb-5">
        Dibuat: {formatDate(room.created_at)}
      </div>

      {/* Actions */}
      <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => { onClose(); onDelete(room); }}
          className="btn btn-danger btn-sm"
          id="btn-delete-room-detail"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="btn btn-secondary">Tutup</button>
          <button
            onClick={() => { onClose(); onEdit(room); }}
            className="btn-primary"
            id="btn-edit-room-detail"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Kamar
          </button>
        </div>
      </div>
    </Modal>
  );
}