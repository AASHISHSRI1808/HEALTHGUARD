import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Download, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PredictionResult() {
  const { id } = useParams();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/predictions/${id}`)
      .then(res => setPrediction(res.data.prediction))
      .catch(() => navigate(isDoctor ? '/doctor-dashboard' : '/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/predictions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `HealthGuard_Report_${prediction.reportId}.pdf`;
      a.click();
    } catch (err) {
      alert('PDF download failed. Please try again.');
    }
  };

  const getRiskConfig = (level) => ({
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '✅', msg: 'Low risk detected. Continue maintaining healthy habits.' },
    Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⚠️', msg: 'Moderate risk. Consult a doctor and monitor your health.' },
    High: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨', msg: 'High risk detected! Immediate medical consultation recommended.' },
    'Very High': { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', icon: '🆘', msg: 'Very High risk! Seek emergency medical attention immediately.' }
  }[level] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', icon: 'ℹ️', msg: '' });

  if (loading) return (
    <div className="page-container">
      <Navbar />
      <div className="loading-container" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px', borderWidth: '3px' }} />
        <p>Loading prediction report...</p>
      </div>
    </div>
  );

  if (!prediction) return null;

  const riskConfig = getRiskConfig(prediction.result?.riskLevel);
  const isPositive = prediction.result?.prediction === 'Positive';
  const specialistMap = { Heart: 'Cardiologist', Liver: 'Hepatologist', Parkinson: 'Neurologist' };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper" style={{ maxWidth: '900px' }}>

        {/* Result Banner */}
        <div style={{
          padding: '32px', borderRadius: '20px',
          background: isPositive ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.05)',
          border: `1px solid ${isPositive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: isPositive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
            {prediction.diseaseType === 'Heart' ? '❤️' : prediction.diseaseType === 'Liver' ? '🫀' : '🧠'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {prediction.diseaseType} Disease Analysis
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: isPositive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: isPositive ? '#ef4444' : '#10b981', padding: '6px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '16px' }}>
                {isPositive ? '⚠️ Positive' : '✅ Negative'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Report ID: {prediction.reportId}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{new Date(prediction.createdAt).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleDownloadPDF} className="btn btn-secondary" style={{ gap: '8px' }}>
              <Download size={16} /> Download PDF
            </button>
            {/* Book Doctor button — patients only */}
            {!isDoctor && (
              <Link to={`/doctors?specialization=${specialistMap[prediction.diseaseType]}`} className="btn btn-primary">
                Book Doctor <ArrowRight size={16} />
              </Link>
            )}
            {/* Doctor: back to dashboard */}
            {isDoctor && (
              <button onClick={() => navigate('/doctor-dashboard')} className="btn btn-primary">
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Probability */}
          <div className="card">
            <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Prediction Probability</h3>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="54" fill="none"
                    stroke={riskConfig.color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(prediction.result?.probability / 100) * 339.3} 339.3`}
                    style={{ transition: 'stroke-dasharray 1.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: riskConfig.color }}>{prediction.result?.probability}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Probability</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${prediction.result?.probability}%`, background: riskConfig.color }} />
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="card" style={{ background: riskConfig.bg, border: `1px solid ${riskConfig.border}` }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Risk Assessment</h3>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{riskConfig.icon}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: riskConfig.color, marginBottom: '12px' }}>
                {prediction.result?.riskLevel} Risk
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{riskConfig.msg}</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Patient Information</h3>
          <div className="grid-4">
            {[
              { label: 'Patient Name', val: prediction.patientName },
              { label: 'Disease Type', val: `${prediction.diseaseType} Disease` },
              { label: 'Report ID', val: prediction.reportId },
              { label: 'Date & Time', val: new Date(prediction.createdAt).toLocaleString('en-IN') }
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-raised)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Parameters */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Input Parameters</h3>
          <div className="grid-3">
            {Object.entries(prediction.inputParameters || {}).map(([key, val]) => (
              <div key={key} style={{ padding: '12px 16px', background: 'var(--bg-raised)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{key}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>📋 Medical Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {prediction.recommendations?.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'var(--bg-raised)', borderRadius: '10px' }}>
                <CheckCircle size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="alert alert-warning" style={{ marginBottom: '32px' }}>
          <AlertTriangle size={20} />
          <span><strong>Medical Disclaimer:</strong> This AI prediction is for informational purposes only and should not replace professional medical advice. Please consult a qualified doctor for proper diagnosis and treatment.</span>
        </div>

        {/* CTA — patients only */}
        {!isDoctor && isPositive && (
          <div style={{ padding: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              🏥 We Recommend Consulting a {specialistMap[prediction.diseaseType]}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Based on the prediction results, we suggest booking an appointment with a specialist.
            </p>
            <Link to={`/doctors?specialization=${specialistMap[prediction.diseaseType]}&predictionId=${id}`} className="btn btn-primary btn-lg">
              Find {specialistMap[prediction.diseaseType]}s Near You <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
