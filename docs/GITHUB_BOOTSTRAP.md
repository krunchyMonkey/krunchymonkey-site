# One-command GitHub setup from Windows

This package can't create remote resources on its own. The script in `scripts/bootstrap-github.ps1` uses the **GitHub CLI authenticated on your Windows computer** to create the public repository, push the exact site and reference assets, create a GitHub Projects board, publish 12 groomed issues and link them to the board.

## Prerequisites

- Git installed and `git --version` works.
- GitHub CLI (`gh`) installed. If necessary: `winget install --id GitHub.cli --exact`.
- `gh auth login` completed in your own browser with your own GitHub account.
- `gh auth refresh -s project,workflow` completed for GitHub Projects and GitHub Actions workflow push permissions; verify with `gh auth status`.
- A Git identity configured for the commit (`git config --global user.name` / `git config --global user.email`).

Do not share your GitHub token, any Cloudflare token, or local secret files with this site.

## Steps

1. Extract the release ZIP somewhere **outside** your private Tracing Guatemala repo, e.g., `D:\develop\krunchymonkey-site`.
2. Open PowerShell in the extracted folder and run:

   ```powershell
   pwsh -File .\scripts\bootstrap-github.ps1
   ```

   If `pwsh` (PowerShell 7) is unavailable, try `powershell -NoProfile -File .\scripts\bootstrap-github.ps1`.

3. The script prints the new repository and Projects URLs, verifies/creates the GitHub items, and exits. It will **not** force-push, delete resources, or merge PRs.
4. The script attempts to enable GitHub Pages in **Actions** mode for the public preview (no DNS change). If GitHub rejects that API call, use **Settings → Pages → Source: GitHub Actions**. Run the deploy workflow, then check the Pages preview URL.

## If the repo/project already exists

Re-running the script reuses them by name and skips issues with the same `[KM-...]` issue-title prefix. This is intended for recoverable interrupted setup. If an existing repo contains unrelated commits or the `origin` remote points elsewhere, the script stops instead of overwriting history.

The script creates a `Workflow` single-select field for the desired `Backlog / Ready / In Progress / Review / Done` flow, plus `Priority` and `Release` fields. GitHub Projects also has its own default `Status` field; configure a board view grouped by `Workflow` after setup if you want the exact five-column presentation.

## Boundaries

- Repository and board are **public**, matching the static landing-page purpose.
- GitHub will list the public content and project issues; never place client information or private server configuration into them.
- Custom domain `krunchymonkey.dev` DNS mapping is not changed by the script. This requires a separate owner-approved step after the Pages preview works.