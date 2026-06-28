import { Request } from "express";
import { absoluteUrl } from "../url";


// export type WallpaperDTOModel = {
//     id: string;

//     title: string;
//     slug: string;
//     description: string | null;

//     originalPath: string;
//     displayPath: string;
//     thumbnailPath: string;

//     originalName: string;
//     fileName: string;
//     mimeType: string;
//     extension: string;

//     width: number;
//     height: number;
//     aspectRatio: number;

//     originalSize: number;
//     displaySize: number;
//     thumbnailSize: number;

//     quality: string;
//     format: string;

//     isPremium: boolean;
//     isFeatured: boolean;
//     featuredOrder: number;

//     active: boolean;

//     likeCount: number;
//     downloadCount: number;
//     viewCount: number;

//     dominantColor: string | null;
//     blurHash: string | null;

//     cacheVersion: number;

//     status: string;

//     createdAt: Date;
//     updatedAt: Date;

//     category?: {
//         id: string;
//         name: string;
//         slug: string;
//         thumbnailUrl: string | null;
//     } | null;

//     wallpaperVariants?: any[];

//     wallpaperTags?: {
//         tag: {
//             id: string;
//             name: string;
//         };
//     }[];
// };

export const toWallpaperDTO = (
    req: Request,
    wallpaper: any
) => ({
    id: wallpaper.id,

    title: wallpaper.title,

    slug: wallpaper.slug,

    description: wallpaper.description,

    imageUrl: absoluteUrl(req, wallpaper.displayPath),

    thumbnailUrl: absoluteUrl(req, wallpaper.thumbnailPath),

    downloadUrl: absoluteUrl(req, wallpaper.originalPath),

    width: wallpaper.width,

    height: wallpaper.height,

    aspectRatio: wallpaper.aspectRatio,

    quality: wallpaper.quality,

    format: wallpaper.format,

    isPremium: wallpaper.isPremium,

    isFeatured: wallpaper.isFeatured,

    featuredOrder: wallpaper.featuredOrder,

    active: wallpaper.active,

    likes: wallpaper.likeCount,

    downloads: wallpaper.downloadCount,

    views: wallpaper.viewCount,

    dominantColor: wallpaper.dominantColor,

    blurHash: wallpaper.blurHash,

    cacheVersion: wallpaper.cacheVersion,

    status: wallpaper.status,

    createdAt: wallpaper.createdAt,

    updatedAt: wallpaper.updatedAt,

    category: wallpaper.category && {
        id: wallpaper.category.id,

        name: wallpaper.category.name,

        slug: wallpaper.category.slug,

        thumbnailUrl: wallpaper.category.thumbnailUrl
            ? absoluteUrl(req, wallpaper.category.thumbnailUrl)
            : null
    },

    tags:
        wallpaper.wallpaperTags?.map((x: any) => x.tag.name) ?? [],

    variants:
        wallpaper.wallpaperVariants?.map((v: any) => ({
            type: v.type,

            url: absoluteUrl(req, v.url),

            width: v.width,

            height: v.height,

            size: v.size,

            format: v.format,

            quality: v.compressionQuality,

            isDefault: v.isDefault
        })) ?? []
});
