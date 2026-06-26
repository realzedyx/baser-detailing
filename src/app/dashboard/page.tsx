'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Check, X, ChevronLeft, ChevronRight, Clock, Calendar, Users, Briefcase, BarChart2, BookOpen } from 'lucide-react';

// ─── PIN ────────────────────────────────────────────────────────────────────
const ADMIN_PIN = '1234'; // TODO: move to env / Supabase

// ─── Types ───────────────────────────────────────────────────────────────────
type Service = 'Interior' | 'Exterior' | 'Full Detail';
type Payment = 'PayID' | 'Cash';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'DECLINED';
type DayStatus = 'open' | 'booked' | 'blocked';

interface Job {
  id: string; date: string; make: string; model: string; year: string;
  colour: string; suburb: string; service: Service; amount: number;
  payment: Payment; notes: string;
}
interface Booking {
  id: string; carName: string; service: Service; price: number; suburb: string;
  customerName: string; phone: string; contactMethod: string;
  dateTime: string; status: BookingStatus;
}
interface Customer {
  id: string; name: string; phone: string; suburb: string;
  type: 'member' | 'guest'; jobCount: number; totalSpent: number;
  lastBooking: string; totalRequests: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_JOBS: Job[] = [
  { id:'j1', date:'2026-06-20', make:'Toyota', model:'Camry', year:'2021', colour:'Silver', suburb:'Parramatta', service:'Full Detail', amount:320, payment:'PayID', notes:'' },
  { id:'j2', date:'2026-06-18', make:'BMW', model:'3 Series', year:'2022', colour:'Black', suburb:'Chatswood', service:'Interior', amount:180, payment:'Cash', notes:'Pet hair removal' },
  { id:'j3', date:'2026-06-15', make:'Mazda', model:'CX-5', year:'2020', colour:'White', suburb:'Hornsby', service:'Exterior', amount:150, payment:'PayID', notes:'' },
  { id:'j4', date:'2026-05-28', make:'Hyundai', model:'Tucson', year:'2023', colour:'Blue', suburb:'Penrith', service:'Full Detail', amount:300, payment:'Cash', notes:'' },
  { id:'j5', date:'2026-05-14', make:'Ford', model:'Ranger', year:'2019', colour:'Grey', suburb:'Blacktown', service:'Exterior', amount:170, payment:'PayID', notes:'Heavy mud' },
];

const MOCK_BOOKINGS: Booking[] = [
  { id:'b1', carName:'Tesla Model 3', service:'Full Detail', price:320, suburb:'North Sydney', customerName:'Alex Chen', phone:'0412 345 678', contactMethod:'SMS', dateTime:'2026-06-28 9:00am', status:'PENDING' },
  { id:'b2', carName:'Audi Q5', service:'Interior', price:180, suburb:'Mosman', customerName:'Sarah Williams', phone:'0423 456 789', contactMethod:'Phone', dateTime:'2026-06-29 11:00am', status:'CONFIRMED' },
  { id:'b3', carName:'Kia Sportage', service:'Exterior', price:150, suburb:'Ryde', customerName:'James Park', phone:'0434 567 890', contactMethod:'SMS', dateTime:'2026-07-01 10:00am', status:'PENDING' },
  { id:'b4', carName:'Mercedes C-Class', service:'Full Detail', price:350, suburb:'Manly', customerName:'Emma Davis', phone:'0445 678 901', contactMethod:'Email', dateTime:'2026-07-02 9:00am', status:'CONFIRMED' },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id:'c1', name:'Alex Chen', phone:'0412 345 678', suburb:'North Sydney', type:'member', jobCount:4, totalSpent:980, lastBooking:'2026-06-28', totalRequests:5 },
  { id:'c2', name:'Sarah Williams', phone:'0423 456 789', suburb:'Mosman', type:'member', jobCount:2, totalSpent:500, lastBooking:'2026-06-29', totalRequests:3 },
  { id:'c3', name:'James Park', phone:'0434 567 890', suburb:'Ryde', type:'guest', jobCount:1, totalSpent:150, lastBooking:'2026-07-01', totalRequests:1 },
  { id:'c4', name:'Emma Davis', phone:'0445 678 901', suburb:'Manly', type:'member', jobCount:6, totalSpent:1750, lastBooking:'2026-07-02', totalRequests:7 },
  { id:'c5', name:'Tom Brown', phone:'0456 789 012', suburb:'Penrith', type:'guest', jobCount:1, totalSpent:300, lastBooking:'2026-05-28', totalRequests:1 },
];

const MONTHLY_REVENUE = [
  { month:'Jan', revenue:1200, jobs:5 },
  { month:'Feb', revenue:980, jobs:4 },
  { month:'Mar', revenue:1540, jobs:7 },
  { month:'Apr', revenue:1100, jobs:5 },
  { month:'May', revenue:1870, jobs:8 },
  { month:'Jun', revenue:920, jobs:4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const s = (i: number, extra?: object) => ({
  initial: { opacity: 0, y: 16, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number], delay: i * 0.06 },
  ...extra,
});

const GOLD = '#CBA65C';
const BG = '#0a0a0a';

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%', boxSizing: 'border-box',
  background: focused ? 'rgba(203,166,92,0.04)' : 'rgba(255,255,255,0.025)',
  border: `1px solid ${focused ? 'rgba(203,166,92,0.45)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 10, padding: '11px 14px', fontSize: 13,
  color: '#E8E8E8', outline: 'none', transition: 'all 0.2s',
  fontWeight: 300, letterSpacing: '0.01em',
});

// ─── PIN Gate ─────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setTimeout(onUnlock, 300);
      } else {
        setShake(true); setError(true);
        setTimeout(() => { setDigits(''); setShake(false); setError(false); }, 700);
      }
    }
  };
  const del = () => setDigits(d => d.slice(0, -1));

  return (
    <div className="min-h-screen w-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position:'absolute', width:600, height:600, top:'10%', left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle, rgba(203,166,92,0.045) 0%, transparent 65%)', filter:'blur(60px)' }} />
      </div>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }} style={{ width:320 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <p style={{ fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.28em', textTransform:'uppercase', marginBottom:10 }}>Admin Access</p>
          <h1 style={{ fontSize:32, fontWeight:200, color:'#E8E8E8', letterSpacing:'-0.03em', margin:0 }}>Enter PIN</h1>
        </div>

        {/* Dots */}
        <motion.div animate={shake ? { x:[-8,8,-6,6,-4,4,0] } : { x:0 }} transition={{ duration:0.5 }} style={{ display:'flex', justifyContent:'center', gap:16, marginBottom:40 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:14, height:14, borderRadius:'50%', border:`1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(203,166,92,0.4)'}`, background: i < digits.length ? (error ? 'rgba(239,68,68,0.8)' : GOLD) : 'transparent', transition:'all 0.15s' }} />
          ))}
        </motion.div>

        {/* Numpad */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            k === '' ? <div key={i} /> :
            <motion.button key={i} whileHover={{ scale:1.05 }} whileTap={{ scale:0.93 }}
              onClick={() => k === '⌫' ? del() : press(k)}
              style={{ padding:'18px 0', fontSize: k === '⌫' ? 18 : 22, fontWeight:200, color: k === '⌫' ? 'rgba(255,255,255,0.35)' : '#E8E8E8', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, cursor:'pointer', letterSpacing:'-0.02em' }}
            >{k}</motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, revenue, jobs, delay }: { label:string; revenue:number; jobs:number; delay:number }) {
  return (
    <motion.div {...s(delay)} style={{ flex:1, minWidth:0, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(203,166,92,0.15)', borderRadius:16, padding:'20px 22px' }}>
      <p style={{ fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:10 }}>{label}</p>
      <p style={{ fontSize:26, fontWeight:200, color:'#E8E8E8', letterSpacing:'-0.03em', margin:0 }}>${revenue.toLocaleString()}</p>
      <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4 }}>{jobs} job{jobs !== 1 ? 's' : ''}</p>
    </motion.div>
  );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────
function RevenueChart() {
  const max = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));
  return (
    <div style={{ padding:'20px 0' }}>
      <p style={{ fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:16 }}>Revenue — Last 6 Months</p>
      <svg width="100%" viewBox="0 0 420 120" preserveAspectRatio="none" style={{ overflow:'visible' }}>
        {MONTHLY_REVENUE.map((m, i) => {
          const h = (m.revenue / max) * 90;
          const x = i * 70 + 10;
          return (
            <g key={i}>
              <title>${m.revenue} — {m.jobs} jobs</title>
              <rect x={x} y={110 - h} width={50} height={h} rx={6} fill="rgba(203,166,92,0.15)" stroke="rgba(203,166,92,0.3)" strokeWidth={1} />
              <rect x={x} y={110 - h} width={50} height={4} rx={2} fill={GOLD} opacity={0.9} />
              <text x={x + 25} y={120} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="inherit">{m.month}</text>
              <text x={x + 25} y={105 - h} textAnchor="middle" fill="rgba(203,166,92,0.7)" fontSize={8} fontFamily="inherit">${m.revenue}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────
function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [form, setForm] = useState({ date:'', make:'', model:'', year:'', colour:'', suburb:'', service:'Interior' as Service, amount:'', payment:'PayID' as Payment, notes:'' });
  const [focused, setFocused] = useState('');
  const [filterService, setFilterService] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [search, setSearch] = useState('');
  const [fSearch, setFSearch] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const job: Job = { ...form, id: Date.now().toString(), amount: parseFloat(form.amount) || 0, service: form.service as Service, payment: form.payment as Payment };
    setJobs(j => [job, ...j]);
    setForm({ date:'', make:'', model:'', year:'', colour:'', suburb:'', service:'Interior', amount:'', payment:'PayID', notes:'' });
  };

  const filtered = jobs.filter(j => {
    if (filterService !== 'All' && j.service !== filterService) return false;
    if (filterPayment !== 'All' && j.payment !== filterPayment) return false;
    if (search && !`${j.make} ${j.model} ${j.suburb}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const labelStyle: React.CSSProperties = { display:'block', fontSize:9, color:GOLD, letterSpacing:'0.22em', textTransform:'uppercase', fontWeight:500, marginBottom:6 };
  const selStyle = (focused: boolean): React.CSSProperties => ({ ...inputStyle(focused), appearance:'none', WebkitAppearance:'none' });

  return (
    <div style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:24, alignItems:'start' }}>
      {/* Log form */}
      <motion.div {...s(0)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'28px 24px' }}>
        <p style={{ fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:20 }}>Log a Job</p>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {([['date','Date','','date'],['make','Make','e.g. Toyota',''],['model','Model','e.g. Camry',''],['year','Year','e.g. 2021',''],['colour','Colour','e.g. Black',''],['suburb','Suburb','e.g. Parramatta',''],['amount','Amount ($)','e.g. 320','']] as [string,string,string,string][]).map(([k,l,ph,t]) => (
            <div key={k}>
              <label style={labelStyle}>{l}</label>
              <input type={t || 'text'} placeholder={ph} value={(form as Record<string,string>)[k]} onChange={set(k)} onFocus={() => setFocused(k)} onBlur={() => setFocused('')} required={k !== 'notes'} style={inputStyle(focused === k)} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Service</label>
            <select value={form.service} onChange={set('service')} onFocus={() => setFocused('service')} onBlur={() => setFocused('')} style={selStyle(focused === 'service')}>
              {['Interior','Exterior','Full Detail'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Payment</label>
            <select value={form.payment} onChange={set('payment')} onFocus={() => setFocused('payment')} onBlur={() => setFocused('')} style={selStyle(focused === 'payment')}>
              {['PayID','Cash'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Optional notes..." rows={3} onFocus={() => setFocused('notes')} onBlur={() => setFocused('')}
              style={{ ...inputStyle(focused === 'notes'), resize:'vertical', fontFamily:'inherit' }} />
          </div>
          <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ marginTop:4, background:`linear-gradient(120deg, #BF9A50, ${GOLD} 40%, #E4C883 65%, ${GOLD})`, color:BG, border:'none', borderRadius:12, padding:'13px', fontSize:11, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer', position:'relative', overflow:'hidden' }}>
            <motion.div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} animate={{ x:['-100%','100%'] }} transition={{ duration:2.5, ease:'easeInOut', repeat:Infinity, repeatDelay:4 }} />
            <span style={{ position:'relative', zIndex:1 }}>Save Job →</span>
          </motion.button>
        </form>
      </motion.div>

      {/* Right panel */}
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <motion.div {...s(1)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'24px' }}>
          <RevenueChart />
        </motion.div>

        <motion.div {...s(2)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'24px' }}>
          {/* Filters */}
          <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
            {(['All','Interior','Exterior','Full Detail'] as string[]).map(s => (
              <button key={s} onClick={() => setFilterService(s)}
                style={{ padding:'6px 14px', fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:8, cursor:'pointer', border:`1px solid ${filterService === s ? GOLD : 'rgba(255,255,255,0.08)'}`, background: filterService === s ? 'rgba(203,166,92,0.12)' : 'transparent', color: filterService === s ? GOLD : 'rgba(255,255,255,0.4)', transition:'all 0.15s' }}>{s}</button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              {(['All','PayID','Cash'] as string[]).map(p => (
                <button key={p} onClick={() => setFilterPayment(p)}
                  style={{ padding:'6px 12px', fontSize:10, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:8, cursor:'pointer', border:`1px solid ${filterPayment === p ? GOLD : 'rgba(255,255,255,0.08)'}`, background: filterPayment === p ? 'rgba(203,166,92,0.12)' : 'transparent', color: filterPayment === p ? GOLD : 'rgba(255,255,255,0.4)', transition:'all 0.15s' }}>{p}</button>
              ))}
            </div>
          </div>
          <input placeholder="Search by car or suburb..." value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setFSearch(true)} onBlur={() => setFSearch(false)} style={{ ...inputStyle(fSearch), marginBottom:16 }} />

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.length === 0 && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12, textAlign:'center', padding:'20px 0' }}>No jobs found</p>}
            {filtered.map(j => (
              <div key={j.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, color:'#E8E8E8', fontWeight:300 }}>{j.make} {j.model} <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>· {j.colour}</span></p>
                  <p style={{ margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.3)' }}>{j.suburb} · {j.service} · {j.date}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:300, color:GOLD }}>${j.amount}</p>
                  <p style={{ margin:'3px 0 0', fontSize:10, color: j.payment === 'Cash' ? 'rgba(255,255,255,0.35)' : 'rgba(203,166,92,0.5)', letterSpacing:'0.1em' }}>{j.payment}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const statusColor = (s: BookingStatus) => s === 'PENDING' ? 'rgba(251,191,36,0.9)' : s === 'CONFIRMED' ? 'rgba(34,197,94,0.9)' : s === 'DONE' ? 'rgba(203,166,92,0.6)' : 'rgba(239,68,68,0.7)';
  const statusBg = (s: BookingStatus) => s === 'PENDING' ? 'rgba(251,191,36,0.1)' : s === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : s === 'DONE' ? 'rgba(203,166,92,0.1)' : 'rgba(239,68,68,0.1)';

  const act = (id: string, newStatus: BookingStatus) =>
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: newStatus } : b));

  const btnStyle = (color: string, bg: string): React.CSSProperties => ({
    padding:'6px 12px', fontSize:10, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase',
    borderRadius:8, cursor:'pointer', border:`1px solid ${color}`, background: bg, color, transition:'all 0.15s',
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {bookings.map((b, i) => (
        <motion.div key={b.id} {...s(i)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'22px 24px' }}>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <p style={{ margin:0, fontSize:15, fontWeight:300, color:'#E8E8E8' }}>{b.carName}</p>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', padding:'3px 8px', borderRadius:6, color: statusColor(b.status), background: statusBg(b.status), border:`1px solid ${statusColor(b.status)}30` }}>{b.status}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.4)' }}>{b.service} · ${b.price} · {b.suburb}</p>
            </div>
            <div style={{ flex:1, minWidth:180 }}>
              <p style={{ margin:0, fontSize:13, color:'#E8E8E8' }}>{b.customerName}</p>
              <p style={{ margin:'3px 0', fontSize:12, color:GOLD }}>{b.phone}</p>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.3)' }}>via {b.contactMethod} · {b.dateTime}</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              {b.status === 'PENDING' && <>
                <button style={btnStyle('rgba(34,197,94,0.8)','rgba(34,197,94,0.1)')} onClick={() => act(b.id,'CONFIRMED')}>
                  <Check size={10} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />Confirm &amp; Lock Day
                </button>
                <button style={btnStyle('rgba(239,68,68,0.7)','rgba(239,68,68,0.08)')} onClick={() => act(b.id,'DECLINED')}>
                  <X size={10} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />Decline
                </button>
              </>}
              {b.status === 'CONFIRMED' && <>
                <button style={btnStyle('rgba(203,166,92,0.7)','rgba(203,166,92,0.08)')} onClick={() => alert(`Texting ${b.customerName}...`)}>Text Confirmation</button>
                <button style={btnStyle('rgba(34,197,94,0.8)','rgba(34,197,94,0.1)')} onClick={() => act(b.id,'DONE')}>Mark Done → Log Job</button>
                <button style={btnStyle('rgba(239,68,68,0.7)','rgba(239,68,68,0.08)')} onClick={() => act(b.id,'DECLINED')}>
                  <X size={10} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />Cancel
                </button>
              </>}
              {(b.status === 'DONE' || b.status === 'DECLINED') && (
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontStyle:'italic' }}>{b.status === 'DONE' ? 'Completed' : 'Declined'}</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Availability Tab ─────────────────────────────────────────────────────────
function AvailabilityTab() {
  const today = new Date(2026, 5, 26);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({
    '2026-06-28': 'booked', '2026-06-29': 'booked', '2026-07-01': 'booked',
    '2026-07-02': 'booked', '2026-06-27': 'blocked', '2026-07-04': 'blocked',
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('8:00 AM');
  const [bookingWindow, setBookingWindow] = useState('4');
  const [offDays, setOffDays] = useState<number[]>([0]); // Sunday

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const dayKey = (d: number) => `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const statusOf = (d: number): DayStatus => dayStatuses[dayKey(d)] ?? 'open';

  const dayColor = (s: DayStatus) => s === 'open' ? 'rgba(34,197,94,0.7)' : s === 'booked' ? GOLD : 'rgba(239,68,68,0.6)';
  const dayBg = (s: DayStatus, active: boolean) => active ? (s === 'open' ? 'rgba(34,197,94,0.15)' : s === 'booked' ? 'rgba(203,166,92,0.15)' : 'rgba(239,68,68,0.12)') : 'rgba(255,255,255,0.02)';

  const cycleStatus = (d: number) => {
    const k = dayKey(d);
    setDayStatuses(ds => {
      const cur = ds[k] ?? 'open';
      const next: DayStatus = cur === 'open' ? 'blocked' : cur === 'blocked' ? 'booked' : 'open';
      return { ...ds, [k]: next };
    });
    setSelected(k);
  };

  const toggleOffDay = (d: number) => setOffDays(ds => ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d]);
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>
      <motion.div {...s(0)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'28px' }}>
        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}
            style={{ background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 10px', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}><ChevronLeft size={14} /></button>
          <p style={{ margin:0, fontSize:14, fontWeight:300, color:'#E8E8E8', letterSpacing:'0.05em' }}>{monthName}</p>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}
            style={{ background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 10px', color:'rgba(255,255,255,0.5)', cursor:'pointer' }}><ChevronRight size={14} /></button>
        </div>

        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
          {dayNames.map(d => <p key={d} style={{ margin:0, fontSize:9, color:'rgba(255,255,255,0.25)', textAlign:'center', letterSpacing:'0.1em' }}>{d}</p>)}
        </div>

        {/* Calendar grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const k = dayKey(d);
            const st = statusOf(d);
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
            return (
              <motion.button key={d} onClick={() => cycleStatus(d)} whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
                style={{ aspectRatio:'1', borderRadius:10, border:`1px solid ${selected === k ? dayColor(st) : 'rgba(255,255,255,0.06)'}`, background: dayBg(st, selected === k || st !== 'open'), color: st === 'open' ? (isToday ? '#E8E8E8' : 'rgba(255,255,255,0.55)') : dayColor(st), fontSize:12, fontWeight: isToday ? 500 : 300, cursor:'pointer', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', transition:'border-color 0.15s' }}>
                {isToday && <div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:GOLD }} />}
                {d}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:20, marginTop:20 }}>
          {([['open','Open'],['booked','Booked'],['blocked','Blocked']] as [DayStatus,string][]).map(([st,label]) => (
            <div key={st} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: dayColor(st) }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em' }}>{label}</span>
            </div>
          ))}
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginLeft:'auto', fontStyle:'italic' }}>Click a day to cycle status</span>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div {...s(1)} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'24px', display:'flex', flexDirection:'column', gap:20 }}>
        <p style={{ margin:0, fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.22em', textTransform:'uppercase' }}>Settings</p>
        <div>
          <label style={{ display:'block', fontSize:9, color:GOLD, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>Default Start Time</label>
          <input value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle(false)} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:9, color:GOLD, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>Booking Window (weeks ahead)</label>
          <input value={bookingWindow} onChange={e => setBookingWindow(e.target.value)} style={inputStyle(false)} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:9, color:GOLD, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12 }}>Default Off Days</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {dayNames.map((d, i) => (
              <button key={i} onClick={() => toggleOffDay(i)}
                style={{ padding:'6px 10px', fontSize:10, borderRadius:8, cursor:'pointer', border:`1px solid ${offDays.includes(i) ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, background: offDays.includes(i) ? 'rgba(239,68,68,0.1)' : 'transparent', color: offDays.includes(i) ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.35)', transition:'all 0.15s' }}>{d}</button>
            ))}
          </div>
        </div>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          style={{ marginTop:4, background:`linear-gradient(120deg, #BF9A50, ${GOLD} 40%, #E4C883 65%, ${GOLD})`, color:BG, border:'none', borderRadius:12, padding:'12px', fontSize:11, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>
          Save Settings
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Customers Tab ────────────────────────────────────────────────────────────
function CustomersTab() {
  const [subTab, setSubTab] = useState<'member' | 'guest'>('member');
  const customers = MOCK_CUSTOMERS.filter(c => c.type === subTab);

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {(['member','guest'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            style={{ padding:'8px 20px', fontSize:10, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', borderRadius:10, cursor:'pointer', border:`1px solid ${subTab === t ? GOLD : 'rgba(255,255,255,0.08)'}`, background: subTab === t ? 'rgba(203,166,92,0.1)' : 'transparent', color: subTab === t ? GOLD : 'rgba(255,255,255,0.4)', transition:'all 0.15s' }}>
            {t === 'member' ? 'Members' : 'Guests'}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <AnimatePresence mode="wait">
          {customers.map((c, i) => (
            <motion.div key={c.id} {...s(i)} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 22px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, flexWrap:'wrap' }}>
              <div style={{ flex:'0 0 40px', height:40, borderRadius:'50%', background:'rgba(203,166,92,0.12)', border:'1px solid rgba(203,166,92,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:14, fontWeight:300, color:GOLD }}>{c.name[0]}</span>
              </div>
              <div style={{ flex:1, minWidth:160 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:300, color:'#E8E8E8' }}>{c.name}</p>
                <p style={{ margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.35)' }}>{c.phone} · {c.suburb}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,auto)', gap:'4px 24px', alignItems:'center' }}>
                {[['Jobs',c.jobCount],['Spent','$'+c.totalSpent.toLocaleString()],['Last',c.lastBooking],['Requests',c.totalRequests]].map(([l,v]) => (
                  <div key={String(l)} style={{ textAlign:'center' }}>
                    <p style={{ margin:0, fontSize:9, color:'rgba(203,166,92,0.5)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{l}</p>
                    <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.7)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
                  onClick={() => window.open(`tel:${c.phone}`)}
                  style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(203,166,92,0.3)', background:'rgba(203,166,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:GOLD }}>
                  <Phone size={14} strokeWidth={1.8} />
                </motion.button>
                <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
                  onClick={() => window.open(`sms:${c.phone}`)}
                  style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(203,166,92,0.3)', background:'rgba(203,166,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:GOLD }}>
                  <MessageCircle size={14} strokeWidth={1.8} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type Tab = 'Jobs' | 'Bookings' | 'Availability' | 'Customers';
const TABS: { id: Tab; icon: React.ReactNode }[] = [
  { id:'Jobs', icon:<Briefcase size={13} strokeWidth={1.8} /> },
  { id:'Bookings', icon:<BookOpen size={13} strokeWidth={1.8} /> },
  { id:'Availability', icon:<Calendar size={13} strokeWidth={1.8} /> },
  { id:'Customers', icon:<Users size={13} strokeWidth={1.8} /> },
];

function Dashboard() {
  const [tab, setTab] = useState<Tab>('Jobs');

  const thisMonth = MOCK_JOBS.filter(j => j.date.startsWith('2026-06')).reduce((a, j) => a + j.amount, 0);
  const allTime = MOCK_JOBS.reduce((a, j) => a + j.amount, 0);
  const avgPerJob = Math.round(allTime / (MOCK_JOBS.length || 1));
  const thisWeek = MOCK_JOBS.filter(j => new Date(j.date) >= new Date('2026-06-22')).reduce((a, j) => a + j.amount, 0);
  const thisWeekJobs = MOCK_JOBS.filter(j => new Date(j.date) >= new Date('2026-06-22')).length;

  return (
    <div style={{ minHeight:'100vh', backgroundColor: BG, color:'#E8E8E8' }}>
      {/* Ambient glow */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', width:800, height:400, top:0, left:'50%', transform:'translateX(-50%)', background:'radial-gradient(ellipse, rgba(203,166,92,0.04) 0%, transparent 70%)', filter:'blur(60px)' }} />
      </div>
      {/* Grid texture */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.5 }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'40px 32px' }}>
        {/* Header */}
        <motion.div {...s(0)} style={{ marginBottom:36 }}>
          <p style={{ margin:0, fontSize:9, color:'rgba(203,166,92,0.6)', letterSpacing:'0.28em', textTransform:'uppercase', marginBottom:8 }}>Baser Detailing</p>
          <h1 style={{ margin:0, fontSize:'clamp(28px,3vw,40px)', fontWeight:200, color:'#E8E8E8', letterSpacing:'-0.03em' }}>Command Centre</h1>
        </motion.div>

        {/* Stat chips */}
        <div style={{ display:'flex', gap:14, marginBottom:32, flexWrap:'wrap' }}>
          <StatChip label="This Month" revenue={thisMonth} jobs={MOCK_JOBS.filter(j => j.date.startsWith('2026-06')).length} delay={1} />
          <StatChip label="All Time" revenue={allTime} jobs={MOCK_JOBS.length} delay={2} />
          <StatChip label="Avg Per Job" revenue={avgPerJob} jobs={0} delay={3} />
          <StatChip label="This Week" revenue={thisWeek} jobs={thisWeekJobs} delay={4} />
        </div>

        {/* Tabs */}
        <motion.div {...s(5)} style={{ display:'flex', gap:6, marginBottom:28 }}>
          {TABS.map(({ id, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', borderRadius:10, cursor:'pointer', border:`1px solid ${tab === id ? GOLD : 'rgba(255,255,255,0.08)'}`, background: tab === id ? 'rgba(203,166,92,0.1)' : 'rgba(255,255,255,0.02)', color: tab === id ? GOLD : 'rgba(255,255,255,0.4)', transition:'all 0.2s' }}>
              {icon}{id}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}>
            {tab === 'Jobs' && <JobsTab />}
            {tab === 'Bookings' && <BookingsTab />}
            {tab === 'Availability' && <AvailabilityTab />}
            {tab === 'Customers' && <CustomersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
