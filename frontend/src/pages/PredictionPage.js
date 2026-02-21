import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react';

const DISEASES = {
  Heart: {
    icon: '❤️', color: '#ef4444', model: 'Random Forest',
    description: 'Predict heart disease risk using 13 clinical parameters',
    fields: [
      { key: 'age', label: 'Age', type: 'number', placeholder: '50', unit: 'years' },
      { key: 'sex', label: 'Sex', type: 'select', options: [{ val: 1, label: 'Male' }, { val: 0, label: 'Female' }] },
      { key: 'cp', label: 'Chest Pain Type', type: 'select', options: [{ val: 0, label: '0 - Typical Angina' }, { val: 1, label: '1 - Atypical Angina' }, { val: 2, label: '2 - Non-Anginal' }, { val: 3, label: '3 - Asymptomatic' }] },
      { key: 'trestbps', label: 'Resting Blood Pressure', type: 'number', placeholder: '120', unit: 'mmHg' },
      { key: 'chol', label: 'Serum Cholesterol', type: 'number', placeholder: '200', unit: 'mg/dl' },
      { key: 'fbs', label: 'Fasting Blood Sugar > 120 mg/dl', type: 'select', options: [{ val: 1, label: 'Yes' }, { val: 0, label: 'No' }] },
      { key: 'restecg', label: 'Resting ECG Results', type: 'select', options: [{ val: 0, label: '0 - Normal' }, { val: 1, label: '1 - ST-T Abnormality' }, { val: 2, label: '2 - LV Hypertrophy' }] },
      { key: 'thalach', label: 'Maximum Heart Rate', type: 'number', placeholder: '150', unit: 'bpm' },
      { key: 'exang', label: 'Exercise Induced Angina', type: 'select', options: [{ val: 1, label: 'Yes' }, { val: 0, label: 'No' }] },
      { key: 'oldpeak', label: 'ST Depression', type: 'number', placeholder: '1.0', unit: 'mm', step: '0.1' },
      { key: 'slope', label: 'Slope of ST Segment', type: 'select', options: [{ val: 0, label: '0 - Upsloping' }, { val: 1, label: '1 - Flat' }, { val: 2, label: '2 - Downsloping' }] },
      { key: 'ca', label: 'Major Vessels (Fluoroscopy)', type: 'select', options: [0,1,2,3].map(v => ({ val: v, label: String(v) })) },
      { key: 'thal', label: 'Thalassemia', type: 'select', options: [{ val: 0, label: '0 - Normal' }, { val: 1, label: '1 - Fixed Defect' }, { val: 2, label: '2 - Reversible Defect' }] }
    ]
  },
  Liver: {
    icon: '🫀', color: '#f59e0b', model: 'XGBoost',
    description: 'Analyze liver function tests to detect liver disease',
    fields: [
      { key: 'Age', label: 'Age', type: 'number', placeholder: '45', unit: 'years' },
      { key: 'Gender', label: 'Gender', type: 'select', options: [{ val: 1, label: 'Male' }, { val: 0, label: 'Female' }] },
      { key: 'Total_Bilirubin', label: 'Total Bilirubin', type: 'number', placeholder: '0.7', unit: 'mg/dL', step: '0.1' },
      { key: 'Direct_Bilirubin', label: 'Direct Bilirubin', type: 'number', placeholder: '0.2', unit: 'mg/dL', step: '0.1' },
      { key: 'Alkaline_Phosphotase', label: 'Alkaline Phosphotase', type: 'number', placeholder: '187', unit: 'IU/L' },
      { key: 'Alamine_Aminotransferase', label: 'ALT (SGPT)', type: 'number', placeholder: '16', unit: 'IU/L' },
      { key: 'Aspartate_Aminotransferase', label: 'AST (SGOT)', type: 'number', placeholder: '18', unit: 'IU/L' },
      { key: 'Total_Protiens', label: 'Total Proteins', type: 'number', placeholder: '6.8', unit: 'g/dL', step: '0.1' },
      { key: 'Albumin', label: 'Albumin', type: 'number', placeholder: '3.3', unit: 'g/dL', step: '0.1' },
      { key: 'Albumin_and_Globulin_Ratio', label: 'Albumin/Globulin Ratio', type: 'number', placeholder: '0.9', unit: '', step: '0.1' }
    ]
  },
  Parkinson: {
    icon: '🧠', color: '#8b5cf6', model: 'SVM',
    description: "Voice biomarker analysis for Parkinson's disease detection",
    fields: [
      { key: 'MDVP:Fo(Hz)', label: 'Avg Vocal Frequency (Fo)', type: 'number', placeholder: '119.992', step: '0.001' },
      { key: 'MDVP:Fhi(Hz)', label: 'Max Vocal Frequency (Fhi)', type: 'number', placeholder: '157.302', step: '0.001' },
      { key: 'MDVP:Flo(Hz)', label: 'Min Vocal Frequency (Flo)', type: 'number', placeholder: '74.997', step: '0.001' },
      { key: 'MDVP:Jitter(%)', label: 'Jitter %', type: 'number', placeholder: '0.00784', step: '0.00001' },
      { key: 'MDVP:Jitter(Abs)', label: 'Absolute Jitter', type: 'number', placeholder: '0.00007', step: '0.00001' },
      { key: 'MDVP:RAP', label: 'RAP', type: 'number', placeholder: '0.0037', step: '0.0001' },
      { key: 'MDVP:PPQ', label: 'PPQ', type: 'number', placeholder: '0.00554', step: '0.0001' },
      { key: 'Jitter:DDP', label: 'DDP', type: 'number', placeholder: '0.01109', step: '0.0001' },
      { key: 'MDVP:Shimmer', label: 'Shimmer', type: 'number', placeholder: '0.04374', step: '0.0001' },
      { key: 'MDVP:Shimmer(dB)', label: 'Shimmer (dB)', type: 'number', placeholder: '0.426', step: '0.001' },
      { key: 'Shimmer:APQ3', label: 'APQ3', type: 'number', placeholder: '0.02182', step: '0.0001' },
      { key: 'Shimmer:APQ5', label: 'APQ5', type: 'number', placeholder: '0.0313', step: '0.0001' },
      { key: 'MDVP:APQ', label: 'APQ', type: 'number', placeholder: '0.02971', step: '0.0001' },
      { key: 'Shimmer:DDA', label: 'DDA', type: 'number', placeholder: '0.06545', step: '0.0001' },
      { key: 'NHR', label: 'NHR', type: 'number', placeholder: '0.02211', step: '0.0001' },
      { key: 'HNR', label: 'HNR', type: 'number', placeholder: '21.033', step: '0.001' },
      { key: 'RPDE', label: 'RPDE', type: 'number', placeholder: '0.414783', step: '0.000001' },
      { key: 'DFA', label: 'DFA', type: 'number', placeholder: '0.815285', step: '0.000001' },
      { key: 'spread1', label: 'Spread1', type: 'number', placeholder: '-4.813031', step: '0.000001' },
      { key: 'spread2', label: 'Spread2', type: 'number', placeholder: '0.266482', step: '0.000001' },
      { key: 'D2', label: 'D2', type: 'number', placeholder: '2.301442', step: '0.000001' },
      { key: 'PPE', label: 'PPE', type: 'number', placeholder: '0.284654', step: '0.000001' }
    ]
  }
};

export default function PredictionPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [formData, setFormData] = useState({});
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    setFormData({});
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDoctor && !patientName.trim()) {
      toast.error('Please enter the patient name');
      return;
    }
    setLoading(true);
    try {
      const processedData = {};
      DISEASES[selectedDisease].fields.forEach(f => {
        processedData[f.key] = parseFloat(formData[f.key] || 0);
      });

      const payload = { diseaseType: selectedDisease, inputParameters: processedData };
      if (isDoctor) payload.patientName = patientName.trim();

      const res = await api.post('/predictions', payload);
      toast.success('Prediction completed! Generating report...');
      navigate(`/prediction-result/${res.data.prediction._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disease = selectedDisease ? DISEASES[selectedDisease] : null;

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper" style={{ maxWidth: '900px' }}>
        <div className="page-header">
          <h1 className="page-title">
            {isDoctor ? '🔬 Run Patient Prediction' : 'Disease Prediction'}
          </h1>
          <p className="page-subtitle">
            {isDoctor
              ? 'Enter patient clinical data to generate an AI-powered disease prediction report'
              : 'AI-powered analysis using trained machine learning models'}
          </p>
        </div>

        {/* Doctor: Patient Name Input (always visible) */}
        {isDoctor && (
          <div className="card" style={{ marginBottom: '28px', borderColor: 'rgba(59,130,246,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Patient Information</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter the patient's name before running the prediction</p>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Disease Selection */}
        {!selectedDisease && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              Select the disease type to analyze:
            </p>
            <div className="grid-3" style={{ gap: '20px' }}>
              {Object.entries(DISEASES).map(([key, d]) => (
                <button key={key} onClick={() => handleDiseaseSelect(key)}
                  style={{ background: 'var(--gradient-card)', border: `1px solid ${d.color}30`, borderRadius: '16px', padding: '32px 24px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${d.color}20`; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = `${d.color}30`; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ width: '64px', height: '64px', background: `${d.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>
                    {d.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{key} Disease</h3>
                  <span style={{ background: `${d.color}15`, color: d.color, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>{d.model}</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '14px', lineHeight: 1.5 }}>{d.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: d.color, fontSize: '13px', fontWeight: '600' }}>
                    Start Analysis <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {selectedDisease && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', padding: '20px 24px', background: `${disease.color}10`, border: `1px solid ${disease.color}30`, borderRadius: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: `${disease.color}20`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                {disease.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedDisease} Disease Analysis</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Model: {disease.model} • {disease.fields.length} parameters required
                  {isDoctor && patientName && <span style={{ color: '#3b82f6', marginLeft: '10px' }}>• Patient: {patientName}</span>}
                </p>
              </div>
              <button onClick={() => setSelectedDisease(null)} className="btn btn-secondary btn-sm">
                ← Change Disease
              </button>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '24px' }}>
              ℹ️ Please enter accurate clinical values for better prediction accuracy. All fields are required.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="grid-2">
                  {disease.fields.map(field => (
                    <div className="form-group" key={field.key}>
                      <label className="form-label">
                        {field.label}
                        {field.unit && <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px', fontWeight: 400, textTransform: 'none' }}>({field.unit})</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select className="form-input" value={formData[field.key] || ''} required
                          onChange={e => handleFieldChange(field.key, e.target.value)}>
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt.val} value={opt.val}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input type="number" className="form-input form-input-number"
                          placeholder={field.placeholder} required
                          step={field.step || '1'}
                          value={formData[field.key] || ''}
                          onChange={e => handleFieldChange(field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                      Analyzing... Please wait
                    </>
                  ) : (
                    <>🔬 Run AI Prediction</>
                  )}
                </button>
                <button type="button" onClick={() => setSelectedDisease(null)} className="btn btn-secondary btn-lg">
                  Cancel
                </button>
              </div>
            </form>

            {loading && (
              <div style={{ textAlign: 'center', padding: '32px', marginTop: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: disease.color, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '8px' }}>AI Model Processing...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Running {disease.model} analysis on patient data</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
