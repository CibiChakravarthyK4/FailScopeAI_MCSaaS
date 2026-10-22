/** For individual file sizes (e.g. the import wizard's file list) - includes a
 * KB tier, since uploaded files are often small. SettingsPage.tsx has its own
 * separate formatBytes for storage *totals*, which skips straight to MB/GB -
 * deliberately not shared, since totals are rarely worth showing in KB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
