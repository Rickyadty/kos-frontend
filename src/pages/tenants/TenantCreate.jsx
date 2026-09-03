import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';
import PageHeader from '../../components/ui/PageHeader';

const initialForm = {
  name: '',
  no_hp: '',
  alamat: '',
  no_identitas: '',
  pekerjaan: '',
  kontak_darurat: '',
  status: 'aktif',
};

export default function TenantCreate() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      await tenantService.createTenant(form);
      addToast('Data tenant berhasil ditambahkan.', 'success');
      navigate('/tenants');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: err.response.data.message });
      } else {
        addToast(err.response?.data?.message || 'Gagal menambahkan tenant.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Tambah Penghuni"
        subtitle="Isi data penghuni baru"
        action={<Link to="/tenants" className="btn btn-secondary">Kembali</Link>}
      />
      <div className="card p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="name">Nama Lengkap *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange}
                className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Budi Santoso" />
              <FieldError error={errors.name?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="no_hp">No HP *</label>
              <input id="no_hp" name="no_hp" value={form.no_hp} onChange={handleChange}
                className={`input ${errors.no_hp ? 'input-error' : ''}`} placeholder="08xxxxxxxxxx" />
              <FieldError error={errors.no_hp?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="no_identitas">No Identitas (KTP) *</label>
              <input id="no_identitas" name="no_identitas" value={form.no_identitas} onChange={handleChange}
                className={`input ${errors.no_identitas ? 'input-error' : ''}`} placeholder="16 digit NIK" maxLength={16} />
              <FieldError error={errors.no_identitas?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="pekerjaan">Pekerjaan</label>
              <input id="pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange}
                className="input" placeholder="Mahasiswa / Karyawan / ..." />
            </div>
            <div>
              <label className="label" htmlFor="kontak_darurat">Kontak Darurat</label>
              <input id="kontak_darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={handleChange}
                className="input" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="input">
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="alamat">Alamat Asal</label>
            <textarea id="alamat" name="alamat" value={form.alamat} onChange={handleChange}
              className="input resize-none" rows={2} placeholder="Jl. Contoh No. 1, Kota" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link to="/tenants" className="btn btn-secondary">Batal</Link>
            <button type="submit" disabled={loading} className="btn-primary" id="btn-save-tenant">
              {loading ? 'Menyimpan...' : 'Simpan Penghuni'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
