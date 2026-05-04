import useSWR from "swr";
import type {
  PledgeTrackerResponse,
  FinalStatus,
} from "@/app/api/tracker/route";

export interface TrackerFilter {
  administration?: number;
  party_id?: number;          // 数値に統一
  category?: string;
  status?: FinalStatus[];
  needs_review?: boolean;
  page?: number;
  limit?: number;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<PledgeTrackerResponse>;
  });

function buildUrl(filter: TrackerFilter): string {
  const params = new URLSearchParams();

  if (filter.administration !== undefined)
    params.set("administration", String(filter.administration));
  if (filter.party_id !== undefined)
    params.set("party_id", String(filter.party_id));
  if (filter.category) params.set("category", filter.category);
  if (filter.status?.length) params.set("status", filter.status.join(","));
  if (filter.needs_review !== undefined)
    params.set("needs_review", String(filter.needs_review));

  params.set("page", String(filter.page ?? 1));
  params.set("limit", String(filter.limit ?? 20));

  return `/api/tracker?${params.toString()}`;
}

export function useTracker(filter: TrackerFilter | null) {
  const url = filter ? buildUrl(filter) : null;

  const { data, error, isLoading, mutate } = useSWR<PledgeTrackerResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  return { data, isLoading, isError: Boolean(error), mutate };
}