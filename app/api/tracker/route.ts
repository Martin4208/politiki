/**
 * app/api/tracker/route.ts
 *
 * GET /api/tracker
 *   ?administration=104
 *   &party_id=1
 *   &category=economy
 *   &status=achieved,in_progress
 *   &needs_review=true
 *   &page=1&limit=20
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export type FinalStatus =
  | "achieved"
  | "in_progress"
  | "partial"
  | "regressive"
  | "unstarted";

export interface PledgeTrackerItem {
  pledge_id: number;
  pledge_text: string;
  party_id: number;
  category: string;
  final_status: FinalStatus;
  best_score: number;
  best_bill_id: string | null;
  all_bill_ids: string[];
  achieved_elements: string[];
  missing_elements: string[];
  reasoning: string;
  needs_review: boolean;
  review_reason: string | null;
  updated_at: string;
  sources?: { label: string; url: string }[];
}

export interface PledgeTrackerResponse {
  items: PledgeTrackerItem[];
  total: number;
  page: number;
  limit: number;
  summary: StatusSummary;
}

export interface StatusSummary {
  achieved: number;
  in_progress: number;
  partial: number;
  regressive: number;
  unstarted: number;
  needs_review: number;
}

// ---------------------------------------------------------------------------
// DB接続
// ---------------------------------------------------------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

// ---------------------------------------------------------------------------
// GET ハンドラ
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // --- パラメータのパース ---
  const administration = searchParams.get("administration")
    ? Number(searchParams.get("administration"))
    : undefined;
  const party_id = searchParams.get("party_id")
    ? Number(searchParams.get("party_id"))
    : undefined;
  const category = searchParams.get("category") ?? undefined;
  const statusRaw = searchParams.get("status");
  const needs_review =
    searchParams.get("needs_review") === "true" ? true : undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
  );
  const offset = (page - 1) * limit;

  const statusFilter: FinalStatus[] | undefined = statusRaw
    ? (statusRaw.split(",") as FinalStatus[])
    : undefined;

  const client = await pool.connect();

  try {
    // ── WHERE句を動的に構築 ─────────────────────────────────
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (administration !== undefined) {
      conditions.push(`pt.administration_id = $${paramIdx++}`);
      params.push(administration);
    }
    if (party_id !== undefined) {
      conditions.push(`pt.party_id = $${paramIdx++}`);
      params.push(party_id);
    }
    if (category) {
      conditions.push(`pt.category = $${paramIdx++}`);
      params.push(category);
    }
    if (statusFilter && statusFilter.length > 0) {
      conditions.push(`pt.final_status = ANY($${paramIdx++}::text[])`);
      params.push(statusFilter);
    }
    if (needs_review !== undefined) {
      conditions.push(`pt.needs_review = $${paramIdx++}`);
      params.push(needs_review);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // ── メインクエリ ────────────────────────────────────────
    const dataQuery = `
      SELECT
        pt.pledge_id,
        pt.pledge_text,
        pt.party_id,
        pt.category,
        pt.final_status,
        pt.best_score,
        pt.best_bill_id,
        pt.all_bill_ids,
        pt.achieved_elements,
        pt.missing_elements,
        pt.reasoning,
        pt.needs_review,
        pt.review_reason,
        pt.updated_at
      FROM pledge_tracker pt
      ${where}
      ORDER BY
        CASE pt.final_status
          WHEN 'regressive'  THEN 1
          WHEN 'achieved'    THEN 2
          WHEN 'in_progress' THEN 3
          WHEN 'partial'     THEN 4
          WHEN 'unstarted'   THEN 5
        END,
        pt.best_score DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    params.push(limit, offset);

    // ── カウントクエリ ──────────────────────────────────────
    const countQuery = `
      SELECT COUNT(*) AS total FROM pledge_tracker pt ${where}
    `;
    const countParams = params.slice(0, params.length - 2);

    // ── サマリークエリ（status / needs_review フィルタを除外）───
    const summaryConditions: string[] = [];
    const summaryParams: unknown[] = [];
    let sIdx = 1;

    if (administration !== undefined) {
      summaryConditions.push(`pt.administration_id = $${sIdx++}`);
      summaryParams.push(administration);
    }
    if (party_id !== undefined) {
      summaryConditions.push(`pt.party_id = $${sIdx++}`);
      summaryParams.push(party_id);
    }
    if (category) {
      summaryConditions.push(`pt.category = $${sIdx++}`);
      summaryParams.push(category);
    }

    const summaryWhere =
      summaryConditions.length > 0
        ? `WHERE ${summaryConditions.join(" AND ")}`
        : "";

    const summaryQuery = `
      SELECT
        COUNT(*) FILTER (WHERE pt.final_status = 'achieved')    AS achieved,
        COUNT(*) FILTER (WHERE pt.final_status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE pt.final_status = 'partial')     AS partial,
        COUNT(*) FILTER (WHERE pt.final_status = 'regressive')  AS regressive,
        COUNT(*) FILTER (WHERE pt.final_status = 'unstarted')   AS unstarted,
        COUNT(*) FILTER (WHERE pt.needs_review = TRUE)          AS needs_review
      FROM pledge_tracker pt
      ${summaryWhere}
    `;

    // ── 並列実行 ────────────────────────────────────────────
    const [dataResult, countResult, summaryResult] = await Promise.all([
      client.query(dataQuery, params),
      client.query(countQuery, countParams),
      client.query(summaryQuery, summaryParams),
    ]);

    // ── レスポンス整形 ──────────────────────────────────────
    const items: PledgeTrackerItem[] = dataResult.rows.map((row) => ({
      pledge_id: Number(row.pledge_id),
      pledge_text: row.pledge_text,
      party_id: Number(row.party_id),
      category: row.category,
      final_status: row.final_status as FinalStatus,
      best_score: Number(row.best_score),
      best_bill_id: row.best_bill_id ?? null,
      all_bill_ids: row.all_bill_ids ?? [],
      achieved_elements: row.achieved_elements ?? [],
      missing_elements: row.missing_elements ?? [],
      reasoning: row.reasoning ?? "",
      needs_review: Boolean(row.needs_review),
      review_reason: row.review_reason ?? null,
      updated_at: row.updated_at?.toISOString() ?? "",
    }));

    const s = summaryResult.rows[0];
    const summary: StatusSummary = {
      achieved: Number(s.achieved),
      in_progress: Number(s.in_progress),
      partial: Number(s.partial),
      regressive: Number(s.regressive),
      unstarted: Number(s.unstarted),
      needs_review: Number(s.needs_review),
    };

    const response: PledgeTrackerResponse = {
      items,
      total: Number(countResult.rows[0].total),
      page,
      limit,
      summary,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[/api/tracker] DB error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}