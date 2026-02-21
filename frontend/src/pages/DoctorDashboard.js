import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Download, Eye, Calendar, Clock, User, Phone, Activity } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, statsRes] = await Promise.all([
        api.get('/doctors/dashboard/appointments'),
        api.get('/doctors/dashboard/stats')
      ]);
      setAppointments(apptRes.data.appointments || []);
      setDoctorProfile(apptRes.data.doctorProfile);
      setStats(statsRes.data.stats || {});
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/doctors/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDownloadPDF = async (predictionId, reportId) => {
    try {
      const res = await api.get(`/predictions/${predictionId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `HealthGuard_${reportId || 'Report'}.pdf`;
      a.click();
      toast.success('Report downloaded!');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const filtered = activeTab === 'all' ? appointments : appointments.filter(a => a.status === activeTab);

  const statusConfig = {
    Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    Confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    Completed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
  };

  const riskColors = { Low: '#10b981', Moderate: '#f59e0b', High: '#ef4444', 'Very High': '#dc2626' };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
              👨‍⚕️
            </div>
            <div>
              <h1 className="page-title" style={{ marginBottom: '4px' }}>Dr. {user?.name}</h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {doctorProfile && (
                  <>
                    <span className="badge badge-info">{doctorProfile.specialization}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>🏥 {doctorProfile.hospitalName}, {doctorProfile.city}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>⭐ {doctorProfile.rating} Rating</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/predict')} className="btn btn-primary" style={{ gap: '8px' }}>
            🔬 New Patient Prediction
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {[
            { icon: '📅', label: 'Total Appointments', val: stats.total || 0, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { icon: '✅', label: 'Confirmed', val: stats.confirmed || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { icon: '⏳', label: 'Pending', val: stats.pending || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: '🏁', label: 'Completed', val: stats.completed || 0, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, fontSize: '26px' }}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action — Run Patient Prediction */}
        <div style={{ marginBottom: '32px' }}>
          <Link to="/doctor-predict" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 28px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(59,130,246,0.35)', borderRadius: '16px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ width: '52px', height: '52px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                🔬
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Run AI Prediction for a Patient
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Enter patient name &amp; clinical values → Instant AI diagnosis report (Heart, Liver, Parkinson's)
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                Start →
              </div>
            </div>
          </Link>
        </div>

        {/* Appointment Detail Modal */}
        {selectedAppt && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => setSelectedAppt(null)}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Appointment Details</h2>
                <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>

              {/* Patient Info */}
              <div style={{ background: 'var(--bg-raised)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Patient Information</h3>
                <div className="grid-2">
                  {[
                    { icon: <User size={14} />, label: 'Name', val: selectedAppt.patientId?.name },
                    { icon: <Phone size={14} />, label: 'Contact', val: selectedAppt.patientId?.mobile },
                    { icon: '📧', label: 'Email', val: selectedAppt.patientId?.email },
                    { icon: '🩸', label: 'Age/Gender', val: `${selectedAppt.patientId?.age || '?'} yrs / ${selectedAppt.patientId?.gender || '?'}` },
                    { icon: <Calendar size={14} />, label: 'Date', val: new Date(selectedAppt.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: <Clock size={14} />, label: 'Time Slot', val: selectedAppt.timeSlot },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.icon} {item.label}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.val || '—'}</div>
                    </div>
                  ))}
                </div>
                {selectedAppt.notes && (
                  <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>PATIENT NOTES</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedAppt.notes}</div>
                  </div>
                )}
              </div>

              {/* Prediction Info */}
              {selectedAppt.predictionId && (
                <div style={{ background: 'var(--bg-raised)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prediction Analysis</h3>
                  <div className="grid-2">
                    {[
                      { label: 'Report ID', val: selectedAppt.predictionId?.reportId },
                      { label: 'Disease Type', val: `${selectedAppt.predictionId?.diseaseType} Disease` },
                      { label: 'Prediction Result', val: selectedAppt.predictionId?.result?.prediction },
                      { label: 'Probability', val: `${selectedAppt.predictionId?.result?.probability}%` },
                      { label: 'Risk Level', val: selectedAppt.predictionId?.result?.riskLevel },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: item.label === 'Prediction Result' ? (item.val === 'Positive' ? '#ef4444' : '#10b981') : item.label === 'Risk Level' ? (riskColors[item.val] || 'var(--text-primary)') : 'var(--text-primary)' }}>
                          {item.val || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => handleDownloadPDF(selectedAppt.predictionId._id, selectedAppt.predictionId.reportId)}
                    className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                    <Download size={14} /> Download Patient Report PDF
                  </button>
                </div>
              )}

              {/* Payment Info */}
              <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--bg-raised)', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>PAYMENT STATUS</div>
                  <span className={`badge badge-${selectedAppt.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                    💳 {selectedAppt.paymentStatus}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>AMOUNT</div>
                  <span style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: '#10b981' }}>₹{selectedAppt.amount}</span>
                </div>
              </div>

              {/* Status Actions */}
              {selectedAppt.status !== 'Cancelled' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedAppt.status === 'Confirmed' && (
                    <button onClick={() => { handleStatusUpdate(selectedAppt._id, 'Completed'); setSelectedAppt(null); }}
                      className="btn btn-primary" style={{ flex: 1 }}>
                      🏁 Mark as Completed
                    </button>
                  )}
                  {selectedAppt.status === 'Pending' && (
                    <button onClick={() => { handleStatusUpdate(selectedAppt._id, 'Confirmed'); setSelectedAppt(null); }}
                      className="btn btn-success" style={{ flex: 1 }}>
                      ✅ Confirm Appointment
                    </button>
                  )}
                  {(selectedAppt.status === 'Pending' || selectedAppt.status === 'Confirmed') && (
                    <button onClick={() => {
                      if (window.confirm(`Cancel appointment for ${selectedAppt.patientId?.name}?`)) {
                        handleStatusUpdate(selectedAppt._id, 'Cancelled');
                        setSelectedAppt(null);
                      }
                    }} className="btn btn-danger" style={{ flex: 1 }}>
                      ✕ Cancel Appointment
                    </button>
                  )}
                </div>
              )}
              {selectedAppt.status === 'Cancelled' && (
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: '#ef4444', fontWeight: 600, fontSize: '14px' }}>
                  ✕ This appointment has been cancelled
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-raised)', padding: '4px', borderRadius: '12px', width: 'fit-content', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All', count: appointments.length },
            { key: 'Pending', label: '⏳ Pending', count: appointments.filter(a => a.status === 'Pending').length },
            { key: 'Confirmed', label: '✅ Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length },
            { key: 'Completed', label: '🏁 Completed', count: appointments.filter(a => a.status === 'Completed').length },
            { key: 'Cancelled', label: '❌ Cancelled', count: appointments.filter(a => a.status === 'Cancelled').length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', fontFamily: 'Outfit',
                background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
            <p>Loading appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '60px' }}>📅</span>
            <h3 style={{ fontFamily: 'Outfit', marginTop: '20px', color: 'var(--text-secondary)' }}>No appointments found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(appt => {
              const sc = statusConfig[appt.status] || statusConfig.Pending;
              const pred = appt.predictionId;
              return (
                <div key={appt._id} className="card" style={{ border: `1px solid ${sc.border}` }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Patient Avatar */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: '#3b82f6', flexShrink: 0 }}>
                      {appt.patientId?.name?.charAt(0) || 'P'}
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {appt.patientId?.name}
                        </h3>
                        <span className="badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                          {appt.status}
                        </span>
                        {appt.paymentStatus === 'Paid' && (
                          <span className="badge badge-success" style={{ fontSize: '11px' }}>💳 Paid ₹{appt.amount}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <Calendar size={13} /> {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <Clock size={13} /> {appt.timeSlot}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          📞 {appt.patientId?.mobile}
                        </span>
                      </div>

                      {/* Report available indicator (no prediction data shown) */}
                      {pred && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '13px' }}>📋</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Report available — click View Details</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => setSelectedAppt(appt)} className="btn btn-secondary btn-sm">
                        <Eye size={13} /> View Details
                      </button>
                      {pred && (
                        <button onClick={() => handleDownloadPDF(pred._id || pred, pred.reportId)} className="btn btn-primary btn-sm">
                          <Download size={13} /> PDF Report
                        </button>
                      )}
                      {appt.status === 'Pending' && (
                        <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} className="btn btn-success btn-sm">
                          ✅ Confirm
                        </button>
                      )}
                      {appt.status === 'Confirmed' && (
                        <button onClick={() => handleStatusUpdate(appt._id, 'Completed')} className="btn btn-secondary btn-sm">
                          🏁 Complete
                        </button>
                      )}
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                        <button onClick={() => {
                          if (window.confirm(`Cancel appointment for ${appt.patientId?.name}?`)) {
                            handleStatusUpdate(appt._id, 'Cancelled');
                          }
                        }} className="btn btn-danger btn-sm">
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
