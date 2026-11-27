param(
  [Parameter(Mandatory = $true)]
  [string] $RepositoryRoot,
  [Parameter(Mandatory = $true)]
  [string] $OutputPath
)

$RepositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$relativePaths = @(
  'dist',
  'src/renderer/diagramBrowserRuntime.ts',
  'desktop-app/dist',
  'desktop-app/artifacts',
  'desktop-app/test-results',
  'package.json',
  'bun.lock',
  'desktop-app/package.json',
  'planning/sprints/0121-v20-transpiler-contract-feasibility-gate/artifacts',
  'planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts',
  'planning/sprints/0123-v20-core-document-ast-emitter/artifacts',
  'planning/sprints/0124-v20-module-graph-and-cli/artifacts',
  'planning/sprints/0125-v20-desktop-export-and-documentation/artifacts'
)

$rows = foreach ($relativePath in $relativePaths) {
  $fullPath = Join-Path $RepositoryRoot $relativePath
  if (-not (Test-Path -LiteralPath $fullPath)) { continue }

  if (Test-Path -LiteralPath $fullPath -PathType Container) {
    Get-ChildItem -LiteralPath $fullPath -File -Recurse | ForEach-Object {
      [pscustomobject]@{
        Path = $_.FullName.Substring($RepositoryRoot.Length + 1)
        Bytes = $_.Length
        SHA256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
      }
    }
  } else {
    $item = Get-Item -LiteralPath $fullPath
    [pscustomobject]@{
      Path = $item.FullName.Substring($RepositoryRoot.Length + 1)
      Bytes = $item.Length
      SHA256 = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash
    }
  }
}

$sortedRows = @($rows | Sort-Object Path)
$sortedRows | Export-Csv -LiteralPath $OutputPath -NoTypeInformation -Encoding UTF8
$manifestHash = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash
$totalBytes = ($sortedRows | Measure-Object -Property Bytes -Sum).Sum
Write-Output "Files: $($sortedRows.Count)"
Write-Output "Bytes: $totalBytes"
Write-Output "Manifest SHA256: $manifestHash"