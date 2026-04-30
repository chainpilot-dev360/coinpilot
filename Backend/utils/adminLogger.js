export async function logAdminAction(
  pool,
  adminId,
  action,
  targetType,
  targetId,
  details = ""
) {
  try {
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, targetType, targetId, details]
    );
  } catch (error) {
    console.error("Admin log error:", error);
  }
}