import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiChevronRight,
  FiDollarSign,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiMap,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { getProfile } from "../services/api";

const managementItems = [
  {
    icon: FiDollarSign,
    title: "My Earnings",
    text: "View current balance and withdrawal history",
    path: "/withdraw",
    className: "earnings",
  },
  {
    icon: FiFileText,
    title: "Commission History",
    text: "Review past onboarding commissions",
    path: "/commissions",
    className: "commissions",
  },
  {
    icon: FiMap,
    title: "Assigned Territory",
    text: "Manage active service zones",
    path: "/territory",
    className: "territory",
  },
  {
    icon: FiSettings,
    title: "Account Settings",
    text: "Update personal details and preferences",
    path: "/account-settings",
    className: "settings",
  },
  {
    icon: FiHelpCircle,
    title: "Help & Support",
    text: "Contact the administrator or read FAQs",
    path: "/support",
    className: "support",
  },
];

const getInitials = (profile) => {
  if (profile?.initials) {
    return String(profile.initials).slice(0, 2).toUpperCase();
  }

  if (!profile?.name) {
    return "SE";
  }

  return String(profile.name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProfile();
      setProfile(response?.data || null);
    } catch (requestError) {
      console.error("Profile loading error:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "The sales profile could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const performance = profile?.performance || {};

  const progressWidth = useMemo(() => {
    const rate = Number(performance.conversionRate || 0);
    return Math.min(Math.max(rate, 0), 100);
  }, [performance.conversionRate]);

  const logout = () => {
    localStorage.removeItem("salesAccessToken");
    localStorage.removeItem("salesUser");
    sessionStorage.removeItem("salesAccessToken");
    sessionStorage.removeItem("salesUser");

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="sales-profile-state-page">
        <style>{profileStyles}</style>
        <span className="sales-profile-loader" />
        <h2>Loading profile</h2>
        <p>Preparing account and sales performance information.</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="sales-profile-state-page">
        <style>{profileStyles}</style>
        <span className="sales-profile-error-icon">
          <FiRefreshCw />
        </span>
        <h2>Profile could not be loaded</h2>
        <p>{error || "No profile information was returned."}</p>
        <button type="button" onClick={loadProfile}>
          <FiRefreshCw /> Try again
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{profileStyles}</style>

      <main className="sales-profile-page">
        <section className="sales-profile-frame">
          <div className="sales-profile-header-wrap">
            <Header />
          </div>

          <div className="sales-profile-content">
            <section className="sales-profile-hero">
              <div className="sales-profile-decoration" />

              <div className="sales-profile-hero-heading">
                <span>
                  <FiShield /> VERIFIED SALES ACCOUNT
                </span>

                <span className="sales-profile-id">
                  ID: {profile.executiveCode || "Not assigned"}
                </span>
              </div>

              <div className="sales-profile-identity">
                <div className="sales-profile-avatar-ring">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Sales executive profile"
                    />
                  ) : (
                    <span>{getInitials(profile)}</span>
                  )}
                </div>

                <div className="sales-profile-name-block">
                  <small>WELCOME BACK</small>
                  <h1>{profile.name || "Sales Executive"}</h1>
                  <p>{profile.designation || "Sales Executive"}</p>
                </div>
              </div>

              <div className="sales-profile-hero-badge">
                <span>
                  <FiAward />
                </span>
                <div>
                  <small>CURRENT RECOGNITION</small>
                  <strong>
                    {performance.rankLabel || "Sales Performer"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="sales-profile-section">
              <div className="sales-profile-section-heading">
                <div>
                  <small>PERFORMANCE</small>
                  <h2>Performance overview</h2>
                </div>

                <span>
                  <FiBarChart2 /> Live metrics
                </span>
              </div>

              <article className="sales-performance-card">
                <div className="sales-performance-grid">
                  <div className="sales-performance-metric onboarded">
                    <span className="sales-performance-icon">
                      <FiUsers />
                    </span>
                    <small>TOTAL ONBOARDED</small>
                    <strong>{Number(performance.totalOnboarded || 0)}</strong>
                    <span>assigned vendors</span>
                  </div>

                  <div className="sales-performance-metric conversion">
                    <span className="sales-performance-icon">
                      <FiTrendingUp />
                    </span>
                    <small>CONVERSION RATE</small>
                    <strong>{Number(performance.conversionRate || 0)}%</strong>
                    <span>overall conversion</span>
                  </div>
                </div>

                <div className="sales-conversion-progress">
                  <div className="sales-progress-labels">
                    <span>Conversion progress</span>
                    <strong>{progressWidth}%</strong>
                  </div>

                  <div className="sales-progress-track">
                    <span style={{ width: `${progressWidth}%` }} />
                  </div>
                </div>

                <div className="sales-rank-card">
                  <span className="sales-rank-icon">
                    <FiAward />
                  </span>

                  <div>
                    <small>CURRENT RANK</small>
                    <strong>
                      Top {Number(performance.rankPercent || 0)}%
                    </strong>
                    <p>Based on sales performance</p>
                  </div>

                  <em>{performance.rankLabel || "Performer"}</em>
                </div>
              </article>
            </section>

            <section className="sales-profile-section">
              <div className="sales-profile-section-heading management-heading">
                <div>
                  <small>ACCOUNT</small>
                  <h2>Account management</h2>
                </div>

                <span>{managementItems.length} options</span>
              </div>

              <div className="sales-management-list">
                {managementItems.map(
                  ({ icon: Icon, title, text, path, className }, index) => (
                    <button
                      type="button"
                      key={title}
                      className="sales-management-item"
                      onClick={() => navigate(path)}
                      style={{ "--management-index": index }}
                    >
                      <span className={`sales-management-icon ${className}`}>
                        <Icon />
                      </span>

                      <span className="sales-management-copy">
                        <strong>{title}</strong>
                        <small>{text}</small>
                      </span>

                      <span className="sales-management-arrow">
                        <FiChevronRight />
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="sales-profile-security-card">
              <span>
                <FiShield />
              </span>

              <div>
                <small>ACCOUNT SECURITY</small>
                <strong>Your sales session is protected</strong>
                <p>Always sign out when using a shared device.</p>
              </div>
            </section>

            <button
              type="button"
              className="sales-profile-logout"
              onClick={logout}
            >
              <FiLogOut />
              <span>Log out of sales panel</span>
              <FiArrowRight />
            </button>
          </div>

          <BottomNav />
        </section>
      </main>
    </>
  );
}

const profileStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

:root{
  --sp-primary:#0F766E;
  --sp-primary-dark:#0B5F59;
  --sp-primary-deep:#084C48;
  --sp-primary-soft:#DCEFEB;
  --sp-accent:#FF8A4C;
  --sp-accent-dark:#E96F32;
  --sp-accent-soft:#FFF0E8;
  --sp-text:#18323B;
  --sp-white:#FFFFFF;
  --sp-surface:#F0F7F6;
  --sp-muted:#64777D;
  --sp-line:#D8E7E4;
  --sp-danger:#B23547;
  --sp-danger-soft:#FFF2F4;
}

*{box-sizing:border-box}
html,body,#root{width:100%;min-height:100%;margin:0;color-scheme:light only}
body{overflow-x:hidden;background:#e7f0ef}
button,input{font:inherit}
button{-webkit-tap-highlight-color:transparent}
button:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255,138,76,.24)}

.sales-profile-page{width:100%;min-height:100vh;min-height:100dvh;display:flex;justify-content:center;background:radial-gradient(circle at 12% 10%,rgba(15,118,110,.12),transparent 28%),radial-gradient(circle at 90% 85%,rgba(255,138,76,.1),transparent 29%),#e7f0ef;color:var(--sp-text);font-family:"Inter",sans-serif}
.sales-profile-frame{position:relative;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;padding-bottom:84px;overflow-x:hidden;background:var(--sp-surface);border-inline:1px solid var(--sp-line)}
.sales-profile-header-wrap{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97);border-bottom:1px solid var(--sp-line);box-shadow:0 4px 16px rgba(24,50,59,.05);backdrop-filter:blur(16px)}
.sales-profile-content{width:100%;padding:18px 15px 32px}

.sales-profile-hero{position:relative;padding:18px 17px 17px;overflow:hidden;border-radius:20px;color:#fff;background:radial-gradient(circle at 92% 5%,rgba(255,138,76,.27),transparent 31%),radial-gradient(circle at 3% 100%,rgba(255,255,255,.1),transparent 35%),linear-gradient(145deg,var(--sp-primary-deep),var(--sp-primary));box-shadow:0 15px 32px rgba(15,118,110,.2)}
.sales-profile-decoration{position:absolute;top:17px;right:-43px;width:140px;height:140px;border:1px solid rgba(255,255,255,.12);border-radius:50%}
.sales-profile-hero-heading{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:9px}
.sales-profile-hero-heading>span:first-child{display:flex;align-items:center;gap:5px;color:#ffd8c4;font-size:7px;font-weight:800;letter-spacing:.85px}
.sales-profile-id{padding:6px 8px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(255,255,255,.11);color:#e5f2f0;font-size:7px;font-weight:700}
.sales-profile-identity{position:relative;z-index:2;margin-top:18px;display:flex;align-items:center;gap:14px}
.sales-profile-avatar-ring{width:79px;height:79px;padding:4px;display:grid;place-items:center;flex:none;overflow:hidden;border:2px solid rgba(255,138,76,.85);border-radius:50%;background:rgba(255,255,255,.12);box-shadow:0 10px 24px rgba(8,50,48,.24)}
.sales-profile-avatar-ring img,.sales-profile-avatar-ring>span{width:100%;height:100%;border-radius:50%}
.sales-profile-avatar-ring img{display:block;object-fit:cover}
.sales-profile-avatar-ring>span{display:grid;place-items:center;background:linear-gradient(145deg,#ffd8c4,var(--sp-accent));color:#71300c;font-size:22px;font-weight:800}
.sales-profile-name-block{min-width:0;display:flex;flex-direction:column}
.sales-profile-name-block small{color:#ffd8c4;font-size:7px;font-weight:800;letter-spacing:.85px}
.sales-profile-name-block h1{margin:5px 0 4px;overflow:hidden;color:#fff;font-size:22px;line-height:1.1;letter-spacing:-.6px;text-overflow:ellipsis;white-space:nowrap}
.sales-profile-name-block p{margin:0;color:#dcefeb;font-size:9px}
.sales-profile-hero-badge{position:relative;z-index:2;margin-top:17px;padding:11px 12px;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,185,148,.28);border-radius:13px;background:rgba(255,138,76,.11)}
.sales-profile-hero-badge>span{width:34px;height:34px;display:grid;place-items:center;flex:none;border-radius:11px;background:rgba(255,138,76,.18);color:#ffd8c4;font-size:16px}
.sales-profile-hero-badge div{min-width:0;display:flex;flex-direction:column}
.sales-profile-hero-badge small{color:#c9ddda;font-size:6px;font-weight:800;letter-spacing:.65px}
.sales-profile-hero-badge strong{margin-top:4px;overflow:hidden;color:#fff8f4;font-size:9px;text-overflow:ellipsis;white-space:nowrap}

.sales-profile-section{margin-top:24px}
.sales-profile-section-heading{margin-bottom:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.sales-profile-section-heading small{color:var(--sp-primary);font-size:8px;font-weight:800;letter-spacing:1.05px}
.sales-profile-section-heading h2{margin:4px 0 0;color:var(--sp-text);font-size:17px;letter-spacing:-.35px}
.sales-profile-section-heading>span{padding:5px 8px;display:flex;align-items:center;gap:4px;border-radius:9px;background:var(--sp-primary-soft);color:var(--sp-primary-dark);font-size:7px;font-weight:700}
.management-heading>span{color:var(--sp-muted);background:#e8f0ee}

.sales-performance-card{padding:16px;border:1px solid var(--sp-line);border-radius:18px;background:var(--sp-white);box-shadow:0 9px 25px rgba(24,50,59,.07)}
.sales-performance-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.sales-performance-metric{min-width:0;padding:13px;display:flex;flex-direction:column;border:1px solid transparent;border-radius:14px}
.sales-performance-metric.onboarded{background:var(--sp-primary-soft);border-color:#c7e1dc}
.sales-performance-metric.conversion{background:var(--sp-accent-soft);border-color:#ffd0b7}
.sales-performance-icon{width:35px;height:35px;display:grid;place-items:center;margin-bottom:12px;border-radius:11px;font-size:16px}
.onboarded .sales-performance-icon{background:var(--sp-primary);color:#fff}
.conversion .sales-performance-icon{background:var(--sp-accent);color:#71300c}
.sales-performance-metric small{color:var(--sp-muted);font-size:6px;font-weight:800;letter-spacing:.55px}
.sales-performance-metric strong{margin-top:5px;overflow:hidden;color:var(--sp-text);font-size:22px;line-height:1.05;text-overflow:ellipsis;white-space:nowrap}
.sales-performance-metric>span:last-child{margin-top:5px;color:var(--sp-muted);font-size:7px}

.sales-conversion-progress{margin-top:15px}
.sales-progress-labels{margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;color:var(--sp-muted);font-size:8px}
.sales-progress-labels strong{color:var(--sp-primary-dark)}
.sales-progress-track{height:7px;overflow:hidden;border-radius:999px;background:#e3ecea}
.sales-progress-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--sp-primary),var(--sp-accent));transition:width .5s ease}

.sales-rank-card{margin-top:15px;padding:12px;display:flex;align-items:center;gap:10px;border:1px solid #f4c5ad;border-radius:14px;background:var(--sp-accent-soft)}
.sales-rank-icon{width:39px;height:39px;display:grid;place-items:center;flex:none;border-radius:12px;background:#ffd8c4;color:var(--sp-accent-dark);font-size:18px}
.sales-rank-card div{min-width:0;flex:1;display:flex;flex-direction:column}
.sales-rank-card small{color:var(--sp-accent-dark);font-size:6px;font-weight:800;letter-spacing:.65px}
.sales-rank-card strong{margin-top:3px;color:var(--sp-text);font-size:11px}
.sales-rank-card p{margin:3px 0 0;color:var(--sp-muted);font-size:7px}
.sales-rank-card em{padding:6px 8px;flex:none;border-radius:9px;background:var(--sp-primary);color:#fff;font-size:7px;font-style:normal;font-weight:700}

.sales-management-list{overflow:hidden;border:1px solid var(--sp-line);border-radius:18px;background:var(--sp-white);box-shadow:0 9px 25px rgba(24,50,59,.07)}
.sales-management-item{--management-index:0;width:100%;min-height:71px;padding:11px 13px;display:flex;align-items:center;gap:11px;border:0;border-bottom:1px solid #e8f0ee;background:var(--sp-white);color:var(--sp-text);text-align:left;cursor:pointer;animation:management-rise .4s both;animation-delay:calc(var(--management-index)*45ms);transition:background-color .2s ease,transform .15s ease}
.sales-management-item:last-child{border-bottom:0}
.sales-management-item:hover{background:#fbfdfd}
.sales-management-item:active{transform:scale(.995)}
.sales-management-icon{width:41px;height:41px;display:grid;place-items:center;flex:none;border-radius:13px;font-size:17px}
.sales-management-icon.earnings,.sales-management-icon.territory,.sales-management-icon.support{background:var(--sp-primary-soft);color:var(--sp-primary)}
.sales-management-icon.commissions,.sales-management-icon.settings{background:var(--sp-accent-soft);color:var(--sp-accent-dark)}
.sales-management-copy{min-width:0;flex:1;display:flex;flex-direction:column}
.sales-management-copy strong{font-size:10px}
.sales-management-copy small{margin-top:4px;overflow:hidden;color:var(--sp-muted);font-size:7px;text-overflow:ellipsis;white-space:nowrap}
.sales-management-arrow{width:27px;height:27px;display:grid;place-items:center;flex:none;border-radius:9px;background:var(--sp-surface);color:var(--sp-primary)}

.sales-profile-security-card{margin-top:16px;padding:13px;display:flex;align-items:center;gap:10px;border:1px solid #badbd6;border-radius:15px;background:var(--sp-primary-soft)}
.sales-profile-security-card>span{width:39px;height:39px;display:grid;place-items:center;flex:none;border-radius:12px;background:var(--sp-primary);color:#fff}
.sales-profile-security-card div{min-width:0;display:flex;flex-direction:column}
.sales-profile-security-card small{color:var(--sp-primary);font-size:6px;font-weight:800;letter-spacing:.7px}
.sales-profile-security-card strong{margin-top:3px;color:var(--sp-text);font-size:9px}
.sales-profile-security-card p{margin:4px 0 0;color:var(--sp-muted);font-size:7px}

.sales-profile-logout{width:100%;min-height:48px;margin-top:16px;padding:0 14px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid #efcbd1;border-radius:12px;background:var(--sp-danger-soft);color:var(--sp-danger);font-size:9px;font-weight:700;cursor:pointer;transition:background-color .2s,transform .15s}
.sales-profile-logout:hover{background:#ffe7ea}
.sales-profile-logout:active{transform:scale(.99)}
.sales-profile-logout span{flex:1;text-align:left}

.sales-profile-state-page{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;padding:28px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--sp-surface);color:var(--sp-text);font-family:"Inter",sans-serif;text-align:center}
.sales-profile-loader{width:44px;height:44px;border:4px solid var(--sp-primary-soft);border-top-color:var(--sp-accent);border-radius:50%;animation:profile-spin .8s linear infinite}
.sales-profile-error-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:50%;background:var(--sp-danger-soft);color:var(--sp-danger);font-size:22px}
.sales-profile-state-page h2{margin:15px 0 6px;font-size:16px}
.sales-profile-state-page p{max-width:290px;margin:0;color:var(--sp-muted);font-size:10px;line-height:1.5}
.sales-profile-state-page button{margin-top:14px;padding:10px 15px;display:flex;align-items:center;gap:6px;border:0;border-radius:10px;background:var(--sp-primary);color:#fff;font-size:10px;font-weight:700;cursor:pointer}

@keyframes profile-spin{to{transform:rotate(360deg)}}
@keyframes management-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:431px){.sales-profile-frame{box-shadow:0 0 40px rgba(24,50,59,.11)}}
@media(max-width:350px){.sales-profile-content{padding-left:12px;padding-right:12px}.sales-profile-hero-heading{align-items:flex-start;flex-direction:column}.sales-profile-id{align-self:flex-start}.sales-performance-grid{grid-template-columns:1fr}.sales-rank-card{align-items:flex-start;flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;

