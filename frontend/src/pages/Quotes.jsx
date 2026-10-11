import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useToast } from '../components/Toast';
import EmailRecipientModal from '../components/EmailRecipientModal';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [emailQuote, setEmailQuote] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    quote_number: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
    notes: 'Commercial terms apply. Valid for 30 days.',
    discount_amount: 0,
    items: [
      { product_id: null, product_name: '', quantity: 1, unit_price: 0, discount_percent: 0, total_price: 0 }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        apiClient.get('/quotes?limit=100'),
        apiClient.get('/products?limit=200')
      ]);
      setQuotes(qRes);
      setProducts(pRes);
    } catch (err) {
      showToast('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (index, productId) => {
    const prod = products.find((p) => p.id === parseInt(productId));
    const newItems = [...formData.items];
    if (prod) {
      newItems[index] = {
        ...newItems[index],
        product_id: prod.id,
        product_name: prod.name,
        unit_price: prod.unit_price,
        total_price: newItems[index].quantity * prod.unit_price
      };
    } else {
      newItems[index].product_id = null;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    const qty = parseFloat(newItems[index].quantity) || 0;
    const price = parseFloat(newItems[index].unit_price) || 0;
    const disc = parseFloat(newItems[index].discount_percent) || 0;
    newItems[index].total_price = (qty * price) * (1 - disc / 100);
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: null, product_name: '', quantity: 1, unit_price: 0, discount_percent: 0, total_price: 0 }]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((acc, item) => acc + (parseFloat(item.total_price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/quotes', formData);
      showToast('Quotation created successfully!', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create quote', 'error');
    }
  };

  const handleConvertToInvoice = async (quoteId) => {
    try {
      const invoice = await apiClient.post(`/quotes/${quoteId}/convert-to-invoice`);
      showToast(`Success! Converted Quote to Invoice #${invoice.invoice_number}`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to convert quote to invoice', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation record?')) return;
    try {
      await apiClient.delete(`/quotes/${id}`);
      showToast('Quotation deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete quote', 'error');
    }
  };

  const handleEmailQuote = async (email) => {
    try {
      setSendingEmail(true);
      await apiClient.post('/notifications/send-quote', {
        to_email: email,
        entity_number: emailQuote.quote_number,
        customer_name: "Valued Customer",
        total_amount: emailQuote.total_amount
      });
      showToast(`Quotation #${emailQuote.quote_number} dispatched to ${email}!`, 'success');
      return true;
    } catch (err) {
      showToast('Failed to dispatch quotation email', 'error');
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>📜 Quotations & Proposals</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Create formal customer quotes, calculate taxes, and convert to invoices</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          ➕ Create New Quote
        </button>
      </div>

      {/* Quotes List Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading quotations...</div>
      ) : quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', color: '#94a3b8' }}>
          No quotations created yet. Click "Create New Quote" to get started.
        </div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px' }}>Quote #</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Subtotal</th>
                <th style={{ padding: '14px 18px' }}>Tax (18%)</th>
                <th style={{ padding: '14px 18px' }}>Total Amount</th>
                <th style={{ padding: '14px 18px' }}>Created Date</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#38bdf8' }}>{q.quote_number}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: q.status === 'Accepted' ? 'rgba(16, 185, 129, 0.2)' : q.status === 'Sent' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: q.status === 'Accepted' ? '#34d399' : q.status === 'Sent' ? '#38bdf8' : '#fbbf24',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {q.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>${q.subtotal.toLocaleString()}</td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>${q.tax_amount.toLocaleString()}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#4ade80', fontSize: '1.05rem' }}>${q.total_amount.toLocaleString()}</td>
                  <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{new Date(q.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button onClick={() => setPreviewQuote(q)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: '10px', fontWeight: 600 }}>👁️ View</button>
                    <button onClick={() => setEmailQuote(q)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', marginRight: '10px', fontWeight: 600 }}>📧 Email</button>
                    <button onClick={() => handleConvertToInvoice(q.id)} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#818cf8', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px', fontWeight: 600, fontSize: '0.78rem' }}>🧾 Convert to Invoice</button>
                    <button onClick={() => handleDelete(q.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quote Preview Modal */}
      {previewQuote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', color: '#0f172a', width: '100%', maxWidth: '700px', padding: '32px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#4f46e5', fontWeight: 800 }}>CRM 360 Enterprise</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Commercial Proposal / Quotation</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{previewQuote.quote_number}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Date: {new Date(previewQuote.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {previewQuote.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{item.product_name}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>${item.unit_price.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>${item.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px' }}>
                <strong>Notes:</strong> {previewQuote.notes || 'N/A'}
              </div>
              <div style={{ width: '220px', textAlign: 'right', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <strong>${previewQuote.subtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b' }}>
                  <span>Tax (18%):</span>
                  <span>+${previewQuote.tax_amount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', padding: '8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5' }}>
                  <span>Total:</span>
                  <span>${previewQuote.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => window.print()} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>🖨️ Print Quote</button>
              <button onClick={() => setPreviewQuote(null)} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Quote Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff' }}>Create Commercial Quotation</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Quote Number</label>
                <input type="text" required value={formData.quote_number} onChange={(e) => setFormData({ ...formData, quote_number: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }} />
              </div>

              {/* Line Items Builder */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>Line Items</label>
                {formData.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <select
                      value={item.product_id || ''}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="">-- Custom Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (${p.unit_price})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <div style={{ fontWeight: 700, color: '#4ade80', textAlign: 'right', fontSize: '0.9rem' }}>
                      ${(item.total_price || 0).toLocaleString()}
                    </div>
                    <button type="button" onClick={() => removeItemRow(idx)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#f87171', borderRadius: '6px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={addItemRow} style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1', color: '#818cf8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', marginTop: '6px' }}>+ Add Item Line</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>Calculated Subtotal:</span>
                <strong style={{ color: '#4ade80', fontSize: '1.1rem' }}>${calculateSubtotal().toLocaleString()}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Terms & Notes</label>
                <textarea rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#10b981', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Generate Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {emailQuote && (
        <EmailRecipientModal
          documentType="Quotation"
          documentNumber={emailQuote.quote_number}
          isSubmitting={sendingEmail}
          onClose={() => setEmailQuote(null)}
          onSubmit={handleEmailQuote}
        />
      )}
    </div>
  );
}
