import multer from "multer";
import path from "path";
import fs from "fs";

// ==============================
// ENSURE UPLOAD FOLDER EXISTS
// ==============================

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
};


// ==============================
// COMMON IMAGE FILTER
// ==============================

const imageFileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {

    if (
        file.mimetype.startsWith(
            "image/"
        )
    ) {
        cb(null, true);
    }
    else {
        cb(
            new Error(
                "Only images allowed"
            )
        );
    }

};


// ==============================
// WALLPAPER UPLOAD STORAGE
// Used for existing wallpaper upload
// Saves to: uploads/
// ==============================

const wallpaperStorage = multer.diskStorage({

    destination: (
        _req,
        _file,
        cb
    ) => {

        const uploadPath =
            path.join(
                process.cwd(),
                "uploads"
            );

        ensureDir(uploadPath);

        cb(
            null,
            uploadPath
        );

    },


    filename: (
        _req,
        file,
        cb
    ) => {

        const uniqueName =
            Date.now()
            + "-"
            + Math.round(Math.random() * 1e9)
            + path.extname(file.originalname);

        cb(
            null,
            uniqueName
        );

    }

});


// ==============================
// CATEGORY THUMBNAIL STORAGE
// Used for category thumbnail upload
// Saves to: uploads/thumbnails/
// ==============================

const categoryThumbnailStorage = multer.diskStorage({

    destination: (
        _req,
        _file,
        cb
    ) => {

        const uploadPath =
            path.join(
                process.cwd(),
                "uploads",
                "thumbnails"
            );

        ensureDir(uploadPath);

        cb(
            null,
            uploadPath
        );

    },


    filename: (
        _req,
        file,
        cb
    ) => {

        const uniqueName =
            "category-"
            + Date.now()
            + "-"
            + Math.round(Math.random() * 1e9)
            + path.extname(file.originalname);

        cb(
            null,
            uniqueName
        );

    }

});


// ==============================
// WALLPAPER UPLOAD
// Existing export - do not remove
// ==============================

export const upload =
    multer({

        storage:
            wallpaperStorage,

        limits: {
            fileSize:
                10 * 1024 * 1024
        },

        fileFilter:
            imageFileFilter

    });


// ==============================
// CATEGORY THUMBNAIL UPLOAD
// New export for category image
// ==============================

export const categoryThumbnailUpload =
    multer({

        storage:
            categoryThumbnailStorage,

        limits: {
            fileSize:
                5 * 1024 * 1024
        },

        fileFilter:
            imageFileFilter

    });