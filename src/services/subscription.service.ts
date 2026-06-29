import prisma from "../config/prisma";

import { ApiError } from "../utils/ApiError";

import {
    SubscriptionPlan,
    SubscriptionPlatform,
} from "@prisma/client";

const getEndDate = (
    plan: SubscriptionPlan
) => {
    const end = new Date();

    switch (plan) {
        case "MONTHLY":
            end.setMonth(end.getMonth() + 1);
            break;

        case "QUARTERLY":
            end.setMonth(end.getMonth() + 3);
            break;

        case "YEARLY":
            end.setFullYear(end.getFullYear() + 1);
            break;

        case "LIFETIME":
            end.setFullYear(end.getFullYear() + 100);
            break;

        default:
            end.setMonth(end.getMonth() + 1);
    }

    return end;
};

export const subscriptionService = {
    async verify(
        userId: string,
        input: {
            plan: SubscriptionPlan;
            platform: SubscriptionPlatform;
            purchaseToken: string;
            transactionId?: string;
            amount?: number;
            currency?: string;
        }
    ) {
        const existing =
            await prisma.subscription.findUnique({
                where: {
                    purchaseToken:
                        input.purchaseToken,
                },
            });

        if (existing) {
            throw ApiError.conflict(
                "Purchase token already exists."
            );
        }

        const startDate = new Date();

        const endDate =
            getEndDate(input.plan);

        return prisma.$transaction(
            async (tx) => {
                await tx.subscription.updateMany({
                    where: {
                        userId,
                        active: true,
                    },

                    data: {
                        active: false,
                    },
                });

                const subscription =
                    await tx.subscription.create({
                        data: {
                            userId,

                            plan: input.plan,

                            platform:
                                input.platform,

                            purchaseToken:
                                input.purchaseToken,

                            transactionId:
                                input.transactionId,

                            amount: input.amount,

                            currency:
                                input.currency,

                            startDate,

                            endDate,

                            active: true,
                        },
                    });

                await tx.user.update({
                    where: {
                        id: userId,
                    },

                    data: {
                        isPremium: true,

                        premiumUntil: endDate,
                    },
                });

                return subscription;
            }
        );
    },

    async status(userId: string) {
        const user =
            await prisma.user.findUnique({
                where: {
                    id: userId,
                },

                select: {
                    isPremium: true,

                    premiumUntil: true,
                },
            });

        if (!user) {
            throw ApiError.notFound(
                "User not found."
            );
        }

        return user;
    },

    async plans() {
        return [
            {
                plan: "MONTHLY",
                price: 49,
            },
            {
                plan: "QUARTERLY",
                price: 129,
            },
            {
                plan: "YEARLY",
                price: 329,
            },
        ];
    },
};