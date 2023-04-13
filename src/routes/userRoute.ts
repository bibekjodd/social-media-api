import express from "express";
import { createUser, login, myProfile } from "../controllers/userController";
const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);
router.get("/me", myProfile);

export default router;
