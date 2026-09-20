const { pool } = require("../config/db");

const ALLOWED_FILTERS = new Set(["all", "credited", "pending", "rejected"]);

function normalizeFilter(value) {
  return String(value || "all")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function mapDatabaseStatus(status) {
  const value = String(status || "earned").trim().toLowerCase();

  if (value === "earned") return "credited";
  if (value === "reversed") return "rejected";
  return "pending";
}

function buildReference(id) {
  return `COM-${String(id).padStart(6, "0")}`;
}

exports.getHistory = async (req, res, next) => {
  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales executive authentication is required.",
      });
    }

    const search = String(req.query.search || "").trim().toLowerCase();
    const statusFilter = normalizeFilter(req.query.status);

    if (!ALLOWED_FILTERS.has(statusFilter)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commission status filter.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
         sc.id,
         sc.vendor_id,
         sc.amount,
         sc.commission_type,
         sc.description,
         sc.status,
         sc.earned_at,
         sc.created_at,
         v.name AS vendor_name,
         v.service_type
       FROM sales_commissions sc
       LEFT JOIN vendors v
         ON v.id = sc.vendor_id
       WHERE sc.sales_executive_id = ?
       ORDER BY sc.earned_at DESC, sc.id DESC`,
      [salesExecutiveId]
    );

    const allCommissions = rows.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName:
        row.vendor_name ||
        row.description ||
        "Vendor onboarding",
      serviceType:
        row.service_type ||
        String(row.commission_type || "vendor_onboarding").replace(/_/g, " "),
      commissionType: row.commission_type,
      description: row.description,
      commissionAmount: Number(row.amount || 0),
      status: mapDatabaseStatus(row.status),
      originalStatus: row.status,
      date: row.earned_at || row.created_at,
      referenceId: buildReference(row.id),
    }));

    const summary = allCommissions.reduce(
      (result, record) => {
        const amount = Number(record.commissionAmount || 0);

        result.totalCommissions += amount;
        result.totalRecords += 1;

        if (record.status === "credited") {
          result.creditedCommissions += amount;
          result.creditedCount += 1;
        } else if (record.status === "rejected") {
          result.rejectedCommissions += amount;
          result.rejectedCount += 1;
        } else {
          result.pendingCommissions += amount;
          result.pendingCount += 1;
        }

        return result;
      },
      {
        totalCommissions: 0,
        creditedCommissions: 0,
        pendingCommissions: 0,
        rejectedCommissions: 0,
        totalRecords: 0,
        creditedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
      }
    );

    const commissions = allCommissions.filter((record) => {
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      if (!matchesStatus) return false;
      if (!search) return true;

      return [
        record.vendorName,
        record.serviceType,
        record.description,
        record.referenceId,
        record.originalStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    return res.json({
      success: true,
      data: {
        summary,
        commissions,
      },
    });
  } catch (error) {
    next(error);
  }
};
