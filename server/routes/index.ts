import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/session.js";
import health from "./health.js";
import auth from "./auth.js";
import calendar from "./calendar.js";
import state from "./state.js";

const router: IRouter = Router();

// Public
router.use(health);
router.use(auth);
router.use(calendar);

// Everything below needs a signed-in user.
router.use(requireAuth);
router.use(state);

export default router;
