# FoodControl - Servidor local sin dependencias externas
# Ejecutar con: powershell -ExecutionPolicy Bypass -File servidor.ps1

param(
    [int]$Port = 8000,
    [switch]$BindAll,
    [switch]$NoBrowser
)

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
if ($BindAll) {
    $listener.Prefixes.Add("http://+:$Port/")
} else {
    $listener.Prefixes.Add($prefix)
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".map"  = "application/json"
}

try {
    $listener.Start()
    Write-Host ""
    Write-Host "  FoodControl esta disponible en $prefix" -ForegroundColor Green
    Write-Host "  Presiona Ctrl+C para detener el servidor." -ForegroundColor DarkGray
    Write-Host ""

    if (-not $NoBrowser) {
        try { Start-Process $prefix } catch { }
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($localPath -eq "/" -or $localPath -eq "") {
                $localPath = "/index.html"
            }

            $relative = $localPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relative))

            # Evitar acceder fuera de la carpeta del proyecto
            if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $contentType = $mimeTypes[$extension]
                if (-not $contentType) { $contentType = "application/octet-stream" }

                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.Headers.Add("Cache-Control", "no-cache")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $message = [System.Text.Encoding]::UTF8.GetBytes(@"
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>FoodControl - Pagina no encontrada</title>
<style>
body { background: #0f0f0f; color: #fff; font-family: 'Segoe UI', Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
.box { text-align: center; border: 1px solid #333; border-top: 3px solid #ff6b35; background: #242424; border-radius: 10px; padding: 2.5rem 3rem; max-width: 420px; }
h1 { color: #ff6b35; margin-bottom: 0.5rem; }
p { color: #b0b0b0; line-height: 1.6; }
a { display: inline-block; margin-top: 1rem; background: #ff6b35; color: #16100c; text-decoration: none; font-weight: 600; padding: 0.6rem 1.4rem; border-radius: 8px; }
</style>
</head>
<body>
<div class="box">
<h1>404</h1>
<p>No se encontro la pagina solicitada.<br>Verifica la direccion o vuelve al inicio de sesion.</p>
<a href="/index.html">Ir al inicio</a>
</div>
</body>
</html>
"@)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $message.Length
                $response.OutputStream.Write($message, 0, $message.Length)
            }
        } catch {
            $response.StatusCode = 500
        } finally {
            $response.Close()
        }
    }
} catch {
    Write-Host "No se pudo iniciar el servidor en el puerto $Port." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor DarkGray
    Write-Host "Cierra cualquier otro programa que use ese puerto e intentalo de nuevo." -ForegroundColor DarkGray
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
