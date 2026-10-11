import React, { useState } from 'react';

export default function EmailRecipientModal({
  documentType,
  documentNumber,
  isSubmitting,
  onClose,
  onSubmit
}) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const recipient = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      setValidationError('Enter a valid customer email address.');
      return;
    }

    setValidationError('');
    const sent = await onSubmit(recipient);
    if (sent) onClose();
  };

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-recipient-title"
        style={{
          background: '#1e293b',
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <h3 id="email-recipient-title" style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#fff' }}>
          Email {documentType} {documentNumber}
        </h3>
        <p style={{ margin: '0 0 18px', color: '#94a3b8', fontSize: '0.9rem' }}>
          Enter the customer email address to send this {documentType.toLowerCase()}.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="email-recipient" style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            Customer email
          </label>
          <input
            id="email-recipient"
            type="text"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setValidationError('');
            }}
            placeholder="name@example.com"
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? 'email-recipient-error' : undefined}
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: '8px',
              border: `1px solid ${validationError ? '#ef4444' : 'rgba(255,255,255,0.18)'}`,
              background: '#0f172a',
              color: '#fff',
              fontSize: '0.95rem'
            }}
          />
          {validationError && (
            <span id="email-recipient-error" role="alert" style={{ color: '#fca5a5', fontSize: '0.8rem' }}>
              {validationError}
            </span>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Sending…' : 'Send email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
