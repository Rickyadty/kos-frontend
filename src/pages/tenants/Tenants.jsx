import { useState, useEffect, useCallback, useRef } from 'react';
import { tenantService } from '../../services/tenantService';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Modal from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { FieldError } from '../../components/ui/ErrorAlert';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';

const emptyForm = {
  name: '',
  no_hp: '',
  alamat: '',
  no_identitas: '',
  pekerjaan: '',
  kontak_darurat: '',
  status: 'aktif',
};

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="font-medium text-slate-700">{value || '-'}</p>
    </div>
  );
}

export default function Tenants() {
  const { addToast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // 'create' | 'detail' | 'edit' | null
  const [modalMode, setModalMode] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeTenant, setActiveTenant] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTenants = useCallback(async (q = search, s = status, p = page) => {
    setLoading(true);
    try {
      const params = { page: p };
      if (q) params.search = q;
      if (s) params.status = s;
      const res = await tenantService.getTenants(params);
      setTenants(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal memuat data penghuni.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, addToast]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchTenants(val, status, 1);
    }, 400);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    setPage(1);
    fetchTenants(search, val, 1);
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveId(null);
    setActiveTenant(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setModalMode('create');
  };

  const openDetail = async (id) => {
    setModalMode('detail');
    setActiveId(id);
    setModalLoading(true);
    try {
      const res = await tenantService.getTenant(id);
      setActiveTenant(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
      closeModal();
    } finally {
      setModalLoading(false);
    }
  };

  const openEdit = async (id) => {
    setModalMode('edit');
    setActiveId(id);
    setErrors({});
    setModalLoading(true);
    try {
      const res = await tenantService.getTenant(id);
      const t = res.data.data;
      setActiveTenant(t);
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
      closeModal();
    } finally {
      setModalLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await tenantService.createTenant(form);
      addToast('Data tenant berhasil ditambahkan.', 'success');
      closeModal();
      fetchTenants();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: err.response.data.message });
      } else {
        addToast(err.response?.data?.message || 'Gagal menambahkan tenant.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await tenantService.updateTenant(activeId, form);
      addToast('Data penghuni berhasil diperbarui.', 'success');
      closeModal();
      fetchTenants();
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tenantService.deleteTenant(deleteTarget.id);
      addToast(`Penghuni ${deleteTarget.name} berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      if (modalMode === 'detail' && activeId === deleteTarget.id) closeModal();
      fetchTenants();
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus penghuni.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Penghuni"
        subtitle="Kelola data penghuni kos"
        action={
          <button onClick={openCreate} className="btn-primary" id="btn-create-tenant">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Penghuni
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama, no HP, identitas..."
            className="input pl-9"
            id="search-tenant"
          />
        </div>
        <select value={status} onChange={handleStatusChange} className="input w-auto" id="filter-tenant-status">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="tidak_aktif">Tidak Aktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper bg-white">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : tenants.length === 0 ? (
          <EmptyState
            title="Belum ada penghuni"
            description={search ? `Tidak ada hasil untuk "${search}"` : 'Tambahkan penghuni kos pertama Anda.'}
            action={!search && <button onClick={openCreate} className="btn-primary">Tambah Penghuni</button>}
          />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>No HP</th>
                  <th>Pekerjaan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant, idx) => (
                  <tr key={tenant.id}>
                    <td className="text-slate-400 text-xs">{((meta?.current_page - 1) * meta?.per_page) + idx + 1}</td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{tenant.name}</p>
                        <p className="text-xs text-slate-400">{tenant.no_identitas}</p>
                      </div>
                    </td>
                    <td>{tenant.no_hp}</td>
                    <td>{tenant.pekerjaan || '-'}</td>
                    <td><Badge status={tenant.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(tenant.id)} className="btn btn-ghost btn-sm text-blue-600" id={`btn-detail-tenant-${tenant.id}`}>Detail</button>
                        <button onClick={() => openEdit(tenant.id)} className="btn btn-ghost btn-sm" id={`btn-edit-tenant-${tenant.id}`}>Edit</button>
                        <button onClick={() => setDeleteTarget(tenant)} className="btn btn-ghost btn-sm text-red-500" id={`btn-delete-tenant-${tenant.id}`}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={(p) => { setPage(p); fetchTenants(search, status, p); }} />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalMode === 'create'} onClose={closeModal} title="Tambah Penghuni" size="lg">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="c-name">Nama Lengkap *</label>
              <input id="c-name" name="name" value={form.name} onChange={handleChange}
                className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Budi Santoso" />
              <FieldError error={errors.name?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="c-no_hp">No HP *</label>
              <input id="c-no_hp" name="no_hp" value={form.no_hp} onChange={handleChange}
                className={`input ${errors.no_hp ? 'input-error' : ''}`} placeholder="08xxxxxxxxxx" />
              <FieldError error={errors.no_hp?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="c-no_identitas">No Identitas (KTP) *</label>
              <input id="c-no_identitas" name="no_identitas" value={form.no_identitas} onChange={handleChange}
                className={`input ${errors.no_identitas ? 'input-error' : ''}`} placeholder="16 digit NIK" maxLength={16} />
              <FieldError error={errors.no_identitas?.[0]} />
            </div>
            <div>
              <label className="label" htmlFor="c-pekerjaan">Pekerjaan</label>
              <input id="c-pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange}
                className="input" placeholder="Mahasiswa / Karyawan / ..." />
            </div>
            <div>
              <label className="label" htmlFor="c-kontak_darurat">Kontak Darurat</label>
              <input id="c-kontak_darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={handleChange}
                className="input" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="label" htmlFor="c-status">Status</label>
              <select id="c-status" name="status" value={form.status} onChange={handleChange} className="input">
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="c-alamat">Alamat Asal</label>
            <textarea id="c-alamat" name="alamat" value={form.alamat} onChange={handleChange}
              className="input resize-none" rows={2} placeholder="Jl. Contoh No. 1, Kota" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary" id="btn-save-tenant">
              {saving ? 'Menyimpan...' : 'Simpan Penghuni'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={modalMode === 'detail'} onClose={closeModal} title="Detail Penghuni" size="lg">
        {modalLoading || !activeTenant ? (
          <PageLoader />
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-navy-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">{activeTenant.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{activeTenant.name}</h2>
                <Badge status={activeTenant.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="No HP" value={activeTenant.no_hp} />
              <InfoRow label="No Identitas (KTP)" value={activeTenant.no_identitas} />
              <InfoRow label="Pekerjaan" value={activeTenant.pekerjaan} />
              <InfoRow label="Kontak Darurat" value={activeTenant.kontak_darurat} />
              <InfoRow label="Alamat" value={activeTenant.alamat} />
              <InfoRow label="Terdaftar Sejak" value={formatDate(activeTenant.created_at)} />
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => openEdit(activeTenant.id)} className="btn-primary btn-sm" id={`btn-edit-tenant-detail-${activeTenant.id}`}>Edit</button>
              <button onClick={() => setDeleteTarget(activeTenant)} className="btn btn-danger btn-sm" id={`btn-delete-tenant-detail-${activeTenant.id}`}>
                Hapus Penghuni
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalMode === 'edit'} onClose={closeModal} title="Edit Penghuni" size="lg">
        {modalLoading ? (
          <PageLoader />
        ) : (
          <>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.general}</div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="e-name">Nama Lengkap *</label>
                  <input id="e-name" name="name" value={form.name} onChange={handleChange}
                    className={`input ${errors.name ? 'input-error' : ''}`} />
                  <FieldError error={errors.name?.[0]} />
                </div>
                <div>
                  <label className="label" htmlFor="e-no_hp">No HP</label>
                  <input id="e-no_hp" name="no_hp" value={form.no_hp} onChange={handleChange} className="input" />
                  <FieldError error={errors.no_hp?.[0]} />
                </div>
                <div>
                  <label className="label" htmlFor="e-no_identitas">No Identitas</label>
                  <input id="e-no_identitas" name="no_identitas" value={form.no_identitas} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="e-pekerjaan">Pekerjaan</label>
                  <input id="e-pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="e-kontak_darurat">Kontak Darurat</label>
                  <input id="e-kontak_darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="e-status">Status</label>
                  <select id="e-status" name="status" value={form.status} onChange={handleChange} className="input">
                    <option value="aktif">Aktif</option>
                    <option value="tidak_aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="e-alamat">Alamat</label>
                <textarea id="e-alamat" name="alamat" value={form.alamat} onChange={handleChange}
                  className="input resize-none" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" id="btn-save-tenant-edit">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Penghuni"
        message={`Apakah Anda yakin ingin menghapus penghuni "${deleteTarget?.name}"?`}
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  );
}