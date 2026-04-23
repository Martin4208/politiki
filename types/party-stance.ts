type PartyStance = {
    stance: 1 | 2 | 3 | 4 | 5 | null
    source: 'manifesto' | 'statement' | null
    sourceURL: string
    sourcePage: string
    note: string
}

export type StanceData = Record<string, Record<string, PartyStance>>