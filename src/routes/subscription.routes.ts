import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";

import { validate } from "../middlewares/validate.middleware";

import { asyncHandler } from "../utils/asyncHandler";

import { subscriptionController } from "../controllers/subscription.controller";

import {
    verifySubscriptionBody,
} from "../validations/subscription.validation";

const router = Router();

// Public

router.get(
    "/plans",
    asyncHandler(
        subscriptionController.plans
    )
);

// Protected

router.use(authenticate);

router.post(
    "/verify",
    validate({
        body: verifySubscriptionBody,
    }),
    asyncHandler(
        subscriptionController.verify
    )
);

router.get(
    "/status",
    asyncHandler(
        subscriptionController.status
    )
);

export default router;