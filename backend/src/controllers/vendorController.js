const { pool } = require("../config/db");

exports.getVendors = async (req, res, next) => {
  try {
    const id = req.salesExecutive.id;
    const search = String(req.query.search || "");
    const status = String(req.query.status || "all");

    let sql = `
      SELECT
        v.id,
        v.name,
        v.service_type,
        v.registration_status,
        v.is_active,
        v.is_verified,
        v.created_at,
        vvs.status AS verification_status
      FROM vendors v
      LEFT JOIN vendor_verification_submissions vvs
        ON vvs.vendor_id = v.id
      WHERE v.sales_executive_id = ?
    `;

    const params = [id];

    if (search) {
      sql += ` AND (v.name LIKE ? OR v.service_type LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status === "approved") {
      sql += ` AND vvs.status = 'approved'`;
    } else if (status === "pending") {
      sql += ` AND vvs.status = 'pending_review'`;
    }

    sql += ` ORDER BY v.created_at DESC`;

    const [rows] = await pool.query(sql, params);

    res.json({
      success: true,
      data: {
        vendors: rows.map((r) => ({
          id: r.id,
          name: r.name,
          serviceType: r.service_type,
          status:
            r.verification_status === "approved"
              ? "approved"
              : r.verification_status === "rejected"
                ? "rejected"
                : "pending",
          date: new Date(r.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        })),
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.getVendorDetails = async (req, res, next) => {
  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);
    const vendorId = Number(req.params.vendorId);

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales executive authentication is required.",
      });
    }

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    const [[vendor]] = await pool.query(
      `
        SELECT
          v.id,
          v.name,
          v.owner_name,
          v.service_type,
          v.category_id,
          vc.name AS category_name,
          v.description,
          v.years_of_experience,
          v.minimum_price,
          v.maximum_price,
          v.opening_time,
          v.closing_time,
          v.registration_status,
          v.is_verified,
          v.submitted_at,
          v.image_url,
          v.phone,
          v.whatsapp,
          v.email,
          v.address,
          v.city,
          v.state,
          v.postal_code,
          v.landmark,
          v.is_active,
          vvs.status AS verification_status
        FROM vendors v
LEFT JOIN vendor_categories vc
  ON vc.id = v.category_id
LEFT JOIN vendor_verification_submissions vvs
  ON vvs.vendor_id = v.id
WHERE
  v.id = ?
  AND v.sales_executive_id = ?
LIMIT 1
      `,
      [vendorId, salesExecutiveId]
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor was not found.",
      });
    }

    const [services] = await pool.query(
      `
        SELECT
          id,
          name,
          description,
          pricing_type,
          price_min,
          price_max,
          status,
          sort_order
        FROM vendor_services
        WHERE vendor_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
      [vendorId]
    );

    const [documents] = await pool.query(
      `
        SELECT
          id,
          document_type,
          original_file_name,
          mime_type,
          file_size,
          review_status
        FROM vendor_verification_documents
        WHERE vendor_id = ?
        ORDER BY id ASC
      `,
      [vendorId]
    );

    const [[consent]] = await pool.query(
      `
        SELECT
          privacy_accepted,
          terms_accepted,
          accepted_at
        FROM vendor_registration_consents
        WHERE vendor_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [vendorId]
    );

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          ownerName: vendor.owner_name,
          serviceType: vendor.service_type,
          categoryId: vendor.category_id,
          categoryName: vendor.category_name,
          description: vendor.description,
          yearsOfExperience: vendor.years_of_experience,
          minimumPrice: vendor.minimum_price,
          maximumPrice: vendor.maximum_price,
          openingTime: vendor.opening_time,
          closingTime: vendor.closing_time,
         registrationStatus:
  vendor.verification_status === "approved"
    ? "approved"
    : vendor.verification_status === "rejected"
      ? "rejected"
      : "pending",
      verificationStatus: vendor.verification_status,
isVerified: vendor.is_verified,

          submittedAt: vendor.submitted_at,
          imageUrl: vendor.image_url,
          phone: vendor.phone,
          whatsapp: vendor.whatsapp,
          email: vendor.email,
          address: vendor.address,
          city: vendor.city,
          state: vendor.state,
          postalCode: vendor.postal_code,
          landmark: vendor.landmark,
          isActive: vendor.is_active,
        },
        services,
        documents,
        consent: consent || null,
      },
    });
  } catch (e) {
    next(e);
  }
};