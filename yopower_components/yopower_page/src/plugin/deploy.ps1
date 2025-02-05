param (
    [Parameter(Mandatory = $true)]
    [string]$a,

    [Parameter(Mandatory = $true)]
    [string]$o,

    [Parameter(Mandatory = $true)]
    [string]$m
)

function Publish {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$assemblyid,

        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$output,

        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$mode)

        Clear-Host
        $root = (Get-Location).Path
        $sensitiveConfig = $root -replace "yp-learning-plugins", "yp-learning-connection\app-sensitive.config"
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
        pac plugin push -id $assemblyid -pf $output -t Assembly -c $mode
}

Publish -assemblyid $a -output $o -mode $m