'use client';

import useSWR from 'swr';
import { getSupabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export interface ElectionParty {
  party_id: number;
  party_name: string;
  party_shortname: string;
  color_code: string | null;
  administration_id: number | null;
  note: string | null;
}

export interface Election {
  id: number;
  election_date: string;
  label: string;
  session_id: number | null;
  parties: ElectionParty[];
}

// ---------------------------------------------------------------------------
// フェッチャー
// ---------------------------------------------------------------------------

async function fetchElections(): Promise<Election[]> {
  const supabase = getSupabase();

  // elections を新しい順に取得
  const { data: elections, error: elErr } = await supabase
    .from('elections')
    .select('id, election_date, label, session_id')
    .order('election_date', { ascending: false });

  if (elErr) throw elErr;
  if (!elections || elections.length === 0) return [];

  // election_parties + parties を JOIN 取得
  const { data: entries, error: epErr } = await supabase
    .from('election_parties')
    .select(`
      election_id,
      party_id,
      administration_id,
      note,
      parties (
        name,
        shortname,
        color_code
      )
    `);

  if (epErr) throw epErr;

  // election_id ごとにグルーピング
  const partyMap = new Map<number, ElectionParty[]>();
  for (const entry of entries ?? []) {
    const party = entry.parties as unknown as {
      name: string;
      shortname: string;
      color_code: string | null;
    };

    const ep: ElectionParty = {
      party_id: entry.party_id,
      party_name: party.name,
      party_shortname: party.shortname,
      color_code: party.color_code,
      administration_id: entry.administration_id,
      note: entry.note,
    };

    const list = partyMap.get(entry.election_id) ?? [];
    list.push(ep);
    partyMap.set(entry.election_id, list);
  }

  return elections.map((e) => ({
    id: e.id,
    election_date: e.election_date,
    label: e.label,
    session_id: e.session_id,
    parties: partyMap.get(e.id) ?? [],
  }));
}

// ---------------------------------------------------------------------------
// フック
// ---------------------------------------------------------------------------

export function useElections() {
  const { data, error, isLoading } = useSWR<Election[]>(
    'elections',
    fetchElections,
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );

  return {
    elections: data ?? [],
    isLoading,
    isError: Boolean(error),
  };
}