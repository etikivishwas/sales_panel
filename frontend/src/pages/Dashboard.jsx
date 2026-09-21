import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiGift,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { dashboard } from "../services/api";

const VENDOR_REGISTRATION_PATH = "/vendor-registration";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatStatus = (status) =>
  String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusClass = (status) => {
  const value = String(status || "pending").trim().toLowerCase().replace(/\s+/g, "_");
  if (["approved", "active", "completed"].includes(value)) return "status-approved";
  if (["rejected", "cancelled"].includes(value)) return "status-rejected";
  if (["in_review", "under_review", "submitted"].includes(value)) return "status-review";
  return "status-pending";
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await dashboard();
      setDashboardData(response?.data || null);
    } catch (requestError) {
      console.error("Dashboard loading error:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "The dashboard could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statistics = useMemo(() => {
    const metrics = dashboardData?.metrics || {};
    return [
      {
        id: "vendors",
        label: "Vendors onboarded",
        value: metrics.totalVendors || 0,
        description: "Total registered vendors",
        icon: FiUsers,
        className: "vendors",
      },
      {
        id: "paid-commissions",
        label: "Paid commissions",
        value: money(metrics.paidCommissions),
        description: "Commission from paid listings",
        icon: FiDollarSign,
        className: "paid-commissions",
      },
      {
        id: "free-commissions",
        label: "Free commissions",
        value: money(metrics.freeCommissions),
        description: "Commission from free listings",
        icon: FiGift,
        className: "free-commissions",
      },
      {
        id: "withdrawals",
        label: "Pending withdrawals",
        value: money(metrics.pendingWithdrawals),
        description: "Available withdrawal amount",
        icon: FiClock,
        className: "withdrawals",
        action: { label: "Withdraw", path: "/withdraw" },
      },
    ];
  }, [dashboardData]);

  const recentRegistrations = dashboardData?.recentRegistrations || [];
  const executiveFirstName = dashboardData?.executive?.firstName || "Executive";

  if (loading) {
    return (
      <main className="sales-dashboard-state">
        <style>{dashboardStyles}</style>
        <span className="dashboard-loader" />
        <h2>Loading dashboard</h2>
        <p>Preparing the latest sales performance information.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sales-dashboard-state">
        <style>{dashboardStyles}</style>
        <span className="dashboard-error-icon"><FiRefreshCw /></span>
        <h2>Dashboard could not be loaded</h2>
        <p>{error}</p>
        <button type="button" className="dashboard-retry" onClick={loadDashboard}>
          <FiRefreshCw /> Try again
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{dashboardStyles}</style>
      <main className="sales-dashboard-page">
        <section className="sales-dashboard-frame">
          <div className="sales-dashboard-header-wrap"><Header /></div>

          <div className="sales-dashboard-content">
            <section className="sales-dashboard-hero">
              <div className="hero-top">
                <span className="hero-label"><FiTrendingUp /> SALES OVERVIEW</span>
                <span className="hero-date">Today</span>
              </div>
              <h1>Welcome back, {executiveFirstName}.</h1>
              <p>Track vendor onboarding, paid commissions, free commissions and recent registrations.</p>
              <div className="hero-highlight">
                <span className="hero-highlight-icon"><FiBriefcase /></span>
                <span>
                  <strong>Sales workspace is ready</strong>
                  <small>Review pending vendors and continue today's follow-ups.</small>
                </span>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <div><small>PERFORMANCE</small><h2>Sales summary</h2></div>
                <span>Updated today</span>
              </div>

              <div className="stats-grid">
                {statistics.map(({ id, label, value, description, icon: Icon, className, action }) => (
                  <article className={`stat-card ${className}`} key={id}>
                    <span className="stat-icon"><Icon /></span>
                    <div className="stat-copy">
                      <small>{label.toUpperCase()}</small>
                      <strong>{value}</strong>
                      <span>{description}</span>
                    </div>
                    {action && (
                      <Link to={action.path} className="stat-action">
                        {action.label} <FiArrowRight />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-section">
              <div className="registration-heading">
                <div><small>LATEST ACTIVITY</small><h2>Recent registrations</h2></div>
                <Link to="/vendors" className="view-all">View all <FiArrowRight /></Link>
              </div>

              {recentRegistrations.length > 0 ? (
                <div className="registration-list">
                  {recentRegistrations.map((vendor) => (
                    <article className="registration-item" key={vendor.id}>
                      <span className="registration-avatar">
                        {vendor.initials || vendor.name?.slice(0, 2).toUpperCase() || "VN"}
                      </span>
                      <span className="registration-info">
                        <strong>{vendor.name || "Vendor"}</strong>
                        <small>{vendor.serviceType || "General Service"}</small>
                      </span>
                      <em className={`registration-status ${getStatusClass(vendor.status)}`}>
                        {formatStatus(vendor.status)}
                      </em>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="registration-empty">
                  <span><FiCheckCircle /></span>
                  <h3>No recent registrations</h3>
                  <p>New vendor registrations will appear here.</p>
                </div>
              )}
            </section>
          </div>

          <Link
            to={VENDOR_REGISTRATION_PATH}
            className="vendor-add-button"
            aria-label="Register a new vendor"
            title="Register a new vendor"
          >
            <FiPlus />
          </Link>

          <BottomNav />
        </section>
      </main>
    </>
  );
}

const dashboardStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
*{box-sizing:border-box}html,body,#root{width:100%;min-height:100%;margin:0}body{overflow-x:hidden;background:#edf3fb}button,input{font:inherit}
.sales-dashboard-page{width:100%;min-height:100vh;min-height:100dvh;display:flex;align-items:flex-start;justify-content:center;background:radial-gradient(circle at 12% 10%,rgba(55,139,183,.1),transparent 28%),radial-gradient(circle at 90% 85%,rgba(44,191,137,.09),transparent 29%),#edf3fb;color:#102535;font-family:"Inter",sans-serif}
.sales-dashboard-frame{position:relative;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;padding-bottom:84px;overflow-x:hidden;background:#f4f7fa;border-left:1px solid #dbe3e8;border-right:1px solid #dbe3e8;box-shadow:0 0 40px rgba(20,45,60,.09)}
.sales-dashboard-header-wrap{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97);border-bottom:1px solid #e1e8ec;backdrop-filter:blur(16px)}
.sales-dashboard-content{width:100%;padding:19px 15px 30px}.sales-dashboard-hero{position:relative;padding:20px 17px 18px;overflow:hidden;border-radius:20px;color:#fff;background:radial-gradient(circle at 92% 5%,rgba(91,239,169,.26),transparent 31%),radial-gradient(circle at 3% 100%,rgba(72,137,171,.25),transparent 35%),linear-gradient(145deg,#061b2b,#0b3043);box-shadow:0 15px 32px rgba(7,31,48,.18)}
.sales-dashboard-hero:after{content:"";position:absolute;top:17px;right:-43px;width:140px;height:140px;border:1px solid rgba(255,255,255,.08);border-radius:50%}.hero-top{position:relative;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.hero-label{display:flex;align-items:center;gap:5px;color:#69efb0;font-size:8px;font-weight:800;letter-spacing:1.1px}.hero-date{padding:6px 8px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:#c8d7dd;font-size:7px;font-weight:600}
.sales-dashboard-hero h1{position:relative;z-index:2;margin:12px 0 7px;max-width:300px;color:#fff;font-size:24px;line-height:1.14;letter-spacing:-.75px}.sales-dashboard-hero>p{position:relative;z-index:2;max-width:340px;margin:0;color:#bdced6;font-size:10px;line-height:1.55}.hero-highlight{position:relative;z-index:2;margin-top:17px;padding:11px 12px;display:flex;align-items:center;gap:9px;border:1px solid rgba(97,237,172,.2);border-radius:13px;background:rgba(97,237,172,.09)}.hero-highlight-icon{width:34px;height:34px;display:grid;place-items:center;flex:none;border-radius:11px;background:rgba(97,237,172,.14);color:#69efb0;font-size:16px}.hero-highlight>span:last-child{min-width:0;display:flex;flex-direction:column}.hero-highlight strong{color:#f0f8f5;font-size:9px}.hero-highlight small{margin-top:3px;color:#a9c2cb;font-size:7px}
.dashboard-section{margin-top:24px}.section-heading,.registration-heading{margin-bottom:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px}.section-heading small,.registration-heading small{color:#0a8b68;font-size:8px;font-weight:800;letter-spacing:1.1px}.section-heading h2,.registration-heading h2{margin:4px 0 0;color:#102b3a;font-size:17px;letter-spacing:-.35px}.section-heading>span{color:#849199;font-size:8px}
.stats-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.stat-card{position:relative;min-width:0;min-height:136px;padding:14px 13px;overflow:hidden;border:1px solid #dfe7eb;border-radius:17px;background:#fff;box-shadow:0 8px 22px rgba(23,48,65,.07)}.stat-card:before{content:"";position:absolute;top:0;left:0;width:100%;height:3px}.stat-card.vendors:before{background:linear-gradient(90deg,#147da2,#55b5d5)}.stat-card.paid-commissions:before{background:linear-gradient(90deg,#0b976e,#65e3ae)}.stat-card.free-commissions:before{background:linear-gradient(90deg,#6d55c7,#a78bfa)}.stat-card.withdrawals{grid-column:1/-1;min-height:127px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px}.stat-card.withdrawals:before{background:linear-gradient(90deg,#d89b30,#f0cf75)}
.stat-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:12px;font-size:18px}.vendors .stat-icon{background:#e8f3fa;color:#176b91}.paid-commissions .stat-icon{background:#e3f8ef;color:#087553}.free-commissions .stat-icon{background:#f0ebff;color:#6748bd}.withdrawals .stat-icon{background:#fff4dc;color:#87621d}.stat-copy{min-width:0}.stat-copy small{display:block;margin-top:13px;color:#74838c;font-size:7px;font-weight:800;letter-spacing:.65px}.withdrawals .stat-copy small{margin-top:0}.stat-copy strong{display:block;margin-top:7px;overflow:hidden;color:#102b3a;font-size:23px;line-height:1.05;letter-spacing:-.7px;text-overflow:ellipsis;white-space:nowrap}.stat-copy span{display:block;margin-top:6px;color:#8a969d;font-size:7px}.stat-action{padding:8px 10px;display:flex;align-items:center;gap:4px;border:1px solid #cde4dc;border-radius:9px;background:#effaf6;color:#087553;font-size:8px;font-weight:700;text-decoration:none;white-space:nowrap}
.view-all{padding:7px 9px;display:flex;align-items:center;gap:4px;border:1px solid #d7e2e7;border-radius:9px;background:#fff;color:#315264;font-size:8px;font-weight:700;text-decoration:none}.registration-list{overflow:hidden;border:1px solid #dfe7eb;border-radius:17px;background:#fff;box-shadow:0 8px 24px rgba(23,48,65,.06)}.registration-item{min-height:72px;padding:11px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #edf1f3;background:#fff}.registration-item:last-child{border-bottom:0}.registration-avatar{width:41px;height:41px;display:grid;place-items:center;flex:none;border-radius:13px;background:linear-gradient(145deg,#e7f0fa,#eff6fc);color:#315d79;font-size:9px;font-weight:800}.registration-info{min-width:0;flex:1;display:flex;flex-direction:column}.registration-info strong,.registration-info small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.registration-info strong{color:#153241;font-size:10px}.registration-info small{margin-top:4px;color:#78868e;font-size:8px}.registration-status{min-height:25px;padding:5px 7px;display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:9px;font-size:7px;font-style:normal;font-weight:700;text-transform:capitalize}.status-pending{background:#fff2d6;color:#86621b}.status-approved{background:#ddf8ea;color:#087553}.status-rejected{background:#ffe7ea;color:#ad3044}.status-review{background:#e7effa;color:#315f81}
.registration-empty{min-height:190px;padding:30px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed #cad7dd;border-radius:17px;background:#fff}.registration-empty>span{width:49px;height:49px;display:grid;place-items:center;border-radius:50%;background:#e7f6f1;color:#087553;font-size:21px}.registration-empty h3{margin:13px 0 5px;font-size:14px}.registration-empty p{margin:0;color:#75848d;font-size:9px}
.vendor-add-button{position:fixed;z-index:120;right:max(18px,calc((100vw - 430px)/2 + 18px));bottom:88px;width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.24);border-radius:16px;background:linear-gradient(145deg,#0b3043,#061b2b);color:#fff;font-size:24px;text-decoration:none;box-shadow:0 14px 28px rgba(6,31,47,.3);transition:transform .18s ease,box-shadow .18s ease}.vendor-add-button:hover{transform:translateY(-2px);box-shadow:0 17px 32px rgba(6,31,47,.36)}.vendor-add-button:focus-visible{outline:3px solid rgba(33,173,129,.35);outline-offset:3px}.vendor-add-button:active{transform:scale(.96)}
.sales-dashboard-state{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;padding:26px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f4f7fa;color:#102535;font-family:"Inter",sans-serif;text-align:center}.dashboard-loader{width:44px;height:44px;border:4px solid #dfe8ec;border-top-color:#0b8a68;border-radius:50%;animation:dashboard-spin .8s linear infinite}.sales-dashboard-state h2{margin:15px 0 6px;font-size:16px}.sales-dashboard-state p{max-width:290px;margin:0;color:#71808a;font-size:10px;line-height:1.5}.dashboard-error-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;background:#fff0f2;color:#b23547;font-size:22px}.dashboard-retry{margin-top:14px;padding:10px 15px;display:flex;align-items:center;gap:6px;border:0;border-radius:10px;background:#071f30;color:#fff;font-size:10px;font-weight:700;cursor:pointer}@keyframes dashboard-spin{to{transform:rotate(360deg)}}
@media(max-width:350px){.sales-dashboard-content{padding-left:12px;padding-right:12px}.stats-grid{grid-template-columns:1fr}.stat-card.withdrawals{grid-column:auto;grid-template-columns:auto minmax(0,1fr)}.stat-card.withdrawals .stat-action{grid-column:1/-1;justify-content:center}.vendor-add-button{right:14px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
