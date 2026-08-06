$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$assets = Join-Path (Get-Location) 'assets'

function New-AppImage {
    param(
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [string]$Mode
    )

    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $bg = [System.Drawing.Color]::FromArgb(44, 62, 80)
    $accent = [System.Drawing.Color]::FromArgb(241, 196, 15)
    $light = [System.Drawing.Color]::FromArgb(236, 240, 241)

    $graphics.Clear($bg)

    if ($Mode -eq 'splash') {
        $font = New-Object System.Drawing.Font('Arial', 72, [System.Drawing.FontStyle]::Bold)
        $subFont = New-Object System.Drawing.Font('Arial', 30, [System.Drawing.FontStyle]::Regular)
        $stringFormat = New-Object System.Drawing.StringFormat
        $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        $brush = New-Object System.Drawing.SolidBrush($light)
        $accentBrush = New-Object System.Drawing.SolidBrush($accent)

        $graphics.FillEllipse($accentBrush, ($Width / 2) - 120, ($Height / 2) - 260, 240, 240)
        $graphics.DrawString('G', $font, $brush, [System.Drawing.RectangleF]::new(($Width / 2) - 180, ($Height / 2) - 120, 360, 140), $stringFormat)
        $graphics.DrawString('Guessing Game', $subFont, $brush, [System.Drawing.RectangleF]::new(0, ($Height / 2) + 70, $Width, 60), $stringFormat)

        $brush.Dispose()
        $accentBrush.Dispose()
        $font.Dispose()
        $subFont.Dispose()
        $stringFormat.Dispose()
    }
    else {
        $accentBrush = New-Object System.Drawing.SolidBrush($accent)
        $brush = New-Object System.Drawing.SolidBrush($light)
        $fontSize = [Math]::Round([Math]::Min($Width, $Height) * 0.34)
        $font = New-Object System.Drawing.Font('Arial', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $stringFormat = New-Object System.Drawing.StringFormat
        $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        $padding = [Math]::Round([Math]::Min($Width, $Height) * 0.16)

        $graphics.FillEllipse($accentBrush, $padding, $padding, $Width - (2 * $padding), $Height - (2 * $padding))
        $graphics.DrawString('G', $font, $brush, [System.Drawing.RectangleF]::new(0, 0, $Width, $Height), $stringFormat)

        $accentBrush.Dispose()
        $brush.Dispose()
        $font.Dispose()
        $stringFormat.Dispose()
    }

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-AppImage (Join-Path $assets 'icon.png') 1024 1024 'icon'
New-AppImage (Join-Path $assets 'adaptive-icon.png') 1024 1024 'adaptive'
New-AppImage (Join-Path $assets 'splash.png') 1242 2436 'splash'
New-AppImage (Join-Path $assets 'favicon.png') 48 48 'favicon'
