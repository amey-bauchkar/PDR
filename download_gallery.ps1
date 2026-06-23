$urls = @(
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"
)

$targetDir = "public\images\gallery"

# Remove existing files
Remove-Item -Path "$targetDir\*" -Force -ErrorAction SilentlyContinue

for ($i=0; $i -lt $urls.Length; $i++) {
    $num = $i + 1
    $dest = "$targetDir\gallery-$num.jpg"
    Write-Host "Downloading $($urls[$i]) to $dest"
    Invoke-WebRequest -Uri $urls[$i] -OutFile $dest
}

Write-Host "Done downloading gallery images."
