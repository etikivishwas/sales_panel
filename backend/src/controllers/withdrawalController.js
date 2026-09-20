const { pool } = require("../config/db");

async function balance(db, id) {
  const [[earned]] = await db.query(
    "SELECT COALESCE(SUM(amount), 0) a FROM sales_commissions WHERE sales_executive_id = ? AND status = 'earned'",
    [id]
  );

  const [[requested]] = await db.query(
    "SELECT COALESCE(SUM(amount), 0) a FROM sales_withdrawal_requests WHERE sales_executive_id = ? AND status IN ('pending', 'approved', 'paid')",
    [id]
  );

  const [[settings]] = await db.query(
    "SELECT min_withdrawal FROM admin_settings ORDER BY id LIMIT 1"
  );

  return {
    availableBalance: Math.max(0, earned.a - requested.a),
    minimumWithdrawal: Number(settings?.min_withdrawal || 500),
  };
}

exports.getSummary = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await balance(pool, req.salesExecutive.id),
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const db = await pool.getConnection();

  try {
    await db.beginTransaction();

    const amount = Number(req.body.amount);
    const accountBalance = await balance(db, req.salesExecutive.id);

    if (
      amount < accountBalance.minimumWithdrawal ||
      amount > accountBalance.availableBalance
    ) {
      await db.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    await db.query(
      "INSERT INTO sales_withdrawal_requests(sales_executive_id, amount, status) VALUES (?, ?, 'pending')",
      [req.salesExecutive.id, amount]
    );

    await db.commit();

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
    });
  } catch (error) {
    await db.rollback();
    next(error);
  } finally {
    db.release();
  }
};
