# remark-relgeo-hl Development Plan

Status dokumen: `Active Package Plan`

Tanggal: `2026-07-21`

Dokumen terkait:

1. `README.md`
2. [Markdown Surfaces](https://relgeo.github.io/docs/markdown-surfaces/)
3. [Language Spec](https://relgeo.github.io/docs/language-spec/)

---

## 1. Peran Package

`remark-relgeo-hl` adalah adapter markdown untuk menampilkan source RelGeo dengan baik di fenced code `rg`.

Paket ini penting karena visi RelGeo bukan hanya menghasilkan gambar, tetapi juga membuat aturan gambar tetap:

1. tertulis
2. terbaca
3. bisa dipelajari
4. bisa disisipkan di markdown

Kalau `remark-relgeo` membuktikan sisi preview, maka `remark-relgeo-hl` membuktikan sisi source literacy.

---

## 2. Gambaran Kematangan Yang Ditargetkan

Package ini dianggap matang bila:

1. fenced code `rg` selalu tampil sebagai source yang nyaman dibaca
2. highlight semantic dapat bertumpu pada kemampuan language service tanpa menjadikannya wajib untuk fallback dasar
3. output class dan token stabil untuk styling lintas consumer
4. package bisa dipakai terpisah dari docs-site
5. boundary terhadap preview tetap tegas

---

## 3. Boundary Yang Harus Dijaga

### 3.1 Tanggung Jawab

1. mendeteksi fenced code `rg`
2. menampilkan source RelGeo sebagai code block
3. memberi struktur token atau line metadata untuk styling
4. memanfaatkan language service bila tersedia
5. tetap menyediakan fallback yang aman dan terbaca

### 3.2 Bukan Tanggung Jawab

1. menjalankan preview SVG
2. menggantikan editor language service penuh
3. memutuskan semantics bahasa
4. menggantikan plugin preview embed

---

## 4. Nilai Produk Yang Harus Dijaga

Paket ini harus menjaga bahwa code example RelGeo:

1. mudah dibaca di website
2. mudah di-scan di tutorial
3. cukup stabil untuk reference docs
4. tidak kehilangan keterbacaan walau semantic highlighting belum lengkap

---

## 5. Sasaran Fungsi

### 5.1 Sasaran Minimum

1. dukung fenced code `rg`
2. pertahankan source code sebagai code-oriented output
3. sediakan line wrappers dan metadata dasar
4. sediakan class prefix stabil

### 5.2 Sasaran Menengah

1. tambahkan semantic tokenization dari language service
2. bedakan token penting seperti keyword, identifier, literal, comment, type marker, unit, dan operator relasional jika memang ada
3. sediakan fallback yang tetap bagus bila semantic layer gagal
4. dukung opsi theme atau token-class mode yang terbatas

### 5.3 Sasaran Lanjut

1. siap menjadi fondasi syntax showcase lintas docs-site dan consumer markdown lain
2. siap menjadi jembatan ke highlighter yang lebih kaya tanpa mengubah fence contract

---

## 6. Arah Arsitektur

### 6.1 Pipeline Dasar

Pipeline target:

1. detect block `rg`
2. baca source mentah
3. ambil semantic info bila tersedia
4. bangun output AST code-oriented
5. fallback ke line-preserving source bila semantic info gagal

### 6.2 Dependency Shape

Arah dependency sehat:

1. dependency utama ke `relgeo-language-service`
2. tanpa dependency ke renderer SVG secara default
3. tanpa membawa parser alternatif yang menyimpang dari language service

Kondisi saat ini masih awal karena semantic highlight belum penuh.

### 6.3 Output Shape

Output minimum yang sehat:

1. tetap `pre > code`
2. line wrappers stabil
3. class prefix stabil
4. data attribute minimum untuk fence dan kind

Output matang:

1. token spans tersedia bila semantic data ada
2. struktur output tetap masuk akal tanpa token spans
3. consumer dapat styling line number dan token tanpa patch liar

---

## 7. Area Kerja Utama

### 7.1 Source Readability

Yang perlu dimatangkan:

1. line wrapping
2. whitespace preservation
3. long-line handling
4. visual density yang nyaman

### 7.2 Semantic Highlighting

Yang perlu dipikirkan matang:

1. token taxonomy yang benar-benar berguna bagi RelGeo
2. apakah token names mengikuti generic syntax classes atau class khusus RelGeo
3. bagaimana menangani syntax yang sedang berkembang tanpa sering merombak output
4. bagaimana fallback saat language service belum memberi detail token

### 7.3 Consumer Styling Contract

Yang perlu dibakukan:

1. class prefix dasar
2. nama line class
3. nama token class atau data attribute
4. metadata minimum untuk test dan styling

### 7.4 Interop Dengan Docs-Site

Yang perlu dijaga:

1. docs-site tidak menjadi asumsi tunggal
2. output tetap wajar di unified atau remark consumer lain
3. docs-site boleh menjadi referensi styling, tetapi tidak boleh mengunci API package ini

---

## 8. Rencana Tahapan

### Tahap 1. Source Surface Stabil

Fokus:

1. membakukan fence `rg`
2. membakukan output code-oriented dasar
3. memastikan source tetap terbaca baik tanpa semantic token
4. membakukan line metadata

Acceptance:

1. `rg` selalu tampil sebagai source
2. struktur `pre > code` tetap sehat
3. fallback dasar cukup untuk dokumentasi publik

### Tahap 2. Semantic Highlight Integration

Fokus:

1. integrasi dengan `relgeo-language-service`
2. desain token taxonomy
3. token spans atau data attributes untuk semantic styling
4. fallback aman saat service belum siap

Acceptance:

1. tokenization tidak merusak source
2. semantic layer meningkatkan keterbacaan nyata
3. kegagalan semantic layer tidak mengubah kontrak dasar

### Tahap 3. Publishable Package Readiness

Fokus:

1. README publik yang jelas
2. contoh integrasi consumer umum
3. snapshot test output
4. style guidance dasar

Acceptance:

1. package dapat dipahami dan dipakai tanpa docs-site
2. output cukup stabil untuk diandalkan konsumen luar

---

## 9. Backlog Mendalam

### 9.1 Token Taxonomy

1. definisikan kategori token minimal yang penting bagi RelGeo
2. bedakan token syntax umum vs token yang khas bahasa ini
3. putuskan apakah unit, anchor ref, object id, dan keyword domain perlu kelas khusus
4. jaga agar taxonomy tidak terlalu cepat menjadi beban kompatibilitas

### 9.2 API Plugin

1. putuskan opsi mana yang betul-betul stabil
2. batasi opsi theme agar tidak mengambil alih area CSS consumer
3. sediakan hook hanya jika memang dibutuhkan lebih dari satu consumer

### 9.3 Output Stability

1. jaga struktur HTML tidak terlalu berubah-ubah
2. pisahkan clearly antara line wrapper dan token wrapper
3. pastikan output tetap copyable dan selectable dengan baik

### 9.4 Integration Stories

1. docs-site
2. markdown static site lain
3. MDX-based site
4. future spec repo site

---

## 10. Strategy Pengujian

Minimal yang dibutuhkan:

1. unit test deteksi fence `rg`
2. snapshot test output dasar tanpa semantic tokens
3. snapshot test output dengan semantic token mock
4. whitespace preservation test
5. integration test ringan dengan consumer nyata

Kasus penting:

1. line kosong
2. multiline source
3. indentation
4. source invalid tapi tetap harus tampil
5. source valid dengan metadata block

---

## 11. Risiko Yang Harus Diwaspadai

1. highlighter terlalu cepat menjadi syntax engine kedua
2. token taxonomy berubah-ubah sehingga consumer sulit mengandalkan CSS
3. docs-site styling terlalu spesifik lalu dianggap kontrak universal
4. semantic integration menambah kompleksitas tanpa peningkatan keterbacaan yang nyata

---

## 12. Kriteria Matang

`remark-relgeo-hl` dapat disebut matang bila:

1. `rg` secara konsisten menjadi cara terbaik menampilkan source RelGeo di markdown
2. source tetap nyaman dibaca tanpa semantic mode penuh
3. semantic mode, bila aktif, benar-benar menambah kejelasan
4. output stabil dan cukup generik untuk consumer lain

---

## 13. Keputusan Final Saat Ini

Keputusan yang sekarang dianggap cukup stabil untuk package ini:

1. fence aktif tetap `rg`
2. package ini tetap source-oriented
3. output dasar tetap `pre > code`
4. preview tetap di luar tanggung jawab package ini
5. semantic layer boleh berkembang, tetapi fallback source readability tetap wajib

---

## 14. Backlog Dekat

### Sudah Ditutup

1. membakukan output dasar dan line metadata sebagai kontrak tahap awal
2. merancang token taxonomy awal yang tidak terlalu besar tetapi benar-benar berguna
3. menyiapkan integration path yang sehat ke `relgeo-language-service`
4. merapikan README publik dan contoh consumer dasar

### Masih Terbuka

1. menutup snapshot test untuk output dasar

---

## 15. Backlog Nanti

Hal penting yang layak dijaga di radar, tetapi tidak perlu menahan tahap awal:

1. semantic token set yang lebih kaya
2. opsi theming yang lebih matang
3. integrasi consumer yang lebih luas di luar docs-site
4. style guidance yang lebih formal untuk publik
5. eksperimen jembatan ke highlighter lain bila memang dibutuhkan

---

## 16. Keputusan Praktis Saat Ini

1. fence aktif tetap `rg`
2. package ini tetap source-oriented
3. preview tetap menjadi tanggung jawab `remark-relgeo`
4. fallback dasar harus tetap bekerja walau semantic layer belum matang

---

## 17. Yang Belum Perlu Dipaksakan Sekarang

1. full theming engine
2. semua style preset bawaan
3. dependency renderer atau preview
4. editor-only feature yang tidak relevan bagi markdown output

Dokumen ini adalah peta pematangan package, bukan komitmen bahwa semua backlog harus langsung dikerjakan sekarang.
