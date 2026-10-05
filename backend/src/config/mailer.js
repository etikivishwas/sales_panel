const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendVendorSetupEmail(toEmail, setupUrl, businessName) {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      
      <h2 style="color: #041627;">
        Welcome to Milieu Global
      </h2>

      <p style="color: #44474c;">
        Your vendor account for <strong>${businessName}</strong> has been created.
      </p>

      <p style="color: #44474c;">
        Please set your password using the button below to activate your vendor account.
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <a
          href="${setupUrl}"
          style="
            display: inline-block;
            padding: 13px 24px;
            background: #041627;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Set Password
        </a>
      </div>

      <p style="color: #74777d; font-size: 14px;">
        This setup link expires in 24 hours.
      </p>

      <p style="color: #74777d; font-size: 14px;">
        If you did not expect this email, you can safely ignore it.
      </p>

    </div>
  `;

  await transporter.sendMail({
    from: `"Milieu Global" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Set up your Milieu Global vendor account",
    html,
  });
}

module.exports = {
  sendVendorSetupEmail,
};