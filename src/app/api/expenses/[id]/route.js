import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

async function getUserIdFromToken(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    return null;
  }
}

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Updates an existing expense
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the expense to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               isCredit:
 *                 type: boolean
 *               tag:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PUT(req, { params }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const { title, description, amount, isCredit, tag, date } = await req.json();

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!expense || expense.authorId !== userId) {
      return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        amount,
        isCredit,
        tag,
        date: new Date(date),
      },
    });

    return NextResponse.json({ expense: updatedExpense }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Deletes an expense
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the expense to delete
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
    });

    if (!expense || expense.authorId !== userId) {
      return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Expense deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
