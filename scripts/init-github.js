/**
 * Script untuk inisialisasi GitHub repository
 * - Mengatur .gitignore
 * - Membuat GitHub Actions workflow
 * - Membuat GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Memastikan direktori .github/workflows ada
const ensureGitHubWorkflowsDir = () => {
  const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    console.log('📁 Membuat direktori .github/workflows...');
    fs.mkdirSync(workflowsDir, { recursive: true });
  }
  
  return workflowsDir;
};

// Membuat workflow file
const createWorkflowFile = (workflowsDir) => {
  const deployWorkflowPath = path.join(workflowsDir, 'deploy.yml');
  
  console.log('📝 Membuat file workflow GitHub Actions...');
  
  const workflowContent = `name: Website Portfolio Deployment

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: 'Deploy target (netlify, gh-pages, all)'
        required: true
        default: 'all'
        type: choice
        options:
          - netlify
          - gh-pages
          - all

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint || echo "Linting completed with warnings"
      
      - name: Build for testing
        run: npm run build
      
      - name: Cache build artifacts
        uses: actions/cache@v3
        with:
          path: |
            .next
            out
            node_modules/.cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-\${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          restore-keys: |
            \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-
  
  deploy-to-netlify:
    needs: build
    if: github.event_name == 'push' || github.event.inputs.deploy_target == 'netlify' || github.event.inputs.deploy_target == 'all'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Restore cached build
        uses: actions/cache@v3
        with:
          path: |
            .next
            out
            node_modules/.cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-\${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
      
      - name: Prepare for Netlify
        run: npm run fix-netlify
        env:
          NETLIFY: 'true'
          DEPLOY_TARGET: 'netlify'
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './out'
          production-branch: main
          github-token: \${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
          enable-pull-request-comment: true
          enable-commit-comment: true
          overwrites-pull-request-comment: true
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}
        timeout-minutes: 10
  
  deploy-to-github-pages:
    needs: build
    if: github.event_name == 'push' || github.event.inputs.deploy_target == 'gh-pages' || github.event.inputs.deploy_target == 'all'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Restore cached build
        uses: actions/cache@v3
        with:
          path: |
            .next
            out
            node_modules/.cache
          key: \${{ runner.os }}-nextjs-\${{ hashFiles('**/package-lock.json') }}-\${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
      
      - name: Build for GitHub Pages
        run: npm run export:gh-pages
        env:
          DEPLOY_TARGET: 'gh-pages'
      
      - name: Prepare for GitHub Pages
        run: npm run prepare-gh-pages
      
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: out
          branch: gh-pages
          clean: true
`;

  fs.writeFileSync(deployWorkflowPath, workflowContent);
  console.log('✅ File workflow GitHub Actions berhasil dibuat!');
};

// Memperbarui file .gitignore
const updateGitIgnore = () => {
  const gitIgnorePath = path.join(__dirname, '..', '.gitignore');
  let content = '';
  
  if (fs.existsSync(gitIgnorePath)) {
    content = fs.readFileSync(gitIgnorePath, 'utf8');
  }
  
  // Menambahkan entri yang penting
  const entriesToAdd = [
    '.next/',
    'out/',
    'node_modules/',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.pnpm-debug.log*',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    '.DS_Store',
    'Thumbs.db',
    '.netlify/',
    '.vercel/',
    '.vscode/',
    'coverage/',
    '*.tsbuildinfo',
    'build/',
    'dist/'
  ];
  
  let updated = false;
  for (const entry of entriesToAdd) {
    if (!content.includes(entry)) {
      content += `\n${entry}`;
      updated = true;
    }
  }
  
  if (updated) {
    console.log('📝 Memperbarui file .gitignore...');
    fs.writeFileSync(gitIgnorePath, content.trim() + '\n');
    console.log('✅ File .gitignore berhasil diperbarui!');
  } else {
    console.log('ℹ️ File .gitignore sudah sesuai, tidak perlu pembaruan.');
  }
};

// Membuat GitHub Pages CNAME file jika ada custom domain
const createCNAMEFile = () => {
  const cnamePath = path.join(__dirname, '..', 'public', 'CNAME');
  
  // Cek apakah sudah ada file CNAME
  if (fs.existsSync(cnamePath)) {
    console.log('ℹ️ File CNAME sudah ada.');
    return;
  }
  
  console.log('📝 Membuat file CNAME (opsional)...');
  console.log('ℹ️ Jika Anda ingin menggunakan custom domain untuk GitHub Pages,');
  console.log('   silahkan buat file public/CNAME dengan domain Anda.');
  console.log('   Contoh: echo "portfolio.januargaluh.com" > public/CNAME');
};

// Inisialisasi repository lokal
const initLocalRepo = () => {
  try {
    // Cek apakah repo sudah diinisialisasi
    const isGitRepo = fs.existsSync(path.join(__dirname, '..', '.git'));
    
    if (!isGitRepo) {
      console.log('🔄 Inisialisasi repository Git lokal...');
      execSync('git init', { cwd: path.join(__dirname, '..') });
      execSync('git add .', { cwd: path.join(__dirname, '..') });
      execSync('git commit -m "Initial commit: Portfolio website setup"', { cwd: path.join(__dirname, '..') });
      console.log('✅ Repository Git lokal berhasil diinisialisasi!');
    } else {
      console.log('ℹ️ Repository Git lokal sudah diinisialisasi sebelumnya.');
    }
  } catch (error) {
    console.error('❌ Error saat inisialisasi repository Git lokal:', error.message);
  }
};

// Fungsi utama
const main = () => {
  console.log('=== Inisialisasi GitHub Repository ===');
  
  // 1. Memastikan direktori .github/workflows ada
  const workflowsDir = ensureGitHubWorkflowsDir();
  
  // 2. Membuat workflow file
  createWorkflowFile(workflowsDir);
  
  // 3. Memperbarui .gitignore
  updateGitIgnore();
  
  // 4. Membuat CNAME file untuk GitHub Pages (opsional)
  createCNAMEFile();
  
  // 5. Inisialisasi repository lokal jika belum
  initLocalRepo();
  
  console.log('===================================');
  console.log('✅ Inisialisasi GitHub Repository selesai!');
  console.log('');
  console.log('Langkah selanjutnya:');
  console.log('1. Buat repository baru di GitHub');
  console.log('2. Tambahkan remote origin:');
  console.log('   git remote add origin https://github.com/username/repo-name.git');
  console.log('3. Push ke GitHub:');
  console.log('   git push -u origin main');
  console.log('4. Tambahkan secret di GitHub repository:');
  console.log('   - NETLIFY_AUTH_TOKEN: Token API Netlify Anda');
  console.log('   - NETLIFY_SITE_ID: ID situs Netlify Anda (musical-souffle-ad6848)');
  console.log('===================================');
};

// Jalankan fungsi utama
main(); 