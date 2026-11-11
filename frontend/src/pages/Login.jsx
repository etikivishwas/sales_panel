import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken =
      localStorage.getItem("salesAccessToken") ||
      sessionStorage.getItem("salesAccessToken");

    if (accessToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(normalizedEmail, password);
      const accessToken = response?.data?.accessToken;
      const salesUser = response?.data?.user;

      if (!accessToken) {
        throw new Error("The login response did not include an access token.");
      }

      const selectedStorage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      selectedStorage.setItem("salesAccessToken", accessToken);
      selectedStorage.setItem("salesUser", JSON.stringify(salesUser || {}));
      otherStorage.removeItem("salesAccessToken");
      otherStorage.removeItem("salesUser");

      const requestedPage = location.state?.from?.pathname;
      navigate(requestedPage || "/dashboard", { replace: true });
    } catch (requestError) {
      console.error("Sales login error:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Sign in failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <main className="sales-login-page">
        <section className="sales-login-frame" aria-label="Sales panel login">
          <div className="sales-login-orb sales-login-orb-one" />
          <div className="sales-login-orb sales-login-orb-two" />

          <header className="sales-login-brand">
            <span className="sales-login-brand-mark">MG</span>
            <span className="sales-login-brand-copy">
              <strong>Milieu Global</strong>
              <small>Business operations platform</small>
            </span>
          </header>

          <div className="sales-login-content">
            <section className="sales-login-intro">
              <span className="sales-login-intro-icon"><FiBriefcase /></span>
              <span className="sales-login-intro-label">SALES WORKSPACE</span>
              <h1>Welcome back</h1>
              <p>
                Sign in to manage vendors, leads, follow-ups and commissions
                from one secure workspace.
              </p>
              <div className="sales-login-security">
                <FiShield />
                <span>Protected access for authorized sales users</span>
              </div>
            </section>

            <form className="sales-login-card" onSubmit={submit} noValidate>
              <div className="sales-login-card-heading">
                <small>ACCOUNT ACCESS</small>
                <h2>Sign in to continue</h2>
                <p>Enter the credentials assigned to your sales account.</p>
              </div>

              {error && (
                <div className="sales-login-error" role="alert">
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <div className="sales-login-field">
                <label htmlFor="sales-email">Email address</label>
                <div className="sales-login-input">
                  <FiMail />
                  <input
                    id="sales-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
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
                  <label htmlFor="sales-password">Password</label>
                </div>
                <div className="sales-login-input">
                  <FiLock />
                  <input
                    id="sales-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
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
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <label className="sales-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                />
                <span className="sales-checkbox"><FiCheck /></span>
                <span>Keep me signed in on this device</span>
              </label>

              <button type="submit" className="sales-login-submit" disabled={loading}>
                <span>{loading ? "Signing in..." : "Sign in"}</span>
                {loading ? <span className="sales-login-spinner" /> : <FiArrowRight />}
              </button>

              <p className="sales-login-help">
                Need account access? Contact the sales administrator.
              </p>
            </form>
          </div>

          <footer className="sales-login-footer">
            <span>Milieu Global Sales Panel</span>
            <span>Secure access</span>
          </footer>
        </section>
      </main>
    </>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
:root{--sl-primary:#0F766E;--sl-primary-dark:#0B5F59;--sl-primary-deep:#084C48;--sl-primary-soft:#DCEFEB;--sl-accent:#FF8A4C;--sl-accent-dark:#E96F32;--sl-accent-soft:#FFF0E8;--sl-text:#18323B;--sl-white:#FFFFFF;--sl-surface:#F0F7F6;--sl-muted:#64777D;--sl-line:#D8E7E4;--sl-danger:#B23547;--sl-danger-soft:#FFF2F4}
*{box-sizing:border-box}html,body,#root{width:100%;min-height:100%;margin:0;color-scheme:light only}body{overflow-x:hidden;background:#e7f0ef}button,input{font:inherit}button{-webkit-tap-highlight-color:transparent}button:focus-visible,input:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255,138,76,.25)}
.sales-login-page{width:100%;min-height:100vh;min-height:100dvh;padding:24px;display:flex;align-items:center;justify-content:center;overflow-x:hidden;background:radial-gradient(circle at 12% 15%,rgba(15,118,110,.15),transparent 28%),radial-gradient(circle at 88% 85%,rgba(255,138,76,.13),transparent 28%),#e7f0ef;color:var(--sl-text);font-family:"Inter",sans-serif}
.sales-login-frame{position:relative;width:min(100%,430px);min-height:min(720px,calc(100dvh - 48px));padding:24px 20px 17px;overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(216,231,228,.96);border-radius:26px;background:linear-gradient(180deg,rgba(240,247,246,.98),rgba(255,255,255,.99));box-shadow:0 24px 60px rgba(24,50,59,.15),0 4px 12px rgba(24,50,59,.06)}
.sales-login-frame:before{content:"";position:absolute;top:0;right:0;left:0;height:5px;background:linear-gradient(90deg,var(--sl-primary),var(--sl-accent))}.sales-login-orb{position:absolute;border-radius:50%;pointer-events:none}.sales-login-orb-one{top:70px;right:-78px;width:190px;height:190px;border:1px solid rgba(15,118,110,.12)}.sales-login-orb-two{left:-85px;bottom:75px;width:210px;height:210px;background:radial-gradient(circle,rgba(255,138,76,.1),transparent 68%)}
.sales-login-brand{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:10px}.sales-login-brand-mark{width:46px;height:46px;display:grid;place-items:center;border:3px solid var(--sl-primary-soft);border-radius:14px;background:linear-gradient(145deg,var(--sl-primary-dark),var(--sl-primary));color:#fff;font-size:17px;font-weight:800;box-shadow:0 8px 18px rgba(15,118,110,.18)}.sales-login-brand-copy{display:flex;flex-direction:column;gap:2px}.sales-login-brand-copy strong{color:var(--sl-text);font-size:14px;letter-spacing:-.2px}.sales-login-brand-copy small{color:var(--sl-muted);font-size:8px}
.sales-login-content{position:relative;z-index:2;width:100%;margin-top:auto;margin-bottom:auto;padding:22px 0 18px}.sales-login-intro{padding:0 8px 18px;text-align:center}.sales-login-intro-icon{width:44px;height:44px;margin:0 auto 11px;display:grid;place-items:center;border:1px solid #badbd6;border-radius:14px;background:var(--sl-primary-soft);color:var(--sl-primary);font-size:19px}.sales-login-intro-label{color:var(--sl-primary);font-size:8px;font-weight:800;letter-spacing:1.25px}.sales-login-intro h1{margin:7px 0 6px;color:var(--sl-text);font-size:27px;line-height:1.1;letter-spacing:-.9px}.sales-login-intro p{max-width:310px;margin:0 auto;color:var(--sl-muted);font-size:10px;line-height:1.55}.sales-login-security{width:fit-content;margin:12px auto 0;padding:7px 10px;display:flex;align-items:center;gap:5px;border:1px solid #badbd6;border-radius:13px;background:rgba(220,239,235,.7);color:var(--sl-primary-dark);font-size:8px}.sales-login-security svg{width:13px;height:13px}
.sales-login-card{width:100%;padding:19px 17px 18px;border:1px solid var(--sl-line);border-radius:20px;background:rgba(255,255,255,.98);box-shadow:0 16px 35px rgba(24,50,59,.11),0 3px 8px rgba(24,50,59,.04)}.sales-login-card-heading{margin-bottom:16px}.sales-login-card-heading small{color:var(--sl-primary);font-size:8px;font-weight:800;letter-spacing:1.05px}.sales-login-card-heading h2{margin:5px 0;color:var(--sl-text);font-size:18px;letter-spacing:-.35px}.sales-login-card-heading p{margin:0;color:var(--sl-muted);font-size:9px;line-height:1.45}.sales-login-error{margin-bottom:13px;padding:10px 11px;display:flex;align-items:flex-start;gap:7px;border:1px solid #efc7ce;border-radius:10px;background:var(--sl-danger-soft);color:var(--sl-danger);font-size:9px;line-height:1.4}.sales-login-error svg{width:15px;height:15px;flex-shrink:0}
.sales-login-field{margin-bottom:14px}.sales-login-field label,.sales-login-label-row label{display:block;margin-bottom:7px;color:var(--sl-text);font-size:9px;font-weight:700}.sales-login-label-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.sales-login-input{width:100%;height:49px;padding:0 11px 0 13px;display:flex;align-items:center;gap:9px;border:1px solid var(--sl-line);border-radius:12px;background:#fbfdfd;color:var(--sl-primary);transition:border-color .2s,box-shadow .2s,background-color .2s}.sales-login-input:hover{border-color:#afd3cd}.sales-login-input:focus-within{border-color:var(--sl-accent);background:#fff;box-shadow:0 0 0 4px rgba(255,138,76,.18)}.sales-login-input>svg{width:17px;height:17px;flex-shrink:0}.sales-login-input input{min-width:0;height:100%;flex:1;padding:0;border:0;outline:0;background:transparent;color:var(--sl-text);font-size:14px}.sales-login-input input::placeholder{color:#829398}.sales-password-toggle{width:31px;height:31px;display:grid;place-items:center;flex-shrink:0;padding:0;border:0;border-radius:9px;background:var(--sl-primary-soft);color:var(--sl-primary);cursor:pointer}.sales-password-toggle:hover{background:var(--sl-accent-soft);color:var(--sl-accent-dark)}.sales-password-toggle svg{width:16px;height:16px}
.sales-remember{width:fit-content;margin:1px 0 16px;display:flex;align-items:center;gap:8px;color:var(--sl-muted);font-size:8px;cursor:pointer}.sales-remember>input{position:absolute;width:1px;height:1px;opacity:0}.sales-checkbox{width:18px;height:18px;display:grid;place-items:center;flex-shrink:0;border:1px solid #b8cfcb;border-radius:5px;background:#fff;color:transparent;transition:.2s}.sales-checkbox svg{width:12px;height:12px}.sales-remember input:checked+.sales-checkbox{border-color:var(--sl-primary);background:var(--sl-primary);color:#fff}.sales-remember input:focus-visible+.sales-checkbox{box-shadow:0 0 0 3px rgba(255,138,76,.24)}
.sales-login-submit{width:100%;min-height:50px;padding:0 16px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:12px;background:linear-gradient(145deg,var(--sl-primary-dark),var(--sl-primary));color:#fff;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 10px 22px rgba(15,118,110,.22);transition:transform .15s,box-shadow .2s}.sales-login-submit svg{color:#ffd8c4}.sales-login-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 13px 25px rgba(15,118,110,.28)}.sales-login-submit:active:not(:disabled){transform:scale(.99)}.sales-login-submit:disabled{opacity:.68;cursor:wait;box-shadow:none}.sales-login-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:sales-login-spin .8s linear infinite}.sales-login-help{margin:12px 0 0;text-align:center;color:var(--sl-muted);font-size:8px}.sales-login-footer{position:relative;z-index:2;padding-top:11px;display:flex;align-items:center;justify-content:space-between;color:var(--sl-muted);font-size:7px}
@keyframes sales-login-spin{to{transform:rotate(360deg)}}
@media(max-height:760px){.sales-login-page{align-items:flex-start;overflow-y:auto}.sales-login-frame{min-height:calc(100dvh - 32px)}.sales-login-content{padding:18px 0 14px}.sales-login-intro-icon,.sales-login-security{display:none}.sales-login-intro{padding-bottom:14px}}
@media(max-width:480px){.sales-login-page{padding:0;align-items:stretch}.sales-login-frame{width:100%;min-height:100dvh;padding:max(22px,env(safe-area-inset-top)) 18px max(16px,env(safe-area-inset-bottom));border:0;border-radius:0;box-shadow:none}.sales-login-content{padding:23px 0 19px}}
@media(max-width:350px){.sales-login-frame{padding-left:14px;padding-right:14px}.sales-login-card{padding-left:14px;padding-right:14px}.sales-login-intro h1{font-size:25px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;
