import { z } from "zod";

// ======================================
// PARAMS
// ======================================

export const favoriteParams = z.object({
    wallpaperId: z.string().uuid(),
});

// ======================================
// ADD TO FAVORITES
// ======================================

export const addFavoriteBody = z.object({
    wallpaperId: z.string().uuid(),
});

// ======================================
// REMOVE FAVORITE
// ======================================

export const removeFavoriteBody = z.object({
    wallpaperId: z.string().uuid(),
});

// ======================================
// LIST FAVORITES
// ======================================

export const favoriteListQuery = z.object({
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

    search: z
        .string()
        .trim()
        .optional(),

    category: z
        .string()
        .uuid()
        .optional(),

    premiumOnly: z.coerce
        .boolean()
        .optional(),

    featuredOnly: z.coerce
        .boolean()
        .optional(),
});

// ======================================
// CHECK FAVORITE
// ======================================

export const checkFavoriteParams = z.object({
    wallpaperId: z.string().uuid(),
});