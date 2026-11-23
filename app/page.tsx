 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock, Clock3, Globe2, Hourglass, Play, Pause, RotateCcw,
  Plus, Trash2, X, Bell, TimerReset, CalendarDays, Sun, Moon, Check
} from "lucide-react";

type Tab = "clock" | "alarm" | "stopwatch" | "timer";
type Alarm = { id: number; time: string; label: string; enabled: boolean };
type WorldCity = { name: string; zone: string; country: string };

const cities: WorldCity[] = [
  { name: "Bangkok", zone: "Asia/Bangkok", country: "Thailand" },
  { name: "Tokyo", zone: "Asia/Tokyo", country: "Japan" },
  { name: "Seoul", zone: "Asia/Seoul", country: "South Korea" },
  { name: "London", zone: "Europe/London", country: "United Kingdom" },
  { name: "New York", zone: "America/New_York", country: "United States" }
];

const pad = (n: number) => String(n).padStart(2, "0");
const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const formatDuration = (ms: number, tenths = false) => {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const fraction = Math.floor((total % 1000) / 100);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${tenths ? `.${fraction}` : ""}`;
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("clock");
  const [now, setNow] = useState<Date | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: 1, time: "06:30", label: "ตื่นนอน", enabled: true },
    { id: 2, time: "07:00", label: "เตรียมตัว", enabled: false }
  ]);
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState("07:30");
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [swStartedAt, setSwStartedAt] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);
  const [timerInput, setTimerInput] = useState("05:00");
  const [timerRemaining, setTimerRemaining] = useState(300000);
  const [timerEndAt, setTimerEndAt] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!swRunning || swStartedAt === null) return;
    const id = window.setInterval(() => setSwElapsed(Date.now() - swStartedAt), 30);
    return () => window.clearInterval(id);
  }, [swRunning, swStartedAt]);

  useEffect(() => {
    if (!timerRunning || timerEndAt === null) return;
    const update = () => {
      const left = Math.max(0, timerEndAt - Date.now());
      setTimerRemaining(left);
      if (left <= 0) setTimerRunning(false);
    };
    update();
    const id = window.setInterval(update, 100);
    return () => window.clearInterval(id);
  }, [timerRunning, timerEndAt]);

  const dateText = useMemo(() => now?.toLocaleDateString("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }) ?? "กำลังโหลดวันที่…", [now]);

  const localTime = now ? formatTime(now) : "--:--:--";
  const hourAngle = now ? ((now.getHours() % 12) + now.getMinutes() / 60) * 30 : 0;
  const minuteAngle = now ? (now.getMinutes() + now.getSeconds() / 60) * 6 : 0;
  const secondAngle = now ? now.getSeconds() * 6 : 0;

  const addAlarm = () => {
    setAlarms(current => [...current, {
      id: Date.now(), time: newAlarmTime, label: newAlarmLabel.trim() || "นาฬิกาปลุก", enabled: true
    }].sort((a, b) => a.time.localeCompare(b.time)));
    setShowAlarmForm(false);
    setNewAlarmLabel("");
  };

  const startStopwatch = () => {
    setSwStartedAt(Date.now() - swElapsed);
    setSwRunning(true);
  };
  const resetStopwatch = () => {
    setSwRunning(false); setSwElapsed(0); setSwStartedAt(null); setLaps([]);
  };
  const addLap = () => setLaps(current => [swElapsed, ...current]);

  const readTimerInput = () => {
    const [m = "0", s = "0"] = timerInput.split(":");
    const ms = (Math.max(0, Number(m) || 0) * 60 + Math.min(59, Math.max(0, Number(s) || 0))) * 1000;
    return ms;
  };
  const startTimer = () => {
    const base = timerRemaining > 0 ? timerRemaining : readTimerInput();
    if (base <= 0) return;
    setTimerRemaining(base);
    setTimerEndAt(Date.now() + base);
    setTimerRunning(true);
  };
  const pauseTimer = () => {
    setTimerRunning(false); setTimerEndAt(null);
  };
  const resetTimer = () => {
    setTimerRunning(false); setTimerEndAt(null); setTimerRemaining(readTimerInput());
  };
  const updateTimerInput = (value: string) => {
    setTimerInput(value); 
    if (!timerRunning) {
      const [m = "0", s = "0"] = value.split(":");
      setTimerRemaining((Math.max(0, Number(m) || 0) * 60 + Math.min(59, Math.max(0, Number(s) || 0))) * 1000);
    }
  };

  const navItems: { id: Tab; label: string; icon: typeof Clock3 }[] = [
    { id: "clock", label: "นาฬิกา", icon: Clock3 },
    { id: "alarm", label: "ปลุก", icon: AlarmClock },
    { id: "stopwatch", label: "จับเวลา", icon: TimerReset },
    { id: "timer", label: "ตัวตั้งเวลา", icon: Hourglass }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Clock3 size={22} /></div><span>Clockly</span></div>
        <div className="side-caption">MENU</div>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-button ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom"><div className="tiny-orb"><Sun size={17} /></div><div><b>Make time count.</b><small>Every moment matters.</small></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div><div className="eyebrow">YOUR PERSONAL TIMEKEEPER</div><h1>{tab === "clock" ? "นาฬิกา" : tab === "alarm" ? "นาฬิกาปลุก" : tab === "stopwatch" ? "จับเวลา" : "ตัวตั้งเวลา"}</h1></div>
          <div className="top-date"><CalendarDays size={17} /><span>{dateText}</span></div>
        </header>

        {tab === "clock" && <div className="page-content">
          <div className="hero-grid">
            <section className="panel clock-panel">
              <div className="panel-heading"><div><span className="eyebrow">LOCAL TIME</span><h2>เวลาปัจจุบัน</h2></div><span className="live-pill"><i /> LIVE</span></div>
              <div className="clock-face" aria-label="นาฬิกา analog">
                {Array.from({ length: 12 }, (_, i) => <span key={i} className="clock-number" style={{ transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-112px) rotate(${-i * 30}deg)` }}>{i === 0 ? 12 : i}</span>)}
                <div className="hand hour-hand" style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }} />
                <div className="hand minute-hand" style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }} />
                <div className="hand second-hand" style={{ transform: `translateX(-50%) rotate(${secondAngle}deg)` }} />
                <div className="clock-pin" />
              </div>
              <div className="digital-time">{localTime}</div>
              <div className="date-line">{dateText}</div>
              <div className="timezone-label"><Globe2 size={14} /> {Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone"}</div>
            </section>
            <section className="panel today-panel">
              <div className="panel-heading"><div><span className="eyebrow">TODAY</span><h2>วันนี้</h2></div><div className="sun-icon"><Sun size={20} /></div></div>
              <div className="today-date">{now ? now.getDate() : "--"}</div>
              <div className="today-month">{now?.toLocaleDateString("th-TH", { month: "long", year: "numeric" }) ?? " "}</div>
              <div className="today-divider" />
              <div className="today-detail"><span>วัน</span><b>{now?.toLocaleDateString("th-TH", { weekday: "long" }) ?? "—"}</b></div>
              <div className="today-detail"><span>รูปแบบเวลา</span><b>24 ชั่วโมง</b></div>
            </section>
          </div>
          <section className="world-section">
            <div className="section-heading"><div><span className="eyebrow">AROUND THE WORLD</span><h2>เวลาทั่วโลก</h2></div><span className="muted-note">เวลาท้องถิ่นของแต่ละเมือง</span></div>
            <div className="world-grid">{cities.map(city => <div className="world-card" key={city.name}>
              <div className="world-top"><div><b>{city.name}</b><small>{city.country}</small></div><Globe2 size={17} /></div>
              <strong>{now ? now.toLocaleTimeString("en-GB", { timeZone: city.zone, hour12: false }) : "--:--:--"}</strong>
              <small>{now ? now.toLocaleDateString("en-US", { timeZone: city.zone, weekday: "short", day: "numeric", month: "short" }) : "—"}</small>
            </div>)}</div>
          </section>
        </div>}

        {tab === "alarm" && <div className="page-content narrow-content">
          <section className="panel tool-panel">
            <div className="section-heading"><div><span className="eyebrow">WAKE UP ON TIME</span><h2>รายการปลุก</h2></div><button className="primary-button" onClick={() => setShowAlarmForm(true)}><Plus size={17} /> เพิ่มการปลุก</button></div>
            <p className="helper-text">ตั้งเวลาและเปิดหรือปิดการปลุกได้ตามต้องการ</p>
            <div className="alarm-list">{alarms.length === 0 ? <div className="empty-state"><Bell size={26} /><p>ยังไม่มีรายการปลุก</p></div> : alarms.map(alarm => <div className="alarm-row" key={alarm.id}>
              <div className="alarm-symbol"><AlarmClock size={21} /></div><div className="alarm-info"><strong>{alarm.time}</strong><span>{alarm.label}</span></div>
              <button className={`toggle ${alarm.enabled ? "on" : ""}`} aria-label="เปิดหรือปิดการปลุก" onClick={() => setAlarms(items => items.map(a => a.id === alarm.id ? { ...a, enabled: !a.enabled } : a))}><i /></button>
              <button className="icon-button delete-button" aria-label="ลบการปลุก" onClick={() => setAlarms(items => items.filter(a => a.id !== alarm.id))}><Trash2 size={17} /></button>
            </div>)}</div>
            <div className="prototype-note"><Bell size={16} /><span>ต้นแบบนี้แสดงการตั้งค่าการปลุกในหน้าเว็บ แต่ยังไม่ส่งเสียงเมื่อถึงเวลา</span></div>
          </section>
        </div>}

        {tab === "stopwatch" && <div className="page-content narrow-content">
          <section className="panel tool-panel centered-tool">
            <span className="eyebrow">MEASURE EVERY MOMENT</span><h2>นาฬิกาจับเวลา</h2>
            <div className="stopwatch-display">{formatDuration(swElapsed, true)}</div>
            <div className="tool-status">{swRunning ? <><i className="status-dot" /> กำลังจับเวลา</> : "พร้อมเริ่มจับเวลา"}</div>
            <div className="control-row">
              {swRunning ? <button className="primary-button" onClick={() => setSwRunning(false)}><Pause size={18} /> หยุดชั่วคราว</button> : <button className="primary-button" onClick={startStopwatch}><Play size={18} /> {swElapsed > 0 ? "ทำต่อ" : "เริ่ม"}</button>}
              <button className="secondary-button" onClick={addLap} disabled={!swRunning}><FlagIcon /> รอบ</button>
              <button className="secondary-button" onClick={resetStopwatch}><RotateCcw size={17} /> รีเซ็ต</button>
            </div>
            {laps.length > 0 && <div className="laps"><div className="lap-heading"><b>รอบที่บันทึก</b><span>เวลา</span></div>{laps.map((lap, i) => <div className="lap-row" key={`${lap}-${i}`}><span>รอบ {laps.length - i}</span><b>{formatDuration(lap, true)}</b></div>)}</div>}
          </section>
        </div>}

        {tab === "timer" && <div className="page-content narrow-content">
          <section className="panel tool-panel centered-tool">
            <span className="eyebrow">COUNTDOWN</span><h2>ตัวตั้งเวลา</h2>
            <div className="timer-display">{formatDuration(timerRemaining)}</div>
            <div className="timer-input-wrap"><label htmlFor="timer-input">ตั้งเวลานับถอยหลัง (นาที:วินาที)</label><input id="timer-input" value={timerInput} onChange={e => updateTimerInput(e.target.value)} disabled={timerRunning} placeholder="05:00" /></div>
            <div className="control-row">
              {timerRunning ? <button className="primary-button" onClick={pauseTimer}><Pause size={18} /> พัก</button> : <button className="primary-button" onClick={startTimer} disabled={timerRemaining <= 0}><Play size={18} /> เริ่ม</button>}
              <button className="secondary-button" onClick={resetTimer}><RotateCcw size={17} /> รีเซ็ต</button>
            </div>
            <div className="timer-hint">{timerRemaining === 0 ? "หมดเวลาแล้ว" : timerRunning ? "กำลังนับถอยหลัง…" : "ตั้งเวลาแล้วกดเริ่มได้เลย"}</div>
            <div className="quick-times">{[1, 5, 10, 15, 30].map(min => <button key={min} onClick={() => { setTimerInput(`${pad(min)}:00`); setTimerRemaining(min * 60000); setTimerRunning(false); setTimerEndAt(null); }} disabled={timerRunning}>{min} นาที</button>)}</div>
          </section>
        </div>}

        <footer className="footer"><span>Clockly</span><span>Simple time. Clear mind.</span></footer>
      </section>

      <nav className="mobile-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "selected" : ""} onClick={() => setTab(id)}><Icon size={20} /><span>{label}</span></button>)}</nav>

      {showAlarmForm && <div className="modal-backdrop" onClick={() => setShowAlarmForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-heading"><div><span className="eyebrow">NEW ALARM</span><h2>เพิ่มการปลุก</h2></div><button className="icon-button" onClick={() => setShowAlarmForm(false)}><X size={20} /></button></div>
        <label htmlFor="alarm-time">เวลา</label><input id="alarm-time" type="time" value={newAlarmTime} onChange={e => setNewAlarmTime(e.target.value)} />
        <label htmlFor="alarm-label">ชื่อรายการ</label><input id="alarm-label" value={newAlarmLabel} onChange={e => setNewAlarmLabel(e.target.value)} placeholder="เช่น ตื่นนอน, ไปเรียน" />
        <button className="primary-button full-button" onClick={addAlarm}><Check size={18} /> บันทึกการปลุก</button>
      </div></div>}
    </main>
  );
}

function FlagIcon() {
  return <span className="flag-symbol">⚑</span>;
}
