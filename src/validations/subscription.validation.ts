import { z } from "zod";

import {
    SubscriptionPlan,
    SubscriptionPlatform,
} from "@prisma/client";

// ======================================
// PARAMS
// ======================================

export const subscriptionIdParams = z.object({
    id: z.string().uuid(),
});

// ======================================
// VERIFY SUBSCRIPTION
// POST /subscriptions/verify
// ======================================

export const verifySubscriptionBody = z.object({
    plan: z.nativeEnum(SubscriptionPlan),

    platform: z.nativeEnum(
        SubscriptionPlatform
    ),

    purchaseToken: z
        .string()
        .trim()
        .min(10),

    transactionId: z
        .string()
        .trim()
        .optional(),

    amount: z.coerce
        .number()
        .positive()
        .optional(),

    currency: z
        .string()
        .trim()
        .length(3)
        .optional(),
});

// ======================================
// LIST SUBSCRIPTIONS
// (Future Admin/User History)
// ======================================

export const subscriptionListQuery =
    z.object({
        active: z.coerce
            .boolean()
            .optional(),

        platform: z
            .nativeEnum(
                SubscriptionPlatform
            )
            .optional(),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(20),

        offset: z.coerce
            .number()
            .int()
            .min(0)
            .default(0),
    });

// ======================================
// CANCEL SUBSCRIPTION
// (Future)
// ======================================

export const cancelSubscriptionBody =
    z.object({
        reason: z
            .string()
            .trim()
            .max(500)
            .optional(),
    });