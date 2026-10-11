import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useToast } from '../components/Toast';
import EmailRecipientModal from '../components/EmailRecipientModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payInvoiceModal, setPayInvoiceModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [emailInvoice, setEmailInvoice] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { showToast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/invoices?limit=100');
      setInvoices(data);
    } catch (err) {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payInvoiceModal || paymentAmount <= 0) return;
    try {
      await apiClient.post(`/invoices/${payInvoiceModal.id}/pay`, { amount: parseFloat(paymentAmount) });
      showToast(`Payment of $${paymentAmount} recorded on ${payInvoiceModal.invoice_number}!`, 'success');
      setPayInvoiceModal(null);
      fetchInvoices();
    } catch (err) {
      showToast('Failed to record payment', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice record?')) return;
    try {
      await apiClient.delete(`/invoices/${id}`);
      showToast('Invoice deleted', 'success');
      fetchInvoices();
    } catch (err) {
      showToast('Failed to delete invoice', 'error');
    }
  };

  const handleEmailInvoice = async (email) => {
    try {
      setSendingEmail(true);
      await apiClient.post('/notifications/send-invoice', {
        to_email: email,
        entity_number: emailInvoice.invoice_number,
        customer_name: "Valued Customer",
        total_amount: emailInvoice.total_amount
      });
      showToast(`Invoice #${emailInvoice.invoice_number} dispatched to ${email}!`, 'success');
      return true;
    } catch (err) {
      showToast('Failed to dispatch invoice email', 'error');
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>🧾 Invoicing & Billing</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Track issued customer invoices, record payments, and manage balance dues</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading customer invoices...</div>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', color: '#94a3b8' }}>
          No invoices issued yet. Convert an accepted Quotation from the Quotations page to create an invoice.
        </div>
      ) : (
        <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 18px' }}>Invoice #</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Issue Date</th>
                <th style={{ padding: '14px 18px' }}>Total Amount</th>
                <th style={{ padding: '14px 18px' }}>Paid Amount</th>
                <th style={{ padding: '14px 18px' }}>Balance Due</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const due = Math.max(inv.total_amount - (inv.paid_amount || 0), 0);
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#38bdf8' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : inv.status === 'Issued' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: inv.status === 'Paid' ? '#34d399' : inv.status === 'Issued' ? '#38bdf8' : '#f87171',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#4ade80' }}>${inv.total_amount.toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>${(inv.paid_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: due > 0 ? '#f87171' : '#34d399' }}>${due.toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {due > 0 && (
                        <button
                          onClick={() => { setPayInvoiceModal(inv); setPaymentAmount(due); }}
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          💳 Record Payment
                        </button>
                      )}
                      <button onClick={() => setEmailInvoice(inv)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', marginRight: '10px', fontWeight: 600 }}>📧 Email</button>
                      <button onClick={() => handleDelete(inv.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payInvoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff' }}>Record Payment: {payInvoiceModal.invoice_number}</h3>
            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setPayInvoiceModal(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#10b981', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {emailInvoice && (
        <EmailRecipientModal
          documentType="Invoice"
          documentNumber={emailInvoice.invoice_number}
          isSubmitting={sendingEmail}
          onClose={() => setEmailInvoice(null)}
          onSubmit={handleEmailInvoice}
        />
      )}
    </div>
  );
}
