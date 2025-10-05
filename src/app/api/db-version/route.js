import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    return NextResponse.json({ version: result.rows[0].version });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
