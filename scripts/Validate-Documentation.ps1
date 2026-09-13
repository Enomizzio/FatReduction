# Controllo documentale indipendente dalle dipendenze applicative.
# Compatibile con Windows PowerShell 5.1; non scrive file o dati.
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$rootPrefix = $projectRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$problems = New-Object 'System.Collections.Generic.List[string]'
$strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
$requiredFiles = @(
    'AGENTS.md', 'README.md', 'FATAREDUCTION_codex_bootstrap.md',
    '.gitignore', '.gitattributes',
    'docs/INDEX.md', 'docs/PRODUCT.md', 'docs/ARCHITECTURE.md',
    'docs/DATA_MODEL.md', 'docs/FRONTEND.md', 'docs/API.md',
    'docs/TESTING.md', 'docs/SECURITY.md', 'docs/DECISIONS.md',
    'docs/PROJECT_STATUS.md', 'docs/gates/GATE_TEMPLATE.md',
    'docs/gates/GATE_00_BOOTSTRAP.md', 'docs/gates/GATE_01_FOUNDATION.md',
    'docs/gates/GATE_02_NUTRITION.md', 'docs/gates/GATE_03_MENU.md',
    'docs/gates/GATE_04_DIARY.md', 'docs/gates/GATE_05_DASHBOARD.md',
    'docs/gates/GATE_06_RELEASE.md', 'src/README.md', 'tests/README.md',
    'scripts/Validate-Documentation.ps1'
)

foreach ($relativePath in $requiredFiles) {
    $absolutePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $absolutePath -PathType Leaf)) {
        $problems.Add("File obbligatorio assente: $relativePath")
        continue
    }
    try {
        $contents = $strictUtf8.GetString([System.IO.File]::ReadAllBytes($absolutePath))
        if ([string]::IsNullOrWhiteSpace($contents)) {
            $problems.Add("File vuoto: $relativePath")
        }
    }
    catch {
        $problems.Add("File non leggibile in UTF-8: $relativePath")
    }
}

$markdownFiles = @()
foreach ($relativePath in $requiredFiles) {
    if ($relativePath.EndsWith('.md')) {
        $absolutePath = Join-Path $projectRoot $relativePath
        if (Test-Path -LiteralPath $absolutePath -PathType Leaf) {
            $markdownFiles += Get-Item -LiteralPath $absolutePath
        }
    }
}
$gateStates = @{}
$gateSections = @('Status', 'Objective', 'Context', 'Scope', 'Out of Scope',
    'Requirements', 'Technical Constraints', 'Relevant Documentation',
    'Acceptance Criteria', 'Validation', 'Gate Result', 'Completion Information', 'Notes')

foreach ($markdownFile in $markdownFiles) {
    try {
        $contents = $strictUtf8.GetString([System.IO.File]::ReadAllBytes($markdownFile.FullName))
    }
    catch { continue }
    foreach ($link in [regex]::Matches($contents, '\[[^\]]+\]\((?<target>[^)]+)\)')) {
        $target = $link.Groups['target'].Value.Trim().Trim('<', '>')
        if ($target -match '^(https?://|mailto:|#)') { continue }
        $targetPath = [Uri]::UnescapeDataString(($target -split '#', 2)[0])
        try {
            $resolvedPath = [System.IO.Path]::GetFullPath((Join-Path $markdownFile.DirectoryName $targetPath))
            if (-not $resolvedPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                $problems.Add("Link fuori progetto in $($markdownFile.Name): $target")
            }
            elseif (-not (Test-Path -LiteralPath $resolvedPath)) {
                $problems.Add("Link locale inesistente in $($markdownFile.Name): $target")
            }
        }
        catch {
            $problems.Add("Link locale non valido in $($markdownFile.Name): $target")
        }
    }

    if ($markdownFile.Directory.Name -ne 'gates') { continue }
    foreach ($section in $gateSections) {
        if ($contents -notmatch ('(?m)^## ' + [regex]::Escape($section) + '\s*$')) {
            $problems.Add("Sezione $section assente in $($markdownFile.Name)")
        }
    }
    $stateMatch = [regex]::Match($contents, '(?m)^## Status\r?\n\s*\r?\n(?<state>NOT STARTED|IN PROGRESS|BLOCKED|COMPLETED)\s*$')
    $resultMatch = [regex]::Match($contents, '(?m)^## Gate Result\r?\n\s*\r?\n`(?<result>PASS|FAIL|BLOCKED|NOT EVALUATED)`\s*$')
    if (-not $stateMatch.Success -or -not $resultMatch.Success) {
        $problems.Add("Stato o risultato non valido in $($markdownFile.Name)")
        continue
    }
    $gateState = $stateMatch.Groups['state'].Value
    $gateResult = $resultMatch.Groups['result'].Value
    $gateStates[$markdownFile.FullName] = $gateState
    if (($gateState -eq 'COMPLETED') -ne ($gateResult -eq 'PASS')) {
        $problems.Add("COMPLETED/PASS discordanti in $($markdownFile.Name)")
    }
    if ($gateResult -eq 'FAIL' -and $gateState -ne 'IN PROGRESS') {
        $problems.Add("FAIL richiede IN PROGRESS in $($markdownFile.Name)")
    }
    if (($gateState -eq 'BLOCKED') -ne ($gateResult -eq 'BLOCKED')) {
        $problems.Add("BLOCKED discordante in $($markdownFile.Name)")
    }
    if ($gateState -eq 'NOT STARTED' -and $gateResult -ne 'NOT EVALUATED') {
        $problems.Add("Gate non iniziato con risultato valutato in $($markdownFile.Name)")
    }
    if ($gateState -eq 'COMPLETED' -and $contents -match '(?m)^- \[ \]') {
        $problems.Add("Checklist incompleta nel Gate completato $($markdownFile.Name)")
    }
}

$statusPath = Join-Path $projectRoot 'docs/PROJECT_STATUS.md'
if (Test-Path -LiteralPath $statusPath -PathType Leaf) {
    $statusContents = Get-Content -LiteralPath $statusPath -Raw -Encoding UTF8
    $currentMatch = [regex]::Match($statusContents, '(?m)^Gate: \[[^\]]+\]\((?<target>[^)]+)\)\s*$')
    $currentStateMatch = [regex]::Match($statusContents, '(?m)^Status: (?<state>NOT STARTED|IN PROGRESS|BLOCKED|COMPLETED)\s*$')
    if (-not $currentMatch.Success -or -not $currentStateMatch.Success) {
        $problems.Add('Current Gate o Status non riconoscibile in PROJECT_STATUS')
    }
    else {
        $currentPath = [System.IO.Path]::GetFullPath((Join-Path (Split-Path $statusPath -Parent) $currentMatch.Groups['target'].Value))
        if (-not $gateStates.ContainsKey($currentPath)) {
            $problems.Add('Il Gate corrente non corrisponde a una specifica valida')
        }
        elseif ($gateStates[$currentPath] -ne $currentStateMatch.Groups['state'].Value) {
            $problems.Add('Lo stato del Gate corrente discordante con PROJECT_STATUS')
        }
    }
    foreach ($section in @('Current Gate', 'Completed Gates', 'Current System State',
        'Known Issues', 'Current Blockers', 'Next Objective', 'Relevant Documents')) {
        if ($statusContents -notmatch ('(?m)^## ' + [regex]::Escape($section) + '\s*$')) {
            $problems.Add("Sezione $section assente in PROJECT_STATUS")
        }
    }
    foreach ($gatePath in $gateStates.Keys) {
        if ([System.IO.Path]::GetFileName($gatePath) -notmatch '^GATE_(\d{2})_') { continue }
        $gateNumber = $Matches[1]
        $completedMark = [regex]::Match($statusContents, ('(?m)^- \[(?<mark>[ x])\] GATE ' + $gateNumber + ' '))
        if (-not $completedMark.Success) {
            $problems.Add("GATE $gateNumber assente nell'elenco dello stato")
        }
        elseif (($completedMark.Groups['mark'].Value -eq 'x') -ne ($gateStates[$gatePath] -eq 'COMPLETED')) {
            $problems.Add("Checklist dello stato discordante per GATE $gateNumber")
        }
    }
}

if ($problems.Count -gt 0) {
    foreach ($problem in $problems) { Write-Output "FAIL: $problem" }
    exit 1
}
Write-Output "PASS: $($requiredFiles.Count) file obbligatori, UTF-8, link locali, specifiche Gate e stato coerenti."
exit 0
