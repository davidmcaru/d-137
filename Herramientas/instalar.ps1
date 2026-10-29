# Instala el mod D-137 en este PC: Claude Code lo leerá de la carpeta «Mod D-137» (la de encima de esta), su
# marketplace local «d-137». Si ya estaba, lo quita y lo vuelve a poner (por si la carpeta se ha movido).
$carpeta = Split-Path -Parent $PSScriptRoot
$claude = (Get-Command claude -ErrorAction SilentlyContinue).Source
if (-not $claude) {
  # el de la app de escritorio, que no está en el PATH: el más reciente
  $datos = Join-Path $env:LOCALAPPDATA 'Claude-Data'
  $claude = Get-ChildItem -Path $datos -Recurse -Filter claude.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like '*claude-code*' } | Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $claude) {
  Write-Host 'No encuentro Claude Code en este PC: instálalo y vuelve a probar.'
  exit 1
}
Write-Host ('Claude Code: ' + $claude)
Write-Host ('El mod, desde: ' + $carpeta)
& $claude plugin uninstall d-137@d-137 --scope user --keep-data 2>&1 | Out-Null
& $claude plugin marketplace remove d-137 2>&1 | Out-Null
& $claude plugin marketplace add $carpeta --scope user
& $claude plugin install d-137@d-137 --scope user
Write-Host ''
Write-Host 'Listo. En cada sesión de Claude Code abierta, escribe /reload-plugins.'
