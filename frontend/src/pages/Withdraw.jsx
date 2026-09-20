import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiInfo,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import { withdrawal, withdraw } from "../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const parseMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Withdraw() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadWithdrawalData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await withdrawal();
      setData(response?.data || null);
    } catch (requestError) {
      console.error("Withdrawal loading error:", requestError);
      setError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Withdrawal information could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawalData();
  }, [loadWithdrawalData]);

  const availableBalance = parseMoney(data?.availableBalance);
  const minimumWithdrawal = parseMoney(data?.minimumWithdrawal);
  const numericAmount = parseMoney(amount);

  const quickAmounts = useMemo(() => {
    if (availableBalance <= 0) {
      return [];
    }

    const candidates = [
      minimumWithdrawal,
      Math.floor(availableBalance * 0.5),
      availableBalance,
    ];

    return [...new Set(candidates)]
      .filter(
        (value) =>
          Number.isFinite(value) &&
          value > 0 &&
          value <= availableBalance
      )
      .sort((first, second) => first - second);
  }, [availableBalance, minimumWithdrawal]);

  const validationMessage = useMemo(() => {
    if (!amount) {
      return "";
    }

    if (numericAmount <= 0) {
      return "Enter an amount greater than zero.";
    }

    if (numericAmount < minimumWithdrawal) {
      return `The minimum withdrawal is ${formatCurrency(
        minimumWithdrawal
      )}.`;
    }

    if (numericAmount > availableBalance) {
      return "The withdrawal amount cannot exceed the available balance.";
    }

    return "";
  }, [amount, numericAmount, minimumWithdrawal, availableBalance]);

  const remainingBalance = Math.max(
    availableBalance - numericAmount,
    0
  );

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === "" || /^\d*$/.test(value)) {
      setAmount(value);
      setMessage("");
      setMessageType("");
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setMessage("");
    setMessageType("");

    if (!amount || validationMessage) {
      setMessage(
        validationMessage || "Enter the amount you want to withdraw."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await withdraw(numericAmount);

      setMessage(
        response?.message ||
        response?.data?.message ||
        "Withdrawal request submitted successfully."
      );
      setMessageType("success");
      setAmount("");

      const updatedResponse = await withdrawal();
      setData(updatedResponse?.data || null);
    } catch (requestError) {
      console.error("Withdrawal submission error:", requestError);
      setMessage(
        requestError?.response?.data?.message ||
        requestError?.message ||
        "The withdrawal request could not be submitted."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="withdraw-state-page">
        <style>{withdrawStyles}</style>
        <span className="withdraw-loader" />
        <h2>Loading withdrawal details</h2>
        <p>Checking the latest commission balance and withdrawal limits.</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="withdraw-state-page">
        <style>{withdrawStyles}</style>
        <span className="withdraw-error-icon">
          <FiRefreshCw />
        </span>
        <h2>Withdrawal details unavailable</h2>
        <p>{error || "No withdrawal information was returned."}</p>
        <button
          type="button"
          className="withdraw-retry-button"
          onClick={loadWithdrawalData}
        >
          <FiRefreshCw /> Try again
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{withdrawStyles}</style>

      <main className="withdraw-page">
        <section className="withdraw-frame">
          <header className="withdraw-header">
            <button
              type="button"
              className="withdraw-back-button"
              onClick={() => navigate("/dashboard", { replace: true })}
              aria-label="Return to dashboard"
            >
              <FiArrowLeft />
            </button>

            <div className="withdraw-header-copy">
              <small>SALES PANEL</small>
              <strong>Withdraw Commissions</strong>
            </div>

            <span className="withdraw-header-icon">
              <FiCreditCard />
            </span>
          </header>

          <div className="withdraw-content">
            <section className="withdraw-hero">
              <div className="withdraw-hero-decoration" />

              <div className="withdraw-hero-top">
                <span className="withdraw-hero-label">
                  <FiTrendingUp /> COMMISSION WALLET
                </span>

                <span className="withdraw-secure-chip">
                  <FiShield /> Secure
                </span>
              </div>

              <p>Available balance</p>
              <h1>{formatCurrency(availableBalance)}</h1>

              <div className="withdraw-balance-details">
                <span>
                  <small>MINIMUM REQUEST</small>
                  <strong>{formatCurrency(minimumWithdrawal)}</strong>
                </span>

                <span>
                  <small>PROCESSING</small>
                  <strong>Manual approval</strong>
                </span>
              </div>
            </section>

            <section className="withdraw-section">
              <div className="withdraw-section-heading">
                <div>
                  <small>NEW REQUEST</small>
                  <h2>Request a withdrawal</h2>
                </div>

                <span>
                  <FiClock /> Admin review
                </span>
              </div>

              <form className="withdraw-form-card" onSubmit={submit} noValidate>
                <div className="withdraw-field">
                  <label htmlFor="withdrawal-amount">Withdrawal amount</label>

                  <div
                    className={`withdraw-amount-shell ${validationMessage ? "invalid" : ""
                      }`}
                  >
                    <span className="withdraw-currency-symbol">₹</span>

                    <input
                      id="withdrawal-amount"
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      autoComplete="off"
                      disabled={submitting}
                    />

                    {amount && (
                      <button
                        type="button"
                        className="withdraw-clear-button"
                        onClick={() => {
                          setAmount("");
                          setMessage("");
                          setMessageType("");
                        }}
                        disabled={submitting}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="withdraw-field-meta">
                    <span>
                      Minimum: <strong>{formatCurrency(minimumWithdrawal)}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setAmount(String(availableBalance))}
                      disabled={availableBalance <= 0 || submitting}
                    >
                      Use full balance
                    </button>
                  </div>

                  {validationMessage && (
                    <p className="withdraw-validation-message">
                      <FiAlertCircle /> {validationMessage}
                    </p>
                  )}
                </div>

                {quickAmounts.length > 0 && (
                  <div className="withdraw-quick-section">
                    <span>Quick select</span>
                    <div className="withdraw-quick-buttons">
                      {quickAmounts.map((value) => (
                        <button
                          type="button"
                          key={value}
                          className={numericAmount === value ? "active" : ""}
                          onClick={() => {
                            setAmount(String(value));
                            setMessage("");
                            setMessageType("");
                          }}
                          disabled={submitting}
                        >
                          {formatCurrency(value)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="withdraw-calculation-card">
                  <span>
                    <small>REQUEST AMOUNT</small>
                    <strong>{formatCurrency(numericAmount)}</strong>
                  </span>

                  <FiArrowRight />

                  <span>
                    <small>REMAINING BALANCE</small>
                    <strong>{formatCurrency(remainingBalance)}</strong>
                  </span>
                </div>

                <div className="withdraw-notice">
                  <span className="withdraw-notice-icon">
                    <FiInfo />
                  </span>

                  <span>
                    <strong>Manual approval required</strong>
                    <p>
                      The request will be sent to the administrator for review
                      and processing. The available balance will update after
                      the request is accepted.
                    </p>
                  </span>
                </div>

                {message && (
                  <div
                    className={`withdraw-message ${messageType}`}
                    role="status"
                  >
                    {messageType === "success" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="withdraw-submit-button"
                  disabled={
                    submitting ||
                    availableBalance <= 0 ||
                    Boolean(validationMessage)
                  }
                >
                  <span>
                    {submitting ? "Submitting request..." : "Submit request"}
                  </span>

                  {submitting ? (
                    <span className="withdraw-button-spinner" />
                  ) : (
                    <FiArrowRight />
                  )}
                </button>
              </form>
            </section>

            <section className="withdraw-help-card">
              <span>
                <FiDollarSign />
              </span>

              <div>
                <small>NEED HELP?</small>
                <strong>Withdrawal support</strong>
                <p>
                  Contact the administrator if a submitted request remains
                  pending longer than expected.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

const withdrawStyles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  overflow-x: hidden;
  background: #edf3fb;
}

button,
input {
  font: inherit;
}

.withdraw-page {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background:
    radial-gradient(circle at 12% 11%, rgba(55, 139, 183, 0.1), transparent 28%),
    radial-gradient(circle at 90% 86%, rgba(44, 191, 137, 0.09), transparent 29%),
    #edf3fb;
  color: #102535;
  font-family: "Inter", sans-serif;
}

.withdraw-frame {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  overflow-x: hidden;
  background: #f4f7fa;
  border-left: 1px solid #dbe3e8;
  border-right: 1px solid #dbe3e8;
  box-shadow: 0 0 40px rgba(20, 45, 60, 0.09);
}

.withdraw-header {
  position: sticky;
  z-index: 50;
  top: 0;
  height: 70px;
  padding: 0 15px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid rgba(216, 226, 232, 0.92);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
}

.withdraw-back-button,
.withdraw-header-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #dce5e9;
  border-radius: 50%;
  background: #fff;
  color: #071f30;
  font-size: 18px;
  box-shadow: 0 5px 16px rgba(16, 42, 58, 0.07);
}

.withdraw-back-button {
  cursor: pointer;
}

.withdraw-header-icon {
  background: #e7f7f1;
  color: #087553;
}

.withdraw-header-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.withdraw-header-copy small {
  color: #0a8b68;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.9px;
}

.withdraw-header-copy strong {
  margin-top: 3px;
  overflow: hidden;
  color: #102535;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.withdraw-content {
  width: 100%;
  padding: 18px 15px 34px;
}

.withdraw-hero {
  position: relative;
  padding: 20px 17px 18px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at 92% 5%, rgba(91, 239, 169, 0.27), transparent 31%),
    radial-gradient(circle at 3% 100%, rgba(72, 137, 171, 0.25), transparent 35%),
    linear-gradient(145deg, #061b2b, #0b3043);
  box-shadow: 0 15px 32px rgba(7, 31, 48, 0.18);
}

.withdraw-hero-decoration {
  position: absolute;
  top: 18px;
  right: -43px;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.withdraw-hero-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.withdraw-hero-label,
.withdraw-secure-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.9px;
}

.withdraw-hero-label {
  color: #69efb0;
}

.withdraw-secure-chip {
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #d1dfe4;
  letter-spacing: 0;
}

.withdraw-hero > p {
  position: relative;
  z-index: 2;
  margin: 19px 0 4px;
  color: #b9ccd4;
  font-size: 9px;
  font-weight: 600;
}

.withdraw-hero > h1 {
  position: relative;
  z-index: 2;
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: -1.2px;
}

.withdraw-balance-details {
  position: relative;
  z-index: 2;
  margin-top: 20px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
}

.withdraw-balance-details > span {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.withdraw-balance-details > span + span {
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.withdraw-balance-details small {
  color: #91aab5;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.7px;
}

.withdraw-balance-details strong {
  margin-top: 5px;
  overflow: hidden;
  color: #eff8f4;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.withdraw-section {
  margin-top: 24px;
}

.withdraw-section-heading {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.withdraw-section-heading small {
  color: #0a8b68;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.withdraw-section-heading h2 {
  margin: 4px 0 0;
  color: #102b3a;
  font-size: 17px;
  letter-spacing: -0.35px;
}

.withdraw-section-heading > span {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 10px;
  background: #fff1d5;
  color: #795b1c;
  font-size: 7px;
  font-weight: 700;
  white-space: nowrap;
}

.withdraw-form-card {
  padding: 17px;
  border: 1px solid #dfe7eb;
  border-radius: 19px;
  background: #fff;
  box-shadow: 0 9px 25px rgba(23, 48, 65, 0.07);
}

.withdraw-field label {
  display: block;
  margin-bottom: 8px;
  color: #1b3544;
  font-size: 10px;
  font-weight: 700;
}

.withdraw-amount-shell {
  width: 100%;
  height: 58px;
  padding: 0 10px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d0dce2;
  border-radius: 13px;
  background: #fbfcfd;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.withdraw-amount-shell:focus-within {
  border-color: #0b8a68;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(11, 138, 104, 0.1);
}

.withdraw-amount-shell.invalid {
  border-color: #c94758;
  background: #fffafb;
}

.withdraw-currency-symbol {
  padding-right: 10px;
  border-right: 1px solid #dce4e8;
  color: #173a4e;
  font-size: 19px;
  font-weight: 700;
}

.withdraw-amount-shell input {
  min-width: 0;
  height: 100%;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #102b39;
  font-size: 22px;
  font-weight: 700;
}

.withdraw-amount-shell input::placeholder {
  color: #a0abb1;
}

.withdraw-clear-button {
  height: 31px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  background: #eef3f5;
  color: #63747e;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}

.withdraw-field-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #73828b;
  font-size: 8px;
}

.withdraw-field-meta strong {
  color: #334e5d;
}

.withdraw-field-meta button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #087553;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}

.withdraw-validation-message {
  margin: 7px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #b23547;
  font-size: 8px;
  line-height: 1.4;
}

.withdraw-quick-section {
  margin-top: 17px;
}

.withdraw-quick-section > span {
  display: block;
  margin-bottom: 8px;
  color: #71808a;
  font-size: 8px;
  font-weight: 700;
}

.withdraw-quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.withdraw-quick-buttons button {
  min-height: 34px;
  padding: 6px 10px;
  border: 1px solid #d5e0e5;
  border-radius: 10px;
  background: #f8fafb;
  color: #405764;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
}

.withdraw-quick-buttons button.active {
  border-color: #a8dbc8;
  background: #e9f9f2;
  color: #087553;
}

.withdraw-calculation-card {
  margin-top: 17px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  border: 1px solid #e1e8eb;
  border-radius: 13px;
  background: #f8fafb;
}

.withdraw-calculation-card > span {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.withdraw-calculation-card > span:last-child {
  text-align: right;
}

.withdraw-calculation-card small {
  color: #829098;
  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.withdraw-calculation-card strong {
  margin-top: 4px;
  overflow: hidden;
  color: #183748;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.withdraw-calculation-card > svg {
  color: #91a0a8;
}

.withdraw-notice {
  margin-top: 15px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 9px;
  border: 1px solid #f0dfb9;
  border-radius: 12px;
  background: #fff9eb;
}

.withdraw-notice-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 10px;
  background: #fff0cc;
  color: #89651e;
}

.withdraw-notice > span:last-child {
  min-width: 0;
}

.withdraw-notice strong {
  color: #644b1d;
  font-size: 9px;
}

.withdraw-notice p {
  margin: 5px 0 0;
  color: #7d6a43;
  font-size: 8px;
  line-height: 1.5;
}

.withdraw-message {
  margin-top: 14px;
  padding: 11px 12px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  border-radius: 11px;
  font-size: 9px;
  line-height: 1.45;
}

.withdraw-message svg {
  width: 15px;
  height: 15px;
  flex: none;
}

.withdraw-message.success {
  border: 1px solid #c9e8db;
  background: #edf9f4;
  color: #087553;
}

.withdraw-message.error {
  border: 1px solid #efc7ce;
  background: #fff3f5;
  color: #ad3044;
}

.withdraw-submit-button {
  width: 100%;
  min-height: 50px;
  margin-top: 16px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(145deg, #071f30, #10394c);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(7, 31, 48, 0.2);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.withdraw-submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 13px 25px rgba(7, 31, 48, 0.25);
}

.withdraw-submit-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.withdraw-button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: withdraw-spin 0.8s linear infinite;
}

.withdraw-help-card {
  margin-top: 16px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dce5ea;
  border-radius: 15px;
  background: #fff;
}

.withdraw-help-card > span {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 12px;
  background: #e8eff8;
  color: #315d79;
}

.withdraw-help-card div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.withdraw-help-card small {
  color: #0a8b68;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.withdraw-help-card strong {
  margin-top: 3px;
  color: #173443;
  font-size: 10px;
}

.withdraw-help-card p {
  margin: 4px 0 0;
  color: #71808a;
  font-size: 8px;
  line-height: 1.45;
}

.withdraw-state-page {
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

.withdraw-loader {
  width: 44px;
  height: 44px;
  border: 4px solid #dfe8ec;
  border-top-color: #0b8a68;
  border-radius: 50%;
  animation: withdraw-spin 0.8s linear infinite;
}

.withdraw-error-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff0f2;
  color: #b23547;
  font-size: 22px;
}

.withdraw-state-page h2 {
  margin: 15px 0 6px;
  font-size: 16px;
}

.withdraw-state-page p {
  max-width: 290px;
  margin: 0;
  color: #71808a;
  font-size: 10px;
  line-height: 1.5;
}

.withdraw-retry-button {
  margin-top: 14px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 10px;
  background: #071f30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

@keyframes withdraw-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 350px) {
  .withdraw-header,
  .withdraw-content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .withdraw-form-card {
    padding: 15px 13px;
  }

  .withdraw-balance-details,
  .withdraw-calculation-card {
    grid-template-columns: 1fr;
  }

  .withdraw-balance-details > span + span {
    padding: 9px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    border-left: 0;
  }

  .withdraw-calculation-card > span:last-child {
    text-align: left;
  }

  .withdraw-calculation-card > svg {
    transform: rotate(90deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
