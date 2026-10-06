const crypto = require("crypto");
const { pool } = require("../config/db");
const { uploadBuffer } = require("../../utils/cloudinaryUpload");
const { sendVendorSetupEmail } = require("../config/mailer");
const FRONTEND_URL =
  process.env.VENDOR_PANEL_URL ||
  "http://localhost:5173";

const SETUP_TOKEN_EXPIRY_HOURS = 24;

function createSetupToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() +
      SETUP_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
}


const DOCUMENT_FIELDS = {
  gstCertificate: "gst_certificate",
  msmeCertificate: "msme_certificate",
  identityProof: "identity_proof",
};

const clean = (value, maximum = 255) => String(value || "").trim().slice(0, maximum);
const digits = (value) => String(value || "").replace(/\D/g, "");

function parseRegistration(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return null;
  }
}

function validate(registration) {
  if (!registration?.step1 || !registration?.step2 || !registration?.step3) return "All three registration steps are required.";
  const { step1, step2, step3 } = registration;
  if (clean(step1.businessName).length < 2) return "Business name is required.";
  if (!Number(step1.categoryId)) return "A valid category is required.";
  if (clean(step1.ownerName).length < 2) return "Owner name is required.";
  if (!/^[6-9]\d{9}$/.test(digits(step1.mobileNumber))) return "A valid mobile number is required.";
  if (!/^[1-9]\d{5}$/.test(digits(step1.postalCode))) return "A valid pincode is required.";
  if (!/^[6-9]\d{9}$/.test(digits(step2.whatsapp))) return "A valid WhatsApp number is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(step2.email, 190).toLowerCase())) return "A valid email is required.";
  if (clean(step2.address).length < 5 || clean(step2.city).length < 2 || clean(step2.state).length < 2) return "Complete location details are required.";
  if (clean(step3.aboutBusiness, 5000).length < 20) return "Business description is required.";
  if (!clean(step3.experience, 30)) return "Years of experience are required.";
  if (!Array.isArray(step3.services) || !step3.services.length) return "At least one service is required.";
  const min = Number(step3.minPrice), max = Number(step3.maxPrice);
  if (!Number.isFinite(min) || min < 0 || !Number.isFinite(max) || max < min) return "A valid pricing range is required.";
  if (!step3.openingTime || !step3.closingTime || step3.openingTime === step3.closingTime) return "Valid business hours are required.";
  if (step3.privacyAccepted !== true || step3.termsAccepted !== true) return "Privacy Policy and Terms must be accepted.";
  return null;
}

exports.getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, icon, description
       FROM vendor_categories
       WHERE status = 'active'
       ORDER BY sort_order, name`
    );
    res.json({ success: true, data: { categories: rows } });
  } catch (error) { next(error); }
};

exports.createRegistration = async (req, res, next) => {
  const db = await pool.getConnection();
  let transactionStarted = false;
  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);
    if (!salesExecutiveId) return res.status(401).json({ success: false, message: "Sales executive authentication is required." });
    const registration = parseRegistration(req.body.registration);
    const validationError = validate(registration);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const { step1, step2, step3 } = registration;

// Check whether this email is already used
const vendorEmail = clean(step2.email, 190).toLowerCase();

const [[existingEmail]] = await db.query(
  `
    SELECT id
    FROM vendors
    WHERE LOWER(email) = ?

    UNION ALL

    SELECT id
    FROM vendor_panel_accounts
    WHERE LOWER(email) = ?

    LIMIT 1
  `,
  [vendorEmail, vendorEmail]
);

if (existingEmail) {
  return res.status(409).json({
    success: false,
    message: "A vendor with this email already exists.",
  });
}

const [[category]] = await db.query(
  "SELECT id, name FROM vendor_categories WHERE id = ? AND status = 'active' LIMIT 1",
  [Number(step1.categoryId)]
);

if (!category) {
  return res.status(400).json({
    success: false,
    message: "The selected category is unavailable.",
  });
}

    const logo = req.files?.logo?.[0] || null;
    let logoUpload = null;
const documentUploads = [];

try {
  if (logo) {
    logoUpload = await uploadBuffer(logo.buffer, {
      folder: "milieu/vendor-logos",
      resource_type: "image",
    });
  }

  for (const [field, documentType] of Object.entries(
    DOCUMENT_FIELDS
  )) {
    const file = req.files?.[field]?.[0];

    if (!file) continue;

    const upload = await uploadBuffer(file.buffer, {
      folder: "milieu/vendor-documents",
      resource_type: "auto",
    });

    documentUploads.push({
      field,
      documentType,
      file,
      upload,
    });
  }
} catch (error) {
  console.error(
    "Cloudinary upload failed:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to upload vendor files. Please try again.",
  });
}
    await db.beginTransaction(); transactionStarted = true;

    const [vendorResult] = await db.query(
  `INSERT INTO vendors 
   (
     name,
     owner_name,
     service_type,
     category_id,
     description,
     years_of_experience,
     minimum_price,
     maximum_price,
     opening_time,
     closing_time,
     registration_status,
     submitted_at,
     image_url,
     phone,
     whatsapp,
     email,
     address,
     city,
     state,
     postal_code,
     landmark,
     is_active,
     sales_executive_id,
     commission_model,
     listing_type,
     commission_type,
     commission_value
   ) 
   VALUES 
   (
     ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
     'submitted',
     NOW(),
     ?,
     ?, ?, ?, ?, ?, ?, ?, ?,
     1,
     ?,
     'Free Listing',
     'General Listing',
     'fixed',
     ?
   )`,
  [
    clean(step1.businessName, 150),
    clean(step1.ownerName),
    category.name,
    category.id,
    clean(step3.aboutBusiness, 5000),
    clean(step3.experience, 30),
    Number(step3.minPrice),
    Number(step3.maxPrice),
    step3.openingTime,
    step3.closingTime,

    logoUpload?.secure_url || null,

    digits(step1.mobileNumber),
    digits(step2.whatsapp),
    vendorEmail,
    clean(step2.address),
    clean(step2.city, 100),
    clean(step2.state, 100),
    digits(step1.postalCode),
    clean(step2.landmark),

    salesExecutiveId,

    Number(
      (
        await db.query(
          "SELECT free_listing_commission FROM admin_settings ORDER BY id LIMIT 1"
        )
      )[0][0]?.free_listing_commission || 10
    ),
  ]
);

const vendorId = vendorResult.insertId;

await db.query(
  `
    INSERT INTO vendor_verification_submissions
    (
      vendor_id,
      status,
      submitted_at,
      ip_address
    )
    VALUES (?, 'pending_review', NOW(), ?)
  `,
  [
    vendorId,
    req.ip || null
  ]
);



    
    const {
  token: setupToken,
  tokenHash: setupTokenHash,
  expiresAt: setupTokenExpiresAt,
} = createSetupToken();
await db.query(
  `INSERT INTO vendor_panel_accounts
   (
     existing_vendor_id,
     business_name,
     contact_name,
     email,
     password_hash,
     avatar_url,
     status,
     email_verified,
     setup_token_hash,
     setup_token_expires_at
   )
   VALUES (?, ?, ?, ?, NULL, ?, 'pending_setup', 0, ?, ?)`,
  [
    vendorId,
    clean(step1.businessName, 150),
    clean(step1.ownerName, 120),
    vendorEmail,
    logoUpload?.secure_url || null,
    setupTokenHash,
    setupTokenExpiresAt,
  ]
);

    for (const [index, serviceName] of step3.services.map(x=>clean(x,150)).filter(Boolean).entries()) {
      await db.query(
        `INSERT INTO vendor_services
         (vendor_id, name, description, pricing_type, price_min, price_max, status, sort_order)
         VALUES (?, ?, ?, 'range', ?, ?, 'draft', ?)`,
        [vendorId, serviceName, clean(step3.aboutBusiness,1000), Number(step3.minPrice), Number(step3.maxPrice), index]
      );
    }

    for (const item of documentUploads) {
  const {
    documentType,
    file,
    upload,
  } = item;

  await db.query(
    `INSERT INTO vendor_verification_documents
     (
       vendor_id,
       document_type,
       original_file_name,
       stored_file_name,
       file_url,
       mime_type,
       file_size,
       document_blob,
       review_status
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 'pending')`,
    [
      vendorId,
      documentType,
      file.originalname,
      upload.public_id,
      upload.secure_url,
      file.mimetype,
      file.size,
    ]
  );
}
    

    await db.query(
      `INSERT INTO vendor_registration_consents
       (vendor_id, privacy_accepted, terms_accepted, accepted_at)
       VALUES (?, 1, 1, NOW())`,
      [vendorId]
    );

    const [[settings]] = await db.query("SELECT free_listing_commission FROM admin_settings ORDER BY id LIMIT 1");
    const commissionAmount = Number(settings?.free_listing_commission || 10);
    await db.query(
      `INSERT INTO sales_commissions
       (sales_executive_id, vendor_id, amount, commission_type,
        commission_source, description, status)
       VALUES (?, ?, ?, 'vendor_onboarding', 'free', ?, 'earned')`,
      [salesExecutiveId, vendorId, commissionAmount, `${clean(step1.businessName,150)} free listing onboarding`]
    );
    await db.query("UPDATE sales_executives SET total_registrations = total_registrations + 1 WHERE id = ?", [salesExecutiveId]);

    await db.commit(); transactionStarted = false;
    const setupUrl =
  `${FRONTEND_URL}/vendor/setup-password?token=${encodeURIComponent(setupToken)}`;

try {
  await sendVendorSetupEmail(
    clean(step2.email, 190).toLowerCase(),
    setupUrl,
    clean(step1.businessName, 150)
  );
} catch (emailError) {
  console.error("Vendor setup email failed:", emailError);
}
    res.status(201).json({ success: true, message: "Vendor registration submitted successfully.", data: { vendorId, registrationStatus: "submitted", commissionAmount, commissionSource: "free" } });
  } catch (error) {
    if (transactionStarted) await db.rollback();
    if (error?.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "This vendor registration contains duplicate information." });
    next(error);
  } finally { db.release(); }
};

exports.getDocument = async (req, res, next) => {
  try {
    const salesExecutiveId =
      Number(req.salesExecutive?.id);

    const [[document]] = await pool.query(
      `SELECT
         d.original_file_name,
         d.mime_type,
         d.file_url
       FROM vendor_verification_documents d
       JOIN vendors v
         ON v.id = d.vendor_id
       WHERE
         d.id = ?
         AND v.sales_executive_id = ?
       LIMIT 1`,
      [
        Number(req.params.documentId),
        salesExecutiveId,
      ]
    );

    if (!document?.file_url) {
      return res.status(404).json({
        success: false,
        message: "Document was not found.",
      });
    }

    return res.redirect(document.file_url);
  } catch (error) {
    next(error);
  }
};
