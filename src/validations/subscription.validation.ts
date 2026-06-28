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
// CREATE SUBSCRIPTION
// ======================================

export const createSubscriptionBody = z
    .object({
        plan: z.nativeEnum(SubscriptionPlan),

        platform: z.nativeEnum(SubscriptionPlatform),

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

        startDate: z.coerce.date(),

        endDate: z.coerce.date(),
    })
    .refine(
        data => data.endDate > data.startDate,
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );

// ======================================
// UPDATE SUBSCRIPTION
// ======================================

export const updateSubscriptionBody = z
    .object({
        plan: z.nativeEnum(SubscriptionPlan).optional(),

        platform: z.nativeEnum(SubscriptionPlatform).optional(),

        purchaseToken: z.string().trim().optional(),

        transactionId: z.string().trim().optional(),

        amount: z.coerce
            .number()
            .positive()
            .optional(),

        currency: z
            .string()
            .trim()
            .length(3)
            .optional(),

        startDate: z.coerce
            .date()
            .optional(),

        endDate: z.coerce
            .date()
            .optional(),

        active: z.coerce
            .boolean()
            .optional(),
    })
    .refine(
        data =>
            !data.startDate ||
            !data.endDate ||
            data.endDate > data.startDate,
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    );
// ======================================
// VERIFY PURCHASE
// ======================================

export const verifyPurchaseBody = z.object({
    purchaseToken: z
        .string()
        .trim()
        .min(10),

    platform: z.nativeEnum(
        SubscriptionPlatform
    ),
});

// ======================================
// USER SUBSCRIPTIONS
// ======================================

export const subscriptionListQuery = z.object({
    active: z.coerce
        .boolean()
        .optional(),

    platform: z
        .nativeEnum(SubscriptionPlatform)
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
// ======================================

export const cancelSubscriptionBody = z.object({
    reason: z
        .string()
        .trim()
        .max(500)
        .optional(),
});