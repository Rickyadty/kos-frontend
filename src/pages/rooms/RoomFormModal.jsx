import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { FieldError } from '../../components/ui/ErrorAlert';
import { roomService } from '../../services/roomService';
import { useToast } from '../../components/ui/Toast';

const initialForm = {
  nomor_kamar: '',
  lantai: '1',
  harga_bulanan: '',
  kapasitas: '2',
  keterangan: '',
};

export default function RoomFormModal({ isOpen, onClose, onSuccess, room = null }) {
  const { addToast } = useToast();
  const isEdit = !!room;
  const [form, setForm] = useState(initialForm);
  const [gambar, setGambar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (room) {
        setForm({
          nomor_kamar: room.nomor_kamar || '',
          lantai: String(room.lantai),
          harga_bulanan: String(room.harga_bulanan),
          kapasitas: String(room.kapasitas),
          keterangan: room.keterangan || '',
        });
        setPreviewUrl(room.gambar_url || null);
      } else {
        setForm(initialForm);
        setPreviewUrl(null);
      }
      setGambar(null);
      setErrors({});
      setSaving(false);
    }
  }, [isOpen, room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setGambar(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    if (errors.gambar) setErrors((p) => ({ ...p, gambar: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('nomor_kamar', form.nomor_kamar);
      formData.append('lantai', form.lantai);
      formData.append('harga_bulanan', form.harga_bulanan);
      formData.append('kapasitas', form.kapasitas);
      if (form.keterangan) formData.append('keterangan', form.keterangan);
      if (gambar) formData.append('gambar', gambar);

      if (isEdit) {
        await roomService.updateRoom(room.id, formData);
        addToast('Kamar berhasil diperbarui.', 'success');
      } else {
        await roomService.createRoom(formData);
        addToast('Kamar berhasil ditambahkan.', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: err.response.data.message });
      } else {
        addToast(err.response?.data?.message || 'Gagal menyimpan kamar.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Kamar ${room?.nomor_kamar}` : 'Tambah Kamar Baru'}
      size="lg"
    >
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>
      )}
      <form id="room-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="modal-nomor-kamar">Nomor Kamar *</label>
            <input id="modal-nomor-kamar" name="nomor_kamar" value={form.nomor_kamar} onChange={handleChange}
              className={`input ${errors.nomor_kamar ? 'input-error' : ''}`} placeholder="101" />
            <FieldError error={errors.nomor_kamar?.[0]} />
          </div>
          <div>
            <label className="label" htmlFor="modal-lantai">Lantai *</label>
            <select id="modal-lantai" name="lantai" value={form.lantai} onChange={handleChange} className="input">
              <option value="1">Lantai 1</option>
              <option value="2">Lantai 2</option>
            </select>
            <FieldError error={errors.lantai?.[0]} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="modal-harga">Harga Bulanan (Rp) *</label>
            <input id="modal-harga" name="harga_bulanan" type="number" value={form.harga_bulanan} onChange={handleChange}
              className={`input ${errors.harga_bulanan ? 'input-error' : ''}`} placeholder="1000000" min="0" />
            <FieldError error={errors.harga_bulanan?.[0]} />
          </div>
          <div>
            <label className="label" htmlFor="modal-kapasitas">Kapasitas *</label>
            <select id="modal-kapasitas" name="kapasitas" value={form.kapasitas} onChange={handleChange} className="input">
              <option value="1">1 Orang</option>
              <option value="2">2 Orang</option>
            </select>
            <FieldError error={errors.kapasitas?.[0]} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="modal-keterangan">Keterangan</label>
          <textarea id="modal-keterangan" name="keterangan" value={form.keterangan} onChange={handleChange}
            className="input min-h-[80px] resize-none" placeholder="Fasilitas atau keterangan tambahan..." rows={3} />
          <FieldError error={errors.keterangan?.[0]} />
        </div>

        <div>
          <label className="label" htmlFor="modal-gambar">{isEdit ? 'Ubah Foto Kamar' : 'Foto Kamar (Opsional)'}</label>
          <input
            type="file"
            id="modal-gambar"
            name="gambar"
            onChange={handleFileChange}
            className={`input ${errors.gambar ? 'input-error' : ''} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer`}
            accept="image/*"
          />
          <FieldError error={errors.gambar?.[0]} />
          {previewUrl && (
            <div className="mt-3">
              <img src={previewUrl} alt="Preview" className="w-full max-h-40 object-cover rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>Batal</button>
          <button type="submit" disabled={saving} className="btn-primary" id="btn-save-room-modal">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : isEdit ? 'Simpan Perubahan' : 'Simpan Kamar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}