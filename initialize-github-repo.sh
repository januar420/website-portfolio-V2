#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Inisialisasi Repositori GitHub untuk Website Portfolio =====${NC}"

# Meminta input username GitHub
read -p "Masukkan username GitHub Anda: " github_username
read -p "Masukkan nama repositori (default: website-portfolio): " repo_name
repo_name=${repo_name:-website-portfolio}

echo -e "\n${GREEN}Menggunakan username: ${github_username} dan repositori: ${repo_name}${NC}"

# Ganti username di file README.md
echo -e "\n${YELLOW}Memperbarui file README.md dengan username Anda...${NC}"
sed -i "s/username/${github_username}/g" GITHUB_README.md
cp GITHUB_README.md README.md

# Memeriksa apakah direktori .git sudah ada
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}Repositori Git sudah ada. Memeriksa remote...${NC}"
    
    # Memeriksa apakah remote 'origin' sudah ada
    if git remote | grep -q "^origin$"; then
        echo -e "${YELLOW}Remote 'origin' sudah ada. Memperbarui URL...${NC}"
        git remote set-url origin "https://github.com/${github_username}/${repo_name}.git"
    else
        echo -e "${YELLOW}Menambahkan remote 'origin'...${NC}"
        git remote add origin "https://github.com/${github_username}/${repo_name}.git"
    fi
else
    echo -e "\n${YELLOW}Inisialisasi repositori Git baru...${NC}"
    git init
    git remote add origin "https://github.com/${github_username}/${repo_name}.git"
fi

echo -e "\n${YELLOW}Menyiapkan .gitignore...${NC}"
# Memastikan file-file yang tidak diperlukan tidak masuk ke Git
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
echo ".DS_Store" >> .gitignore

# Menambahkan dan commit semua perubahan
echo -e "\n${YELLOW}Menambahkan dan commit semua perubahan...${NC}"
git add .
git commit -m "Initial commit: Website Portfolio"

echo -e "\n${GREEN}Persiapan lokal selesai!${NC}"
echo -e "\n${YELLOW}Apa yang ingin Anda lakukan selanjutnya?${NC}"
echo -e "1. Push ke GitHub dan deploy dengan GitHub Pages"
echo -e "2. Hanya push ke GitHub (deploy manual nanti)"
echo -e "3. Keluar tanpa push"

read -p "Pilih opsi (1-3): " option

case $option in
    1)
        echo -e "\n${YELLOW}Melakukan push ke GitHub...${NC}"
        git push -u origin main
        
        echo -e "\n${YELLOW}Menyiapkan dan menjalankan deployment ke GitHub Pages...${NC}"
        # Pastikan gh-pages terinstall
        npm install --save-dev gh-pages
        
        # Deploy ke GitHub Pages
        npm run deploy:gh-pages
        
        echo -e "\n${GREEN}Website berhasil dideploy ke GitHub Pages!${NC}"
        echo -e "${GREEN}Website Anda seharusnya tersedia di: https://${github_username}.github.io/${repo_name}/${NC}"
        ;;
    2)
        echo -e "\n${YELLOW}Melakukan push ke GitHub...${NC}"
        git push -u origin main
        
        echo -e "\n${GREEN}Kode berhasil di-push ke GitHub!${NC}"
        echo -e "${GREEN}Repositori tersedia di: https://github.com/${github_username}/${repo_name}${NC}"
        echo -e "\n${YELLOW}Untuk deploy nanti, jalankan salah satu perintah berikut:${NC}"
        echo -e "- GitHub Pages: npm run deploy:gh-pages"
        echo -e "- Netlify: npm run deploy:netlify"
        echo -e "- Vercel: npm run deploy:vercel-prod"
        echo -e "- Cloudflare: npm run deploy:cloudflare"
        ;;
    3)
        echo -e "\n${YELLOW}Keluar tanpa push.${NC}"
        echo -e "${YELLOW}Repositori lokal telah disiapkan.${NC}"
        echo -e "\n${YELLOW}Untuk push ke GitHub nanti, jalankan:${NC}"
        echo -e "git push -u origin main"
        ;;
    *)
        echo -e "\n${RED}Opsi tidak valid.${NC}"
        ;;
esac

echo -e "\n${GREEN}Selesai!${NC}" 