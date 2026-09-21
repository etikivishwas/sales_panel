const { pool } = require(
  "../config/db"
);

const getInitials = (name) => {
  return String(name || "Vendor")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

exports.getDashboard = async (
  req,
  res,
  next
) => {
  try {
    /*
     * Your existing auth middleware and
     * withdrawal controller already use:
     *
     * req.salesExecutive.id
     */
    const salesExecutiveId =
      Number(
        req.salesExecutive?.id
      );

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,

        message:
          "Sales executive authentication is required.",
      });
    }

    // =================================================
    // SALES EXECUTIVE
    // =================================================

    const [[executive]] =
      await pool.query(
        `SELECT
           id,
           name
         FROM sales_executives
         WHERE id = ?
         LIMIT 1`,
        [salesExecutiveId]
      );

    if (!executive) {
      return res.status(404).json({
        success: false,

        message:
          "Sales executive was not found.",
      });
    }

    // =================================================
    // TOTAL VENDORS ONBOARDED
    // =================================================

    const [[vendorMetrics]] =
      await pool.query(
        `SELECT
           COUNT(*) AS totalVendors
         FROM vendors
         WHERE sales_executive_id = ?`,
        [salesExecutiveId]
      );

    // =================================================
    // PAID AND FREE COMMISSIONS
    // =================================================

    const [[commissionMetrics]] =
      await pool.query(
        `SELECT
           COALESCE(
             SUM(
               CASE
                 WHEN status = 'earned'
                  AND commission_source = 'paid'
                 THEN amount
                 ELSE 0
               END
             ),
             0
           ) AS paidCommissions,

           COALESCE(
             SUM(
               CASE
                 WHEN status = 'earned'
                  AND commission_source = 'free'
                 THEN amount
                 ELSE 0
               END
             ),
             0
           ) AS freeCommissions

         FROM sales_commissions

         WHERE sales_executive_id = ?`,
        [salesExecutiveId]
      );

    // =================================================
    // PENDING WITHDRAWALS
    // =================================================

    /*
     * The Dashboard card says:
     * "Pending Withdrawals"
     *
     * Therefore, it should show only requests
     * whose current status is pending.
     *
     * Available balance is calculated separately
     * by the withdrawal summary endpoint.
     */
    const [[withdrawalMetrics]] =
      await pool.query(
        `SELECT
           COALESCE(
             SUM(amount),
             0
           ) AS pendingWithdrawals

         FROM sales_withdrawal_requests

         WHERE sales_executive_id = ?
           AND status = 'pending'`,
        [salesExecutiveId]
      );

    // =================================================
    // RECENT REGISTRATIONS
    // =================================================

    /*
     * These fields are based on your previously
     * working controller:
     *
     * vendors.name
     * vendors.service_type
     * vendors.is_active
     * vendors.created_at
     */
    const [recentVendors] =
      await pool.query(
        `SELECT
           id,
           name,
           service_type,
           is_active,
           created_at

         FROM vendors

         WHERE sales_executive_id = ?

         ORDER BY created_at DESC

         LIMIT 4`,
        [salesExecutiveId]
      );

    const executiveName = String(
      executive.name || "Executive"
    ).trim();

    const recentRegistrations =
      recentVendors.map((vendor) => ({
        id: vendor.id,

        name:
          vendor.name ||
          "Vendor",

        serviceType:
          vendor.service_type ||
          "General Service",

        initials: getInitials(
          vendor.name
        ),

        status: vendor.is_active
          ? "approved"
          : "pending",

        createdAt:
          vendor.created_at,
      }));

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      data: {
        executive: {
          id: executive.id,

          name: executiveName,

          firstName:
            executiveName
              .split(/\s+/)[0] ||
            "Executive",
        },

        metrics: {
          totalVendors: Number(
            vendorMetrics
              ?.totalVendors || 0
          ),

          paidCommissions: Number(
            commissionMetrics
              ?.paidCommissions || 0
          ),

          freeCommissions: Number(
            commissionMetrics
              ?.freeCommissions || 0
          ),

          pendingWithdrawals:
            Number(
              withdrawalMetrics
                ?.pendingWithdrawals ||
                0
            ),
        },

        recentRegistrations,
      },
    });
  } catch (error) {
    console.error(
      "Get dashboard error:",
      error
    );

    next(error);
  }
};