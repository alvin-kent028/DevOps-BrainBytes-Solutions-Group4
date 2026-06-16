param(
  [switch]$Detach = $true
)

function CommandExists($cmd) { (Get-Command $cmd -ErrorAction SilentlyContinue) -ne $null }

if (-not (CommandExists docker)) {
  Write-Error "Docker not found. Install Docker Desktop: https://www.docker.com/get-started"
  exit 1
}

$composeCmd = $null
try {
  docker compose version > $null 2>&1
  $composeCmd = 'docker compose'
} catch {
  if (CommandExists 'docker-compose') { $composeCmd = 'docker-compose' }
}

if (-not $composeCmd) {
  Write-Error "Neither 'docker compose' (v2) nor 'docker-compose' found. Ensure Docker Compose is available."
  exit 1
}

$upCmd = "$composeCmd up --build"
if ($Detach) { $upCmd += ' -d' }

Write-Output "Running: $upCmd"
Invoke-Expression $upCmd
