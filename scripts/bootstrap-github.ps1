#Requires -Version 5.1
<#
 Creates krunchyMonkey/krunchymonkey-site and its GitHub Projects V2 board.
 Requires git, GitHub CLI (gh), GitHub auth, and the `project` scope.
 Does not force push, merge, change Cloudflare DNS, or read any credentials from files.
 Safe to re-run after a partial setup; existing issue titles are reused.
#>
[CmdletBinding()]
param(
    [string]$Owner = 'krunchyMonkey',
    [string]$Repo = 'krunchymonkey-site',
    [string]$ProjectTitle = 'KrunchyMonkey Site',
    [switch]$SkipProject,
    [switch]$SkipIssues
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-Success([string]$Activity) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Activity failed (exit code $LASTEXITCODE). Fix the error and rerun the script; it won't force-push or duplicate issues."
    }
}

function Read-GhJson([string[]]$CliArgs) {
    $output = & gh @CliArgs
    Assert-Success ('gh ' + ($CliArgs -join ' '))
    return ($output | Out-String | ConvertFrom-Json)
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$fullRepo = "$Owner/$Repo"

foreach ($tool in @('git','gh')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Missing $tool. Install Git + GitHub CLI (winget install --id GitHub.cli --exact), then rerun."
    }
}

& gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated. Run: gh auth login' }

Push-Location $root
try {
    if (-not (Test-Path -LiteralPath (Join-Path $root 'index.html'))) {
        throw "Site source missing. Extract the full release archive before running the script."
    }
    # Python is optional during initial bootstrap; GitHub Actions validates on push.
    if (Get-Command python -ErrorAction SilentlyContinue) {
        & python scripts/check_site.py
        Assert-Success 'Static site validation'
    } elseif (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 scripts/check_site.py
        Assert-Success 'Static site validation'
    } else {
        Write-Warning 'Python is not installed locally. GitHub Actions will validate site files after push.'
    }

    if (-not (Test-Path -LiteralPath '.git')) {
        Write-Host 'Initializing local site repository (main branch)...'
        & git init -b main
        Assert-Success 'git init'
    }

    $gitName = (& git config user.name | Out-String).Trim()
    $gitEmail = (& git config user.email | Out-String).Trim()
    if (-not $gitName -or -not $gitEmail) {
        throw 'Configure git author first: git config --global user.name "Your Name" and git config --global user.email "your-address".'
    }

    & git add --all
    Assert-Success 'git add'
    & git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        & git commit -m 'feat: publish approved KrunchyMonkey site mockup and release plan'
        Assert-Success 'git commit'
    }

    $branchName = (& git branch --show-current | Out-String).Trim()
    if ($branchName -ne 'main') {
        throw "Expected the main branch, found '$branchName'. Switch to main before bootstrapping."
    }

    & gh repo view $fullRepo --json name *> $null
    $repoExists = ($LASTEXITCODE -eq 0)
    if (-not $repoExists) {
        Write-Host "Creating public repository $fullRepo and pushing its contents..."
        & gh repo create $fullRepo --public --description 'KrunchyMonkey public software-lab site, exact design assets and Github Pages' --source . --remote origin --push
        Assert-Success 'GitHub repository creation/push'
    } else {
        Write-Host "Reusing existing repository $fullRepo."
        $remoteNames = @(& git remote)
        Assert-Success 'List git remotes'
        if ($remoteNames -notcontains 'origin') {
            & git remote add origin "https://github.com/$fullRepo.git"
            Assert-Success 'git remote add origin'
        } else {
            $remote = (& git remote get-url origin | Out-String).Trim()
            Assert-Success 'Read origin remote'
            $allowed = @("https://github.com/$fullRepo.git", "https://github.com/$fullRepo", "git@github.com:$fullRepo.git")
            if ($allowed -notcontains $remote) {
                throw "origin remote '$remote' does not match $fullRepo. Refusing to push."
            }
        }
        & git push -u origin main
        Assert-Success 'Non-forced git push'
    }

    # Pages preview is public but does NOT configure krunchymonkey.dev DNS.
    & gh api "repos/$fullRepo/pages" *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Enabling GitHub Pages with Actions deployment (preview URL only)...'
        & gh api -X POST "repos/$fullRepo/pages" -f 'build_type=workflow' *> $null
        if ($LASTEXITCODE -ne 0) {
            Write-Warning 'Could not enable Pages automatically. Use repository Settings -> Pages -> Source: GitHub Actions.'
        }
    }

    if (-not $SkipProject) {
        Write-Host "Creating/reusing GitHub Project '$ProjectTitle'..."
        try {
            $projectList = Read-GhJson @('project','list','--owner',$Owner,'--limit','100','--format','json')
        } catch {
            throw "GitHub Projects access failed. Run: gh auth refresh -s project . Details: $_"
        }
        $projects = @($projectList.projects)
        $matching = @($projects | Where-Object { $_.title -eq $ProjectTitle })
        if ($matching.Count -gt 0) {
            $projectNumber = [int]$matching[0].number
        } else {
            $newProject = Read-GhJson @('project','create','--owner',$Owner,'--title',$ProjectTitle,'--format','json')
            $projectNumber = [int]$newProject.number
        }
        Write-Host "Using GitHub Project #$projectNumber"
        & gh project edit $projectNumber --owner $Owner --visibility PUBLIC --description 'KrunchyMonkey public-site design parity, GitHub Pages launch, and Google OAuth information readiness' *> $null
        Assert-Success 'Project settings'
        & gh project link $projectNumber --owner $Owner --repo $fullRepo *> $null
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Project-repo link may already exist; check the GitHub Project settings.' }

        $fieldList = Read-GhJson @('project','field-list',[string]$projectNumber,'--owner',$Owner,'--format','json')
        $fieldNames = @($fieldList.fields | ForEach-Object { $_.name })
        $fieldDefs = @(
            @{ name='Workflow'; options='Backlog,Ready,In Progress,Review,Done' },
            @{ name='Priority'; options='P0,P1,P2' },
            @{ name='Release'; options='A - Design Parity,B - Public Launch,C - OAuth Readiness' }
        )
        foreach ($field in $fieldDefs) {
            if ($fieldNames -notcontains $field.name) {
                & gh project field-create $projectNumber --owner $Owner --name $field.name --data-type SINGLE_SELECT --single-select-options $field.options *> $null
                Assert-Success "Create '$($field.name)' Project field"
                Write-Host "Created field $($field.name)"
            }
        }
    }

    if (-not $SkipIssues) {
        Write-Host 'Publishing/reusing groomed issues...'
        $manifest = @(Get-Content -LiteralPath (Join-Path $root 'docs/issue-backlog.json') -Raw -Encoding UTF8 | ConvertFrom-Json)
        $existingIssues = @(Read-GhJson @('issue','list','--repo',$fullRepo,'--state','all','--limit','200','--json','title,url'))
        $existingLabels = @(Read-GhJson @('label','list','--repo',$fullRepo,'--limit','100','--json','name'))
        $knownLabels = @{}
        foreach ($label in $existingLabels) { $knownLabels[$label.name] = $true }
        foreach ($issue in $manifest) {
            $labelSpecs = @(
                @{ name="type:$($issue.category)"; color='5319E7' },
                @{ name="priority:$($issue.priority)"; color='D93F0B' },
                @{ name="release:$($issue.release.Substring(0,1))"; color='0E8A16' }
            )
            foreach ($spec in $labelSpecs) {
                if (-not $knownLabels.ContainsKey($spec.name)) {
                    & gh label create $spec.name --repo $fullRepo --color $spec.color --description 'KrunchyMonkey site planning label' *> $null
                    Assert-Success "Create label $($spec.name)"
                    $knownLabels[$spec.name] = $true
                }
            }
            $existing = @($existingIssues | Where-Object { $_.title.StartsWith('[' + $issue.id + ']') })
            if ($existing.Count -gt 0) {
                $issueUrl = [string]$existing[0].url
                Write-Host "Reusing $($issue.id) ($issueUrl)"
            } else {
                $issueArgs = @('issue','create','--repo',$fullRepo,'--title',[string]$issue.title,'--body-file',[string]$issue.bodyFile)
                foreach ($spec in $labelSpecs) { $issueArgs += @('--label',[string]$spec.name) }
                $issueUrl = (& gh @issueArgs | Out-String).Trim()
                Assert-Success "Create $($issue.id)"
                Write-Host "Created $($issue.id) ($issueUrl)"
            }
            if (-not $SkipProject) {
                & gh project item-add $projectNumber --owner $Owner --url $issueUrl *> $null
                if ($LASTEXITCODE -ne 0) { Write-Warning "Could not add $($issue.id) to project; it may be present already." }
                foreach ($spec in @(@{ name='Workflow'; value=$issue.workflow }, @{ name='Priority'; value=$issue.priority }, @{ name='Release'; value=$issue.release })) {
                    & gh project item-edit $projectNumber --owner $Owner --url $issueUrl --field $spec.name --value $spec.value *> $null
                    if ($LASTEXITCODE -ne 0) { Write-Warning "Could not set $($spec.name) for $($issue.id)." }
                }
            }
        }
    }

    Write-Host ''
    Write-Host 'Created or verified:'
    Write-Host "  Repo: https://github.com/$fullRepo"
    if (-not $SkipProject) { Write-Host "  Board: https://github.com/users/$Owner/projects/$projectNumber" }
    Write-Host "  Pages preview: https://$($Owner.ToLowerInvariant()).github.io/$Repo/"
    Write-Host 'NEXT: verify Pages action; do not change krunchymonkey.dev DNS until preview is approved.'
}
finally {
    Pop-Location
}
