import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { pool } from "../../config/db";

export const signupService = async (userData: any) => {
  const { name, email, password, phone, role = "customer" } = userData;

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email.toLowerCase()],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (name, email, password, phone, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, phone, role;
  `;

  const values = [name, email.toLowerCase(), hashedPassword, phone, role];
  const result = await pool.query(query, values);

  return result.rows[0];
};

export const signinService = async (credentials: any) => {
  const { email, password } = credentials;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const secret: Secret = process.env.JWT_SECRET || "super_secret_jwt_key_12345";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as any;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn } as SignOptions,
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};
