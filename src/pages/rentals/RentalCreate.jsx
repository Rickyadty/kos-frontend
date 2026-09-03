import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rentalService } from '../../services/rentalService';
import { tenantService } from '../../services/tenantService';
import { roomService } from '../../services/roomService';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';
import PageHeader from '../../components/ui/PageHeader';
import { getTodayString } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RentalCreate() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    tenant_id: '',
    room_id: '',
    tanggal_masuk: getTodayString(),
  });
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, rRes] = await Promise.all([
          tenantService.getTenants({ status: 'aktif', per_page: 100 }),
          roomService.getRooms(),
        ]);
        setTenants(tRes.data.data);
        // Only show rooms that are not full
        setRooms(rRes.data.data.filter((r) => r.status_kamar !== 'penuh'));
      } catch {
        addToast('Gagal memuat data. Coba refresh halaman.', 'error');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await rentalService.createRental({
        ...form,
        tenant_id: parseInt(form.tenant_id),
        room_id: parseInt(form.room_id),
      });
      addToast('Data hunian berhasil ditambahkan.', 'success');
      navigate('/rentals');
    } catch (err) {
      if (err.response?.status === 422) {
        const errData = err.response.data;
        if (errData.errors) setErrors(errData.errors);
        else setErrors({ general: errData.message });
      } else {
        setErrors({ general: err.response?.data?.message || 'Gagal menyimpan data hunian.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find((r) => String(r.id) === String(form.room_id));

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Tambah Hunian"
        subtitle="Daftarkan penghuni ke kamar"
        action={<Link to="/rentals" className="btn btn-secondary">Kembali</Link>}
      />
      <div className="card p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="tenant_id">Penghuni *</label>
            <select id="tenant_id" name="tenant_id" value={form.tenant_id} onChange={handleChange}
              className={`input ${errors.tenant_id ? 'input-error' : ''}`} disabled={loadingData}>
              <option value="">Pilih penghuni...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.no_hp}</option>
              ))}
            </select>
            <FieldError error={errors.tenant_id?.[0]} />
          </div>

          <div>
            <label className="label" htmlFor="room_id">Kamar *</label>
            <select id="room_id" name="room_id" value={form.room_id} onChange={handleChange}
              className={`input ${errors.room_id ? 'input-error' : ''}`} disabled={loadingData}>
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
              onChange={handleChange} className={`input ${errors.tanggal_masuk ? 'input-error' : ''}`} />
            <FieldError error={errors.tanggal_masuk?.[0]} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/rentals" className="btn btn-secondary">Batal</Link>
            <button type="submit" disabled={loading || loadingData} className="btn-primary" id="btn-save-rental">
              {loading ? 'Menyimpan...' : 'Simpan Hunian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
