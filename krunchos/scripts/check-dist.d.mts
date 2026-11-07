export interface DistFile {
  path: string;
  bytes: number;
  gzipBytes: number;
  sha256: string;
}
export interface DistTotals {
  files: number;
  bytes: number;
  jsBytes: number;
  jsGzipBytes: number;
  cssBytes: number;
  cssGzipBytes: number;
}
export interface DistReport {
  problems: string[];
  files: DistFile[];
  totals: DistTotals | null;
}
export function checkDist(dir: string): DistReport;
