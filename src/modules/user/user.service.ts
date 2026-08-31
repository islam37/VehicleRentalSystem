import { pool } from "../../config/db";

// 1. Get all users (Admin only)
export const getAllUsersService = async () => {
  const query = `
    SELECT id, name, email, phone, role
    FROM users
    ORDER BY id ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// 2. Update user (Admin or Own Profile)
export const updateUserService = async (
  targetUserId: number,
  currentUser: { id: number; role: "admin" | "customer" },
  updateData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: "admin" | "customer";
  },
) => {
  // Check if user has permission (Admin or updating own profile)
  if (currentUser.role !== "admin" && currentUser.id !== targetUserId) {
    throw new Error("Forbidden: You can only update your own profile");
  }

  // Check if target user exists
  const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
    targetUserId,
  ]);
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const existing = userResult.rows[0];

  // Only Admin can update role; Customer retains original role
  const roleToSet =
    currentUser.role === "admin" && updateData.role
      ? updateData.role
      : existing.role;

  const query = `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      role = $4
    WHERE id = $5
    RETURNING id, name, email, phone, role;
  `;

  const values = [
    updateData.name ?? null,
    updateData.email ? updateData.email.toLowerCase() : null,
    updateData.phone ?? null,
    roleToSet,
    targetUserId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// 3. Delete user (Admin only - must not have active bookings)
export const deleteUserService = async (userId: number) => {
  // Constraint: check if user has active bookings
  const checkActiveBooking = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active';",
    [userId],
  );

  if (checkActiveBooking.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id;",
    [userId],
  );

  if (result.rowCount === 0) {
    throw new Error("User not found");
  }

  return true;
};
