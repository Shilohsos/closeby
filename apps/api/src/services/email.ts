import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendApprovalEmail(params: {
  to: string;
  eventTitle: string;
  eventDate: string;
  organizerName: string;
  paymentProofUrl: string;
  approveUrl: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #15803d;">Hush — New Event Pending Approval</h1>
      <p><strong>Event:</strong> ${params.eventTitle}</p>
      <p><strong>Date:</strong> ${params.eventDate}</p>
      <p><strong>Organizer:</strong> ${params.organizerName}</p>
      <p><strong>Payment Proof:</strong></p>
      <img src="${params.paymentProofUrl}" alt="Payment Proof" style="max-width: 100%; border-radius: 8px;" />
      <br /><br />
      <a href="${params.approveUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #15803d; color: white;
                text-decoration: none; border-radius: 8px; font-size: 16px;">
        ✅ Approve This Event
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: `"Close By" <${process.env.GMAIL_USER}>`,
    to: params.to,
    subject: `Hush — Approve: ${params.eventTitle}`,
    html,
  });
}
