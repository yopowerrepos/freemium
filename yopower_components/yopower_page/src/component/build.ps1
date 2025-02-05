Clear-Host
$root = (Get-Location).Path
$obj = "$root\obj"
if (Test-Path -Path $obj) {
    Remove-Item -Path $obj -Recurse -Force
}
$out = "$root\out"
if (Test-Path -Path $out) {
    Remove-Item -Path $out -Recurse -Force
}
pac pcf version -s manifest
pac auth select -n ypdev
pac pcf push --solution-unique-name yopower_powerapps_grid_extensions