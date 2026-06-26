import type { User } from '@prisma/client';

import prisma from '../config/prisma';

import { ApiError } from '../utils/ApiError';

import {
  comparePassword,
} from '../utils/password';

import { hashPassword } from '../utils/password';

import { signToken } from '../utils/jwt';

import { OAuth2Client } from "google-auth-library";


const googleClient =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );

/**
 * Remove sensitive fields
 */
const sanitize = (user: User) => {

  const safe = { ...user } as Partial<User>;

  delete safe.passwordHash;

  return safe;

};



export const authService = {


  async login(

    input: {
      email: string;
      password: string;
    },

    ip?: string,

    userAgent?: string

  ) {



    const user =
      await prisma.user.findUnique({

        where: {

          email: input.email

        },

        include: {

          role: true

        }

      });



    if (!user) {

      throw ApiError.unauthorized(
        'Invalid email or password'
      );

    }




    if (
      !user.passwordHash ||
      user.authProvider !== "LOCAL"
    ) {

      throw ApiError.unauthorized(
        "Use Google login"
      );

    }



    const valid =
      await comparePassword(

        input.password,

        user.passwordHash

      );



    if (!valid) {

      throw ApiError.unauthorized(
        'Invalid email or password'
      );

    }




    const token =
      signToken({

        sub: user.id,

        email: user.email

      });



    /**
     * save login history
     */
    await prisma.userSession.create({

      data: {

        userId: user.id,

        token,

        ipAddress: ip,

        userAgent

      }

    });




    return {

      user: sanitize(user),

      token

    };


  },


  async logout(token: string) {

    const session =
      await prisma.userSession.findUnique({

        where: {

          token

        }

      });




    if (!session) {

      throw ApiError.unauthorized(
        'Invalid session'
      );

    }




    await prisma.userSession.update({

      where: {

        token

      },


      data: {

        isActive: false,

        logoutAt: new Date()

      }

    });



    return {

      success: true

    };


  },


  async register(
    input: {
      email: string;
      username: string;
      password: string;
    },

    ip?: string,

    userAgent?: string
  ) {


    const existing =
      await prisma.user.findUnique({

        where: {
          email: input.email
        }

      });



    if (existing) {

      throw ApiError.conflict(
        "An account with this email already exists"
      );

    }





    /**
     * Get default USER role
     */
    const userRole =
      await prisma.role.findUnique({

        where: {
          name: "USER"
        }

      });




    if (!userRole) {

      throw ApiError.internal(
        "Default USER role missing"
      );

    }





    /**
     * Create User
     */
    const user =
      await prisma.user.create({

        data: {


          email: input.email,


          username: input.username,


          passwordHash:
            await hashPassword(
              input.password
            ),



          /**
           * defaults
           */
          roleId: userRole.id,


          bio:
            "Hey there 👋 I am using FlexiWalls",



          avatarUrl:
            "https://api.dicebear.com/9.x/avataaars/svg?seed=" +
            encodeURIComponent(
              input.username
            ),



          isPremium: false,


          dailyDownloadCount: 0


        },


        include: {

          role: true

        }


      });





    /**
     * Generate JWT
     */
    const token =
      signToken({

        sub: user.id,

        email: user.email

      });






    /**
     * Save Login Session
     */
    await prisma.userSession.create({

      data: {


        userId: user.id,


        token,


        ipAddress: ip,


        userAgent


      }

    });






    return {


      token,


      user: {


        id: user.id,


        email: user.email,


        username: user.username,


        avatarUrl: user.avatarUrl,


        bio: user.bio,


        isPremium: user.isPremium,


        premiumUntil: user.premiumUntil,


        dailyDownloadCount:
          user.dailyDownloadCount,


        role: user.role,


        createdAt: user.createdAt


      }


    };


  }

  ,


  async googleLogin(

    idToken: string,

    ip?: string,

    userAgent?: string

  ) {


    if (!idToken) {

      throw ApiError.badRequest(
        "Google token missing"
      );

    }

    console.log("Verifying Google Token...");


    const ticket =
      await googleClient.verifyIdToken({

        idToken,

        audience:
          process.env.GOOGLE_CLIENT_ID

      });



    const payload =
      ticket.getPayload();

    console.log(payload);


    if (
      !payload ||
      !payload.email
    ) {

      throw ApiError.unauthorized(
        "Invalid Google account"
      );

    }




    const googleId =
      payload.sub;


    const email =
      payload.email;


    const username =
      payload.name ??
      email.split("@")[0];


    const avatar =
      payload.picture;







    let user =
      await prisma.user.findFirst({

        where: {

          OR: [

            {
              googleId
            },


            {
              email
            }

          ]

        },


        include: {

          role: true

        }

      });








    if (!user) {



      const userRole =
        await prisma.role.findUnique({

          where: {

            name: "USER"

          }

        });




      if (!userRole) {

        throw ApiError.internal(
          "Default USER role missing"
        );

      }






      user =
        await prisma.user.create({

          data: {

            email,


            username,


            googleId,


            avatarUrl: avatar,


            authProvider: "GOOGLE",


            roleId: userRole.id,


            bio:
              "Hey there 👋 I am using FlexiWalls",


            isPremium: false,

          },


          include: {

            role: true

          }


        });



    }









    else if (!user.googleId) {


      user =
        await prisma.user.update({

          where: {

            id: user.id

          },


          data: {


            googleId,


            authProvider: "GOOGLE",


            avatarUrl:
              avatar ?? user.avatarUrl

          },


          include: {

            role: true

          }


        });


    }









    const token =
      signToken({

        sub: user.id,

        email: user.email

      });








    await prisma.userSession.create({

      data: {

        userId: user.id,


        token,


        ipAddress: ip,


        userAgent

      }

    });








    return {


      token,


      user: {


        id: user.id,


        email: user.email,


        username: user.username,


        avatarUrl: user.avatarUrl,


        bio: user.bio,


        isPremium: user.isPremium,


        premiumUntil: user.premiumUntil,


        dailyDownloadCount:
          user.dailyDownloadCount,


        role: user.role,


        createdAt: user.createdAt


      }


    };


  }


};