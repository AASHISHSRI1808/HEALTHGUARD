import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Star, CreditCard, CheckCircle, X, Shield, Smartphone, Building2, Wallet, Lock, ChevronRight } from 'lucide-react';

const TIME_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

/* ════════════════════════════════════════
   MOCK PAYMENT MODAL
════════════════════════════════════════ */
function MockPaymentModal({ amount, doctorName, onSuccess, onDismiss }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tab, setTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('');
  const [stage, setStage] = useState('form'); // form | processing | success

  const fmt4   = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp = v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };

  const upiApps = [
    { id:'gpay@okaxis',   label:'Google Pay', icon:'🔵' },
    { id:'pe@ybl',        label:'PhonePe',    icon:'💜' },
    { id:'paytm@paytm',  label:'Paytm',      icon:'🔷' },
    { id:'amazon@apl',   label:'Amazon Pay',  icon:'🟠' },
  ];
  const banks  = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Punjab National Bank','Bank of Baroda','Yes Bank'];
  const wallets= [
    {id:'phonepe',  label:'PhonePe',   icon:'💜', color:'#5f259f'},
    {id:'paytm',    label:'Paytm',     icon:'🔷', color:'#00b9f1'},
    {id:'mobikwik', label:'MobiKwik',  icon:'🔵', color:'#2664ac'},
    {id:'freecharge',label:'FreeCharge',icon:'🟢',color:'#36b37e'},
  ];

  const canPay = () => {
    if (tab==='upi')    return upiId.includes('@') && upiId.length>3;
    if (tab==='card')   return card.number.replace(/\s/g,'').length===16 && card.name && card.expiry.length===5 && card.cvv.length>=3;
    if (tab==='net')    return !!bank;
    if (tab==='wallet') return !!wallet;
    return false;
  };

  const handlePay = () => {
    setStage('processing');
    setTimeout(() => { setStage('success'); setTimeout(onSuccess, 1400); }, 3000);
  };

  const surface = isDark ? '#0f1a12' : '#ffffff';
  const raised  = isDark ? '#162219' : '#f4f9f6';
  const border  = isDark ? '#1c3325' : '#c2dfd0';
  const txt     = isDark ? '#e2f5e9' : '#0c1f15';
  const muted   = isDark ? '#3d7055' : '#6b9e82';
  const inputBg = isDark ? '#0b1410' : '#f4f9f6';

  const iStyle = {
    width:'100%', padding:'11px 14px', borderRadius:'11px',
    border:`1.5px solid ${border}`, background:inputBg, color:txt,
    fontFamily:'Outfit,sans-serif', fontSize:'14px', fontWeight:500,
    outline:'none', boxSizing:'border-box', transition:'all 0.2s'
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ width:'100%', maxWidth:'420px', borderRadius:'24px', overflow:'hidden', boxShadow:`0 40px 100px rgba(0,0,0,0.6)`, background:surface, fontFamily:'Outfit,sans-serif', animation:'scaleIn 0.22s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)', padding:'22px 24px', position:'relative' }}>
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'130px', height:'130px', borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'13px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>💳</div>
              <div>
                <div style={{ color:'white', fontWeight:800, fontSize:'16px' }}>HealthGuard Pay</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:500 }}>Secure Mock Checkout</div>
              </div>
            </div>
            <button onClick={onDismiss} style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', transition:'background 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
              onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            ><X size={15}/></button>
          </div>
          {/* Amount row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'18px', padding:'14px 18px', background:'rgba(255,255,255,0.15)', borderRadius:'14px', position:'relative', zIndex:1, backdropFilter:'blur(6px)' }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:600 }}>Paying to</div>
              <div style={{ color:'white', fontWeight:800, fontSize:'15px' }}>Dr. {doctorName}</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'11px' }}>Consultation Fee</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:600 }}>Amount</div>
              <div style={{ color:'white', fontWeight:900, fontSize:'28px', lineHeight:1.1 }}>₹{amount}</div>
            </div>
          </div>
        </div>

        {/* Processing screen */}
        {stage === 'processing' && (
          <div style={{ padding:'52px 24px', textAlign:'center' }}>
            <div style={{ width:'72px', height:'72px', margin:'0 auto 24px', position:'relative' }}>
              <svg viewBox="0 0 72 72" style={{ width:'72px', height:'72px', animation:'spin 1.1s linear infinite' }}>
                <circle cx="36" cy="36" r="30" fill="none" stroke={isDark?'#1c3325':'#c2dfd0'} strokeWidth="5"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#059669" strokeWidth="5" strokeDasharray="55 132" strokeLinecap="round"/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>💳</div>
            </div>
            <div style={{ fontWeight:900, color:txt, fontSize:'18px', marginBottom:'8px' }}>Processing Payment</div>
            <div style={{ color:muted, fontSize:'14px', marginBottom:'28px' }}>Verifying with secure gateway...</div>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
              {[0,1,2].map(i=>(
                <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#059669', animation:`fadeIn 0.6s ease ${i*0.2}s infinite alternate` }}/>
              ))}
            </div>
          </div>
        )}

        {/* Success screen */}
        {stage === 'success' && (
          <div style={{ padding:'52px 24px', textAlign:'center' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(5,150,105,0.15)', border:'2.5px solid #059669', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'scaleIn 0.3s ease' }}>
              <CheckCircle size={36} color="#059669"/>
            </div>
            <div style={{ fontWeight:900, color:txt, fontSize:'20px', marginBottom:'8px' }}>Payment Successful! 🎉</div>
            <div style={{ color:muted, fontSize:'14px' }}>Confirming your appointment...</div>
          </div>
        )}

        {/* Main form */}
        {stage === 'form' && (
          <div style={{ padding:'22px 24px 28px' }}>
            {/* Tabs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', background:raised, borderRadius:'13px', padding:'5px', marginBottom:'22px' }}>
              {[
                { key:'upi',    icon:<Smartphone size={14}/>, label:'UPI'         },
                { key:'card',   icon:<CreditCard  size={14}/>, label:'Card'        },
                { key:'net',    icon:<Building2   size={14}/>, label:'Net Banking' },
                { key:'wallet', icon:<Wallet      size={14}/>, label:'Wallet'      },
              ].map(t=>(
                <button key={t.key} onClick={()=>setTab(t.key)} style={{
                  padding:'9px 4px', border:'none', borderRadius:'9px', cursor:'pointer',
                  background:tab===t.key?surface:'transparent',
                  color:tab===t.key?'#059669':muted,
                  fontWeight:tab===t.key?800:600, fontSize:'11.5px',
                  boxShadow:tab===t.key?'var(--shadow-sm)':'none',
                  transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:'5px',
                  fontFamily:'Outfit,sans-serif'
                }}>
                  {t.icon}<span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* UPI tab */}
            {tab==='upi' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'9px', marginBottom:'16px' }}>
                  {upiApps.map(app=>(
                    <button key={app.id} onClick={()=>{setSelectedUpiApp(app.id);setUpiId(app.id);}} style={{
                      padding:'13px 10px', border:`2px solid ${selectedUpiApp===app.id?'#059669':border}`,
                      borderRadius:'13px', background:selectedUpiApp===app.id?'rgba(5,150,105,0.1)':surface,
                      cursor:'pointer', display:'flex', alignItems:'center', gap:'9px',
                      fontSize:'13px', fontWeight:700, color:txt, transition:'all 0.2s', fontFamily:'Outfit,sans-serif'
                    }}>
                      <span style={{fontSize:'20px'}}>{app.icon}</span>{app.label}
                      {selectedUpiApp===app.id && <span style={{marginLeft:'auto',color:'#059669',fontSize:'14px'}}>✓</span>}
                    </button>
                  ))}
                </div>
                <div style={{marginBottom:'6px'}}>
                  <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>UPI ID</label>
                  <input value={upiId} onChange={e=>{setUpiId(e.target.value);setSelectedUpiApp('');}} placeholder="yourname@upi" style={iStyle}
                    onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}/>
                  {upiId && !upiId.includes('@') && <div style={{fontSize:'11px',color:'var(--rose-500)',marginTop:'5px'}}>Enter a valid UPI ID (e.g., name@bank)</div>}
                </div>
              </div>
            )}

            {/* Card tab */}
            {tab==='card' && (
              <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
                <div>
                  <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>Card Number</label>
                  <div style={{position:'relative'}}>
                    <input value={card.number} onChange={e=>setCard({...card,number:fmt4(e.target.value)})} placeholder="0000 0000 0000 0000" maxLength={19}
                      style={{...iStyle,paddingRight:'48px',letterSpacing:'1.5px',fontFamily:'DM Mono,monospace'}}
                      onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}/>
                    <span style={{position:'absolute',right:'13px',top:'50%',transform:'translateY(-50%)',fontSize:'20px'}}>
                      {card.number.startsWith('4')?'💳':card.number.startsWith('5')?'🟠':card.number.startsWith('6')?'🟢':'💳'}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>Cardholder Name</label>
                  <input value={card.name} onChange={e=>setCard({...card,name:e.target.value.toUpperCase()})} placeholder="JOHN DOE"
                    style={{...iStyle,textTransform:'uppercase',letterSpacing:'0.5px'}}
                    onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div>
                    <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>Expiry</label>
                    <input value={card.expiry} onChange={e=>setCard({...card,expiry:fmtExp(e.target.value)})} placeholder="MM/YY" maxLength={5}
                      style={{...iStyle,fontFamily:'DM Mono,monospace',letterSpacing:'1px'}}
                      onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}/>
                  </div>
                  <div>
                    <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>CVV <Lock size={10} style={{display:'inline'}}/></label>
                    <input value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="•••" type="password" maxLength={4}
                      style={{...iStyle,fontFamily:'DM Mono,monospace',letterSpacing:'2px'}}
                      onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}/>
                  </div>
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  {['VISA','MASTERCARD','RUPAY','AMEX'].map(n=>(
                    <span key={n} style={{padding:'3px 9px',background:raised,borderRadius:'6px',fontSize:'10px',fontWeight:800,color:muted,border:`1px solid ${border}`}}>{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Net Banking tab */}
            {tab==='net' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}}>
                  {banks.slice(0,4).map(b=>(
                    <button key={b} onClick={()=>setBank(b)} style={{
                      padding:'11px 12px', border:`2px solid ${bank===b?'#059669':border}`,
                      borderRadius:'12px', background:bank===b?'rgba(5,150,105,0.1)':surface,
                      cursor:'pointer', fontSize:'12px', fontWeight:700, color:txt, textAlign:'left',
                      display:'flex', alignItems:'center', gap:'7px', transition:'all 0.2s', fontFamily:'Outfit,sans-serif'
                    }}>
                      🏦 <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.split(' ').slice(0,2).join(' ')}</span>
                      {bank===b && <span style={{marginLeft:'auto',color:'#059669',fontSize:'14px',flexShrink:0}}>✓</span>}
                    </button>
                  ))}
                </div>
                <label style={{fontSize:'11px',fontWeight:800,color:muted,textTransform:'uppercase',letterSpacing:'0.7px',display:'block',marginBottom:'7px'}}>All Banks</label>
                <select value={bank} onChange={e=>setBank(e.target.value)}
                  style={{...iStyle,cursor:'pointer'}}
                  onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor=border}>
                  <option value="">Select your bank</option>
                  {banks.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {/* Wallet tab */}
            {tab==='wallet' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                {wallets.map(w=>(
                  <button key={w.id} onClick={()=>setWallet(w.id)} style={{
                    padding:'18px 14px', border:`2px solid ${wallet===w.id?w.color:border}`,
                    borderRadius:'14px', background:wallet===w.id?`${w.color}15`:surface,
                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                    transition:'all 0.2s', fontFamily:'Outfit,sans-serif'
                  }}>
                    <span style={{fontSize:'30px'}}>{w.icon}</span>
                    <span style={{fontSize:'13px',fontWeight:800,color:wallet===w.id?w.color:txt}}>{w.label}</span>
                    {wallet===w.id && <span style={{fontSize:'11px',color:w.color,fontWeight:700}}>✓ Selected</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Pay button */}
            <button onClick={handlePay} disabled={!canPay()} style={{
              width:'100%', marginTop:'22px', padding:'15px',
              background: canPay() ? 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)' : raised,
              color: canPay() ? 'white' : muted,
              border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:800,
              cursor: canPay() ? 'pointer' : 'not-allowed',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'9px',
              boxShadow: canPay() ? '0 8px 28px rgba(5,150,105,0.35)' : 'none',
              transition:'all 0.25s', fontFamily:'Outfit,sans-serif',
              transform: canPay() ? 'none' : 'none'
            }}
              onMouseOver={e=>{ if(canPay()){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(5,150,105,0.45)'; }}}
              onMouseOut={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=canPay()?'0 8px 28px rgba(5,150,105,0.35)':'none'; }}
            >
              <Shield size={16}/>
              Pay ₹{amount} Securely
              {canPay() && <ChevronRight size={15}/>}
            </button>

            {/* Security note */}
            <div style={{marginTop:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
              <Lock size={11} color={muted}/>
              <span style={{fontSize:'11px',color:muted,fontWeight:600}}>256-bit SSL encrypted · Demo mode · No real charge</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   APPOINTMENT BOOKING PAGE
════════════════════════════════════════ */
export default function AppointmentBooking() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor]         = useState(null);
  const [selectedDate, setDate]     = useState('');
  const [selectedSlot, setSlot]     = useState('');
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(false);
  const [showPay, setShowPay]       = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`).then(r=>setDoctor(r.data.doctor)).finally(()=>setLoading(false));
  }, [doctorId]);

  const minDate = () => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; };

  const handlePaymentSuccess = async () => {
    setShowPay(false); setBooking(true);
    try {
      const ar = await api.post('/appointments', { doctorId, predictionId:predictionId||null, appointmentDate:selectedDate, timeSlot:selectedSlot, notes });
      const id = ar.data.appointment._id;
      const pid = 'mock_' + Math.random().toString(36).substr(2,9).toUpperCase();
      await api.post(`/appointments/${id}/confirm`, { paymentId:pid, orderId:'mock_order_'+pid });
      setDone(true); toast.success('🎉 Appointment confirmed!');
    } catch(e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div className="page-container"><Navbar/>
      <div className="loading-container" style={{minHeight:'calc(100vh - 66px)'}}>
        <div className="loading-spinner" style={{width:'40px',height:'40px'}}/>
        <span style={{color:'var(--text-muted)',fontWeight:600}}>Loading doctor info...</span>
      </div>
    </div>
  );

  /* Success screen */
  if (done) return (
    <div className="page-container"><Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 66px)',padding:'24px'}}>
        <div style={{textAlign:'center',maxWidth:'500px'}} className="animate-fadeInUp">
          <div style={{width:'110px',height:'110px',borderRadius:'50%',background:'rgba(5,150,105,0.12)',border:'3px solid var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',animation:'scaleIn 0.4s ease'}}>
            <CheckCircle size={56} color="var(--accent)"/>
          </div>
          <h2 style={{fontFamily:'Outfit,sans-serif',fontSize:'32px',fontWeight:900,color:'var(--text-primary)',marginBottom:'10px',letterSpacing:'-0.5px'}}>
            Appointment Confirmed! 🎉
          </h2>
          <p style={{color:'var(--text-muted)',marginBottom:'28px',fontSize:'15px'}}>
            A confirmation has been sent to {user.email}
          </p>

          <div style={{background:'var(--bg-surface)',border:'1.5px solid var(--border-subtle)',borderRadius:'20px',padding:'24px',marginBottom:'28px',textAlign:'left',boxShadow:'var(--shadow-sm)'}}>
            {[
              {emoji:'👨‍⚕️', label:'Doctor',      val:`Dr. ${doctor.name}`},
              {emoji:'🏥',  label:'Hospital',    val:`${doctor.hospitalName}, ${doctor.city}`},
              {emoji:'📅',  label:'Date',        val:new Date(selectedDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})},
              {emoji:'⏰',  label:'Time',        val:selectedSlot},
              {emoji:'💰',  label:'Amount Paid', val:`₹${doctor.consultationFee}`,bold:true,color:'var(--accent)'},
            ].map((r,i,a)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 0',borderBottom:i<a.length-1?'1px solid var(--border-subtle)':'none'}}>
                <span style={{fontSize:'20px',flexShrink:0}}>{r.emoji}</span>
                <span style={{color:'var(--text-muted)',fontSize:'13px',fontWeight:600,minWidth:'80px'}}>{r.label}</span>
                <span style={{color:r.color||'var(--text-primary)',fontWeight:r.bold?900:700,fontSize:'14px'}}>{r.val}</span>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
            <button onClick={()=>navigate('/appointments')} className="btn btn-primary">View Appointments</button>
            <button onClick={()=>navigate('/dashboard')}    className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container bg-bio">
      <Navbar/>
      {showPay && <MockPaymentModal amount={doctor?.consultationFee} doctorName={doctor?.name} onSuccess={handlePaymentSuccess} onDismiss={()=>setShowPay(false)}/>}

      <div className="content-wrapper" style={{maxWidth:'940px'}}>
        <div className="page-header animate-fadeInUp">
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-subtitle">Select your preferred date, time, and complete payment</p>
        </div>

        {/* Mock payment notice */}
        <div className="alert alert-info animate-fadeInUp stagger-1" style={{marginBottom:'24px'}}>
          <span style={{fontSize:'20px'}}>🧪</span>
          <div>
            <strong>Demo Payment Mode</strong> — No real money charged. This is a simulated payment flow for demonstration. All payment methods are mocked.
          </div>
        </div>

        <div className="grid-2" style={{gap:'24px',alignItems:'start'}}>
          {/* Left — Doctor + Summary */}
          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <div className="card animate-fadeInUp stagger-2">
              <div style={{display:'flex',gap:'16px',marginBottom:'20px'}}>
                <div style={{width:'74px',height:'74px',borderRadius:'20px',background:'var(--accent-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'38px',flexShrink:0,border:'2px solid var(--accent-glow)'}}>
                  👨‍⚕️
                </div>
                <div>
                  <h2 style={{fontFamily:'Outfit,sans-serif',fontSize:'22px',fontWeight:900,color:'var(--text-primary)',marginBottom:'6px',letterSpacing:'-0.3px'}}>Dr. {doctor?.name}</h2>
                  <span className="badge badge-teal">{doctor?.specialization}</span>
                </div>
              </div>
              {[
                {icon:<MapPin size={14}/>,  label:`${doctor?.hospitalName}, ${doctor?.city}`},
                {icon:<Clock  size={14}/>,  label:`${doctor?.experience} yrs experience`},
                {icon:<Star   size={14}/>,  label:`${doctor?.rating} / 5.0 Rating`},
              ].map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',color:'var(--text-secondary)',fontSize:'14px',marginBottom:'10px',fontWeight:500}}>
                  <span style={{color:'var(--accent)',flexShrink:0}}>{item.icon}</span>{item.label}
                </div>
              ))}
              {doctor?.about && <p style={{color:'var(--text-muted)',fontSize:'13px',marginTop:'12px',lineHeight:1.65,fontWeight:500,paddingTop:'12px',borderTop:'1px solid var(--border-subtle)'}}>{doctor.about}</p>}
            </div>

            {/* Fee card */}
            <div className="card animate-fadeInUp stagger-3" style={{border:'1.5px solid var(--accent-glow)',background:'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-raised) 100%)'}}>
              <h3 style={{fontFamily:'Outfit,sans-serif',fontSize:'15px',fontWeight:800,color:'var(--text-primary)',marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
                💳 Payment Summary
              </h3>
              <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border-subtle)',marginBottom:'10px'}}>
                <span style={{color:'var(--text-secondary)',fontSize:'14px',fontWeight:500}}>Consultation Fee</span>
                <span style={{fontWeight:700,color:'var(--text-primary)'}}>₹{doctor?.consultationFee}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',marginBottom:'14px'}}>
                <span style={{fontWeight:800,color:'var(--text-primary)',fontSize:'15px'}}>Total</span>
                <span style={{fontFamily:'Outfit,sans-serif',fontSize:'26px',fontWeight:900,color:'var(--accent)'}}>₹{doctor?.consultationFee}</span>
              </div>
              <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>
                {['📱 UPI','💳 Card','🏦 Net Banking','👛 Wallet'].map(m=>(
                  <span key={m} style={{padding:'4px 11px',background:'var(--bg-raised)',borderRadius:'20px',fontSize:'11.5px',color:'var(--text-muted)',fontWeight:600,border:'1px solid var(--border-subtle)'}}>
                    {m}
                  </span>
                ))}
              </div>
              <div style={{marginTop:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
                <Shield size={11} color="var(--accent)"/>
                <span style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:600}}>Secured · Demo payment · No real charges</span>
              </div>
            </div>
          </div>

          {/* Right — Date/Slot/Notes */}
          <div className="card animate-fadeInUp stagger-4">
            <h3 style={{fontFamily:'Outfit,sans-serif',fontSize:'18px',fontWeight:900,color:'var(--text-primary)',marginBottom:'22px',letterSpacing:'-0.3px'}}>
              📅 Select Date & Time
            </h3>

            <div className="form-group">
              <label className="form-label"><Calendar size={11} style={{display:'inline',marginRight:'5px'}}/> Appointment Date</label>
              <input type="date" className="form-input" value={selectedDate} min={minDate()} onChange={e=>setDate(e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label"><Clock size={11} style={{display:'inline',marginRight:'5px'}}/> Available Slots</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'4px'}}>
                {TIME_SLOTS.map(slot=>(
                  <button key={slot} type="button" onClick={()=>setSlot(slot)} style={{
                    padding:'10px 4px', border:`1.5px solid ${selectedSlot===slot?'var(--accent)':'var(--border-subtle)'}`,
                    borderRadius:'10px', cursor:'pointer',
                    fontSize:'12.5px', fontWeight:700, fontFamily:'Outfit,sans-serif',
                    background: selectedSlot===slot?'var(--accent-soft)':'var(--bg-raised)',
                    color: selectedSlot===slot?'var(--accent)':'var(--text-muted)',
                    transition:'all 0.2s',
                    boxShadow: selectedSlot===slot?'0 0 0 3px var(--accent-soft)':'none'
                  }}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Describe your symptoms or concerns..."/>
            </div>

            <button onClick={()=>{ if(!selectedDate||!selectedSlot){toast.error('Select date and time slot');return;} setShowPay(true); }}
              className="btn btn-primary btn-full btn-lg" style={{marginTop:'4px'}} disabled={booking||!selectedDate||!selectedSlot}>
              {booking
                ? <><div className="loading-spinner" style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white'}}/> Confirming...</>
                : <><CreditCard size={17}/> Pay ₹{doctor?.consultationFee} & Confirm</>
              }
            </button>

            <p style={{textAlign:'center',color:'var(--text-faint)',fontSize:'11.5px',marginTop:'12px',fontWeight:600}}>
              🔒 Mock payment · UPI · Card · Net Banking · Wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
