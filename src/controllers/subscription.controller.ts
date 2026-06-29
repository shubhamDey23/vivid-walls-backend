import { Request, Response } from "express";

import { subscriptionService } from "../services/subscription.service";

import { response } from "../utils/ApiResponse";

export const subscriptionController = {
    async plans(
        _req: Request,
        res: Response
    ) {
        const plans =
            await subscriptionService.plans();

        response.success(res, plans);
    },

    async verify(
        req: Request,
        res: Response
    ) {
        const subscription =
            await subscriptionService.verify(
                req.user!.id,
                req.body
            );

        response.success(
            res,
            subscription,
            {
                status: 201,
                message:
                    "Subscription activated.",
            }
        );
    },

    async status(
        req: Request,
        res: Response
    ) {
        const status =
            await subscriptionService.status(
                req.user!.id
            );

        response.success(res, status);
    },
};