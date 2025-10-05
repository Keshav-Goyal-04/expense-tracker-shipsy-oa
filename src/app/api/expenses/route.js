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
 * /api/expenses:
 *   get:
 *     summary: Retrieves a paginated list of expenses with optional filters
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: The number of expenses to retrieve per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: A search term to filter expenses by title or description
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: A comma-separated list of tags to filter expenses by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date of the date range to filter expenses by
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date of the date range to filter expenses by
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: The minimum amount to filter expenses by
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: The maximum amount to filter expenses by
 *       - in: query
 *         name: isCredit
 *         schema:
 *           type: string
 *         description: Filter by credit or debit
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: The field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: The sort order (asc or desc)
 *     responses:
 *       200:
 *         description: A list of expenses
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const isCredit = searchParams.get('isCredit');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = {
      authorId: userId,
      AND: [
        search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},
        tags ? { tag: { in: tags } } : {},
        startDate ? { date: { gte: new Date(startDate) } } : {},
        endDate ? { date: { lte: new Date(endDate) } } : {},
        minAmount ? { amount: { gte: parseFloat(minAmount) } } : {},
        maxAmount ? { amount: { lte: parseFloat(maxAmount) } } : {},
        isCredit !== null && isCredit !== 'all'
          ? { isCredit: isCredit === 'true' }
          : {},
      ],
    };

    const orderBy = [];
    if (sortBy) {
      orderBy.push({ [sortBy]: sortOrder });
    }
    orderBy.push({ createdAt: 'desc' });

    const [expenses, totalExpenses, totalAmountResult, tagDistribution] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.expense.count({
        where,
      }),
      prisma.expense.groupBy({
        by: ['isCredit'],
        where,
        _sum: {
          amount: true,
        },
      }),
      prisma.expense.groupBy({
        by: ['tag'],
        where: { ...where, isCredit: false }, // Only group debits for the pie chart
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalCredit = totalAmountResult.find(item => item.isCredit === true)?._sum.amount || 0;
    const totalDebit = totalAmountResult.find(item => item.isCredit === false)?._sum.amount || 0;
    const totalAmount = totalCredit - totalDebit;
    const totalIncome = totalCredit;
    const totalExpense = totalDebit;

    const totalPages = Math.ceil(totalExpenses / pageSize);

    const formattedTagDistribution = tagDistribution.map(item => ({ tag: item.tag, amount: item._sum.amount }));

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        pageSize,
        totalExpenses,
        totalPages,
      },
      totalAmount,
      totalIncome,
      totalExpense,
      tagDistribution: formattedTagDistribution,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Creates a new expense
 *     tags:
 *       - Expenses
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
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, amount, isCredit, tag, date } = await req.json();

    if (!title || !amount || !tag || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount,
        isCredit,
        tag,
        date: new Date(date),
        authorId: userId,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}