import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useToast } from '../components/Toast';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    entity_type: 'general',
    entity_id: '',
    description: ''
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let url = '/documents?limit=200';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (entityFilter) url += `&entity_type=${encodeURIComponent(entityFilter)}`;
      const data = await apiClient.get(url);
      setDocuments(data);
    } catch (err) {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search, entityFilter]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file to upload', 'warning');
      return;
    }

    try {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title || selectedFile.name);
      data.append('entity_type', formData.entity_type);
      if (formData.entity_id) data.append('entity_id', formData.entity_id);
      if (formData.description) data.append('description', formData.description);

      await apiClient.post('/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Document uploaded successfully!', 'success');
      setShowModal(false);
      setSelectedFile(null);
      setFormData({ title: '', entity_type: 'general', entity_id: '', description: '' });
      fetchDocuments();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to upload file', 'error');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      showToast('Failed to download document', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await apiClient.delete(`/documents/${id}`);
      showToast('Document deleted', 'success');
      fetchDocuments();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📁 Document & Attachment Vault</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Upload proposals, contracts, customer NDAs, and lead attachments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          📤 Upload Document
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search documents by title, file name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,41,59,0.7)', color: '#fff' }}
        />
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,41,59,0.7)', color: '#fff' }}
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="lead">Lead Attachment</option>
          <option value="opportunity">Opportunity Contract</option>
          <option value="account">Account Document</option>
          <option value="quote">Quotation PDF</option>
          <option value="invoice">Invoice PDF</option>
        </select>
      </div>

      {/* Documents List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading document vault...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', color: '#94a3b8' }}>
          No documents found. Click "Upload Document" to attach files.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    📄
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.file_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
                    {doc.entity_type}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', fontSize: '0.75rem' }}>
                    {(doc.file_size / 1024).toFixed(1)} KB
                  </span>
                </div>
                {doc.description && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 12px 0' }}>{doc.description}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '8px' }}>
                <button onClick={() => handleDownload(doc)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  ⬇️ Download
                </button>
                <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff' }}>Upload Attachment Document</h3>
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Select File</label>
                <input type="file" required onChange={(e) => setSelectedFile(e.target.files[0])} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Document Title</label>
                <input type="text" placeholder="e.g. Master Service Agreement NDA" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Category / Link Entity</label>
                <select value={formData.entity_type} onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }}>
                  <option value="general">General Attachment</option>
                  <option value="lead">Lead Attachment</option>
                  <option value="opportunity">Opportunity Contract</option>
                  <option value="account">Account Customer File</option>
                  <option value="quote">Quotation File</option>
                  <option value="invoice">Invoice Receipt</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
