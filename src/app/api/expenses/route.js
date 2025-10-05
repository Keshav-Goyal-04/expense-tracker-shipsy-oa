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

export async function GET(req) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [expenses, totalExpenses] = await prisma.$transaction([
      prisma.expense.findMany({
        where: {
          authorId: userId,
        },
        orderBy: [
          {
            date: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        skip,
        take,
      }),
      prisma.expense.count({
        where: {
          authorId: userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalExpenses / pageSize);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        pageSize,
        totalExpenses,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
