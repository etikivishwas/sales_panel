import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { leads } from "../services/api";

const formatStatus = (status) =>
  String(status || "new")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusClass = (status) => {
  const value = String(status || "new")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (["converted", "completed", "approved"].includes(value)) {
    return "lead-status-converted";
  }

  if (["contacted", "in_progress", "follow_up"].includes(value)) {
    return "lead-status-contacted";
  }

  if (["qualified", "interested"].includes(value)) {
    return "lead-status-qualified";
  }

  if (["rejected", "closed", "not_interested"].includes(value)) {
    return "lead-status-closed";
  }

  return "lead-status-new";
};

const cleanPhoneNumber = (phone) => String(phone || "").replace(/\D/g, "");

const getWhatsAppNumber = (phone) => {
  const cleanedNumber = cleanPhoneNumber(phone);

  if (cleanedNumber.length === 10) {
    return `91${cleanedNumber}`;
  }

  return cleanedNumber;
};

export default function Leads() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async (searchValue = "", background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const searchParameters = new URLSearchParams();

      if (searchValue.trim()) {
        searchParameters.set("search", searchValue.trim());
      }

      const response = await leads(searchParameters.toString());
      setData(response?.data || { summary: {}, leads: [] });
    } catch (requestError) {
      console.error("Leads loading error:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "The leads could not be loaded."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadLeads(query, Boolean(data));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, loadLeads]);

  const summary = data?.summary || {};
  const leadItems = Array.isArray(data?.leads) ? data.leads : [];

  const conversionRate = useMemo(() => {
    const total = Number(summary.total || 0);
    const converted = Number(summary.converted || 0);

    if (total <= 0) {
      return 0;
    }

    return Math.round((converted / total) * 100);
  }, [summary.total, summary.converted]);

  if (loading && !data) {
    return (
      <main className="sales-leads-state-page">
        <style>{leadsStyles}</style>
        <span className="sales-leads-loader" />
        <h2>Loading leads</h2>
        <p>Preparing the latest assigned leads and follow-up information.</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="sales-leads-state-page">
        <style>{leadsStyles}</style>
        <span className="sales-leads-error-icon">
          <FiRefreshCw />
        </span>
        <h2>Leads could not be loaded</h2>
        <p>{error}</p>
        <button type="button" onClick={() => loadLeads(query)}>
          <FiRefreshCw /> Try again
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{leadsStyles}</style>

      <main className="sales-leads-page">
        <section className="sales-leads-frame">
          <div className="sales-leads-header-wrap">
            <Header />
          </div>

          <div className="sales-leads-content">
            <section className="sales-leads-hero">
              <div className="sales-leads-hero-decoration" />

              <div className="sales-leads-hero-top">
                <span>
                  <FiTrendingUp /> LEAD PIPELINE
                </span>

                <span className="sales-leads-rate">
                  {conversionRate}% converted
                </span>
              </div>

              <h1>Manage your leads</h1>
              <p>
                Search assigned opportunities, contact customers, and keep
                follow-ups moving toward conversion.
              </p>

              <div className="sales-leads-hero-summary">
                <span>
                  <FiUsers />
                  <span>
                    <small>TOTAL LEADS</small>
                    <strong>{Number(summary.total || 0)}</strong>
                  </span>
                </span>

                <span>
                  <FiCheckCircle />
                  <span>
                    <small>CONVERTED</small>
                    <strong>{Number(summary.converted || 0)}</strong>
                  </span>
                </span>

                <span>
                  <FiClock />
                  <span>
                    <small>FOLLOW-UPS</small>
                    <strong>{Number(summary.pending || 0)}</strong>
                  </span>
                </span>
              </div>
            </section>

            <section className="sales-leads-section">
              <div className="sales-leads-section-heading">
                <div>
                  <small>ASSIGNED OPPORTUNITIES</small>
                  <h2>Lead directory</h2>
                </div>

                <span>
                  {leadItems.length} {leadItems.length === 1 ? "result" : "results"}
                </span>
              </div>

              <div className="sales-leads-search-shell">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search vendor, customer, service, or location"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />

                {refreshing && <span className="sales-leads-search-spinner" />}

                {!refreshing && query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {error && (
                <div className="sales-leads-inline-error" role="alert">
                  <FiAlertCircle />
                  <span>{error}</span>
                  <button type="button" onClick={() => loadLeads(query, true)}>
                    Retry
                  </button>
                </div>
              )}

              {leadItems.length > 0 ? (
                <div className="sales-leads-list">
                  {leadItems.map((lead, index) => {
                    const displayName =
                      lead.vendorName || lead.customerName || "Lead";
                    const phoneNumber = cleanPhoneNumber(lead.customerPhone);
                    const whatsappNumber = getWhatsAppNumber(lead.customerPhone);

                    return (
                      <article
                        className="sales-lead-card"
                        key={lead.id}
                        style={{ "--lead-index": index }}
                      >
                        <div className="sales-lead-card-top">
                          <span className="sales-lead-avatar">
                            {lead.initials || displayName.slice(0, 2).toUpperCase()}
                          </span>

                          <div className="sales-lead-info">
                            <strong>{displayName}</strong>
                            <span>{lead.serviceRequested || "Service enquiry"}</span>
                            <small>
                              <FiMapPin />
                              {lead.location || "Assigned lead"}
                            </small>
                          </div>

                          <em
                            className={`sales-lead-status ${getStatusClass(
                              lead.status
                            )}`}
                          >
                            {formatStatus(lead.status)}
                          </em>
                        </div>

                        <div className="sales-lead-divider" />

                        <div className="sales-lead-actions">
                          <a
                            href={phoneNumber ? `tel:${phoneNumber}` : undefined}
                            className={!phoneNumber ? "disabled" : ""}
                            aria-disabled={!phoneNumber}
                            onClick={(event) => {
                              if (!phoneNumber) event.preventDefault();
                            }}
                          >
                            <FiPhone /> Call customer
                          </a>

                          <a
                            href={
                              whatsappNumber
                                ? `https://wa.me/${whatsappNumber}`
                                : undefined
                            }
                            className={`whatsapp ${
                              !whatsappNumber ? "disabled" : ""
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-disabled={!whatsappNumber}
                            onClick={(event) => {
                              if (!whatsappNumber) event.preventDefault();
                            }}
                          >
                            <FaWhatsapp /> WhatsApp
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="sales-leads-empty">
                  <span>
                    <FiSearch />
                  </span>
                  <h3>{query ? "No matching leads" : "No leads assigned"}</h3>
                  <p>
                    {query
                      ? "Try another name, service, or location."
                      : "New assigned leads will appear here."}
                  </p>
                  {query && (
                    <button type="button" onClick={() => setQuery("")}>
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <BottomNav />
        </section>
      </main>
    </>
  );
}

const leadsStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; }
body { overflow-x: hidden; background: #edf3fb; }
button, input { font: inherit; }

.sales-leads-page {
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

.sales-leads-frame {
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

.sales-leads-header-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  border-bottom: 1px solid #e1e8ec;
  backdrop-filter: blur(16px);
}

.sales-leads-content { width: 100%; padding: 18px 15px 31px; }

.sales-leads-hero {
  position: relative;
  padding: 20px 17px 17px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at 92% 5%, rgba(91, 239, 169, 0.26), transparent 31%),
    radial-gradient(circle at 3% 100%, rgba(72, 137, 171, 0.25), transparent 35%),
    linear-gradient(145deg, #061b2b, #0b3043);
  box-shadow: 0 15px 32px rgba(7, 31, 48, 0.18);
}

.sales-leads-hero-decoration {
  position: absolute;
  top: 17px;
  right: -43px;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.sales-leads-hero-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}

.sales-leads-hero-top > span:first-child {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #69efb0;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.05px;
}

.sales-leads-rate {
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #d1dfe4;
  font-size: 7px;
  font-weight: 700;
}

.sales-leads-hero h1 {
  position: relative;
  z-index: 2;
  margin: 13px 0 7px;
  font-size: 24px;
  line-height: 1.12;
  letter-spacing: -0.75px;
}

.sales-leads-hero > p {
  position: relative;
  z-index: 2;
  max-width: 315px;
  margin: 0;
  color: #bdced6;
  font-size: 10px;
  line-height: 1.55;
}

.sales-leads-hero-summary {
  position: relative;
  z-index: 2;
  margin-top: 18px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
}

.sales-leads-hero-summary > span {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
}

.sales-leads-hero-summary > span + span {
  padding-left: 7px;
  border-left: 1px solid rgba(255, 255, 255, 0.11);
}

.sales-leads-hero-summary > span > svg {
  width: 15px;
  height: 15px;
  flex: none;
  color: #6fefb3;
}

.sales-leads-hero-summary > span > span {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sales-leads-hero-summary small {
  color: #91aab5;
  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.45px;
}

.sales-leads-hero-summary strong {
  margin-top: 4px;
  color: #f2faf6;
  font-size: 15px;
}

.sales-leads-section { margin-top: 24px; }

.sales-leads-section-heading {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.sales-leads-section-heading small {
  color: #0a8b68;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.05px;
}

.sales-leads-section-heading h2 {
  margin: 4px 0 0;
  color: #102b3a;
  font-size: 17px;
  letter-spacing: -0.35px;
}

.sales-leads-section-heading > span {
  padding: 5px 8px;
  border-radius: 9px;
  background: #e8f6f1;
  color: #087553;
  font-size: 7px;
  font-weight: 700;
}

.sales-leads-search-shell {
  width: 100%;
  height: 50px;
  padding: 0 10px 0 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #d1dce2;
  border-radius: 13px;
  background: #fff;
  color: #71818a;
  box-shadow: 0 6px 18px rgba(23, 48, 65, 0.05);
}

.sales-leads-search-shell:focus-within {
  border-color: #0b8a68;
  box-shadow: 0 0 0 4px rgba(11, 138, 104, 0.1);
}

.sales-leads-search-shell > svg { width: 18px; height: 18px; flex: none; }

.sales-leads-search-shell input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #102b39;
  font-size: 13px;
}

.sales-leads-search-shell input::placeholder { color: #8d9aa2; }

.sales-leads-search-shell button {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: #eef3f5;
  color: #63747e;
  cursor: pointer;
}

.sales-leads-search-spinner {
  width: 16px;
  height: 16px;
  flex: none;
  border: 2px solid #d7e2e6;
  border-top-color: #0b8a68;
  border-radius: 50%;
  animation: leads-spin 0.8s linear infinite;
}

.sales-leads-inline-error {
  margin-top: 10px;
  padding: 10px 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #efc7ce;
  border-radius: 10px;
  background: #fff3f5;
  color: #ad3044;
  font-size: 8px;
}

.sales-leads-inline-error > span { min-width: 0; flex: 1; }
.sales-leads-inline-error button { border: 0; background: transparent; color: #9c2940; font-size: 8px; font-weight: 800; cursor: pointer; }

.sales-leads-list { margin-top: 12px; display: flex; flex-direction: column; gap: 11px; }

.sales-lead-card {
  --lead-index: 0;
  padding: 13px;
  border: 1px solid #dfe7eb;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(23, 48, 65, 0.07);
  animation: lead-rise 0.4s both;
  animation-delay: calc(var(--lead-index) * 45ms);
}

.sales-lead-card-top { display: flex; align-items: flex-start; gap: 10px; }

.sales-lead-avatar {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 14px;
  background: linear-gradient(145deg, #e7f0fa, #eff6fc);
  color: #315d79;
  font-size: 9px;
  font-weight: 800;
}

.sales-lead-info { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.sales-lead-info strong { overflow: hidden; color: #153241; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.sales-lead-info > span { margin-top: 4px; overflow: hidden; color: #526a77; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.sales-lead-info small { margin-top: 5px; display: flex; align-items: center; gap: 3px; overflow: hidden; color: #849199; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.sales-lead-info small svg { width: 10px; height: 10px; flex: none; }

.sales-lead-status {
  min-height: 25px;
  padding: 5px 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 9px;
  font-size: 7px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.lead-status-new { background: #e8f1fb; color: #315f81; }
.lead-status-converted { background: #ddf8ea; color: #087553; }
.lead-status-contacted { background: #fff2d6; color: #86621b; }
.lead-status-qualified { background: #eee9fc; color: #5e4a8b; }
.lead-status-closed { background: #ffe7ea; color: #ad3044; }

.sales-lead-divider { height: 1px; margin: 12px 0 10px; background: #edf1f3; }

.sales-lead-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.sales-lead-actions a {
  min-height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #d3dfe4;
  border-radius: 10px;
  background: #f8fafb;
  color: #173b50;
  font-size: 8px;
  font-weight: 700;
  text-decoration: none;
}

.sales-lead-actions a.whatsapp { border-color: #bfe8d6; background: #eaf9f3; color: #087553; }
.sales-lead-actions a.disabled { opacity: 0.45; cursor: not-allowed; }
.sales-lead-actions svg { width: 14px; height: 14px; }

.sales-leads-empty {
  min-height: 250px;
  margin-top: 12px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #cad7dd;
  border-radius: 17px;
  background: #fff;
  text-align: center;
}

.sales-leads-empty > span { width: 50px; height: 50px; display: grid; place-items: center; border-radius: 50%; background: #e7f6f1; color: #087553; font-size: 21px; }
.sales-leads-empty h3 { margin: 13px 0 5px; font-size: 14px; }
.sales-leads-empty p { margin: 0; color: #75848d; font-size: 9px; }
.sales-leads-empty button { margin-top: 13px; padding: 9px 13px; border: 0; border-radius: 9px; background: #071f30; color: #fff; font-size: 8px; font-weight: 700; cursor: pointer; }

.sales-leads-state-page {
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

.sales-leads-loader { width: 44px; height: 44px; border: 4px solid #dfe8ec; border-top-color: #0b8a68; border-radius: 50%; animation: leads-spin 0.8s linear infinite; }
.sales-leads-error-icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: #fff0f2; color: #b23547; font-size: 22px; }
.sales-leads-state-page h2 { margin: 15px 0 6px; font-size: 16px; }
.sales-leads-state-page p { max-width: 290px; margin: 0; color: #71808a; font-size: 10px; line-height: 1.5; }
.sales-leads-state-page button { margin-top: 14px; padding: 10px 15px; display: flex; align-items: center; gap: 6px; border: 0; border-radius: 10px; background: #071f30; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }

@keyframes leads-spin { to { transform: rotate(360deg); } }
@keyframes lead-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 350px) {
  .sales-leads-content { padding-left: 12px; padding-right: 12px; }
  .sales-leads-hero-summary { grid-template-columns: 1fr; }
  .sales-leads-hero-summary > span + span { padding: 8px 0 0; border-top: 1px solid rgba(255, 255, 255, 0.11); border-left: 0; }
  .sales-lead-actions { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;
