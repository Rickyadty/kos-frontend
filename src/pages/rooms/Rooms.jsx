import { useState, useEffect, useCallback } from 'react';
import { roomService } from '../../services/roomService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { SkeletonRoomCard } from '../../components/ui/Skeleton';
import RoomFormModal from './RoomFormModal';
import RoomDetailModal from './RoomDetailModal';

const FILTERS = [
  { label: 'Semua', value: {} },
  { label: 'Lantai 1', value: { lantai: 1 } },
  { label: 'Lantai 2', value: { lantai: 2 } },
  { label: 'Kosong', value: { status: 'kosong' } },
  { label: 'Terisi', value: { status: 'terisi' } },
  { label: 'Penuh', value: { status: 'penuh' } },
];

const defaultRoomImage = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80';

function RoomCard({ room, onDetail, onEdit, onDelete }) {
  const occupancy = `${room.jumlah_penghuni_aktif} / ${room.kapasitas}`;
  const pct = (room.jumlah_penghuni_aktif / room.kapasitas) * 100;
  const image = room.gambar_url || defaultRoomImage;

  return (
    <div className="card p-4 hover:shadow-float transition-all duration-200 group flex flex-col justify-between">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3.5 bg-slate-100 cursor-pointer" onClick={() => onDetail(room)}>
          <img
            src={image}
            alt={`Kamar ${room.nomor_kamar}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 right-2.5">
            <Badge status={room.status_kamar} />
          </div>
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-semibold">
            Lantai {room.lantai}
          </div>
        </div>

        {/* Room Title & Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-jet text-base">Kamar {room.nomor_kamar}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[180px]">
              {room.keterangan || `Fasilitas standar Lantai ${room.lantai}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-extrabold text-jet">
              {formatCurrency(room.harga_bulanan)}
            </p>
            <p className="text-[10px] text-slate-400">/ bulan</p>
          </div>
        </div>

        {/* Occupancy bar */}
        <div className="my-3 bg-slate-50 p-2.5 rounded-2xl border border-black/[0.03]">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>Kapasitas Penghuni</span>
            <span className="font-bold text-jet">{occupancy} orang</span>
          </div>
          <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct === 0 ? 'bg-emerald-500' : pct < 100 ? 'bg-sand-400' : 'bg-rose-500'
                }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onDetail(room)}
          className="btn btn-secondary btn-sm flex-1 justify-center rounded-full"
          id={`btn-detail-room-${room.id}`}
        >
          Detail
        </button>
        <button
          onClick={() => onEdit(room)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          id={`btn-edit-room-${room.id}`}
          title="Edit Kamar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(room)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors"
          id={`btn-delete-room-${room.id}`}
          title="Hapus Kamar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { addToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomService.getRooms(FILTERS[activeFilter].value);
      setRooms(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal memuat data kamar.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, addToast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handlers
  const handleOpenCreate = () => {
    setEditTarget(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditTarget(room);
    setShowFormModal(true);
  };

  const handleOpenDetail = (room) => {
    setDetailTarget(room);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await roomService.deleteRoom(deleteTarget.id);
      addToast(`Kamar ${deleteTarget.nomor_kamar} berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      fetchRooms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus kamar.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Listing Kamar"
        subtitle="Kelola seluruh unit kamar kos Aurex Living"
        action={
          <button onClick={handleOpenCreate} className="btn-primary" id="btn-create-room">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kamar
          </button>
        }
      />

      {/* Pill Filters Bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(i)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeFilter === i
                ? 'bg-jet text-white shadow-sm'
                : 'bg-white text-slate-600 border border-black/[0.06] hover:bg-slate-50'
              }`}
            id={`filter-room-${f.label.toLowerCase().replace(' ', '-')}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Room Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonRoomCard key={i} />)}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Belum ada kamar"
          description="Mulai dengan menambahkan kamar kos pertama Anda."
          action={
            <button onClick={handleOpenCreate} className="btn-primary">
              Tambah Kamar
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onDetail={handleOpenDetail}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <RoomFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditTarget(null); }}
        onSuccess={fetchRooms}
        room={editTarget}
      />

      {/* Detail Modal */}
      <RoomDetailModal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        room={detailTarget}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Kamar"
        message={`Apakah Anda yakin ingin menghapus Kamar ${deleteTarget?.nomor_kamar}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  );
}
