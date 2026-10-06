import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiFileText,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import {
  getVendorDetails,
  getVendorDocument,
} from "../services/api";

import "./VendorReview.css";

const BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5002/api/sales"
).replace(/\/$/, "");

const token = () =>
  localStorage.getItem("salesAccessToken") ||
  sessionStorage.getItem("salesAccessToken") ||
  "";

const formatDocumentType = (type) => {
  const labels = {
    gst_certificate: "GST Certificate",
    msme_certificate: "MSME Certificate",
    identity_proof: "Identity Proof",
  };

  return labels[type] || type;
};

const formatTime = (time) => {
  if (!time) return "-";

  const [hours, minutes] = String(time).split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function VendorReview() {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [consent, setConsent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadVendor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getVendorDetails(vendorId);

        if (cancelled) return;

        const data = response?.data || {};

        setVendor(data.vendor || null);
        setServices(Array.isArray(data.services) ? data.services : []);
        setDocuments(
          Array.isArray(data.documents) ? data.documents : []
        );
        setConsent(data.consent || null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || "Unable to load vendor registration."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (vendorId) {
      loadVendor();
    }

    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  const openDocument = async (documentId) => {
  const documentWindow = window.open(
    "",
    "_blank"
  );

  try {
    const blob = await getVendorDocument(documentId);

    const url = URL.createObjectURL(blob);

    if (documentWindow) {
      documentWindow.location.href = url;
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    documentWindow?.close();

    console.error("Unable to open vendor document:", error);
    alert("Unable to open this document.");
  }
};

  if (loading) {
    return (
      <div className="sales-page">
        <Header />

        <main className="vendor-review-page">
          <div className="vendor-review-loading">
            Loading vendor registration...
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="sales-page">
        <Header />

        <main className="vendor-review-page">
          <button
            type="button"
            className="vendor-review-back"
            onClick={() => navigate("/vendors")}
          >
            <FiArrowLeft />
            Back to vendors
          </button>

          <div className="vendor-review-error">
            {error || "Vendor registration was not found."}
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="sales-page">
      <Header />

      <main className="vendor-review-page">
        <button
          type="button"
          className="vendor-review-back"
          onClick={() => navigate("/vendors")}
        >
          <FiArrowLeft />
          Back to vendors
        </button>

        <section className="vendor-review-hero">
          <div className="vendor-review-avatar">
            {vendor.imageUrl ? (
              <img
                src={vendor.imageUrl}
                alt={vendor.name}
              />
            ) : (
              vendor.name?.charAt(0)?.toUpperCase() || "V"
            )}
          </div>

          <div className="vendor-review-title">
            <div className="vendor-review-title-row">
              <h1>{vendor.name}</h1>

              <span
                className={`vendor-review-status ${vendor.registrationStatus}`}
              >
                {vendor.registrationStatus === "approved"
                  ? "Approved"
                  : vendor.registrationStatus === "rejected"
                    ? "Rejected"
                    : "Pending"}
              </span>
            </div>

            <p>
              {vendor.categoryName || vendor.serviceType || "Vendor"}
            </p>

            {vendor.submittedAt && (
              <span className="vendor-review-submitted">
                <FiCalendar />
                Submitted{" "}
                {new Date(vendor.submittedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            )}
          </div>
        </section>

        <section className="vendor-review-card">
          <div className="vendor-review-card-header">
            <h2>Business Information</h2>
          </div>

          <div className="vendor-review-grid">
            <div>
              <span>Business Name</span>
              <strong>{vendor.name || "-"}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{vendor.categoryName || "-"}</strong>
            </div>

            <div>
              <span>Owner Name</span>
              <strong>{vendor.ownerName || "-"}</strong>
            </div>

            <div>
              <span>Experience</span>
              <strong>
                {vendor.yearsOfExperience
                  ? `${vendor.yearsOfExperience} years`
                  : "-"}
              </strong>
            </div>
          </div>

          <div className="vendor-review-description">
            <span>About the Business</span>
            <p>{vendor.description || "-"}</p>
          </div>
        </section>

        <section className="vendor-review-card">
          <div className="vendor-review-card-header">
            <h2>Contact & Location</h2>
          </div>

          <div className="vendor-review-grid">
            <div>
              <span>
                <FiPhone /> Mobile
              </span>
              <strong>{vendor.phone || "-"}</strong>
            </div>

            <div>
              <span>
                <FiPhone /> WhatsApp
              </span>
              <strong>{vendor.whatsapp || "-"}</strong>
            </div>

            <div>
              <span>
                <FiMail /> Email
              </span>
              <strong>{vendor.email || "-"}</strong>
            </div>

            <div>
              <span>
                <FiMapPin /> City
              </span>
              <strong>{vendor.city || "-"}</strong>
            </div>
          </div>

          <div className="vendor-review-address">
            <span>Address</span>
            <strong>
              {vendor.address || "-"}
              {vendor.landmark
                ? `, ${vendor.landmark}`
                : ""}
              {vendor.city
                ? `, ${vendor.city}`
                : ""}
              {vendor.state
                ? `, ${vendor.state}`
                : ""}
              {vendor.postalCode
                ? ` - ${vendor.postalCode}`
                : ""}
            </strong>
          </div>
        </section>

        <section className="vendor-review-card">
          <div className="vendor-review-card-header">
            <h2>Business Details</h2>
          </div>

          <div className="vendor-review-grid">
            <div>
              <span>Service Type</span>
              <strong>{vendor.serviceType || "-"}</strong>
            </div>

            <div>
              <span>Price Range</span>
              <strong>
                ₹{Number(vendor.minimumPrice || 0).toLocaleString("en-IN")}
                {" - "}
                ₹{Number(vendor.maximumPrice || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>
                <FiClock /> Opening Time
              </span>
              <strong>
                {formatTime(vendor.openingTime)}
              </strong>
            </div>

            <div>
              <span>
                <FiClock /> Closing Time
              </span>
              <strong>
                {formatTime(vendor.closingTime)}
              </strong>
            </div>
          </div>
        </section>

        <section className="vendor-review-card">
          <div className="vendor-review-card-header">
            <h2>Services Offered</h2>
          </div>

          {services.length ? (
            <div className="vendor-review-services">
              {services.map((service) => (
                <div
                  className="vendor-review-service"
                  key={service.id}
                >
                  <div>
                    <strong>{service.name}</strong>

                    {service.description && (
                      <p>{service.description}</p>
                    )}
                  </div>

                  <span>
                    ₹
                    {Number(
                      service.price_min || 0
                    ).toLocaleString("en-IN")}
                    {" - "}
                    ₹
                    {Number(
                      service.price_max || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="vendor-review-empty">
              No services were submitted.
            </p>
          )}
        </section>

        <section className="vendor-review-card">
          <div className="vendor-review-card-header">
            <h2>Documents</h2>
          </div>

          {documents.length ? (
            <div className="vendor-review-documents">
              {documents.map((document) => (
                <div
                  className="vendor-review-document"
                  key={document.id}
                >
                  <div className="vendor-review-document-icon">
                    <FiFileText />
                  </div>

                  <div className="vendor-review-document-info">
                    <strong>
                      {formatDocumentType(
                        document.document_type
                      )}
                    </strong>

                    <span>
                      {document.original_file_name}
                    </span>

                    <small>
                      {document.review_status || "pending"}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openDocument(document.id)
                    }
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="vendor-review-empty">
              No documents were submitted.
            </p>
          )}
        </section>

        {consent && (
          <section className="vendor-review-card">
            <div className="vendor-review-card-header">
              <h2>Registration Consent</h2>
            </div>

            <div className="vendor-review-consent">
              <span>
                Privacy Policy:{" "}
                {consent.privacy_accepted ? "Accepted" : "Not accepted"}
              </span>

              <span>
                Terms & Conditions:{" "}
                {consent.terms_accepted ? "Accepted" : "Not accepted"}
              </span>

              {consent.accepted_at && (
                <span>
                  Accepted on{" "}
                  {new Date(
                    consent.accepted_at
                  ).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}