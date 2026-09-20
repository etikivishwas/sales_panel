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
*{box-sizing:border-box}html,body,#root{width:100%;min-height:100%;margin:0}body{background:#edf3fb}button,input{font:inherit}.ch-page{min-height:100dvh;display:flex;justify-content:center;background:#edf3fb;font-family:Inter,sans-serif;color:#102535}.ch-frame{position:relative;width:100%;max-width:430px;min-height:100dvh;padding-bottom:84px;background:#f4f7fa;border-left:1px solid #dbe3e8;border-right:1px solid #dbe3e8;box-shadow:0 0 40px rgba(20,45,60,.09)}.ch-header{position:sticky;top:0;z-index:100;height:70px;padding:0 15px;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:9px;background:rgba(255,255,255,.96);border-bottom:1px solid #e0e8ec;backdrop-filter:blur(16px)}.ch-back,.ch-header-icon{width:42px;height:42px;display:grid;place-items:center;border:1px solid #dce5e9;border-radius:50%;background:#fff;color:#071f30;font-size:18px}.ch-back{cursor:pointer}.ch-header-icon{background:#e7f7f1;color:#087553}.ch-header>div{display:flex;flex-direction:column}.ch-header small{color:#0a8b68;font-size:7px;font-weight:800;letter-spacing:.9px}.ch-header strong{margin-top:3px;font-size:12px}.ch-content{padding:18px 15px 32px}.ch-hero{position:relative;padding:20px 17px 17px;overflow:hidden;border-radius:20px;color:#fff;background:radial-gradient(circle at 92% 5%,rgba(91,239,169,.27),transparent 31%),linear-gradient(145deg,#061b2b,#0b3043);box-shadow:0 15px 32px rgba(7,31,48,.18)}.ch-hero:after{content:"";position:absolute;right:-43px;top:17px;width:140px;height:140px;border:1px solid rgba(255,255,255,.08);border-radius:50%}.ch-hero-top{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center}.ch-hero-top>span{display:flex;align-items:center;gap:5px;color:#69efb0;font-size:7px;font-weight:800;letter-spacing:.9px}.ch-hero-top em{padding:6px 8px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:#d1dfe4;font-size:7px;font-style:normal}.ch-hero>p{position:relative;z-index:2;margin:20px 0 4px;color:#b9ccd4;font-size:9px}.ch-hero h1{position:relative;z-index:2;margin:0;font-size:34px;letter-spacing:-1.2px}.ch-summary{position:relative;z-index:2;margin-top:20px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:rgba(255,255,255,.08)}.ch-summary>span{display:flex;align-items:center;gap:8px}.ch-summary>span+span{padding-left:10px;border-left:1px solid rgba(255,255,255,.12)}.ch-summary svg{color:#69efb0}.ch-summary>span>span{display:flex;flex-direction:column}.ch-summary small{color:#91aab5;font-size:6px;font-weight:800}.ch-summary strong{margin-top:4px;font-size:11px}.ch-section{margin-top:24px}.ch-title{margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-end}.ch-title small{color:#0a8b68;font-size:8px;font-weight:800;letter-spacing:1px}.ch-title h2{margin:4px 0 0;font-size:17px}.ch-title>span{padding:5px 8px;border-radius:9px;background:#e8f6f1;color:#087553;font-size:7px;font-weight:700}.ch-search{height:50px;padding:0 10px 0 13px;display:flex;align-items:center;gap:9px;border:1px solid #d1dce2;border-radius:13px;background:#fff;color:#71818a}.ch-search:focus-within{border-color:#0b8a68;box-shadow:0 0 0 4px rgba(11,138,104,.1)}.ch-search input{min-width:0;height:100%;flex:1;border:0;outline:0;background:transparent;font-size:13px}.ch-search button{width:31px;height:31px;display:grid;place-items:center;border:0;border-radius:9px;background:#eef3f5;cursor:pointer}.ch-mini-loader,.ch-loader{border:3px solid #dfe8ec;border-top-color:#0b8a68;border-radius:50%;animation:spin .8s linear infinite}.ch-mini-loader{width:16px;height:16px}.ch-filters{margin-top:10px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ch-filters button{min-height:41px;display:flex;align-items:center;justify-content:center;gap:5px;border:1px solid #d7e1e6;border-radius:11px;background:#fff;color:#60747e;font-size:7px;font-weight:700;cursor:pointer}.ch-filters em{min-width:17px;height:17px;display:grid;place-items:center;border-radius:7px;background:#edf2f4;font-size:6px;font-style:normal}.ch-filters .active{border-color:#12384c;background:linear-gradient(145deg,#071f30,#10394c);color:#fff}.ch-list{margin-top:12px;display:flex;flex-direction:column;gap:11px}.ch-card{overflow:hidden;border:1px solid #dfe7eb;border-radius:17px;background:#fff;box-shadow:0 8px 22px rgba(23,48,65,.07);animation:rise .35s both;animation-delay:calc(var(--i)*40ms)}.ch-card-main{padding:13px;display:flex;align-items:flex-start;gap:10px}.ch-avatar{width:44px;height:44px;display:grid;place-items:center;flex:none;border-radius:14px;background:#e7f0fa;color:#315d79;font-size:9px;font-weight:800}.ch-info{min-width:0;flex:1;display:flex;flex-direction:column}.ch-info strong{font-size:10px}.ch-info span{margin-top:5px;display:flex;align-items:center;gap:4px;color:#70818a;font-size:7px}.ch-info small{margin-top:4px;overflow:hidden;color:#8a979e;font-size:7px;text-overflow:ellipsis;white-space:nowrap}.ch-amount{display:flex;align-items:flex-end;flex-direction:column;gap:7px}.ch-amount>strong{font-size:13px}.ch-amount em{padding:5px 7px;border-radius:9px;font-size:7px;font-style:normal;font-weight:700}.ch-amount .credited{background:#ddf8ea;color:#087553}.ch-amount .rejected{background:#ffe7ea;color:#ad3044}.ch-card footer{min-height:43px;padding:8px 11px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #edf1f3;background:#fafcfd;color:#819098;font-size:7px}.ch-card footer span{display:flex;align-items:center;gap:5px}.ch-empty{min-height:230px;margin-top:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #cad7dd;border-radius:17px;background:#fff;text-align:center}.ch-empty>span{width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:#e7f6f1;color:#087553;font-size:21px}.ch-empty h3{margin:13px 0 5px;font-size:14px}.ch-empty p{margin:0;color:#75848d;font-size:9px}.ch-inline-error{margin-top:10px;padding:10px;display:flex;align-items:center;gap:7px;border:1px solid #efc7ce;border-radius:10px;background:#fff3f5;color:#ad3044;font-size:8px}.ch-inline-error span{flex:1}.ch-inline-error button{border:0;background:transparent;color:#9c2940;font-weight:800}.ch-state{width:100%;max-width:430px;min-height:100dvh;margin:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f4f7fa;font-family:Inter,sans-serif;text-align:center}.ch-loader{width:44px;height:44px}.ch-error-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;background:#fff0f2;color:#b23547;font-size:22px}.ch-state h2{margin:15px 0 6px;font-size:16px}.ch-state p{margin:0;color:#71808a;font-size:10px}.ch-state button{margin-top:14px;padding:10px 15px;display:flex;gap:6px;border:0;border-radius:10px;background:#071f30;color:#fff;font-size:10px;font-weight:700}@keyframes spin{to{transform:rotate(360deg)}}@keyframes rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}`;
