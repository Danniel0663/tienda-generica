$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/..").Path
$runtime = "$env:LOCALAPPDATA/Mostrador"
$config = Get-Content "$runtime/local.json" -Raw | ConvertFrom-Json
$java = (Get-Item "$runtime/jdk-17*/bin/java.exe" | Select-Object -First 1).FullName
$db = (Get-Item "$runtime/mysql-*/bin/mysqld.exe" | Select-Object -First 1).FullName
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://127.0.0.1:3307/tienda_generica?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota'
$env:SPRING_DATASOURCE_USERNAME = 'mostrador'
$env:SPRING_DATASOURCE_PASSWORD = $config.password
$env:APP_SECURITY_TOKEN_SECRET = $config.token
$env:APP_CORS_ALLOWED_ORIGINS = 'http://127.0.0.1:5173,http://localhost:5173'
$env:SERVER_ADDRESS = '127.0.0.1'

function Test-Port([int]$Port) {
    $socket = [Net.Sockets.TcpClient]::new()
    try { $socket.Connect('127.0.0.1', $Port); return $true }
    catch { return $false }
    finally { $socket.Dispose() }
}

if (!(Test-Port 3307)) {
    Start-Process $db -ArgumentList @('--no-defaults', ('--datadir="{0}/db"' -f $runtime), '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF') -WindowStyle Hidden
    for ($i = 0; $i -lt 30 -and !(Test-Port 3307); $i++) { Start-Sleep 1 }
    if (!(Test-Port 3307)) { throw 'MySQL no respondió en el puerto 3307.' }
}

$services = [ordered]@{usuarios=8082; clientes=8083; proveedores=8084; productos=8085; ventas=8086; report=8087; gateway=8081}
foreach ($name in $services.Keys) {
    if (Test-Port $services[$name]) { continue }
    $module = "$name-service"
    $archive = Get-ChildItem "$repo/microservices/$module/target/$module-*" -File |
        Where-Object Extension -in '.war','.jar' | Select-Object -First 1
    if (!$archive) { throw "Falta compilar $module con mvnw.cmd package." }
    Start-Process $java -ArgumentList @('-Xms32m','-Xmx192m','-XX:ActiveProcessorCount=2','-jar',('"{0}"' -f $archive.FullName)) -WindowStyle Hidden -RedirectStandardOutput "$runtime/$name.log" -RedirectStandardError "$runtime/$name.err"
}
if (!(Test-Port 5173)) {
    Start-Process node -WorkingDirectory "$repo/frontend" -ArgumentList 'node_modules/vite/bin/vite.js --host 127.0.0.1 --strictPort' -WindowStyle Hidden
}
foreach ($name in $services.Keys) {
    $ready = $false
    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        try {
            $health = Invoke-RestMethod "http://127.0.0.1:$($services[$name])/actuator/health" -TimeoutSec 2
            if ($health.status -eq 'UP') { $ready = $true; break }
        } catch {}
        Start-Sleep 1
    }
    if (!$ready) { throw "Revisa $runtime/$name.log. El servicio no respondió." }
}
Write-Output 'Mostrador disponible en http://127.0.0.1:5173/'
