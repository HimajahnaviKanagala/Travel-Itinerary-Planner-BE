import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.get("/users", authenticate, getAllUsers);
router.put("/users/:id/role", authenticate, updateUserRole);
router.put("/users/:id/status", authenticate, updateUserStatus);

export default router;
