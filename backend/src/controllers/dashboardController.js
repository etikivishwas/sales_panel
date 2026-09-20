const { pool } = require("../config/db");

const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

exports.getDashboard = async (req, res, next) => {
  try {
    const id = req.salesExecutive.id;

    const [[executive]] = await pool.query(
      "SELECT id, name FROM sales_executives WHERE id = ?",
      [id]
    );

    const [[vendors]] = await pool.query(
      "SELECT COUNT(*) total FROM vendors WHERE sales_executive_id = ?",
      [id]
    );

    const [[commissions]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) total FROM sales_commissions WHERE sales_executive_id = ? AND status = 'earned'",
      [id]
    );

    const [[withdrawals]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) total FROM sales_withdrawal_requests WHERE sales_executive_id = ? AND status = 'pending'",
      [id]
    );

    const [recent] = await pool.query(
      "SELECT id, name, service_type, is_active FROM vendors WHERE sales_executive_id = ? ORDER BY created_at DESC LIMIT 4",
      [id]
    );

    res.json({
      success: true,
      data: {
        executive: {
          ...executive,
          firstName: executive.name.split(" ")[0],
        },

        metrics: {
          totalVendors: vendors.total,
          totalCommissions: commissions.total,
          pendingWithdrawals: withdrawals.total,
        },

        recentRegistrations: recent.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          serviceType: vendor.service_type,
          initials: initials(vendor.name),
          status: vendor.is_active ? "approved" : "pending",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

