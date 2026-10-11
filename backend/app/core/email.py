import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email: str, subject: str, body_html: str) -> bool:
    """
    Sends an email using standard SMTP.
    If SMTP parameters are not configured in settings/env, logs a graceful simulated message.
    """
    smtp_server = getattr(settings, 'SMTP_SERVER', None) or 'smtp.gmail.com'
    smtp_port = getattr(settings, 'SMTP_PORT', 587)
    smtp_user = getattr(settings, 'SMTP_USER', None)
    smtp_password = getattr(settings, 'SMTP_PASSWORD', None)

    if not smtp_user or not smtp_password:
        print(f"📧 [Email Notification Simulated]\nTo: {to_email}\nSubject: {subject}\nContent:\n{body_html[:200]}...")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_email

        html_part = MIMEText(body_html, "html")
        msg.attach(html_part)

        with smtplib.SMTP(smtp_server, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())

        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"⚠️ Email send failed: {e}")
        return False

def send_quote_email(to_email: str, quote_number: str, customer_name: str, total_amount: float):
    subject = f"Commercial Proposal & Quotation #{quote_number} - CRM 360"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #4f46e5;">CRM 360 Commercial Proposal</h2>
        <p>Dear {customer_name},</p>
        <p>Thank you for your interest in our products and services. Please find below the details for Quotation <strong>#{quote_number}</strong>:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Quote Number:</strong> {quote_number}</p>
            <p><strong>Total Amount:</strong> ${total_amount:,.2f}</p>
        </div>
        <p>Please log in to your account or contact your sales executive to review full terms and proceed.</p>
        <p>Best regards,<br><strong>CRM 360 Sales Team</strong></p>
    </div>
    """
    return send_email(to_email, subject, html)

def send_invoice_email(to_email: str, invoice_number: str, customer_name: str, due_amount: float):
    subject = f"Invoice #{invoice_number} Issued - CRM 360 Billing"
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #059669;">CRM 360 Invoice Issued</h2>
        <p>Dear {customer_name},</p>
        <p>This is a notification that Invoice <strong>#{invoice_number}</strong> has been generated for your account.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Invoice Number:</strong> {invoice_number}</p>
            <p><strong>Balance Due:</strong> ${due_amount:,.2f}</p>
        </div>
        <p>Thank you for your business!</p>
    </div>
    """
    return send_email(to_email, subject, html)
