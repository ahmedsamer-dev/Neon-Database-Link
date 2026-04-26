import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "../modules/products";
import ordersRouter from "../modules/orders";
import adminRouter from "./admin";
import adminProductsRouter from "./admin-products";
import notificationsRouter from "./notifications";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(adminProductsRouter);
router.use(notificationsRouter);
router.use(settingsRouter);

export default router;
