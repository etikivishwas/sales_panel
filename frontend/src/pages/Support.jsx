import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiSend,
  FiShield,
  FiUserCheck,
  FiX,
} from "react-icons/fi";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const SUPPORT_EMAIL = "vishwa.e@milieuglobal.com";
const SUPPORT_PHONE = "+919381423238";

const FAQS = [
  {
    id: 1,
    category: "Vendors",
    question: "How do I review a pending vendor registration?",
    answer:
      "Open Vendor Registrations, select the Pending filter, and choose Review Request for the relevant vendor. Verify the business, contact, service, and supporting information before taking the available action.",
  },
  {
    id: 2,
    category: "Leads",
    question: "How can I contact an assigned lead?",
    answer:
      "Open the Leads page and use Call Customer or WhatsApp on the lead card. If no phone number is available, contact the administrator so the lead information can be corrected.",
  },
  {
    id: 3,
    category: "Commissions",
    question: "When will an onboarding commission appear?",
    answer:
      "A commission normally appears after the related vendor registration satisfies the required approval conditions. Check Commission History for the current record and contact the administrator if an approved onboarding is missing.",
  },
  {
    id: 4,
    category: "Withdrawals",
    question: "Why is my withdrawal request still pending?",
    answer:
      "Withdrawal requests require manual administrator review. Processing time can vary based on verification and payment handling. Keep the request details available when contacting support.",
  },
  {
    id: 5,
    category: "Territory",
    question: "How do I update my assigned territory?",
    answer:
      "Open Assigned Territory from the Profile page. Territory changes may require administrator approval, so submit the intended service zones and wait for confirmation.",
  },
  {
    id: 6,
    category: "Account",
    question: "What should I do if I cannot sign in?",
    answer:
      "Confirm the assigned sales email and password, then try signing in again. If access still fails, contact the administrator and provide the sales executive code without sharing the password.",
  },
];

const SUPPORT_TOPICS = [
  "Vendor registration",
  "Lead management",
  "Commission or withdrawal",
  "Territory assignment",
  "Account access",
  "Technical issue",
  "Other",
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("");

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return FAQS;
    }

    return FAQS.filter((faq) =>
      [faq.category, faq.question, faq.answer]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  const clearFieldError = (fieldName) => {
    setFormErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    clearFieldError(name);
    setNotice("");
    setNoticeType("");
  };

  const validateSupportRequest = () => {
    const nextErrors = {};

    if (!formData.topic) {
      nextErrors.topic = "Select a support topic.";
    }

    if (!formData.subject.trim()) {
      nextErrors.subject = "Enter a short subject.";
    } else if (formData.subject.trim().length < 4) {
      nextErrors.subject = "The subject must contain at least 4 characters.";
    }

    if (!formData.message.trim()) {
      nextErrors.message = "Describe the support issue.";
    } else if (formData.message.trim().length < 15) {
      nextErrors.message = "Add at least 15 characters so support can understand the issue.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitSupportRequest = (event) => {
    event.preventDefault();

    if (!validateSupportRequest()) {
      setNotice("Review the highlighted fields before continuing.");
      setNoticeType("error");
      return;
    }

    const subject = encodeURIComponent(
      `[Sales Panel] ${formData.topic}: ${formData.subject.trim()}`
    );
    const body = encodeURIComponent(
      [
        `Support topic: ${formData.topic}`,
        "",
        formData.message.trim(),
        "",
        "Sent from the Milieu Global Sales Panel Help & Support page.",
      ].join("\n")
    );

    setNotice("Opening the default email application with the support request.");
    setNoticeType("success");

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <style>{supportStyles}</style>

      <main className="sales-support-page">
        <section className="sales-support-frame">
          <div className="sales-support-header-wrap">
            <Header />
          </div>

          <div className="sales-support-content">
            <section className="sales-support-hero">
              <div className="sales-support-decoration" />

              <div className="sales-support-hero-top">
                <span>
                  <FiShield /> SALES SUPPORT CENTER
                </span>

                <span className="sales-support-availability">
                  <FiClock /> Mon to Fri
                </span>
              </div>

              <span className="sales-support-hero-icon">
                <FiHelpCircle />
              </span>

              <h1>How can support help?</h1>
              <p>
                Find answers for vendor onboarding, leads, commissions,
                withdrawals, territories, and account access.
              </p>

              <div className="sales-support-search">
                <FiSearch />

                <input
                  type="search"
                  placeholder="Search help topics or questions"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoComplete="off"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear help search"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </section>

            <section className="sales-support-section">
              <div className="sales-support-section-heading">
                <div>
                  <small>CONTACT OPTIONS</small>
                  <h2>Contact support</h2>
                </div>

                <span>Choose a channel</span>
              </div>

              <div className="sales-support-contact-grid">
                <a href={`tel:${SUPPORT_PHONE}`} className="sales-support-contact call">
                  <span><FiPhone /></span>
                  <strong>Call admin</strong>
                  <small>Business hours</small>
                </a>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="sales-support-contact email"
                >
                  <span><FiMail /></span>
                  <strong>Email support</strong>
                  <small>Detailed requests</small>
                </a>

                <button
                  type="button"
                  className="sales-support-contact chat"
                  onClick={() => {
                    setNotice("Live chat will be available here soon.");
                    setNoticeType("success");
                  }}
                >
                  <span><FiMessageCircle /></span>
                  <strong>Live chat</strong>
                  <small>Coming soon</small>
                </button>
              </div>

              {notice && (
                <div className={`sales-support-notice ${noticeType}`} role="status">
                  {noticeType === "error" ? (
                    <FiAlertCircle />
                  ) : (
                    <FiCheckCircle />
                  )}
                  <span>{notice}</span>
                </div>
              )}
            </section>

            <section className="sales-support-section">
              <div className="sales-support-section-heading">
                <div>
                  <small>KNOWLEDGE BASE</small>
                  <h2>Frequently asked questions</h2>
                </div>

                <span>
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"}
                </span>
              </div>

              {filteredFaqs.length > 0 ? (
                <div className="sales-support-faq-list">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqId === faq.id;

                    return (
                      <article
                        className={`sales-support-faq ${isOpen ? "open" : ""}`}
                        key={faq.id}
                        style={{ "--faq-index": index }}
                      >
                        <button
                          type="button"
                          className="sales-support-faq-question"
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="sales-support-faq-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="sales-support-faq-copy">
                            <small>{faq.category}</small>
                            <strong>{faq.question}</strong>
                          </span>

                          <FiChevronDown />
                        </button>

                        <div className="sales-support-faq-answer-wrap">
                          <div className="sales-support-faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="sales-support-empty">
                  <span><FiSearch /></span>
                  <h3>No matching help topics</h3>
                  <p>Try a different word or send a support request below.</p>
                  <button type="button" onClick={() => setSearchQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
            </section>

            <section className="sales-support-section">
              <div className="sales-support-section-heading">
                <div>
                  <small>SUPPORT REQUEST</small>
                  <h2>Describe the issue</h2>
                </div>

                <span><FiUserCheck /> Admin review</span>
              </div>

              <form
                className="sales-support-form"
                onSubmit={submitSupportRequest}
                noValidate
              >
                <div className="sales-support-form-heading">
                  <span><FiBookOpen /></span>
                  <div>
                    <strong>Send complete information</strong>
                    <p>Support can respond faster when the issue includes clear details.</p>
                  </div>
                </div>

                <div className="sales-support-field">
                  <label htmlFor="support-topic">Support topic</label>
                  <div className={`sales-support-select ${formErrors.topic ? "invalid" : ""}`}>
                    <select
                      id="support-topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleFormChange}
                    >
                      <option value="">Select a topic</option>
                      {SUPPORT_TOPICS.map((topic) => (
                        <option value={topic} key={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                  {formErrors.topic && <span className="sales-support-error">{formErrors.topic}</span>}
                </div>

                <div className="sales-support-field">
                  <label htmlFor="support-subject">Subject</label>
                  <input
                    id="support-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Briefly summarize the issue"
                    maxLength={100}
                    className={formErrors.subject ? "invalid" : ""}
                  />
                  {formErrors.subject && <span className="sales-support-error">{formErrors.subject}</span>}
                </div>

                <div className="sales-support-field last">
                  <div className="sales-support-label-row">
                    <label htmlFor="support-message">Issue details</label>
                    <span>{formData.message.length}/800</span>
                  </div>
                  <textarea
                    id="support-message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Explain what happened, the page used, and any error message shown..."
                    rows={5}
                    maxLength={800}
                    className={formErrors.message ? "invalid" : ""}
                  />
                  {formErrors.message && <span className="sales-support-error">{formErrors.message}</span>}
                </div>

                <div className="sales-support-privacy">
                  <FiShield />
                  <span>Never include a password, OTP, access token, or other secret in a support request.</span>
                </div>

                <button type="submit" className="sales-support-submit">
                  <FiSend />
                  <span>Prepare email request</span>
                </button>
              </form>
            </section>

            <section className="sales-support-hours">
              <span><FiClock /></span>
              <div>
                <small>SUPPORT HOURS</small>
                <strong>Monday to Friday, 9 AM to 6 PM</strong>
                <p>Email requests may be sent at any time.</p>
              </div>
            </section>
          </div>

          <BottomNav />
        </section>
      </main>
    </>
  );
}

const supportStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
*{box-sizing:border-box}html,body,#root{width:100%;min-height:100%;margin:0}body{overflow-x:hidden;background:#edf3fb}button,input,select,textarea{font:inherit}
.sales-support-page{width:100%;min-height:100vh;min-height:100dvh;display:flex;justify-content:center;background:radial-gradient(circle at 12% 10%,rgba(55,139,183,.1),transparent 28%),radial-gradient(circle at 90% 85%,rgba(44,191,137,.09),transparent 29%),#edf3fb;color:#102535;font-family:"Inter",sans-serif}
.sales-support-frame{position:relative;width:100%;max-width:430px;min-height:100vh;min-height:100dvh;padding-bottom:84px;overflow-x:hidden;background:#f4f7fa;border-left:1px solid #dbe3e8;border-right:1px solid #dbe3e8;box-shadow:0 0 40px rgba(20,45,60,.09)}
.sales-support-header-wrap{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.97);border-bottom:1px solid #e1e8ec;backdrop-filter:blur(16px)}.sales-support-content{width:100%;padding:18px 15px 32px}
.sales-support-hero{position:relative;padding:20px 17px 18px;overflow:hidden;border-radius:20px;color:#fff;background:radial-gradient(circle at 92% 5%,rgba(91,239,169,.26),transparent 31%),radial-gradient(circle at 3% 100%,rgba(72,137,171,.25),transparent 35%),linear-gradient(145deg,#061b2b,#0b3043);box-shadow:0 15px 32px rgba(7,31,48,.18)}
.sales-support-decoration{position:absolute;top:17px;right:-43px;width:140px;height:140px;border:1px solid rgba(255,255,255,.08);border-radius:50%}.sales-support-hero-top{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:9px}.sales-support-hero-top>span:first-child{display:flex;align-items:center;gap:5px;color:#69efb0;font-size:7px;font-weight:800;letter-spacing:.9px}.sales-support-availability{padding:6px 8px;display:flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.08);color:#d1dfe4;font-size:7px;font-weight:700}
.sales-support-hero-icon{position:relative;z-index:2;width:43px;height:43px;margin-top:17px;display:grid;place-items:center;border:1px solid rgba(105,239,176,.24);border-radius:13px;background:rgba(105,239,176,.12);color:#69efb0;font-size:20px}.sales-support-hero h1{position:relative;z-index:2;margin:11px 0 7px;font-size:24px;line-height:1.12;letter-spacing:-.75px}.sales-support-hero>p{position:relative;z-index:2;max-width:315px;margin:0;color:#bdced6;font-size:10px;line-height:1.55}
.sales-support-search{position:relative;z-index:2;width:100%;height:50px;margin-top:18px;padding:0 10px 0 13px;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.18);border-radius:13px;background:#fff;color:#71818a;box-shadow:0 11px 24px rgba(0,0,0,.14)}.sales-support-search:focus-within{box-shadow:0 0 0 4px rgba(105,239,176,.14)}.sales-support-search>svg{width:18px;height:18px;flex:none}.sales-support-search input{min-width:0;height:100%;flex:1;padding:0;border:0;outline:0;background:transparent;color:#102b39;font-size:13px}.sales-support-search input::placeholder{color:#8d9aa2}.sales-support-search button{width:31px;height:31px;display:grid;place-items:center;border:0;border-radius:9px;background:#eef3f5;color:#63747e;cursor:pointer}
.sales-support-section{margin-top:24px}.sales-support-section-heading{margin-bottom:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.sales-support-section-heading small{color:#0a8b68;font-size:8px;font-weight:800;letter-spacing:1.05px}.sales-support-section-heading h2{margin:4px 0 0;color:#102b3a;font-size:17px;letter-spacing:-.35px}.sales-support-section-heading>span{padding:5px 8px;display:flex;align-items:center;gap:4px;border-radius:9px;background:#e8f6f1;color:#087553;font-size:7px;font-weight:700;white-space:nowrap}
.sales-support-contact-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.sales-support-contact{min-width:0;min-height:112px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #dfe7eb;border-radius:15px;background:#fff;color:#102535;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 7px 20px rgba(23,48,65,.06)}button.sales-support-contact{width:100%}.sales-support-contact>span{width:39px;height:39px;display:grid;place-items:center;border-radius:12px;font-size:17px}.sales-support-contact.call>span{background:#e8eff8;color:#315d79}.sales-support-contact.email>span{background:#e4f7ee;color:#087553}.sales-support-contact.chat>span{background:#fff2dc;color:#88631d}.sales-support-contact strong{margin-top:9px;font-size:9px}.sales-support-contact small{margin-top:4px;color:#7d8b93;font-size:7px}
.sales-support-notice{margin-top:10px;padding:10px 11px;display:flex;align-items:flex-start;gap:7px;border-radius:10px;font-size:8px;line-height:1.4}.sales-support-notice.success{border:1px solid #c9e8db;background:#edf9f4;color:#087553}.sales-support-notice.error{border:1px solid #efc7ce;background:#fff3f5;color:#ad3044}.sales-support-notice svg{width:14px;height:14px;flex:none}
.sales-support-faq-list{display:flex;flex-direction:column;gap:9px}.sales-support-faq{--faq-index:0;overflow:hidden;border:1px solid #dfe7eb;border-radius:15px;background:#fff;box-shadow:0 7px 20px rgba(23,48,65,.06);animation:support-rise .4s both;animation-delay:calc(var(--faq-index) * 45ms)}.sales-support-faq.open{border-color:#bfe5d5}.sales-support-faq-question{width:100%;min-height:67px;padding:11px 12px;display:flex;align-items:center;gap:10px;border:0;background:#fff;color:#102535;text-align:left;cursor:pointer}.sales-support-faq-number{width:31px;height:31px;display:grid;place-items:center;flex:none;border-radius:10px;background:#edf3f8;color:#31546c;font-size:8px;font-weight:800}.sales-support-faq-copy{min-width:0;flex:1;display:flex;flex-direction:column}.sales-support-faq-copy small{color:#0a8b68;font-size:7px;font-weight:800;letter-spacing:.7px;text-transform:uppercase}.sales-support-faq-copy strong{margin-top:4px;font-size:9px;line-height:1.4}.sales-support-faq-question>svg{width:17px;height:17px;flex:none;color:#788991;transition:transform .25s ease}.sales-support-faq.open .sales-support-faq-question>svg{transform:rotate(180deg);color:#087553}.sales-support-faq-answer-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .28s ease}.sales-support-faq.open .sales-support-faq-answer-wrap{grid-template-rows:1fr}.sales-support-faq-answer{min-height:0;overflow:hidden}.sales-support-faq-answer p{margin:0 12px 13px 53px;padding-top:11px;border-top:1px solid #edf1f3;color:#667781;font-size:8px;line-height:1.6}
.sales-support-empty{min-height:220px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #cad7dd;border-radius:17px;background:#fff;text-align:center}.sales-support-empty>span{width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:#e7f6f1;color:#087553;font-size:21px}.sales-support-empty h3{margin:13px 0 5px;font-size:14px}.sales-support-empty p{margin:0;color:#75848d;font-size:9px}.sales-support-empty button{margin-top:13px;padding:9px 13px;border:0;border-radius:9px;background:#071f30;color:#fff;font-size:8px;font-weight:700;cursor:pointer}
.sales-support-form{padding:16px;border:1px solid #dfe7eb;border-radius:18px;background:#fff;box-shadow:0 9px 25px rgba(23,48,65,.07)}.sales-support-form-heading{margin-bottom:16px;padding:11px;display:flex;align-items:center;gap:9px;border-radius:13px;background:#f1f8f5}.sales-support-form-heading>span{width:37px;height:37px;display:grid;place-items:center;flex:none;border-radius:11px;background:#dff7ec;color:#087553}.sales-support-form-heading div{min-width:0;display:flex;flex-direction:column}.sales-support-form-heading strong{font-size:9px}.sales-support-form-heading p{margin:4px 0 0;color:#71808a;font-size:7px;line-height:1.4}.sales-support-field{margin-bottom:14px}.sales-support-field.last{margin-bottom:0}.sales-support-field label,.sales-support-label-row label{display:block;margin-bottom:7px;color:#1a3342;font-size:9px;font-weight:700}.sales-support-label-row{display:flex;align-items:center;justify-content:space-between}.sales-support-label-row span{margin-bottom:7px;color:#829099;font-size:7px}.sales-support-field input,.sales-support-field textarea,.sales-support-select{width:100%;border:1px solid #d1dce2;border-radius:12px;background:#fbfcfd;color:#102b39}.sales-support-field input{height:49px;padding:0 12px;font-size:13px}.sales-support-field textarea{min-height:105px;padding:11px 12px;resize:vertical;font-size:13px;line-height:1.5}.sales-support-select{height:49px;padding:0 9px}.sales-support-select select{width:100%;height:100%;border:0;outline:0;background:transparent;color:#102b39;font-size:13px}.sales-support-field input:focus,.sales-support-field textarea:focus,.sales-support-select:focus-within{border-color:#0b8a68;outline:0;background:#fff;box-shadow:0 0 0 4px rgba(11,138,104,.1)}.sales-support-field input.invalid,.sales-support-field textarea.invalid,.sales-support-select.invalid{border-color:#c94758;background:#fffafb}.sales-support-error{display:block;margin-top:6px;color:#b23547;font-size:8px;line-height:1.4}.sales-support-privacy{margin-top:14px;padding:10px 11px;display:flex;align-items:flex-start;gap:7px;border:1px solid #d3eee3;border-radius:10px;background:#f0faf6;color:#42695b;font-size:7px;line-height:1.5}.sales-support-privacy svg{width:14px;height:14px;flex:none;color:#087754}.sales-support-submit{width:100%;min-height:49px;margin-top:14px;padding:0 15px;display:flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:12px;background:linear-gradient(145deg,#071f30,#10394c);color:#fff;font-size:9px;font-weight:700;cursor:pointer;box-shadow:0 10px 22px rgba(7,31,48,.18)}
.sales-support-hours{margin-top:16px;padding:13px;display:flex;align-items:center;gap:10px;border:1px solid #dce5ea;border-radius:15px;background:#fff}.sales-support-hours>span{width:39px;height:39px;display:grid;place-items:center;flex:none;border-radius:12px;background:#e8eff8;color:#315d79}.sales-support-hours div{display:flex;flex-direction:column}.sales-support-hours small{color:#0a8b68;font-size:6px;font-weight:800;letter-spacing:.7px}.sales-support-hours strong{margin-top:3px;font-size:9px}.sales-support-hours p{margin:4px 0 0;color:#71808a;font-size:7px}
@keyframes support-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:350px){.sales-support-content{padding-left:12px;padding-right:12px}.sales-support-contact-grid{grid-template-columns:1fr}.sales-support-contact{min-height:74px;flex-direction:row;justify-content:flex-start;gap:10px;text-align:left}.sales-support-contact strong{margin-top:0}.sales-support-contact small{margin-left:auto}.sales-support-faq-answer p{margin-left:12px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
