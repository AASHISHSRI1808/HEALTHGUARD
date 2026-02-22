const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailService = {

  // ── Send Prediction Report ─────────────────────────────
  async sendPredictionReport(email, name, prediction) {
    const riskColor =
      prediction.result.riskLevel === 'High' ? '#ef4444' :
      prediction.result.riskLevel === 'Very High' ? '#dc2626' :
      prediction.result.riskLevel === 'Moderate' ? '#f59e0b' : '#22c55e';

    const html = `
      <h2>🏥 Health Guard - Prediction Report</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your prediction report is ready.</p>
      <ul>
        <li><strong>Disease:</strong> ${prediction.diseaseType}</li>
        <li><strong>Prediction:</strong> ${prediction.result.prediction}</li>
        <li><strong>Probability:</strong> ${prediction.result.probability}%</li>
        <li><strong>Risk Level:</strong> 
          <span style="color:${riskColor}; font-weight:bold;">
            ${prediction.result.riskLevel}
          </span>
        </li>
      </ul>
      <p><strong>Report ID:</strong> ${prediction.reportId}</p>
      <p>This is AI generated. Please consult a doctor.</p>
    `;

    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Health Guard – ${prediction.diseaseType} Prediction Report`,
      html
    });

    console.log("✅ Prediction Email Sent");
  },

  // ── Appointment Confirmation ───────────────────────────
  async sendAppointmentConfirmation(appointment) {
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;

    const html = `
      <h2>📅 Appointment Booked</h2>
      <p>Dear ${patient.name},</p>
      <p>Your appointment with <strong>Dr. ${doctor.name}</strong> has been booked.</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</li>
        <li><strong>Time:</strong> ${appointment.timeSlot}</li>
        <li><strong>Hospital:</strong> ${doctor.hospitalName}, ${doctor.city}</li>
        <li><strong>Amount Paid:</strong> ₹${appointment.amount}</li>
      </ul>
      <p>Status: Pending confirmation by doctor.</p>
    `;

    await sgMail.send({
      to: patient.email,
      from: process.env.EMAIL_FROM,
      subject: "Health Guard – Appointment Booked Successfully",
      html
    });

    console.log("✅ Appointment Confirmation Email Sent");
  },

  // ── Appointment Status Update ──────────────────────────
  async sendAppointmentStatusUpdate(appointment, newStatus) {
    const patient = appointment.patientId;
    const doctor = appointment.doctorId;

    if (!patient?.email) return;

    const html = `
      <h2>Appointment ${newStatus}</h2>
      <p>Dear ${patient.name},</p>
      <p>Your appointment with <strong>Dr. ${doctor.name}</strong> is now <strong>${newStatus}</strong>.</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toDateString()}</li>
        <li><strong>Time:</strong> ${appointment.timeSlot}</li>
        <li><strong>Amount:</strong> ₹${appointment.amount}</li>
      </ul>
    `;

    await sgMail.send({
      to: patient.email,
      from: process.env.EMAIL_FROM,
      subject: `Health Guard – Appointment ${newStatus}`,
      html
    });

    console.log("✅ Appointment Status Email Sent");
  },

  // ── Doctor Approval / Rejection ────────────────────────
  async sendDoctorApprovalEmail(email, name, status, reason = '') {
    const isApproved = status === 'approved';

    const html = `
      <h2>${isApproved ? "Application Approved ✅" : "Application Rejected ❌"}</h2>
      <p>Dear Dr. ${name},</p>
      ${
        isApproved
          ? "<p>Your registration has been approved. You can now login to Health Guard.</p>"
          : `<p>Your registration was rejected.</p>
             ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}`
      }
    `;

    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Health Guard – Doctor Registration ${isApproved ? "Approved" : "Update"}`,
      html
    });

    console.log("✅ Doctor Status Email Sent");
  }

};

module.exports = emailService;
