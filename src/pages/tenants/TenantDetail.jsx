import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { formatDate } from '../../utils/formatDate';
import { useToast } from '../../components/ui/Toast';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import ConfirmModal from '../../components/ui/ConfirmModal';

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="font-medium text-slate-700">{value || '-'}</p>
    </div>
  );
}

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await tenantService.getTenant(id);
        setTenant(res.data.data);
      } catch (err) {
        addToast(err.response?.data?.message || 'Data tidak ditemukan.', 'error');
        navigate('/tenants');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, addToast, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tenantService.deleteTenant(id);
      addToast('Penghuni berhasil dihapus.', 'success');
      navigate('/tenants');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Detail Penghuni"
        subtitle={tenant.name}
        action={
          <div className="flex gap-2">
            <Link to="/tenants" className="btn btn-secondary">Kembali</Link>
            <Link to={`/tenants/${id}/edit`} className="btn-primary" id={`btn-edit-tenant-${id}`}>Edit</Link>
          </div>
        }
      />

      <div className="card">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-navy-800 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{tenant.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{tenant.name}</h2>
              <Badge status={tenant.status} />
            </div>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="No HP" value={tenant.no_hp} />
          <InfoRow label="No Identitas (KTP)" value={tenant.no_identitas} />
          <InfoRow label="Pekerjaan" value={tenant.pekerjaan} />
          <InfoRow label="Kontak Darurat" value={tenant.kontak_darurat} />
          <InfoRow label="Alamat" value={tenant.alamat} />
          <InfoRow label="Terdaftar Sejak" value={formatDate(tenant.created_at)} />
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end">
          <button onClick={() => setShowDelete(true)} className="btn btn-danger btn-sm" id={`btn-delete-tenant-${id}`}>
            Hapus Penghuni
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Penghuni"
        message={`Apakah Anda yakin ingin menghapus penghuni "${tenant.name}"?`}
        confirmText="Ya, Hapus"
        loading={deleting}
      />
    </div>
  );
}
