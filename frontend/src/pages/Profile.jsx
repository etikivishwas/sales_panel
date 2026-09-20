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

* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; }
body { overflow-x: hidden; background: #edf3fb; }
button, input { font: inherit; }

.sales-profile-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at 12% 10%, rgba(55, 139, 183, 0.1), transparent 28%),
    radial-gradient(circle at 90% 85%, rgba(44, 191, 137, 0.09), transparent 29%),
    #edf3fb;
  color: #102535;
  font-family: "Inter", sans-serif;
}

.sales-profile-frame {
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 84px;
  overflow-x: hidden;
  background: #f4f7fa;
  border-left: 1px solid #dbe3e8;
  border-right: 1px solid #dbe3e8;
  box-shadow: 0 0 40px rgba(20, 45, 60, 0.09);
}

.sales-profile-header-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  border-bottom: 1px solid #e1e8ec;
  backdrop-filter: blur(16px);
}

.sales-profile-content { width: 100%; padding: 18px 15px 32px; }

.sales-profile-hero {
  position: relative;
  padding: 18px 17px 17px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at 92% 5%, rgba(91, 239, 169, 0.26), transparent 31%),
    radial-gradient(circle at 3% 100%, rgba(72, 137, 171, 0.25), transparent 35%),
    linear-gradient(145deg, #061b2b, #0b3043);
  box-shadow: 0 15px 32px rgba(7, 31, 48, 0.18);
}

.sales-profile-decoration {
  position: absolute;
  top: 17px;
  right: -43px;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.sales-profile-hero-heading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.sales-profile-hero-heading > span:first-child {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #69efb0;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.85px;
}

.sales-profile-id {
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #c7d7dd;
  font-size: 7px;
  font-weight: 700;
}

.sales-profile-identity {
  position: relative;
  z-index: 2;
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.sales-profile-avatar-ring {
  width: 79px;
  height: 79px;
  padding: 4px;
  display: grid;
  place-items: center;
  flex: none;
  overflow: hidden;
  border: 2px solid rgba(105, 239, 176, 0.75);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.sales-profile-avatar-ring img,
.sales-profile-avatar-ring > span {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.sales-profile-avatar-ring img { display: block; object-fit: cover; }

.sales-profile-avatar-ring > span {
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #55e7a3, #20b983);
  color: #073c2b;
  font-size: 22px;
  font-weight: 800;
}

.sales-profile-name-block { min-width: 0; display: flex; flex-direction: column; }
.sales-profile-name-block small { color: #69efb0; font-size: 7px; font-weight: 800; letter-spacing: 0.85px; }
.sales-profile-name-block h1 { margin: 5px 0 4px; overflow: hidden; color: #fff; font-size: 22px; line-height: 1.1; letter-spacing: -0.6px; text-overflow: ellipsis; white-space: nowrap; }
.sales-profile-name-block p { margin: 0; color: #b9ccd4; font-size: 9px; }

.sales-profile-hero-badge {
  position: relative;
  z-index: 2;
  margin-top: 17px;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(97, 237, 172, 0.2);
  border-radius: 13px;
  background: rgba(97, 237, 172, 0.09);
}

.sales-profile-hero-badge > span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 11px;
  background: rgba(97, 237, 172, 0.14);
  color: #69efb0;
  font-size: 16px;
}

.sales-profile-hero-badge div { min-width: 0; display: flex; flex-direction: column; }
.sales-profile-hero-badge small { color: #93abb5; font-size: 6px; font-weight: 800; letter-spacing: 0.65px; }
.sales-profile-hero-badge strong { margin-top: 4px; overflow: hidden; color: #eff8f4; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.sales-profile-section { margin-top: 24px; }

.sales-profile-section-heading {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.sales-profile-section-heading small { color: #0a8b68; font-size: 8px; font-weight: 800; letter-spacing: 1.05px; }
.sales-profile-section-heading h2 { margin: 4px 0 0; color: #102b3a; font-size: 17px; letter-spacing: -0.35px; }
.sales-profile-section-heading > span { padding: 5px 8px; display: flex; align-items: center; gap: 4px; border-radius: 9px; background: #e8f6f1; color: #087553; font-size: 7px; font-weight: 700; }
.management-heading > span { color: #60747e; background: #edf3f5; }

.sales-performance-card {
  padding: 16px;
  border: 1px solid #dfe7eb;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 9px 25px rgba(23, 48, 65, 0.07);
}

.sales-performance-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }

.sales-performance-metric {
  min-width: 0;
  padding: 13px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
}

.sales-performance-metric.onboarded { background: #edf5fb; }
.sales-performance-metric.conversion { background: #eaf9f3; }

.sales-performance-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 11px;
  font-size: 16px;
}

.onboarded .sales-performance-icon { background: #dcecf7; color: #21668b; }
.conversion .sales-performance-icon { background: #d5f3e5; color: #087553; }
.sales-performance-metric small { color: #71838d; font-size: 6px; font-weight: 800; letter-spacing: 0.55px; }
.sales-performance-metric strong { margin-top: 5px; overflow: hidden; color: #123241; font-size: 22px; line-height: 1.05; text-overflow: ellipsis; white-space: nowrap; }
.sales-performance-metric > span:last-child { margin-top: 5px; color: #829099; font-size: 7px; }

.sales-conversion-progress { margin-top: 15px; }
.sales-progress-labels { margin-bottom: 7px; display: flex; align-items: center; justify-content: space-between; color: #60737d; font-size: 8px; }
.sales-progress-labels strong { color: #087553; }
.sales-progress-track { height: 7px; overflow: hidden; border-radius: 999px; background: #e5ecef; }
.sales-progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #0b956d, #69eab0); transition: width 0.5s ease; }

.sales-rank-card {
  margin-top: 15px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8e8e2;
  border-radius: 14px;
  background: #f5fbf8;
}

.sales-rank-icon { width: 39px; height: 39px; display: grid; place-items: center; flex: none; border-radius: 12px; background: #dff7ec; color: #087553; font-size: 18px; }
.sales-rank-card div { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.sales-rank-card small { color: #0a8b68; font-size: 6px; font-weight: 800; letter-spacing: 0.65px; }
.sales-rank-card strong { margin-top: 3px; color: #163748; font-size: 11px; }
.sales-rank-card p { margin: 3px 0 0; color: #7f8d95; font-size: 7px; }
.sales-rank-card em { padding: 6px 8px; flex: none; border-radius: 9px; background: #087553; color: #fff; font-size: 7px; font-style: normal; font-weight: 700; }

.sales-management-list {
  overflow: hidden;
  border: 1px solid #dfe7eb;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 9px 25px rgba(23, 48, 65, 0.07);
}

.sales-management-item {
  --management-index: 0;
  width: 100%;
  min-height: 71px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 0;
  border-bottom: 1px solid #edf1f3;
  background: #fff;
  color: #102535;
  text-align: left;
  cursor: pointer;
  animation: management-rise 0.4s both;
  animation-delay: calc(var(--management-index) * 45ms);
  transition: background 0.2s ease;
}

.sales-management-item:last-child { border-bottom: 0; }
.sales-management-item:hover { background: #f7faf9; }

.sales-management-icon { width: 41px; height: 41px; display: grid; place-items: center; flex: none; border-radius: 13px; font-size: 17px; }
.sales-management-icon.earnings { background: #e4f7ee; color: #087553; }
.sales-management-icon.commissions { background: #e9f1fa; color: #315f81; }
.sales-management-icon.territory { background: #fff2dc; color: #88631d; }
.sales-management-icon.settings { background: #eeeafd; color: #5d498a; }
.sales-management-icon.support { background: #e8f3f7; color: #326b80; }

.sales-management-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.sales-management-copy strong { font-size: 10px; }
.sales-management-copy small { margin-top: 4px; overflow: hidden; color: #75848d; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.sales-management-arrow { width: 27px; height: 27px; display: grid; place-items: center; flex: none; border-radius: 9px; background: #f1f5f6; color: #829098; }

.sales-profile-security-card {
  margin-top: 16px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dce5ea;
  border-radius: 15px;
  background: #fff;
}

.sales-profile-security-card > span { width: 39px; height: 39px; display: grid; place-items: center; flex: none; border-radius: 12px; background: #e5f7ef; color: #087553; }
.sales-profile-security-card div { min-width: 0; display: flex; flex-direction: column; }
.sales-profile-security-card small { color: #0a8b68; font-size: 6px; font-weight: 800; letter-spacing: 0.7px; }
.sales-profile-security-card strong { margin-top: 3px; color: #173443; font-size: 9px; }
.sales-profile-security-card p { margin: 4px 0 0; color: #71808a; font-size: 7px; }

.sales-profile-logout {
  width: 100%;
  min-height: 48px;
  margin-top: 16px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #efcbd1;
  border-radius: 12px;
  background: #fff5f6;
  color: #b23547;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.sales-profile-logout span { flex: 1; text-align: left; }

.sales-profile-state-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f4f7fa;
  color: #102535;
  font-family: "Inter", sans-serif;
  text-align: center;
}

.sales-profile-loader { width: 44px; height: 44px; border: 4px solid #dfe8ec; border-top-color: #0b8a68; border-radius: 50%; animation: profile-spin 0.8s linear infinite; }
.sales-profile-error-icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: #fff0f2; color: #b23547; font-size: 22px; }
.sales-profile-state-page h2 { margin: 15px 0 6px; font-size: 16px; }
.sales-profile-state-page p { max-width: 290px; margin: 0; color: #71808a; font-size: 10px; line-height: 1.5; }
.sales-profile-state-page button { margin-top: 14px; padding: 10px 15px; display: flex; align-items: center; gap: 6px; border: 0; border-radius: 10px; background: #071f30; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }

@keyframes profile-spin { to { transform: rotate(360deg); } }
@keyframes management-rise { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 350px) {
  .sales-profile-content { padding-left: 12px; padding-right: 12px; }
  .sales-profile-hero-heading { align-items: flex-start; flex-direction: column; }
  .sales-profile-id { align-self: flex-start; }
  .sales-performance-grid { grid-template-columns: 1fr; }
  .sales-rank-card { align-items: flex-start; flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;
