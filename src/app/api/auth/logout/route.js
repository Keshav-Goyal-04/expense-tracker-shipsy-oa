import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/** @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logs out a user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    cookies().set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1,
      path: '/',
    });

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
