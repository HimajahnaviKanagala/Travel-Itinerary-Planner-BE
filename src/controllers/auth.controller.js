import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res) => {
  try {
    const { email, full_name, password } = req.body;

    if (!email || !full_name || !password)
      return res
        .status(400)
        .json({ error: "Email, name and password are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          full_name: full_name.trim(),
          password: password_hash,
        },
      ])
      .select("id, email, full_name, role, avatar_url, created_at")
      .single();

    if (error) throw error;

    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid email or password" });

    if (!user.is_active)
      return res.status(403).json({ error: "Account has been deactivated" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: "Invalid email or password" });

    // Update last_login timestamp
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    const token = generateToken(user.id);

    // Strip password_hash before sending
    const { password: password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;

    if (!full_name || !full_name.trim())
      return res.status(400).json({ error: "Name cannot be empty" });

    const { data, error } = await supabase
      .from("users")
      .update({ full_name: full_name.trim(), avatar_url: avatar_url || null })
      .eq("id", req.user.id)
      .select("id, email, full_name, role, avatar_url, updated_at")
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "Both current and new password are required" });

    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters" });

    if (currentPassword === newPassword)
      return res.status(400).json({
        error: "New password must be different from current password",
      });

    // Fetch the stored hash
    const { data: user } = await supabase
      .from("users")
      .select("password")
      .eq("id", req.user.id)
      .single();

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      return res.status(400).json({ error: "Current password is incorrect" });

    const password_hash = await bcrypt.hash(newPassword, 12);

    await supabase
      .from("users")
      .update({ password: password_hash })
      .eq("id", req.user.id);

    res.json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Failed to fetch users" });
  res.json({ users: data });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", req.params.id)
    .select("id, full_name, email, role")
    .single();
  if (error) return res.status(500).json({ error: "Failed to update role" });
  res.json({ user: data });
};

export const updateUserStatus = async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabase
    .from("users")
    .update({ is_active })
    .eq("id", req.params.id)
    .select("id, is_active")
    .single();
  if (error) return res.status(500).json({ error: "Failed to update status" });
  res.json({ user: data });
};
