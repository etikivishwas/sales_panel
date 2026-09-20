import { useEffect, useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";

import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const accessToken =
      localStorage.getItem(
        "salesAccessToken"
      ) ||
      sessionStorage.getItem(
        "salesAccessToken"
      );

    if (accessToken) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(
        normalizedEmail,
        password
      );

      const accessToken =
        response?.data?.accessToken;

      const salesUser =
        response?.data?.user;

      if (!accessToken) {
        throw new Error(
          "The login response did not include an access token."
        );
      }

      const selectedStorage = rememberMe
        ? localStorage
        : sessionStorage;

      const otherStorage = rememberMe
        ? sessionStorage
        : localStorage;

      selectedStorage.setItem(
        "salesAccessToken",
        accessToken
      );

      selectedStorage.setItem(
        "salesUser",
        JSON.stringify(salesUser || {})
      );

      otherStorage.removeItem(
        "salesAccessToken"
      );

      otherStorage.removeItem(
        "salesUser"
      );

      const requestedPage =
        location.state?.from?.pathname;

      navigate(
        requestedPage || "/dashboard",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      console.error(
        "Sales login error:",
        requestError
      );

      setError(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Sign in failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url(
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        );

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

        .sales-login-page {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;

          padding: 24px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow-x: hidden;

          background:
            radial-gradient(
              circle at 12% 15%,
              rgba(41, 130, 175, 0.13),
              transparent 27%
            ),
            radial-gradient(
              circle at 88% 85%,
              rgba(37, 196, 138, 0.11),
              transparent 27%
            ),
            #edf3fb;

          color: #102535;

          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .sales-login-frame {
          position: relative;

          width: min(100%, 430px);

          min-height: min(
            720px,
            calc(100dvh - 48px)
          );

          padding: 24px 20px 17px;

          overflow: hidden;

          display: flex;
          flex-direction: column;

          border:
            1px solid
            rgba(203, 217, 225, 0.96);

          border-radius: 26px;

          background:
            linear-gradient(
              180deg,
              rgba(236, 249, 245, 0.97),
              rgba(255, 255, 255, 0.99)
            );

          box-shadow:
            0 24px 60px
              rgba(19, 47, 64, 0.15),
            0 4px 12px
              rgba(19, 47, 64, 0.06);
        }

        .sales-login-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .sales-login-orb-one {
          top: 70px;
          right: -78px;

          width: 190px;
          height: 190px;

          border:
            1px solid
            rgba(8, 139, 102, 0.09);
        }

        .sales-login-orb-two {
          left: -85px;
          bottom: 75px;

          width: 210px;
          height: 210px;

          background:
            radial-gradient(
              circle,
              rgba(70, 137, 175, 0.09),
              transparent 68%
            );
        }

        .sales-login-brand {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;
        }

        .sales-login-brand-mark {
          width: 46px;
          height: 46px;

          display: grid;
          place-items: center;

          border:
            1px solid
            #cee4dc;

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              #071f30,
              #10394c
            );

          color: #70efb2;

          font-size: 17px;
          font-weight: 800;

          box-shadow:
            0 8px 18px
              rgba(21, 63, 70, 0.15);
        }

        .sales-login-brand-copy {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .sales-login-brand-copy strong {
          color: #0b2535;

          font-size: 14px;
          letter-spacing: -0.2px;
        }

        .sales-login-brand-copy small {
          color: #71818a;

          font-size: 8px;
        }

        .sales-login-content {
          position: relative;
          z-index: 2;

          width: 100%;

          /*
            Auto margins center the entire
            login content vertically inside
            the phone frame.
          */
          margin-top: auto;
          margin-bottom: auto;

          padding: 22px 0 18px;
        }

        .sales-login-intro {
          padding: 0 8px 18px;

          text-align: center;
        }

        .sales-login-intro-icon {
          width: 44px;
          height: 44px;

          margin: 0 auto 11px;

          display: grid;
          place-items: center;

          border:
            1px solid
            #ccebdd;

          border-radius: 14px;

          background: #e4f8ef;

          color: #087553;

          font-size: 19px;
        }

        .sales-login-intro-label {
          color: #087c5b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1.25px;
        }

        .sales-login-intro h1 {
          margin: 7px 0 6px;

          color: #092536;

          font-size: 27px;
          line-height: 1.1;

          letter-spacing: -0.9px;
        }

        .sales-login-intro p {
          max-width: 310px;

          margin: 0 auto;

          color: #637680;

          font-size: 10px;
          line-height: 1.55;
        }

        .sales-login-security {
          width: fit-content;

          margin: 12px auto 0;

          padding: 7px 10px;

          display: flex;
          align-items: center;

          gap: 5px;

          border:
            1px solid
            #d5e9e1;

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.68);

          color: #567269;

          font-size: 8px;
        }

        .sales-login-security svg {
          width: 13px;
          height: 13px;
        }

        .sales-login-card {
          width: 100%;

          padding: 19px 17px 18px;

          border:
            1px solid
            #e0e8eb;

          border-radius: 20px;

          background:
            rgba(255, 255, 255, 0.98);

          box-shadow:
            0 16px 35px
              rgba(20, 51, 67, 0.11),
            0 3px 8px
              rgba(20, 51, 67, 0.04);
        }

        .sales-login-card-heading {
          margin-bottom: 16px;
        }

        .sales-login-card-heading small {
          color: #0a8b68;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1.05px;
        }

        .sales-login-card-heading h2 {
          margin: 5px 0;

          color: #102b3a;

          font-size: 18px;

          letter-spacing: -0.35px;
        }

        .sales-login-card-heading p {
          margin: 0;

          color: #71808a;

          font-size: 9px;
          line-height: 1.45;
        }

        .sales-login-error {
          margin-bottom: 13px;

          padding: 10px 11px;

          display: flex;
          align-items: flex-start;

          gap: 7px;

          border:
            1px solid
            #efc7ce;

          border-radius: 10px;

          background: #fff3f5;

          color: #ad3044;

          font-size: 9px;
          line-height: 1.4;
        }

        .sales-login-error svg {
          width: 15px;
          height: 15px;

          flex-shrink: 0;
        }

        .sales-login-field {
          margin-bottom: 14px;
        }

        .sales-login-field label,
        .sales-login-label-row label {
          display: block;

          margin-bottom: 7px;

          color: #1c3544;

          font-size: 9px;
          font-weight: 700;
        }

        .sales-login-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }

        .sales-login-input {
          width: 100%;
          height: 49px;

          padding:
            0
            11px
            0
            13px;

          display: flex;
          align-items: center;

          gap: 9px;

          border:
            1px solid
            #d1dce2;

          border-radius: 12px;

          background: #fbfcfd;

          color: #71818a;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        }

        .sales-login-input:focus-within {
          border-color: #0b8a68;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
              rgba(11, 138, 104, 0.1);
        }

        .sales-login-input > svg {
          width: 17px;
          height: 17px;

          flex-shrink: 0;
        }

        .sales-login-input input {
          min-width: 0;
          height: 100%;

          flex: 1;

          padding: 0;

          border: 0;
          outline: 0;

          background: transparent;

          color: #102b39;

          font-size: 14px;
        }

        .sales-login-input input::placeholder {
          color: #8d9aa2;
        }

        .sales-password-toggle {
          width: 31px;
          height: 31px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border: 0;
          border-radius: 9px;

          background: #eef3f5;

          color: #63747e;

          cursor: pointer;
        }

        .sales-password-toggle svg {
          width: 16px;
          height: 16px;
        }

        .sales-remember {
          width: fit-content;

          margin:
            1px
            0
            16px;

          display: flex;
          align-items: center;

          gap: 8px;

          color: #60727d;

          font-size: 8px;

          cursor: pointer;
        }

        .sales-remember > input {
          position: absolute;

          width: 1px;
          height: 1px;

          opacity: 0;
        }

        .sales-checkbox {
          width: 18px;
          height: 18px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border:
            1px solid
            #c4d0d6;

          border-radius: 5px;

          background: #ffffff;

          color: transparent;
        }

        .sales-checkbox svg {
          width: 12px;
          height: 12px;
        }

        .sales-remember
          input:checked
          + .sales-checkbox {
          border-color: #0b8a68;

          background: #0b8a68;

          color: #ffffff;
        }

        .sales-login-submit {
          width: 100%;
          min-height: 50px;

          padding: 0 16px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          border: 0;
          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              #071f30,
              #10394c
            );

          color: #ffffff;

          font-size: 11px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 10px 22px
              rgba(7, 31, 48, 0.2);

          transition:
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }

        .sales-login-submit:hover:not(
          :disabled
        ) {
          transform: translateY(-1px);

          box-shadow:
            0 13px 25px
              rgba(7, 31, 48, 0.25);
        }

        .sales-login-submit:active:not(
          :disabled
        ) {
          transform: scale(0.99);
        }

        .sales-login-submit:disabled {
          opacity: 0.68;

          cursor: wait;
        }

        .sales-login-spinner {
          width: 16px;
          height: 16px;

          border:
            2px solid
            rgba(255, 255, 255, 0.35);

          border-top-color: #ffffff;
          border-radius: 50%;

          animation:
            sales-login-spin
            0.8s
            linear
            infinite;
        }

        .sales-login-help {
          margin: 12px 0 0;

          text-align: center;

          color: #839097;

          font-size: 8px;
        }

        .sales-login-footer {
          position: relative;
          z-index: 2;

          padding-top: 11px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #8a989f;

          font-size: 7px;
        }

        @keyframes sales-login-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /*
          Short screens remain scrollable
          rather than cutting off the form.
        */
        @media (max-height: 760px) {
          .sales-login-page {
            align-items: flex-start;

            overflow-y: auto;
          }

          .sales-login-frame {
            min-height:
              calc(100dvh - 32px);
          }

          .sales-login-content {
            padding:
              18px
              0
              14px;
          }

          .sales-login-intro-icon {
            display: none;
          }

          .sales-login-intro {
            padding-bottom: 14px;
          }

          .sales-login-security {
            display: none;
          }
        }

        /*
          Real mobile widths use the full
          viewport instead of a floating frame.
        */
        @media (max-width: 480px) {
          .sales-login-page {
            padding: 0;

            align-items: stretch;
          }

          .sales-login-frame {
            width: 100%;
            min-height: 100dvh;

            padding:
              max(
                22px,
                env(safe-area-inset-top)
              )
              18px
              max(
                16px,
                env(safe-area-inset-bottom)
              );

            border: 0;
            border-radius: 0;

            box-shadow: none;
          }

          .sales-login-content {
            padding:
              23px
              0
              19px;
          }
        }

        @media (max-width: 350px) {
          .sales-login-frame {
            padding-left: 14px;
            padding-right: 14px;
          }

          .sales-login-card {
            padding-left: 14px;
            padding-right: 14px;
          }

          .sales-login-intro h1 {
            font-size: 25px;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }
        }
      `}</style>

      <main className="sales-login-page">
        <section
          className="sales-login-frame"
          aria-label="Sales panel login"
        >
          <div
            className="
              sales-login-orb
              sales-login-orb-one
            "
          />

          <div
            className="
              sales-login-orb
              sales-login-orb-two
            "
          />

          <header className="sales-login-brand">
            <span className="sales-login-brand-mark">
              MG
            </span>

            <span className="sales-login-brand-copy">
              <strong>
                Milieu Global
              </strong>

              <small>
                Business operations platform
              </small>
            </span>
          </header>

          <div className="sales-login-content">
            <section className="sales-login-intro">
              <span className="sales-login-intro-icon">
                <FiBriefcase />
              </span>

              <span className="sales-login-intro-label">
                SALES WORKSPACE
              </span>

              <h1>
                Welcome back
              </h1>

              <p>
                Sign in to manage vendors,
                leads, follow-ups and commissions
                from one secure workspace.
              </p>

              <div className="sales-login-security">
                <FiShield />

                <span>
                  Protected access for
                  authorized sales users
                </span>
              </div>
            </section>

            <form
              className="sales-login-card"
              onSubmit={submit}
              noValidate
            >
              <div className="sales-login-card-heading">
                <small>
                  ACCOUNT ACCESS
                </small>

                <h2>
                  Sign in to continue
                </h2>

                <p>
                  Enter the credentials assigned
                  to your sales account.
                </p>
              </div>

              {error && (
                <div
                  className="sales-login-error"
                  role="alert"
                >
                  <FiAlertCircle />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              <div className="sales-login-field">
                <label htmlFor="sales-email">
                  Email address
                </label>

                <div className="sales-login-input">
                  <FiMail />

                  <input
                    id="sales-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value
                      );

                      setError("");
                    }}
                    autoComplete="email"
                    placeholder="name@company.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="sales-login-field">
                <div className="sales-login-label-row">
                  <label htmlFor="sales-password">
                    Password
                  </label>
                </div>

                <div className="sales-login-input">
                  <FiLock />

                  <input
                    id="sales-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );

                      setError("");
                    }}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="sales-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (currentValue) =>
                          !currentValue
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>
              </div>

              <label className="sales-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span className="sales-checkbox">
                  <FiCheck />
                </span>

                <span>
                  Keep me signed in on this device
                </span>
              </label>

              <button
                type="submit"
                className="sales-login-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                {loading ? (
                  <span className="sales-login-spinner" />
                ) : (
                  <FiArrowRight />
                )}
              </button>

              <p className="sales-login-help">
                Need account access? Contact the
                sales administrator.
              </p>
            </form>
          </div>

          <footer className="sales-login-footer">
            <span>
              Milieu Global Sales Panel
            </span>

            <span>
              Secure access
            </span>
          </footer>
        </section>
      </main>
    </>
  );
}