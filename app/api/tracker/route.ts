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
import { getSupabase } from '@/lib/supabase';

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
// Supabase クライアント
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<FinalStatus, number> = {
  regressive: 1,
  achieved: 2,
  in_progress: 3,
  partial: 4,
  unstarted: 5,
};
// ---------------------------------------------------------------------------
// GET ハンドラ
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const supabase = getSupabase()
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

  try {
    // ── メインクエリ ──────────────────────────────────────
    let query = supabase
      .from("pledge_tracker")
      .select(
        `pledge_id, pledge_text, party_id, category, final_status,
         best_score, best_bill_id, all_bill_ids, achieved_elements,
         missing_elements, reasoning, needs_review, review_reason, updated_at, sources`,
        { count: "exact" }
      )
      .range(offset, offset + limit - 1);

    if (administration !== undefined) {
      query = query.eq("administration_id", administration);
    }
    if (party_id !== undefined) {
      query = query.eq("party_id", party_id);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (statusFilter && statusFilter.length > 0) {
      query = query.in("final_status", statusFilter);
    }
    if (needs_review !== undefined) {
      query = query.eq("needs_review", needs_review);
    }

    // Supabase JS では CASE 式の ORDER BY は使えないので、
    // best_score の降順だけ DB 側で行い、status 順はクライアントでソート
    query = query.order("best_score", { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    // ── クライアント側でステータス順ソート ────────────────
    const sorted = (data ?? []).sort((a, b) => {
      const sa = STATUS_ORDER[a.final_status as FinalStatus] ?? 99;
      const sb = STATUS_ORDER[b.final_status as FinalStatus] ?? 99;
      if (sa !== sb) return sa - sb;
      return (b.best_score ?? 0) - (a.best_score ?? 0);
    });

    const items: PledgeTrackerItem[] = sorted.map((row) => ({
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
      updated_at: row.updated_at ?? "",
      sources: row.sources ?? [],
    }));

    // ── サマリークエリ（status/needs_review フィルタ除外）──
    let summaryQuery = supabase
      .from("pledge_tracker")
      .select("final_status, needs_review");

    if (administration !== undefined) {
      summaryQuery = summaryQuery.eq("administration_id", administration);
    }
    if (party_id !== undefined) {
      summaryQuery = summaryQuery.eq("party_id", party_id);
    }
    if (category) {
      summaryQuery = summaryQuery.eq("category", category);
    }

    const { data: summaryData, error: summaryError } = await summaryQuery;
    if (summaryError) throw summaryError;

    const summary: StatusSummary = {
      achieved: 0,
      in_progress: 0,
      partial: 0,
      regressive: 0,
      unstarted: 0,
      needs_review: 0,
    };

    for (const row of summaryData ?? []) {
      const fs = row.final_status as FinalStatus;
      if (fs in summary) summary[fs]++;
      if (row.needs_review) summary.needs_review++;
    }

    // ── レスポンス ────────────────────────────────────────
    const response: PledgeTrackerResponse = {
      items,
      total: count ?? 0,
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
    console.error("[/api/tracker] Supabase error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
