const { pool } = require("../config/db");

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getProfile = async (req, res, next) => {
  try {
    const executiveId = req.salesExecutive.id;

    const [[executive]] = await pool.query(
      `SELECT
         se.id,
         se.name,
         se.email,
         se.executive_code,
         se.total_registrations,
         se.converted,
         COALESCE(sp.designation, 'Sales Executive') AS designation,
         sp.phone,
         sp.avatar_url
       FROM sales_executives se
       LEFT JOIN sales_executive_profiles sp
         ON sp.sales_executive_id = se.id
       WHERE se.id = ? AND se.status = 'active'
       LIMIT 1`,
      [executiveId]
    );

    if (!executive) {
      return res.status(404).json({
        success: false,
        message: "Sales executive not found",
      });
    }

    const [[vendorStats]] = await pool.query(
      `SELECT COUNT(*) AS total_onboarded
       FROM vendors
       WHERE sales_executive_id = ?`,
      [executiveId]
    );

    const [[rankStats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_executives,
         SUM(r.vendor_count > current_rank.vendor_count) AS executives_ahead
       FROM (
         SELECT
           se.id,
           COUNT(v.id) AS vendor_count
         FROM sales_executives se
         LEFT JOIN vendors v
           ON v.sales_executive_id = se.id
         WHERE se.status = 'active'
         GROUP BY se.id
       ) r
       CROSS JOIN (
         SELECT COUNT(v.id) AS vendor_count
         FROM sales_executives se
         LEFT JOIN vendors v
           ON v.sales_executive_id = se.id
         WHERE se.id = ?
         GROUP BY se.id
       ) current_rank`,
      [executiveId]
    );

    const totalOnboarded = Number(vendorStats.total_onboarded || 0);
    const totalRegistrations = Number(executive.total_registrations || 0);
    const converted = Number(executive.converted || 0);
    const conversionRate = totalRegistrations
      ? Math.round((converted / totalRegistrations) * 100)
      : 0;

    const totalExecutives = Number(rankStats.total_executives || 1);
    const executivesAhead = Number(rankStats.executives_ahead || 0);
    const rankPosition = executivesAhead + 1;
    const rankPercent = Math.max(
      1,
      Math.ceil((rankPosition / totalExecutives) * 100)
    );

    return res.status(200).json({
      success: true,
      data: {
        id: executive.id,
        name: executive.name,
        email: executive.email,
        executiveCode: executive.executive_code,
        designation: executive.designation,
        phone: executive.phone,
        avatarUrl: executive.avatar_url,
        initials: initials(executive.name),
        performance: {
          totalOnboarded,
          conversionRate,
          rankPosition,
          totalExecutives,
          rankPercent,
          rankLabel:
            rankPosition === 1 ? "Top Performer" : `Rank #${rankPosition}`,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProfile };
