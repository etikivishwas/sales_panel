import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { vendors } from "../services/api";

const FILTERS = [
  { value: "all", label: "All", icon: FiUsers },
  { value: "pending", label: "Pending", icon: FiClock },
  { value: "approved", label: "Approved", icon: FiCheckCircle },
  { value: "rejected", label: "Rejected", icon: FiXCircle },
];

const normalizeStatus = (status) =>
  String(status || "pending").trim().toLowerCase().replace(/\s+/g, "_");

const formatStatus = (status) =>
  normalizeStatus(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusClass = (status) => {
  const value = normalizeStatus(status);

  if (["approved", "active", "completed"].includes(value)) {
    return "vendor-status-approved";
  }

  if (["rejected", "declined", "cancelled"].includes(value)) {
    return "vendor-status-rejected";
  }

  if (["in_review", "under_review"].includes(value)) {
    return "vendor-status-review";
  }

  return "vendor-status-pending";
};

const getInitials = (name) => {
  if (!name) return "VN";

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export default function Vendors() {
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadVendors = useCallback(
    async (searchValue = "", statusValue = "all", background = false) => {
      const requestId = ++requestIdRef.current;

      try {
        if (background) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const parameters = new URLSearchParams();

        if (searchValue.trim()) {
          parameters.set("search", searchValue.trim());
        }

        if (statusValue && statusValue !== "all") {
          parameters.set("status", statusValue);
        } else {
          parameters.set("status", "all");
        }

        const response = await vendors(parameters.toString());

        if (requestId !== requestIdRef.current) {
          return;
        }

        const responseData = response?.data || {};
        const vendorList = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData.vendors)
            ? responseData.vendors
            : [];

        setItems(vendorList);
        setSummary(responseData.summary || responseData.counts || {});
        setHasLoaded(true);
      } catch (requestError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("Vendors loading error:", requestError);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Vendor registrations could not be loaded."
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadVendors(query, status, hasLoaded);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, status, loadVendors, hasLoaded]);

  const counts = useMemo(() => {
    const fallback = items.reduce(
      (result, vendor) => {
        const currentStatus = normalizeStatus(vendor.status);
        result.all += 1;

        if (currentStatus === "approved") result.approved += 1;
        else if (currentStatus === "rejected") result.rejected += 1;
        else result.pending += 1;

        return result;
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 }
    );

    return {
      all: Number(summary.total ?? summary.all ?? fallback.all),
      pending: Number(summary.pending ?? fallback.pending),
      approved: Number(summary.approved ?? fallback.approved),
      rejected: Number(summary.rejected ?? fallback.rejected),
    };
  }, [items, summary]);

  const approvalRate = useMemo(() => {
    if (counts.all <= 0) return 0;
    return Math.round((counts.approved / counts.all) * 100);
  }, [counts]);

  const openVendor = (vendor) => {
    const vendorId = vendor?.id ?? vendor?.vendorId ?? vendor?._id;

    if (!vendorId) {
      return;
    }

    navigate(`/vendors/${vendorId}`, {
      state: { vendor },
    });
  };

  if (loading && !hasLoaded) {
    return (
      <main className="sales-vendors-state-page">
        <style>{vendorsStyles}</style>
        <span className="sales-vendors-loader" />
        <h2>Loading registrations</h2>
        <p>Preparing vendor onboarding requests and current review statuses.</p>
      </main>
    );
  }

  if (error && !hasLoaded) {
    return (
      <main className="sales-vendors-state-page">
        <style>{vendorsStyles}</style>
        <span className="sales-vendors-error-icon">
          <FiRefreshCw />
        </span>
        <h2>Registrations could not be loaded</h2>
        <p>{error}</p>
        <button type="button" onClick={() => loadVendors(query, status)}>
          <FiRefreshCw /> Try again
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{vendorsStyles}</style>

      <main className="sales-vendors-page">
        <section className="sales-vendors-frame">
          <div className="sales-vendors-header-wrap">
            <Header />
          </div>

          <div className="sales-vendors-content">
            <section className="sales-vendors-hero">
              <div className="sales-vendors-decoration" />

              <div className="sales-vendors-hero-top">
                <span>
                  <FiShield /> VENDOR ONBOARDING
                </span>

                <span className="sales-vendors-rate">
                  {approvalRate}% approved
                </span>
              </div>

              <h1>Vendor registrations</h1>
              <p>
                Search, review, and manage every vendor onboarding request from
                one organized workspace.
              </p>

              <div className="sales-vendors-summary">
                <span>
                  <FiUsers />
                  <span>
                    <small>TOTAL</small>
                    <strong>{counts.all}</strong>
                  </span>
                </span>

                <span>
                  <FiClock />
                  <span>
                    <small>PENDING</small>
                    <strong>{counts.pending}</strong>
                  </span>
                </span>

                <span>
                  <FiCheckCircle />
                  <span>
                    <small>APPROVED</small>
                    <strong>{counts.approved}</strong>
                  </span>
                </span>
              </div>
            </section>

            <section className="sales-vendors-section">
              <div className="sales-vendors-section-heading">
                <div>
                  <small>REGISTRATION DIRECTORY</small>
                  <h2>Review requests</h2>
                </div>

                <span>{items.length} results</span>
              </div>

              <div className="sales-vendors-search">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search vendor name or service category"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />

                {refreshing && <span className="sales-vendors-search-spinner" />}

                {!refreshing && query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear vendor search"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div className="sales-vendors-filter-heading">
                <span>
                  <FiFilter /> Filter by status
                </span>

                {(query || status !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setStatus("all");
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>

              <div className="sales-vendors-filters">
                {FILTERS.map(({ value, label, icon: Icon }) => (
                  <button
                    type="button"
                    className={status === value ? "active" : ""}
                    onClick={() => setStatus(value)}
                    key={value}
                  >
                    <Icon />
                    <span>{label}</span>
                    <em>{counts[value]}</em>
                  </button>
                ))}
              </div>

              {error && (
                <div className="sales-vendors-inline-error" role="alert">
                  <FiAlertCircle />
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => loadVendors(query, status, true)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {items.length > 0 ? (
                <div className="sales-vendors-list">
                  {items.map((vendor, index) => {
                    const vendorId = vendor.id ?? vendor.vendorId ?? vendor._id;
                    const vendorName = vendor.name || vendor.businessName || "Vendor";
                    const serviceType =
                      vendor.serviceType || vendor.categoryName || "General Service";

                    return (
                      <article
                        className="sales-vendor-card"
                        key={vendorId || `${vendorName}-${index}`}
                        style={{ "--vendor-index": index }}
                      >
                        <div className="sales-vendor-card-top">
                          <span className="sales-vendor-avatar">
                            {vendor.logoUrl ? (
                              <img src={vendor.logoUrl} alt="" />
                            ) : (
                              getInitials(vendorName)
                            )}
                          </span>

                          <div className="sales-vendor-info">
                            <strong>{vendorName}</strong>
                            <span>
                              <FiBriefcase /> {serviceType}
                            </span>
                          </div>

                          <em
                            className={`sales-vendor-status ${getStatusClass(
                              vendor.status
                            )}`}
                          >
                            {formatStatus(vendor.status)}
                          </em>
                        </div>

                        <div className="sales-vendor-card-footer">
                          <span>
                            <FiCalendar />
                            {vendor.date || vendor.createdAt || "Date unavailable"}
                          </span>

                          <button
                            type="button"
                            onClick={() => openVendor(vendor)}
                            disabled={!vendorId}
                          >
                            {normalizeStatus(vendor.status) === "approved"
                              ? "View details"
                              : "Review request"}
                            <FiArrowRight />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="sales-vendors-empty">
                  <span>
                    <FiSearch />
                  </span>
                  <h3>No registrations found</h3>
                  <p>
                    {query || status !== "all"
                      ? "Try another search or reset the selected filters."
                      : "New vendor registration requests will appear here."}
                  </p>
                  {(query || status !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setStatus("all");
                      }}
                    >
                      Clear filters
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

const vendorsStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

* { box-sizing: border-box; }
html, body, #root { width: 100%; min-height: 100%; margin: 0; }
body { overflow-x: hidden; background: #edf3fb; }
button, input { font: inherit; }

.sales-vendors-page {
  width: 100%; min-height: 100vh; min-height: 100dvh;
  display: flex; justify-content: center;
  background: radial-gradient(circle at 12% 10%, rgba(55,139,183,.1), transparent 28%), radial-gradient(circle at 90% 85%, rgba(44,191,137,.09), transparent 29%), #edf3fb;
  color: #102535; font-family: "Inter", sans-serif;
}
.sales-vendors-frame {
  position: relative; width: 100%; max-width: 430px; min-height: 100vh; min-height: 100dvh;
  padding-bottom: 84px; overflow-x: hidden; background: #f4f7fa;
  border-left: 1px solid #dbe3e8; border-right: 1px solid #dbe3e8;
  box-shadow: 0 0 40px rgba(20,45,60,.09);
}
.sales-vendors-header-wrap { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.97); border-bottom: 1px solid #e1e8ec; backdrop-filter: blur(16px); }
.sales-vendors-content { width: 100%; padding: 18px 15px 31px; }

.sales-vendors-hero {
  position: relative; padding: 20px 17px 17px; overflow: hidden; border-radius: 20px; color: #fff;
  background: radial-gradient(circle at 92% 5%, rgba(91,239,169,.26), transparent 31%), radial-gradient(circle at 3% 100%, rgba(72,137,171,.25), transparent 35%), linear-gradient(145deg,#061b2b,#0b3043);
  box-shadow: 0 15px 32px rgba(7,31,48,.18);
}
.sales-vendors-decoration { position: absolute; top: 17px; right: -43px; width: 140px; height: 140px; border: 1px solid rgba(255,255,255,.08); border-radius: 50%; }
.sales-vendors-hero-top { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 9px; }
.sales-vendors-hero-top > span:first-child { display: flex; align-items: center; gap: 5px; color: #69efb0; font-size: 7px; font-weight: 800; letter-spacing: .9px; }
.sales-vendors-rate { padding: 6px 8px; border: 1px solid rgba(255,255,255,.15); border-radius: 10px; background: rgba(255,255,255,.08); color: #d1dfe4; font-size: 7px; font-weight: 700; }
.sales-vendors-hero h1 { position: relative; z-index: 2; margin: 13px 0 7px; font-size: 24px; line-height: 1.12; letter-spacing: -.75px; }
.sales-vendors-hero > p { position: relative; z-index: 2; max-width: 315px; margin: 0; color: #bdced6; font-size: 10px; line-height: 1.55; }
.sales-vendors-summary { position: relative; z-index: 2; margin-top: 18px; padding: 12px; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; background: rgba(255,255,255,.08); }
.sales-vendors-summary > span { min-width: 0; display: flex; align-items: center; gap: 7px; }
.sales-vendors-summary > span + span { padding-left: 7px; border-left: 1px solid rgba(255,255,255,.11); }
.sales-vendors-summary > span > svg { width: 15px; height: 15px; flex: none; color: #6fefb3; }
.sales-vendors-summary > span > span { min-width: 0; display: flex; flex-direction: column; }
.sales-vendors-summary small { color: #91aab5; font-size: 6px; font-weight: 800; letter-spacing: .45px; }
.sales-vendors-summary strong { margin-top: 4px; color: #f2faf6; font-size: 15px; }

.sales-vendors-section { margin-top: 24px; }
.sales-vendors-section-heading { margin-bottom: 12px; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.sales-vendors-section-heading small { color: #0a8b68; font-size: 8px; font-weight: 800; letter-spacing: 1.05px; }
.sales-vendors-section-heading h2 { margin: 4px 0 0; color: #102b3a; font-size: 17px; letter-spacing: -.35px; }
.sales-vendors-section-heading > span { padding: 5px 8px; border-radius: 9px; background: #e8f6f1; color: #087553; font-size: 7px; font-weight: 700; }
.sales-vendors-search { width: 100%; height: 50px; padding: 0 10px 0 13px; display: flex; align-items: center; gap: 9px; border: 1px solid #d1dce2; border-radius: 13px; background: #fff; color: #71818a; box-shadow: 0 6px 18px rgba(23,48,65,.05); }
.sales-vendors-search:focus-within { border-color: #0b8a68; box-shadow: 0 0 0 4px rgba(11,138,104,.1); }
.sales-vendors-search > svg { width: 18px; height: 18px; flex: none; }
.sales-vendors-search input { min-width: 0; height: 100%; flex: 1; padding: 0; border: 0; outline: 0; background: transparent; color: #102b39; font-size: 13px; }
.sales-vendors-search input::placeholder { color: #8d9aa2; }
.sales-vendors-search button { width: 31px; height: 31px; display: grid; place-items: center; border: 0; border-radius: 9px; background: #eef3f5; color: #63747e; cursor: pointer; }
.sales-vendors-search-spinner { width: 16px; height: 16px; flex: none; border: 2px solid #d7e2e6; border-top-color: #0b8a68; border-radius: 50%; animation: vendors-spin .8s linear infinite; }

.sales-vendors-filter-heading { margin: 14px 0 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.sales-vendors-filter-heading > span { display: flex; align-items: center; gap: 5px; color: #647780; font-size: 8px; font-weight: 700; }
.sales-vendors-filter-heading button { padding: 0; border: 0; background: transparent; color: #087553; font-size: 8px; font-weight: 700; cursor: pointer; }
.sales-vendors-filters { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 7px; }
.sales-vendors-filters button { min-width: 0; min-height: 41px; padding: 6px 5px; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid #d7e1e6; border-radius: 11px; background: #fff; color: #60747e; font-size: 7px; font-weight: 700; cursor: pointer; }
.sales-vendors-filters button svg { width: 12px; height: 12px; flex: none; }
.sales-vendors-filters button em { min-width: 17px; height: 17px; padding: 0 4px; display: inline-grid; place-items: center; border-radius: 7px; background: #edf2f4; color: #70818a; font-size: 6px; font-style: normal; }
.sales-vendors-filters button.active { border-color: #12384c; background: linear-gradient(145deg,#071f30,#10394c); color: #fff; box-shadow: 0 7px 16px rgba(7,31,48,.16); }
.sales-vendors-filters button.active em { background: rgba(105,239,176,.15); color: #69efb0; }

.sales-vendors-inline-error { margin-top: 10px; padding: 10px 11px; display: flex; align-items: center; gap: 7px; border: 1px solid #efc7ce; border-radius: 10px; background: #fff3f5; color: #ad3044; font-size: 8px; }
.sales-vendors-inline-error > span { min-width: 0; flex: 1; }
.sales-vendors-inline-error button { border: 0; background: transparent; color: #9c2940; font-size: 8px; font-weight: 800; cursor: pointer; }

.sales-vendors-list { margin-top: 12px; display: flex; flex-direction: column; gap: 11px; }
.sales-vendor-card { --vendor-index: 0; overflow: hidden; border: 1px solid #dfe7eb; border-radius: 17px; background: #fff; box-shadow: 0 8px 22px rgba(23,48,65,.07); animation: vendor-rise .4s both; animation-delay: calc(var(--vendor-index) * 45ms); }
.sales-vendor-card-top { padding: 13px; display: flex; align-items: flex-start; gap: 10px; }
.sales-vendor-avatar { width: 45px; height: 45px; display: grid; place-items: center; flex: none; overflow: hidden; border-radius: 14px; background: linear-gradient(145deg,#e7f0fa,#eff6fc); color: #315d79; font-size: 9px; font-weight: 800; }
.sales-vendor-avatar img { width: 100%; height: 100%; display: block; object-fit: cover; }
.sales-vendor-info { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.sales-vendor-info strong { overflow: hidden; color: #153241; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.sales-vendor-info span { margin-top: 5px; display: flex; align-items: center; gap: 4px; overflow: hidden; color: #6e7f88; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.sales-vendor-info span svg { width: 11px; height: 11px; flex: none; }
.sales-vendor-status { min-height: 25px; padding: 5px 7px; display: inline-flex; align-items: center; justify-content: center; flex: none; border-radius: 9px; font-size: 7px; font-style: normal; font-weight: 700; white-space: nowrap; }
.vendor-status-pending { background: #fff2d6; color: #86621b; }
.vendor-status-approved { background: #ddf8ea; color: #087553; }
.vendor-status-rejected { background: #ffe7ea; color: #ad3044; }
.vendor-status-review { background: #e7effa; color: #315f81; }
.sales-vendor-card-footer { min-height: 47px; padding: 8px 11px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-top: 1px solid #edf1f3; background: #fafcfd; }
.sales-vendor-card-footer > span { min-width: 0; display: flex; align-items: center; gap: 5px; overflow: hidden; color: #819098; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.sales-vendor-card-footer > span svg { width: 12px; height: 12px; flex: none; }
.sales-vendor-card-footer button { min-height: 31px; padding: 6px 9px; display: flex; align-items: center; gap: 4px; border: 1px solid #cde4dc; border-radius: 9px; background: #effaf6; color: #087553; font-size: 7px; font-weight: 700; cursor: pointer; }
.sales-vendor-card-footer button:disabled { opacity: .45; cursor: not-allowed; }

.sales-vendors-empty { min-height: 250px; margin-top: 12px; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #cad7dd; border-radius: 17px; background: #fff; text-align: center; }
.sales-vendors-empty > span { width: 50px; height: 50px; display: grid; place-items: center; border-radius: 50%; background: #e7f6f1; color: #087553; font-size: 21px; }
.sales-vendors-empty h3 { margin: 13px 0 5px; font-size: 14px; }
.sales-vendors-empty p { margin: 0; color: #75848d; font-size: 9px; }
.sales-vendors-empty button { margin-top: 13px; padding: 9px 13px; border: 0; border-radius: 9px; background: #071f30; color: #fff; font-size: 8px; font-weight: 700; cursor: pointer; }

.sales-vendors-state-page { width: 100%; max-width: 430px; min-height: 100vh; min-height: 100dvh; margin: 0 auto; padding: 28px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f4f7fa; color: #102535; font-family: "Inter",sans-serif; text-align: center; }
.sales-vendors-loader { width: 44px; height: 44px; border: 4px solid #dfe8ec; border-top-color: #0b8a68; border-radius: 50%; animation: vendors-spin .8s linear infinite; }
.sales-vendors-error-icon { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%; background: #fff0f2; color: #b23547; font-size: 22px; }
.sales-vendors-state-page h2 { margin: 15px 0 6px; font-size: 16px; }
.sales-vendors-state-page p { max-width: 290px; margin: 0; color: #71808a; font-size: 10px; line-height: 1.5; }
.sales-vendors-state-page button { margin-top: 14px; padding: 10px 15px; display: flex; align-items: center; gap: 6px; border: 0; border-radius: 10px; background: #071f30; color: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }

@keyframes vendors-spin { to { transform: rotate(360deg); } }
@keyframes vendor-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 350px) {
  .sales-vendors-content { padding-left: 12px; padding-right: 12px; }
  .sales-vendors-summary { grid-template-columns: 1fr; }
  .sales-vendors-summary > span + span { padding: 8px 0 0; border-top: 1px solid rgba(255,255,255,.11); border-left: 0; }
  .sales-vendors-filters { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .sales-vendor-card-footer { align-items: flex-start; flex-direction: column; }
  .sales-vendor-card-footer button { width: 100%; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;
