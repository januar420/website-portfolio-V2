@echo off
echo ===== Inisialisasi Repositori GitHub untuk Website Portfolio =====
echo.

set /p github_username=Masukkan username GitHub Anda: 
set /p repo_name=Masukkan nama repositori (default: website-portfolio): 

if "%repo_name%"=="" set repo_name=website-portfolio

echo.
echo Menggunakan username: %github_username% dan repositori: %repo_name%
echo.

:: Ganti username di file README.md
echo Memperbarui file README.md dengan username Anda...
powershell -Command "(Get-Content GITHUB_README.md) -replace 'username', '%github_username%' | Set-Content GITHUB_README.md"
copy GITHUB_README.md README.md /Y

:: Memeriksa apakah direktori .git sudah ada
if exist .git\ (
    echo.
    echo Repositori Git sudah ada. Memeriksa remote...
    
    :: Memeriksa apakah remote 'origin' sudah ada
    for /f %%i in ('git remote') do (
        if "%%i"=="origin" (
            echo Remote 'origin' sudah ada. Memperbarui URL...
            git remote set-url origin "https://github.com/%github_username%/%repo_name%.git"
            goto :continue
        )
    )
    
    echo Menambahkan remote 'origin'...
    git remote add origin "https://github.com/%github_username%/%repo_name%.git"
) else (
    echo.
    echo Inisialisasi repositori Git baru...
    git init
    git remote add origin "https://github.com/%github_username%/%repo_name%.git"
)

:continue
echo.
echo Menyiapkan .gitignore...
:: Memastikan file-file yang tidak diperlukan tidak masuk ke Git
echo .env.local >> .gitignore
echo .env >> .gitignore
echo .DS_Store >> .gitignore

:: Menambahkan dan commit semua perubahan
echo.
echo Menambahkan dan commit semua perubahan...
git add .
git commit -m "Initial commit: Website Portfolio"

echo.
echo Persiapan lokal selesai!
echo.
echo Apa yang ingin Anda lakukan selanjutnya?
echo 1. Push ke GitHub dan deploy dengan GitHub Pages
echo 2. Hanya push ke GitHub (deploy manual nanti)
echo 3. Keluar tanpa push

set /p option=Pilih opsi (1-3): 

if "%option%"=="1" (
    echo.
    echo Melakukan push ke GitHub...
    git push -u origin main
    
    echo.
    echo Menyiapkan dan menjalankan deployment ke GitHub Pages...
    :: Pastikan gh-pages terinstall
    call npm install --save-dev gh-pages
    
    :: Deploy ke GitHub Pages
    call npm run deploy:gh-pages
    
    echo.
    echo Website berhasil dideploy ke GitHub Pages!
    echo Website Anda seharusnya tersedia di: https://%github_username%.github.io/%repo_name%/
) else if "%option%"=="2" (
    echo.
    echo Melakukan push ke GitHub...
    git push -u origin main
    
    echo.
    echo Kode berhasil di-push ke GitHub!
    echo Repositori tersedia di: https://github.com/%github_username%/%repo_name%
    echo.
    echo Untuk deploy nanti, jalankan salah satu perintah berikut:
    echo - GitHub Pages: npm run deploy:gh-pages
    echo - Netlify: npm run deploy:netlify
    echo - Vercel: npm run deploy:vercel-prod
    echo - Cloudflare: npm run deploy:cloudflare
) else if "%option%"=="3" (
    echo.
    echo Keluar tanpa push.
    echo Repositori lokal telah disiapkan.
    echo.
    echo Untuk push ke GitHub nanti, jalankan:
    echo git push -u origin main
) else (
    echo.
    echo Opsi tidak valid.
)

echo.
echo Selesai!
pause 