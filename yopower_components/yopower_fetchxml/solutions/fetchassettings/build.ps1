# Script to run 'pac pcf version -s manifest' for all PCF components

$ErrorActionPreference = "SilentlyContinue"
$WarningPreference = "SilentlyContinue"

function Find-MSBuildPath {
    $vswhere = Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath "Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vswhere) {
        $msbuildPath = & $vswhere -latest -prerelease -products * -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" 2>$null | Select-Object -First 1
        if ($msbuildPath -and (Test-Path $msbuildPath)) {
            return $msbuildPath
        }
    }

    $editions = "Enterprise", "Professional", "Community", "BuildTools"
    $years = "2022", "2019"
    $programFilesDirs = ${env:ProgramFiles}, ${env:ProgramFiles(x86)}

    foreach ($programFiles in $programFilesDirs) {
        foreach ($year in $years) {
            foreach ($edition in $editions) {
                $candidate = Join-Path -Path $programFiles -ChildPath "Microsoft Visual Studio\$year\$edition\MSBuild\Current\Bin\MSBuild.exe"
                if (Test-Path $candidate) {
                    return $candidate
                }
            }
        }
    }

    return $null
}

$solutionPath = Split-Path -Parent $PSCommandPath
$componentsPath = Join-Path -Path $solutionPath -ChildPath "..\..\components"
$componentsPath = (Resolve-Path -Path $componentsPath).Path

Write-Host "Solution Path: $solutionPath" -ForegroundColor Cyan
Write-Host "Components Path: $componentsPath" -ForegroundColor Cyan
Write-Host ""

$components = Get-ChildItem -Path $componentsPath -Directory | Where-Object {
    Test-Path (Join-Path -Path $_.FullName -ChildPath "*.pcfproj")
}

if ($components.Count -eq 0) {
    Write-Host "No PCF components found in $componentsPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($components.Count) PCF component(s):" -ForegroundColor Cyan
$components | ForEach-Object { Write-Host "  - $($_.Name)" }
Write-Host ""

$results = @()

foreach ($component in $components) {
    Write-Host "Processing: $($component.Name)" -ForegroundColor Cyan
    Write-Host "Location: $($component.FullName)" -ForegroundColor Gray
    
    try {
        Push-Location -Path $component.FullName
        
        Write-Host "Running: pac pcf version -s manifest" -ForegroundColor Yellow
        & pac pcf version -s manifest 2>&1 | Out-Null
        
        $results += @{
            Component = $component.Name
            Status = "Success"
            Time = Get-Date
        }
        
        Write-Host "Completed: $($component.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error processing $($component.Name): $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Component = $component.Name
            Status = "Failed"
            Error = $_.Exception.Message
            Time = Get-Date
        }
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
$results | ForEach-Object {
    $statusColor = if ($_.Status -eq "Success") { "Green" } else { "Red" }
    Write-Host "$($_.Component): $($_.Status)" -ForegroundColor $statusColor
}

$successCount = ($results | Where-Object { $_.Status -eq "Success" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "Failed" }).Count
Write-Host "`nTotal: $successCount succeeded, $failCount failed" -ForegroundColor Cyan

# If all components succeeded, run solution version
if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "All components succeeded! Running solution version update..." -ForegroundColor Cyan
    
    try {
        Push-Location -Path $solutionPath
        
        $now = Get-Date
        $buildVersion = "{0}{1:D3}" -f ($now.ToString("yy")), $now.DayOfYear
        $revisionVersion = $now.ToString("HHmm")
        Write-Host "Build version: $buildVersion / Revision version: $revisionVersion" -ForegroundColor Yellow

        & pac auth select -n ypdev
        & pac solution sync

        $solutionXmlPath = Join-Path -Path $solutionPath -ChildPath "src\Other\Solution.xml"
        [xml]$solutionXml = Get-Content -Path $solutionXmlPath
        $versionNode = $solutionXml.SelectSingleNode("//SolutionManifest/Version")
        $versionParts = $versionNode.InnerText.Split('.')
        $newVersion = "$($versionParts[0]).$($versionParts[1]).$buildVersion.$revisionVersion"
        $versionNode.InnerText = $newVersion
        $solutionXml.Save($solutionXmlPath)
        Write-Host "Updated Solution.xml version to: $newVersion" -ForegroundColor Yellow

        Write-Host "Solution version updated successfully" -ForegroundColor Green

        $msbuildPath = Find-MSBuildPath
        if (-not $msbuildPath) {
            Write-Host "MSBuild.exe not found. Install Visual Studio (2019/2022) with the MSBuild component." -ForegroundColor Red
        }
        else {
            Write-Host "Using MSBuild: $msbuildPath" -ForegroundColor Cyan
            $cdsprojPath = Join-Path -Path $solutionPath -ChildPath "fetchassettings.cdsproj"

            Write-Host "Running: msbuild /t:restore" -ForegroundColor Yellow
            & $msbuildPath $cdsprojPath /t:restore

            Write-Host "Running: msbuild /p:configuration=Release" -ForegroundColor Yellow
            & $msbuildPath $cdsprojPath /p:configuration=Release
        }
    }
    catch {
        Write-Host "Error updating solution version: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host ""
    Write-Host "Skipping solution version update due to component failures" -ForegroundColor Yellow
}
