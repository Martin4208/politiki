'use client';

import useSWR from 'swr';
import { getSupabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export interface Administration {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  politician_id: number;
}

export interface Party {
  id: number;
  name: string;
  shortname: string;
  color_code: string | null;
}

export interface AdministrationData {
  administrations: Administration[];
  parties: Party[];
}

// ---------------------------------------------------------------------------
// フェッチャー
// ---------------------------------------------------------------------------

async function fetchAdministrationData(): Promise<AdministrationData> {
  const supabase = getSupabase();

  // pledge_tracker に実際にデータがある administration_id を取得
  const { data: trackerAdminIds, error: tErr } = await supabase
    .from('pledge_tracker')
    .select('administration_id')
    .not('administration_id', 'is', null);

  if (tErr) throw tErr;

  const uniqueAdminIds = [...new Set((trackerAdminIds ?? []).map((r) => r.administration_id))];

  if (uniqueAdminIds.length === 0) {
    return { administrations: [], parties: [] };
  }

  // administrations テーブルから該当する政権を取得
  const { data: admins, error: aErr } = await supabase
    .from('administrations')
    .select('id, name, start_date, end_date, politician_id')
    .in('id', uniqueAdminIds)
    .order('start_date', { ascending: false });

  if (aErr) throw aErr;

  // pledge_tracker に実際にデータがある party_id を取得
  const { data: trackerPartyIds, error: pErr } = await supabase
    .from('pledge_tracker')
    .select('party_id')
    .not('party_id', 'is', null);

  if (pErr) throw pErr;

  const uniquePartyIds = [...new Set((trackerPartyIds ?? []).map((r) => r.party_id))];

  // parties テーブルから取得
  let parties: Party[] = [];
  if (uniquePartyIds.length > 0) {
    const { data: partyData, error: partyErr } = await supabase
      .from('parties')
      .select('id, name, shortname, color_code')
      .in('id', uniquePartyIds)
      .order('id', { ascending: true });

    if (partyErr) throw partyErr;
    parties = (partyData ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      shortname: p.shortname,
      color_code: p.color_code,
    }));
  }

  return {
    administrations: (admins ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      start_date: a.start_date,
      end_date: a.end_date,
      politician_id: a.politician_id,
    })),
    parties,
  };
}

// ---------------------------------------------------------------------------
// フック
// ---------------------------------------------------------------------------

export function useAdministrations() {
  const { data, error, isLoading } = useSWR<AdministrationData>(
    'administration-data',
    fetchAdministrationData,
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );

  return {
    administrations: data?.administrations ?? [],
    parties: data?.parties ?? [],
    isLoading,
    isError: Boolean(error),
  };
}
