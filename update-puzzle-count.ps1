$root = $PSScriptRoot
$puzzles = 0; $pages = 0
Get-ChildItem $root -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch '\\\.git\\' } | ForEach-Object {
  $n = [regex]::Matches([IO.File]::ReadAllText($_.FullName), 'class="[^"]*\brecord-card\b[^"]*"').Count
  if ($n -gt 0) { $puzzles += $n; $pages++ }
}
$inv = [Globalization.CultureInfo]::InvariantCulture
$count = $puzzles.ToString('N0', $inv)
$line = [string]::Format($inv, '{0} puzzles live in this collection &middot; {1} chapters', $count, $pages)
$index = Join-Path $root 'index.html'
$bytes = [IO.File]::ReadAllBytes($index)
$bom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
$html = [IO.File]::ReadAllText($index)
$new = [regex]::Replace($html, '(<p class="puzzle-count-line"[^>]*>)[^<]*(</p>)', { param($m) $m.Groups[1].Value + $line + $m.Groups[2].Value })
$new = [regex]::Replace($new, '(<(strong|b)\b[^>]*data-puzzle-range="([^"]*)"[^>]*>)[^<]*(</\2>)', { param($m) $m.Groups[1].Value + $m.Groups[3].Value + '&ndash;' + $count + $m.Groups[4].Value })
if ($new -ne $html) { [IO.File]::WriteAllText($index, $new, (New-Object Text.UTF8Encoding $bom)) }
Write-Output "$puzzles puzzles on $pages pages"
