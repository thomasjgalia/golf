param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,

  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,

  [string]$CommitMessage = "chore: initialize SOL Golf app (Vite + React + TS + Supabase)"
)

function Exec($cmd) {
  Write-Host ">> $cmd" -ForegroundColor Cyan
  $process = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command",$cmd -NoNewWindow -PassThru -Wait
  if ($process.ExitCode -ne 0) { throw "Command failed: $cmd" }
}

# 1) Go to project folder
Set-Location $ProjectPath

# 2) Ensure Git repo exists
if (!(Test-Path ".git")) {
  Exec "git init"
}

# 3) Ensure main branch
Exec "git branch -M main"

# 4) Configure remote 'origin'
# If origin exists, update it; else add it
try {
  $originUrl = git remote get-url origin 2>$null
  if ($LASTEXITCODE -eq 0) {
    Exec "git remote set-url origin $RepoUrl"
  } else {
    Exec "git remote add origin $RepoUrl"
  }
} catch {
  Exec "git remote add origin $RepoUrl"
}

# 5) Add and commit changes (ignore error if no changes)
Exec "git add ."
try {
  Exec "git commit -m `"$CommitMessage`""
} catch {
  Write-Host "No new changes to commit (or commit failed). Continuing..." -ForegroundColor Yellow
}

# 6) If remote main exists, pull --rebase to merge histories cleanly
$remoteHasMain = $false
try {
  git ls-remote --heads $RepoUrl main | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $remoteHasMain = $true
  }
} catch {}

if ($remoteHasMain) {
  try {
    Exec "git fetch origin main"
    Exec "git pull --rebase origin main"
  } catch {
    Write-Host "Pull/rebase failed. Resolve conflicts if any, then re-run push step." -ForegroundColor Yellow
  }
}

# 7) Push to GitHub
Exec "git push -u origin main"

Write-Host "Done. Repository pushed to $RepoUrl" -ForegroundColor Green