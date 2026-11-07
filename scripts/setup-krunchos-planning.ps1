#Requires -Version 5.1
<#
Adds existing KrunchOS issues to seven repository milestones and GitHub Project #9.
Uses the authenticated GitHub CLI. No repository pushes, merges, deployments,
DNS changes, or credential-file reads. Re-running will reuse existing milestones
and project items. Preview with -WhatIf.
#>
[CmdletBinding()]
param(
    [string]$Owner = 'krunchyMonkey',
    [string]$Repo = 'krunchymonkey-site',
    [int]$ProjectNumber = 9,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$fullRepo = "$Owner/$Repo"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI is required. Install gh, run gh auth login, then gh auth refresh -s project.'
}
& gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated. Run gh auth login.' }

function Invoke-Gh([string[]]$Arguments) {
    $output = & gh @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "gh $($Arguments -join ' ') failed. Fix authentication or permission errors and re-run."
    }
    return $output
}

function Get-GhJson([string[]]$Arguments) {
    $output = Invoke-Gh $Arguments
    return (($output | Out-String) | ConvertFrom-Json)
}

$phases = @(
    @{ title='KrunchOS v0.1 - Foundations'; field='v0.1 Foundations'; issues=@(14,15,16,17,48,49); description='Design, framework ADR, typed app registry, CI and pixel-first 8bitcn UI experiment' },
    @{ title='KrunchOS v0.2 - Desktop'; field='v0.2 Desktop'; issues=(18..22); description='Desktop shell, window manager, folders, dock and preferences' },
    @{ title='KrunchOS v0.3 - Mobile'; field='v0.3 Mobile'; issues=(23..26); description='Touch-first OS launcher, navigation and accessibility' },
    @{ title='KrunchOS v0.4 - Workbench'; field='v0.4 Workbench'; issues=(27..31); description='Projects, folders, journal, schematics and architecture stories' },
    @{ title='KrunchOS v0.5 - Demo Browser'; field='v0.5 Demos'; issues=@(32,33,34,35,46); description='Public demo windows, origin checks, optional first-party presentation bridge and mobile fallback' },
    @{ title='KrunchOS v1.0 - Public Launch'; field='v1.0 Launch'; issues=(36..40); description='Boot experience, polish, quality review and public release' },
    @{ title='KrunchOS v1.1 - Open Workshop'; field='v1.1 Community'; issues=(41..45); description='Licensing, contribution process, content validation, curated gallery' }
)

$milestones = @(Get-GhJson @('api',"repos/$fullRepo/milestones?state=all&per_page=100"))
$project = Get-GhJson @('project','view',[string]$ProjectNumber,'--owner',$Owner,'--format','json')
Write-Host "Repository: $fullRepo"
Write-Host "Project #$ProjectNumber : $($project.title)"
if ($project.number -ne $ProjectNumber) { throw 'Unexpected project number.' }

$fieldList = Get-GhJson @('project','field-list',[string]$ProjectNumber,'--owner',$Owner,'--format','json')
$phaseFieldName = 'KrunchOS Phase'
if (@($fieldList.fields | Where-Object { $_.name -eq $phaseFieldName }).Count -eq 0) {
    if ($WhatIf) {
        Write-Host "[preview] Create project single-select field $phaseFieldName"
    } else {
        $options = ($phases | ForEach-Object { $_.field }) -join ','
        Invoke-Gh @('project','field-create',[string]$ProjectNumber,'--owner',$Owner,'--name',$phaseFieldName,'--data-type','SINGLE_SELECT','--single-select-options',$options) | Out-Null
        Write-Host "Created Project field: $phaseFieldName"
    }
}

$existingItems = @(Get-GhJson @('project','item-list',[string]$ProjectNumber,'--owner',$Owner,'--format','json','--limit','200') | Select-Object -ExpandProperty items)
$existingUrls = @{}
foreach ($item in $existingItems) {
    if ($null -ne $item.content -and $null -ne $item.content.url) {
        $existingUrls[[string]$item.content.url] = $true
    }
}

foreach ($phase in $phases) {
    $matches = @($milestones | Where-Object { $_.title -eq $phase.title })
    if ($matches.Count -eq 0) {
        if ($WhatIf) {
            Write-Host "[preview] Create milestone: $($phase.title)"
        } else {
            Invoke-Gh @('api','-X','POST',"repos/$fullRepo/milestones",'-f',"title=$($phase.title)",'-f',"description=$($phase.description)") | Out-Null
            Write-Host "Created milestone: $($phase.title)"
        }
    } else {
        Write-Host "Reusing milestone: $($phase.title)"
    }

    foreach ($number in $phase.issues) {
        $issueUrl = "https://github.com/$fullRepo/issues/$number"
        if ($WhatIf) {
            Write-Host "[preview] Set #$number to $($phase.title) and add to Project #$ProjectNumber"
            continue
        }

        Invoke-Gh @('issue','edit',[string]$number,'--repo',$fullRepo,'--milestone',$phase.title) | Out-Null

        if (-not $existingUrls.ContainsKey($issueUrl)) {
            Invoke-Gh @('project','item-add',[string]$ProjectNumber,'--owner',$Owner,'--url',$issueUrl) | Out-Null
            $existingUrls[$issueUrl] = $true
        }

        Invoke-Gh @('project','item-edit',[string]$ProjectNumber,'--owner',$Owner,'--url',$issueUrl,'--field',$phaseFieldName,'--value',$phase.field) | Out-Null
        Write-Host "Assigned issue #$number -> $($phase.title)"
    }
}

Write-Host 'Complete. Review GitHub milestones and Project #9 before starting implementation.'
