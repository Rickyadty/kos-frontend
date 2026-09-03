import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { useToast } from '../../components/ui/Toast';
import { FieldError } from '../../components/ui/ErrorAlert';
import PageHeader from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';

export default function TenantEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await tenantService.getTenant(id);
        const t = res.data.data;
        setForm({
          name: t.name || '',
          no_hp: t.no_hp || '',
          alamat: t.alamat || '',
          no_identitas: t.no_identitas || '',
          pekerjaan: t.pekerjaan || '',
          kontak_darurat: t.kontak_darurat || '',
          status: t.status || 'aktif',
        });
      } catch (err) {
        addToast(err.response?.data?.message || 'Gagal memuat data.', 'error');
        navigate('/tenants');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, addToast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await tenantService.updateTenant(id, form);
      addToast('Data penghuni berhasil diperbarui.', 'success');
      navigate(`/tenants/${id}`);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: err.response.data.message });
      } else {
        addToast(err.response?.data?.message || 'Gagal memperbarui.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Penghuni"
        subtitle={`Memperbarui data ${form?.name}`}
        action={<Link to={`/tenants/${id}`} className="btn btn-secondary">Batal</Link>}
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
                className={`input ${errors.name ? 'input-error' : ''}`} />
              <FieldError error={errors.name?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="no_hp">No HP</label>
              <input id="no_hp" name="no_hp" value={form.no_hp} onChange={handleChange} className="input" />
              <FieldError error={errors.no_hp?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="no_identitas">No Identitas</label>
              <input id="no_identitas" name="no_identitas" value={form.no_identitas} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="pekerjaan">Pekerjaan</label>
              <input id="pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="kontak_darurat">Kontak Darurat</label>
              <input id="kontak_darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={handleChange} className="input" />
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
            <label className="label" htmlFor="alamat">Alamat</label>
            <textarea id="alamat" name="alamat" value={form.alamat} onChange={handleChange}
              className="input resize-none" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link to={`/tenants/${id}`} className="btn btn-secondary">Batal</Link>
            <button type="submit" disabled={saving} className="btn-primary" id="btn-save-tenant-edit">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
