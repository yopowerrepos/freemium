Clear-Host
$root = (Get-Location).Path
$sensitiveConfig = $root -replace "yopower_papps_grid_extensions\\earlybound", "yopower_products_connection\app-sensitive.config"
Write-Host $sensitiveConfig

$xmlContent = Get-Content -Path $sensitiveConfig
$xml = [xml]$xmlContent
$settings = @{}

foreach ($add in $xml.configuration.appSettings.add) {
    $key = $add.GetAttribute("key")
    $value = $add.GetAttribute("value")
    $settings[$key] = $value
}

pac auth create -n $settings["friendlyName"] -env $settings["url"] -t $settings["tenantid"] -id $settings["applicationid"] -cs $settings["secret"]
pac auth select -n $settings["friendlyName"]
pac modelbuilder build -o $root -stf "$root\_earlyboundsettings.json"