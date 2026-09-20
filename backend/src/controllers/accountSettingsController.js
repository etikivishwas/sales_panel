const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const PHONE_PATTERN = /^[0-9+()\-\s]{7,30}$/;

exports.getAccountSettings = async (req, res, next) => {
  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales executive authentication is required.",
      });
    }

    const [[account]] = await pool.query(
      `SELECT
         se.id,
         se.name,
         se.email,
         se.executive_code,
         se.status,
         COALESCE(sep.designation, 'Sales Executive') AS designation,
         sep.phone,
         sep.avatar_url,
         spa.last_login_at
       FROM sales_executives se
       LEFT JOIN sales_executive_profiles sep
         ON sep.sales_executive_id = se.id
       LEFT JOIN sales_panel_accounts spa
         ON spa.sales_executive_id = se.id
       WHERE se.id = ?
       LIMIT 1`,
      [salesExecutiveId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Sales account was not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        email: account.email,
        executiveCode: account.executive_code,
        status: account.status,
        designation: account.designation,
        phone: account.phone || "",
        avatarUrl: account.avatar_url || "",
        lastLoginAt: account.last_login_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAccountSettings = async (req, res, next) => {
  const db = await pool.getConnection();
  let transactionStarted = false;

  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales executive authentication is required.",
      });
    }

    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const designation = String(req.body.designation || "Sales Executive").trim();
    const avatarUrl = String(req.body.avatarUrl || "").trim();

    if (name.length < 2 || name.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 255 characters.",
      });
    }

    if (phone && !PHONE_PATTERN.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number.",
      });
    }

    if (!designation || designation.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Designation is required and cannot exceed 100 characters.",
      });
    }

    if (avatarUrl.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL cannot exceed 500 characters.",
      });
    }

    await db.beginTransaction();
    transactionStarted = true;

    const [executiveResult] = await db.query(
      `UPDATE sales_executives
       SET name = ?
       WHERE id = ?`,
      [name, salesExecutiveId]
    );

    if (!executiveResult.affectedRows) {
      await db.rollback();
      return res.status(404).json({
        success: false,
        message: "Sales account was not found.",
      });
    }

    await db.query(
      `INSERT INTO sales_executive_profiles
         (sales_executive_id, designation, phone, avatar_url)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         designation = VALUES(designation),
         phone = VALUES(phone),
         avatar_url = VALUES(avatar_url),
         updated_at = CURRENT_TIMESTAMP`,
      [salesExecutiveId, designation, phone || null, avatarUrl || null]
    );

    await db.commit();
    transactionStarted = false;

    return res.json({
      success: true,
      message: "Account settings updated successfully.",
      data: { name, phone, designation, avatarUrl },
    });
  } catch (error) {
    if (transactionStarted) {
      await db.rollback();
    }
    next(error);
  } finally {
    db.release();
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const salesExecutiveId = Number(req.salesExecutive?.id);
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!salesExecutiveId) {
      return res.status(401).json({
        success: false,
        message: "Sales executive authentication is required.",
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({
        success: false,
        message: "New password must contain between 8 and 72 characters.",
      });
    }

    const [[account]] = await pool.query(
      `SELECT id, email, password_hash
       FROM sales_panel_accounts
       WHERE sales_executive_id = ?
         AND status = 'active'
       LIMIT 1`,
      [salesExecutiveId]
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Active sales login account was not found.",
      });
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      account.password_hash
    );

    if (!currentPasswordMatches) {
      return res.status(400).json({
        success: false,
        message: "The current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, account.password_hash);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "The new password must be different from the current password.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      `UPDATE sales_panel_accounts
       SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [passwordHash, account.id]
    );

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
