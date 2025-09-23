import { useEffect, useMemo, useState } from 'react';

type RegionRow = { province: string; city: string };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') inQuotes = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsvSimple(text: string): RegionRow[] {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map(s => s.trim().toLowerCase());
  const pi = header.indexOf('province');
  const ci = header.indexOf('city');

  const rows: RegionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]).map(s => s.trim());
    const province = (cols[pi] ?? '').trim();
    const city = (cols[ci] ?? '').trim();
    if (province) rows.push({ province, city });
  }
  return rows;
}

export default function useRegionsCsv(url = '/regions.csv') {
  const [rows, setRows] = useState<RegionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(url);
        const text = await res.text();
        const parsed = parseCsvSimple(text);
        if (!ignore) setRows(parsed);
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'CSV 로드 실패');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [url]);

  const provinces = useMemo(() => {
    const set = new Set(rows.map(r => r.province).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const citiesByProvince = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of rows) {
      if (!r.province) continue;
      if (!map[r.province]) map[r.province] = [];
      if (r.city) map[r.province].push(r.city);
    }
    for (const p of Object.keys(map)) {
      map[p] = Array.from(new Set(map[p])).sort();
    }
    return map;
  }, [rows]);

  return { provinces, citiesByProvince, loading, error };
}
