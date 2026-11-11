import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import BottomNav from "../components/BottomNav";
import { commissions } from "../services/api";

const FILTERS = [
  { value: "all", label: "All", icon: FiFileText },
  { value: "credited", label: "Credited", icon: FiCheckCircle },
  { value: "rejected", label: "Reversed", icon: FiXCircle },
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const initials = (name) =>
  String(name || "Vendor")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

export default function CommissionHistory() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (background = false) => {
    try {
      background ? setRefreshing(true) : setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (status !== "all") params.set("status", status);
      const response = await commissions(params.toString());
      setData(response?.data || { summary: {}, commissions: [] });
    } catch (requestError) {
      setError(requestError?.message || "Commission history could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadHistory(Boolean(data)), 300);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  const records = Array.isArray(data?.commissions) ? data.commissions : [];
  const summary = data?.summary || {};

  const counts = useMemo(() => ({
    all: Number(summary.totalRecords || 0),
    credited: Number(summary.creditedCount || 0),
    rejected: Number(summary.rejectedCount || 0),
  }), [summary]);

  if (loading && !data) {
    return <main className="ch-state"><style>{styles}</style><span className="ch-loader"/><h2>Loading commissions</h2><p>Reading real commission records from the database.</p></main>;
  }

  if (error && !data) {
    return <main className="ch-state"><style>{styles}</style><span className="ch-error-icon"><FiAlertCircle/></span><h2>Unable to load commissions</h2><p>{error}</p><button onClick={() => loadHistory(false)}><FiRefreshCw/> Try again</button></main>;
  }

  return (
    <>
      <style>{styles}</style>
      <main className="ch-page">
        <section className="ch-frame">
          <header className="ch-header">
            <button className="ch-back" onClick={() => navigate("/profile")} aria-label="Back to profile"><FiArrowLeft/></button>
            <div><small>SALES PANEL</small><strong>Commission History</strong></div>
            <span className="ch-header-icon"><FiDollarSign/></span>
          </header>

          <div className="ch-content">
            <section className="ch-hero">
              <div className="ch-hero-top"><span><FiTrendingUp/> EARNINGS OVERVIEW</span><em>{counts.credited} credited</em></div>
              <p>Total earned commissions</p>
              <h1>{money(summary.totalCommissions)}</h1>
              <div className="ch-summary">
                <span><FiCheckCircle/><span><small>CREDITED</small><strong>{money(summary.creditedCommissions)}</strong></span></span>
                <span><FiXCircle/><span><small>REVERSED</small><strong>{money(summary.rejectedCommissions)}</strong></span></span>
              </div>
            </section>

            <section className="ch-section">
              <div className="ch-title"><div><small>TRANSACTION HISTORY</small><h2>Onboarding commissions</h2></div><span>{records.length} results</span></div>
              <div className="ch-search"><FiSearch/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vendor, service, or reference"/>{refreshing ? <span className="ch-mini-loader"/> : query ? <button onClick={() => setQuery("")}><FiX/></button> : null}</div>
              <div className="ch-filters">
                {FILTERS.map(({value,label,icon:Icon}) => <button key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}><Icon/><span>{label}</span><em>{counts[value]}</em></button>)}
              </div>

              {error && <div className="ch-inline-error"><FiAlertCircle/><span>{error}</span><button onClick={() => loadHistory(true)}>Retry</button></div>}

              {records.length ? <div className="ch-list">{records.map((record,index) => (
                <article className="ch-card" key={record.id} style={{"--i": index}}>
                  <div className="ch-card-main">
                    <span className="ch-avatar">{initials(record.vendorName)}</span>
                    <div className="ch-info"><strong>{record.vendorName}</strong><span><FiBriefcase/>{record.serviceType}</span><small>{record.description}</small></div>
                    <div className="ch-amount"><strong>{money(record.commissionAmount)}</strong><em className={record.status === "credited" ? "credited" : "rejected"}>{record.status === "credited" ? "Credited" : "Reversed"}</em></div>
                  </div>
                  <footer><span><FiCalendar/>{formatDate(record.date)}</span><span>{record.referenceId}</span></footer>
                </article>
              ))}</div> : <div className="ch-empty"><span><FiFileText/></span><h3>No commission records found</h3><p>Try another search or status filter.</p></div>}
            </section>
          </div>
          <BottomNav/>
        </section>
      </main>
    </>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

:root{
  --ch-primary:#0F766E;
  --ch-primary-dark:#0B5F59;
  --ch-primary-deep:#084C48;
  --ch-primary-soft:#DCEFEB;
  --ch-accent:#FF8A4C;
  --ch-accent-dark:#E96F32;
  --ch-accent-soft:#FFF0E8;
  --ch-text:#18323B;
  --ch-white:#FFFFFF;
  --ch-surface:#F0F7F6;
  --ch-muted:#64777D;
  --ch-line:#D8E7E4;
  --ch-danger:#B23547;
  --ch-danger-soft:#FFF2F4;
}

*{box-sizing:border-box}
html,body,#root{width:100%;min-height:100%;margin:0;color-scheme:light only}
body{background:#e7f0ef}
button,input{font:inherit}
button{-webkit-tap-highlight-color:transparent}
button:focus-visible,input:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255,138,76,.24)}

.ch-page{min-height:100dvh;display:flex;justify-content:center;background:#e7f0ef;font-family:Inter,sans-serif;color:var(--ch-text)}
.ch-frame{position:relative;width:100%;max-width:430px;min-height:100dvh;padding-bottom:84px;background:var(--ch-surface);border-inline:1px solid var(--ch-line)}

.ch-header{position:sticky;top:0;z-index:100;height:70px;padding:0 15px;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:9px;background:rgba(255,255,255,.97);border-bottom:1px solid var(--ch-line);box-shadow:0 4px 16px rgba(24,50,59,.05);backdrop-filter:blur(16px)}
.ch-back,.ch-header-icon{width:42px;height:42px;display:grid;place-items:center;padding:0;border:1px solid var(--ch-line);border-radius:50%;background:var(--ch-white);color:var(--ch-primary);font-size:18px;box-shadow:0 5px 16px rgba(24,50,59,.07)}
.ch-back{cursor:pointer;transition:color .2s,background-color .2s,transform .2s}
.ch-back:hover{color:#fff;background:var(--ch-primary);transform:translateY(-1px)}
.ch-header-icon{background:var(--ch-primary-soft)}
.ch-header>div{display:flex;flex-direction:column}
.ch-header small{color:var(--ch-primary);font-size:7px;font-weight:800;letter-spacing:.9px}
.ch-header strong{margin-top:3px;color:var(--ch-text);font-size:12px}

.ch-content{padding:18px 15px 32px}
.ch-hero{position:relative;padding:20px 17px 17px;overflow:hidden;border-radius:20px;color:#fff;background:radial-gradient(circle at 92% 5%,rgba(255,138,76,.27),transparent 31%),linear-gradient(145deg,var(--ch-primary-deep),var(--ch-primary));box-shadow:0 15px 32px rgba(15,118,110,.2)}
.ch-hero:after{content:"";position:absolute;right:-43px;top:17px;width:140px;height:140px;border:1px solid rgba(255,255,255,.12);border-radius:50%}
.ch-hero-top{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center}
.ch-hero-top>span{display:flex;align-items:center;gap:5px;color:#ffd8c4;font-size:7px;font-weight:800;letter-spacing:.9px}
.ch-hero-top em{padding:6px 8px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(255,255,255,.11);color:#e5f2f0;font-size:7px;font-style:normal}
.ch-hero>p{position:relative;z-index:2;margin:20px 0 4px;color:#dcefeb;font-size:9px}
.ch-hero h1{position:relative;z-index:2;margin:0;font-size:34px;letter-spacing:-1.2px}
.ch-summary{position:relative;z-index:2;margin-top:20px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(255,255,255,.1)}
.ch-summary>span{display:flex;align-items:center;gap:8px}
.ch-summary>span+span{padding-left:10px;border-left:1px solid rgba(255,255,255,.16)}
.ch-summary svg{color:var(--ch-accent)}
.ch-summary>span>span{display:flex;flex-direction:column}
.ch-summary small{color:#c9ddda;font-size:6px;font-weight:800}
.ch-summary strong{margin-top:4px;font-size:11px}

.ch-section{margin-top:24px}
.ch-title{margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
.ch-title small{color:var(--ch-primary);font-size:8px;font-weight:800;letter-spacing:1px}
.ch-title h2{margin:4px 0 0;color:var(--ch-text);font-size:17px}
.ch-title>span{padding:5px 8px;border-radius:9px;background:var(--ch-primary-soft);color:var(--ch-primary-dark);font-size:7px;font-weight:700}

.ch-search{height:50px;padding:0 10px 0 13px;display:flex;align-items:center;gap:9px;border:1px solid var(--ch-line);border-radius:13px;background:var(--ch-white);color:var(--ch-primary);transition:border-color .2s,box-shadow .2s}
.ch-search:hover{border-color:#afd3cd}
.ch-search:focus-within{border-color:var(--ch-accent);box-shadow:0 0 0 4px rgba(255,138,76,.18)}
.ch-search input{min-width:0;height:100%;flex:1;border:0;outline:0;background:transparent;color:var(--ch-text);font-size:13px}
.ch-search input::placeholder{color:#829398}
.ch-search button{width:31px;height:31px;display:grid;place-items:center;padding:0;border:0;border-radius:9px;background:var(--ch-accent-soft);color:var(--ch-accent-dark);cursor:pointer}
.ch-mini-loader,.ch-loader{border:3px solid var(--ch-primary-soft);border-top-color:var(--ch-accent);border-radius:50%;animation:spin .8s linear infinite}
.ch-mini-loader{width:16px;height:16px}

.ch-filters{margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.ch-filters button{min-height:41px;display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--ch-line);border-radius:11px;background:var(--ch-white);color:var(--ch-muted);font-size:7px;font-weight:700;cursor:pointer;transition:color .2s,background-color .2s,border-color .2s,transform .15s}
.ch-filters button:hover{color:var(--ch-primary);border-color:#afd3cd;background:#fbfdfd}
.ch-filters em{min-width:17px;height:17px;display:grid;place-items:center;border-radius:7px;background:var(--ch-surface);font-size:6px;font-style:normal}
.ch-filters .active{border-color:var(--ch-primary);background:linear-gradient(145deg,var(--ch-primary-dark),var(--ch-primary));color:#fff;box-shadow:0 7px 16px rgba(15,118,110,.22)}
.ch-filters .active em{color:#71300c;background:var(--ch-accent)}
.ch-filters button:active{transform:scale(.98)}

.ch-list{margin-top:12px;display:flex;flex-direction:column;gap:11px}
.ch-card{overflow:hidden;border:1px solid var(--ch-line);border-radius:17px;background:var(--ch-white);box-shadow:0 8px 22px rgba(24,50,59,.07);animation:rise .35s both;animation-delay:calc(var(--i)*40ms);transition:transform .2s,box-shadow .2s,border-color .2s}
.ch-card:hover{transform:translateY(-2px);border-color:#b9d9d4;box-shadow:0 12px 28px rgba(24,50,59,.12)}
.ch-card-main{padding:13px;display:flex;align-items:flex-start;gap:10px}
.ch-avatar{width:44px;height:44px;display:grid;place-items:center;flex:none;border-radius:14px;background:var(--ch-primary-soft);color:var(--ch-primary-dark);font-size:9px;font-weight:800}
.ch-info{min-width:0;flex:1;display:flex;flex-direction:column}
.ch-info strong{color:var(--ch-text);font-size:10px}
.ch-info span{margin-top:5px;display:flex;align-items:center;gap:4px;color:var(--ch-primary);font-size:7px}
.ch-info small{margin-top:4px;overflow:hidden;color:var(--ch-muted);font-size:7px;text-overflow:ellipsis;white-space:nowrap}
.ch-amount{display:flex;align-items:flex-end;flex-direction:column;gap:7px}
.ch-amount>strong{color:var(--ch-text);font-size:13px}
.ch-amount em{padding:5px 7px;border-radius:9px;font-size:7px;font-style:normal;font-weight:700}
.ch-amount .credited{background:var(--ch-primary-soft);color:var(--ch-primary-dark)}
.ch-amount .rejected{background:var(--ch-danger-soft);color:var(--ch-danger)}
.ch-card footer{min-height:43px;padding:8px 11px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e8f0ee;background:#fbfdfd;color:var(--ch-muted);font-size:7px}
.ch-card footer span{display:flex;align-items:center;gap:5px}
.ch-card footer svg{color:var(--ch-accent-dark)}

.ch-empty{min-height:230px;margin-top:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #b8d4cf;border-radius:17px;background:var(--ch-white);text-align:center}
.ch-empty>span{width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:var(--ch-primary-soft);color:var(--ch-primary);font-size:21px}
.ch-empty h3{margin:13px 0 5px;color:var(--ch-text);font-size:14px}
.ch-empty p{margin:0;color:var(--ch-muted);font-size:9px}

.ch-inline-error{margin-top:10px;padding:10px;display:flex;align-items:center;gap:7px;border:1px solid #efc7ce;border-radius:10px;background:var(--ch-danger-soft);color:var(--ch-danger);font-size:8px}
.ch-inline-error span{flex:1}
.ch-inline-error button{border:0;background:transparent;color:var(--ch-danger);font-weight:800;cursor:pointer}

.ch-state{width:100%;max-width:430px;min-height:100dvh;margin:auto;padding:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ch-surface);color:var(--ch-text);font-family:Inter,sans-serif;text-align:center}
.ch-loader{width:44px;height:44px}
.ch-error-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;background:var(--ch-danger-soft);color:var(--ch-danger);font-size:22px}
.ch-state h2{margin:15px 0 6px;font-size:16px}
.ch-state p{margin:0;color:var(--ch-muted);font-size:10px}
.ch-state button{margin-top:14px;padding:10px 15px;display:flex;align-items:center;gap:6px;border:0;border-radius:10px;background:var(--ch-primary);color:#fff;font-size:10px;font-weight:700;cursor:pointer}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
@media(min-width:431px){.ch-frame{box-shadow:0 0 40px rgba(24,50,59,.11)}}
@media(max-width:350px){.ch-content{padding-left:12px;padding-right:12px}.ch-summary{grid-template-columns:1fr}.ch-summary>span+span{padding-top:10px;padding-left:0;border-top:1px solid rgba(255,255,255,.16);border-left:0}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
