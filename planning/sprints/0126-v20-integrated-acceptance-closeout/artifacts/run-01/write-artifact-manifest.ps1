$root = $PSScriptRoot
$manifestPath = Join-Path $root 'artifact-manifest.csv'
$files = @(Get-ChildItem -LiteralPath $root -File -Recurse |
  Where-Object { $_.FullName -ne $manifestPath } |
  Sort-Object FullName)
$rows = foreach ($file in $files) {
  [pscustomobject]@{
    Path = $file.FullName.Substring($root.Length + 1)
    Bytes = $file.Length
    SHA256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
  }
}
$rows | Export-Csv -LiteralPath $manifestPath -NoTypeInformation -Encoding UTF8
$totalBytes = ($rows | Measure-Object -Property Bytes -Sum).Sum
$manifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash
Write-Output "Files: $($files.Count)"
Write-Output "Bytes: $totalBytes"
Write-Output "Manifest SHA256: $manifestHash"