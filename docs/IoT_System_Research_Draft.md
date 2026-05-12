# Draft Laporan Proyek IoT Logistic Controls

## Abstrak

Keterbatasan visibilitas pelacakan paket menjadi masalah ketika status pengiriman masih bergantung pada pencatatan manual dan tidak memiliki bukti event digital yang mudah ditelusuri. Penelitian ini bertujuan merancang dan menguji prototipe IoT Logistic Controls untuk membuktikan alur dasar pelacakan paket berbasis RFID, GPS, MQTT, backend, dan dashboard observasi. Metode yang digunakan adalah prototyping dengan simulasi perangkat ESP32/Wokwi, RFID reader PN532, GPS NEO-6M, broker Mosquitto MQTT, backend worker, PostgreSQL/Prisma, serta dashboard/API berbasis Next.js. Pengujian dilakukan melalui skenario heartbeat, telemetry GPS, scan RFID terdaftar, scan RFID tidak dikenal, duplicate scan cooldown, package timeline API, raw event API, dashboard realtime/SSE, offline timeout, dan command demonstrasi. Hasil pengujian menunjukkan bahwa perangkat dapat mengirim data ke MQTT, backend dapat memvalidasi dan menyimpan event, status perangkat dan paket dapat diperbarui, unknown scan dapat dipisahkan, serta dashboard/API dapat menampilkan bukti observasi. Dengan demikian, alur RFID + GPS + MQTT + backend + dashboard terbukti dapat digunakan untuk observasi pelacakan paket pada skala riset terbatas.

**Kata kunci:** Internet of Things, pelacakan paket, RFID, GPS, MQTT, ESP32, dashboard observasi

## Abstract

Limited visibility in package tracking becomes a problem when shipment status still depends on manual updates and lacks traceable digital event evidence. This study designs and evaluates the IoT Logistic Controls prototype to demonstrate a basic package-tracking workflow that connects RFID identification, GPS telemetry, MQTT communication, backend persistence, and an observation dashboard. The research uses a prototyping method with an ESP32/Wokwi simulated device, PN532 RFID reader, NEO-6M GPS module, local Mosquitto MQTT broker, backend worker, PostgreSQL/Prisma database, and a Next.js dashboard/API. The evaluation covers device heartbeat, GPS telemetry, known RFID scan, unknown RFID scan, duplicate scan cooldown, package timeline API, raw event API, realtime dashboard/SSE, offline timeout, and device command demonstration. The results show that the simulated device can publish MQTT events, the backend can validate and persist incoming data, device and package states can be updated, unknown scans can be isolated, and the dashboard/API can expose observation evidence. Therefore, the RFID + GPS + MQTT + backend + dashboard workflow is feasible for package tracking observation within a limited research prototype.

**Keywords:** Internet of Things, package tracking, RFID, GPS, MQTT, ESP32, observation dashboard

## 1. Pendahuluan

### 1.1 Latar Belakang

Perkembangan Internet of Things (IoT) telah mendorong perubahan signifikan pada sektor logistik. Aktivitas distribusi yang sebelumnya banyak bergantung pada pencatatan manual mulai diarahkan menuju sistem yang mampu menghubungkan perangkat fisik, jaringan komunikasi, penyimpanan data, dan antarmuka pemantauan. Dalam konteks logistik, kebutuhan utama dari transformasi ini adalah meningkatnya visibilitas terhadap pergerakan barang, status paket, dan kondisi operasional selama proses pengiriman. Sergi et al. [1] menunjukkan bahwa penerapan IoT dan teknologi cloud dapat mendukung pelacakan serta pemantauan barang secara jarak jauh, terutama ketika data dari perangkat tepi perlu dikirim, disimpan, dan dianalisis untuk kebutuhan operasional.

Visibilitas rantai pasok menjadi isu penting karena pengiriman barang melibatkan banyak titik perpindahan, perangkat, dan aktor operasional. Keterbatasan informasi pada salah satu titik dapat menyebabkan keterlambatan pembaruan status, kesulitan menelusuri posisi paket, serta rendahnya kemampuan sistem dalam menyediakan bukti digital terhadap aktivitas pengiriman. Ahmed et al. [2] menegaskan bahwa IoT berperan dalam meningkatkan visibilitas rantai pasok melalui integrasi data antar pihak, meskipun penerapannya tetap memerlukan rancangan sistem, interoperabilitas, dan tata kelola data yang jelas. Pada skala operasional sederhana, permasalahan tersebut dapat dirumuskan sebagai kebutuhan untuk mengidentifikasi paket, mengaitkan paket dengan lokasi perangkat, mengirim data perangkat ke backend, dan menampilkan riwayat peristiwa secara mudah diamati.

Berbagai penelitian terdahulu telah membahas pemanfaatan IoT dalam logistik dari beberapa sudut pandang. Chen et al. [3] mengkaji integrasi IoT dan blockchain untuk mendukung penentuan lokasi gudang dalam sistem transportasi logistik cerdas. Kvak dan Straka [4] membahas penggunaan IoT dalam distribusi barang konsumsi, yang menunjukkan relevansi sensor dan konektivitas data pada proses distribusi. Sementara itu, Hsu et al. [5] menempatkan smart logistics sebagai bagian dari arah perkembangan Industry 5.0, dengan penekanan pada faktor pendukung strategis seperti integrasi teknologi digital, kolaborasi pemangku kepentingan, dan keamanan informasi. Kajian-kajian tersebut memperlihatkan bahwa IoT telah menjadi fondasi penting dalam modernisasi logistik, baik pada level platform, strategi, maupun optimasi proses.

Meskipun demikian, masih terdapat ruang penelitian pada tingkat prototipe terbatas yang berfokus pada pembuktian aliran data pelacakan paket secara end-to-end. Banyak penelitian membahas arsitektur, kerangka strategis, optimasi, atau aspek keamanan pada level konseptual dan sistem yang lebih luas. Penelitian ini mengambil ruang yang lebih sempit, yaitu memvalidasi prototipe pelacakan paket yang mengintegrasikan identifikasi RFID, telemetry GPS, komunikasi MQTT, persistence backend, dan dashboard observasi. Fokus tersebut penting karena sistem pelacakan logistik tidak hanya memerlukan konsep teknologi, tetapi juga pembuktian bahwa data dari perangkat dapat dikirim, divalidasi, disimpan, dan ditampilkan secara konsisten dalam skenario pengujian yang dapat diulang.

Berdasarkan permasalahan tersebut, penelitian ini mengembangkan prototipe sistem pelacakan paket logistik berbasis IoT menggunakan simulasi perangkat ESP32, RFID, GPS, MQTT, backend berbasis database, dan dashboard/API sederhana. Prototipe ini tidak ditujukan sebagai platform logistik komersial penuh, melainkan sebagai media penelitian untuk membuktikan alur dasar pelacakan paket. Urgensi penelitian terletak pada penyediaan rancangan dan implementasi yang murah, terukur, serta mudah diamati untuk menunjukkan bagaimana data scan RFID dan telemetry GPS dapat digunakan sebagai dasar pembaruan status dan lokasi paket. Dengan demikian, tujuan umum penelitian ini adalah merancang dan mengevaluasi prototipe pelacakan paket logistik berbasis IoT pada ruang lingkup simulasi yang terkendali.

### 1.2 Rumusan Masalah

Berdasarkan latar belakang tersebut, rumusan masalah dalam penelitian ini adalah sebagai berikut:

1. Bagaimana merancang arsitektur prototipe sistem pelacakan paket logistik berbasis IoT yang mengintegrasikan RFID, GPS, MQTT, backend, dan dashboard?
2. Bagaimana mengimplementasikan simulasi ESP32 untuk mengirim telemetry GPS, heartbeat, dan event scan RFID melalui MQTT?
3. Bagaimana backend memvalidasi payload MQTT, menyimpan event, memperbarui status perangkat, mencatat event paket, dan mengelola data paket internal?
4. Bagaimana dashboard/API digunakan untuk mengamati status perangkat, riwayat event, timeline paket, dan data paket?
5. Bagaimana hasil pengujian prototipe pada skenario telemetry, heartbeat, scan RFID terdaftar, scan RFID tidak dikenal, pengelolaan data paket, dan pembaruan status paket

### 1.3 Tujuan Penelitian

Tujuan dari penelitian ini adalah sebagai berikut:

1. Merancang arsitektur prototipe pelacakan paket logistik berbasis IoT yang mengintegrasikan RFID, GPS, MQTT, backend, dan dashboard/API.
2. Mengimplementasikan simulasi ESP32 berbasis Wokwi sebagai perangkat mobile untuk membaca tag RFID dan mengirim telemetry GPS.
3. Mengimplementasikan komunikasi MQTT untuk pengiriman telemetry, heartbeat, dan event scan dari perangkat ke backend.
4. Mengembangkan backend untuk validasi payload, penyimpanan event, pembaruan state perangkat, pencatatan event paket, dan pemisahan scan RFID tidak dikenal.
5. Menyediakan dashboard/API untuk observasi device state, event feed, package timeline, dan pengelolaan data paket internal.
6. Menguji prototipe berdasarkan skenario pengiriman data, penyimpanan event, pengelolaan data paket, dan pembaruan status paket.

### 1.4 Manfaat Penelitian

Manfaat yang diharapkan dari penelitian ini adalah sebagai berikut:

1. Memberikan kontribusi akademik berupa rancangan dan implementasi prototipe pelacakan paket logistik berbasis IoT dalam ruang lingkup simulasi.
2. Menunjukkan integrasi RFID dan GPS untuk menghubungkan identitas paket dengan lokasi perangkat pada skenario logistik sederhana.
3. Memberikan contoh penerapan MQTT, validasi backend, dan database persistence dalam alur data IoT yang dapat ditelusuri melalui raw event.
4. Menyediakan referensi praktis pengembangan sistem IoT end-to-end, mulai dari perangkat, komunikasi, backend, hingga dashboard observasi.
5. Menjadi dasar bagi penelitian lanjutan terkait perangkat fisik, keamanan broker, autentikasi, geofence, peta interaktif, notifikasi, dan optimasi rute.

### 1.5 Batasan Masalah

Agar penelitian lebih terarah dan sesuai dengan kapasitas prototipe, batasan masalah dalam penelitian ini adalah sebagai berikut:

1. Sistem yang dikembangkan merupakan prototipe penelitian, bukan sistem logistik komersial atau deployment produksi.
2. Perangkat IoT dimodelkan melalui simulasi ESP32/Wokwi, dengan komponen berupa ESP32, PN532 RFID/NFC reader, GPS NEO6M, LED, resistor, breadboard, dan kabel jumper.
3. Paket direpresentasikan sebagai tag RFID deterministik dengan jumlah terbatas sesuai skala prototipe.
4. Lokasi paket menggunakan pendekatan device-centric, yaitu lokasi GPS perangkat mobile dikaitkan dengan paket setelah tag RFID terbaca.
5. Komunikasi data dibatasi pada broker MQTT lokal untuk telemetry, heartbeat, scan event, dan command demonstrasi.
6. Backend dibatasi pada validasi payload, penyimpanan event, pembaruan status perangkat, pencatatan package event, telemetry, heartbeat, unknown scan, serta package CRUD internal.
7. Database menggunakan PostgreSQL dengan Prisma ORM untuk kebutuhan penyimpanan data prototipe.
8. Dashboard/API hanya digunakan untuk observasi penelitian, meliputi status perangkat, event feed, command sederhana, package timeline, dan pengelolaan data paket internal.
9. Penelitian tidak mencakup customer portal, RBAC, peta interaktif, geofence, notifikasi, email, optimasi rute, estimasi kedatangan, multi-tenant deployment, maupun pengujian skalabilitas besar.
10. Aspek keamanan produksi seperti HTTPS, autentikasi penuh, otorisasi, broker ACL, dan hardening infrastruktur tidak diimplementasikan, tetapi dicatat sebagai keterbatasan dan arah pengembangan.

## 2. Tinjauan Pustaka

### 2.1 Konsep dan Teori Dasar

Internet of Things (IoT) merupakan konsep yang menghubungkan perangkat fisik, sensor, aktuator, jaringan komunikasi, penyimpanan data, dan aplikasi agar objek di lingkungan nyata dapat menghasilkan data digital. Pada sistem logistik, IoT digunakan untuk meningkatkan visibilitas perpindahan barang melalui pencatatan event, pembacaan sensor, pelacakan aset, dan pemantauan kondisi operasional. Sergi et al. [1] menjelaskan bahwa sistem logistik berbasis IoT dan cloud dapat mendukung pelacakan barang, komunikasi perangkat, dan pengelolaan data pemantauan secara terhubung.

Visibilitas rantai pasok berkaitan dengan kemampuan sistem untuk menyediakan informasi tentang posisi, status, dan riwayat pergerakan barang. Ahmed et al. [2] menempatkan IoT sebagai salah satu pendukung supply chain visibility karena data dari perangkat dapat dibagikan dan digunakan oleh aktor rantai pasok. Namun, visibilitas tidak otomatis muncul hanya karena penggunaan sensor. Sistem tetap memerlukan integrasi data, interoperabilitas, dan rancangan tata kelola yang menentukan bagaimana data dikumpulkan, divalidasi, disimpan, dan digunakan [2].

Radio Frequency Identification (RFID) merupakan teknologi identifikasi objek menggunakan komunikasi radio antara tag dan reader. Dalam rantai pasok, RFID digunakan untuk mengidentifikasi produk, paket, kontainer, atau aset tanpa bergantung pada pencatatan manual. Tan dan Sidhu [6] menyebut integrasi RFID dan IoT sebagai RFID-IoT, yaitu pendekatan yang menggabungkan identifikasi otomatis dengan konektivitas internet untuk mendukung otomasi sensing, visibilitas, dan interoperabilitas proses supply chain.

Global Positioning System (GPS) menyediakan informasi posisi geografis perangkat. Pada pelacakan logistik, GPS sering dikombinasikan dengan identitas barang agar catatan pengiriman tidak hanya berisi status, tetapi juga lokasi. C.-L. Chen et al. [7] menunjukkan pola tersebut melalui sistem logistik yang menggabungkan RFID dan GPS, yaitu identitas barang diperoleh dari pembacaan RFID, sedangkan lokasi diperoleh dari mobile reader yang memiliki kemampuan GPS. Kombinasi ini penting karena RFID menjawab pertanyaan "barang apa yang terbaca", sedangkan GPS menjawab "di mana perangkat pembaca berada".

Message Queuing Telemetry Transport (MQTT) adalah protokol komunikasi ringan berbasis publish/subscribe. Silva et al. [8] menjelaskan bahwa MQTT dirancang untuk pemantauan jarak jauh, komunikasi asinkron, dan distribusi data melalui broker. Dalam model tersebut, publisher mengirim pesan ke topic, broker menerima pesan, lalu subscriber yang berlangganan topic terkait menerima data. Karakteristik ini membuat MQTT banyak digunakan dalam sistem IoT yang memerlukan pengiriman telemetry, event sensor, atau status perangkat secara periodik.

ESP32 merupakan microcontroller yang umum digunakan pada prototipe IoT karena mendukung konektivitas jaringan dan integrasi sensor. D'Ortona et al. [9] menggunakan ESP32 sebagai node sensor dalam sistem IoT end-to-end berbasis MQTT dan web control panel. Wokwi sebagai simulator microcontroller dapat ditempatkan sebagai media prototyping untuk menguji alur perangkat tanpa harus langsung menggunakan perangkat fisik, terutama ketika tujuan awal adalah validasi perilaku logika, format payload, dan komunikasi sistem.

### 2.2 Kelompok Penelitian Terdahulu

Secara umum, kajian terdahulu menunjukkan bahwa penerapan Internet of Things (IoT) dalam logistik berkembang dari fungsi pemantauan operasional menuju sistem logistik cerdas yang terintegrasi, terlacak, dan strategis. Pada aspek visibilitas dan pemantauan logistik, Sergi et al. [1] menekankan peran IoT dan cloud dalam membangun sistem logistik cerdas yang mampu mendukung pelacakan, pemantauan, serta keamanan data. Sejalan dengan itu, Ahmed et al. [2] menjelaskan bahwa kontribusi utama IoT dalam rantai pasok terletak pada kemampuannya meningkatkan supply chain visibility melalui pertukaran data antar-aktor. Kvak dan Straka [4] juga memperlihatkan bahwa pemanfaatan sensor dan konektivitas data dalam distribusi barang konsumsi dapat memperkuat efektivitas proses distribusi. Dengan demikian, IoT berperan penting dalam menyediakan data real-time yang mendukung transparansi dan pengambilan keputusan dalam aktivitas logistik.

Selain visibilitas, aspek identifikasi dan keterlacakan juga menjadi perhatian penting dalam pengembangan sistem logistik berbasis IoT. C.-L. Chen et al. [7] mengintegrasikan RFID, GPS, dan blockchain untuk membangun sistem logistik yang traceable dan verifiable. Dalam pendekatan tersebut, RFID berfungsi sebagai identitas barang, GPS menyediakan informasi lokasi, sedangkan blockchain menjaga integritas dan keandalan catatan transaksi. Tan dan Sidhu [6] turut menegaskan bahwa integrasi RFID dan IoT dalam supply chain management dapat mendukung otomasi identifikasi, pelacakan barang, serta peningkatan efisiensi proses. Hal ini menunjukkan bahwa kombinasi teknologi identifikasi, pelacakan lokasi, dan penyimpanan data yang aman merupakan fondasi penting bagi sistem logistik yang transparan dan dapat diverifikasi.

Dari sisi arsitektur komunikasi, penelitian sebelumnya menekankan pentingnya pemilihan infrastruktur dan protokol yang sesuai untuk mendukung sistem IoT secara end-to-end. D’Ortona et al. [9] menunjukkan bahwa perangkat ESP32, MQTT broker, dan panel kontrol berbasis web dapat diintegrasikan dalam sistem IoT open-source, sehingga memperjelas peran broker sebagai penghubung antara perangkat edge dan aplikasi pemantauan. Sementara itu, Silva et al. [8] membandingkan MQTT, CoAP, dan OPC UA serta menunjukkan bahwa pemilihan protokol komunikasi harus disesuaikan dengan kebutuhan transport data, karakteristik komunikasi, dan skenario implementasi. Dengan demikian, keberhasilan sistem IoT logistik tidak hanya bergantung pada perangkat sensor, tetapi juga pada rancangan arsitektur komunikasi yang andal, efisien, dan sesuai dengan konteks penggunaan.

Pada tingkat yang lebih strategis, IoT dalam logistik juga dikaitkan dengan optimasi sistem, tata kelola teknologi, dan transformasi menuju smart logistics. J. Chen et al. [3] menghubungkan IoT dan blockchain dengan optimasi lokasi gudang dalam sistem transportasi logistik cerdas. Hsu et al. [5] memperluas pembahasan smart logistics menuju Industry 5.0 dengan menekankan pentingnya integrasi teknologi digital, kolaborasi pemangku kepentingan, keberlanjutan, dan keamanan informasi. Temuan ini menunjukkan bahwa implementasi IoT dalam logistik tidak dapat dipahami hanya sebagai penggunaan sensor dan konektivitas, tetapi juga sebagai bagian dari desain sistem, strategi operasional, dan tata kelola teknologi yang lebih luas.

Dapat disimpulkan bahwa penelitian terkait IoT dalam logistik mencakup empat dimensi utama, yaitu visibilitas operasional, identifikasi dan keterlacakan, arsitektur komunikasi, serta strategi smart logistics. Keempat dimensi tersebut saling melengkapi dalam membentuk sistem logistik cerdas yang mampu menyediakan data real-time, meningkatkan efisiensi proses, menjamin integritas informasi, dan mendukung pengambilan keputusan strategis.

### 2.3 Perbandingan Temuan Penelitian Terdahulu

**Tabel 1 State of The Art Sistem Logistik**

| No  | Penelitian            | Tahun | Metode                                                                                     | Hasil Utama                                                                                                                    |
| --- | --------------------- | ----: | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Sergi et al. [1]      |  2021 | Perancangan sistem logistik berbasis IoT dan cloud                                         | IoT dan cloud mendukung pelacakan barang, pemantauan jarak jauh, dan pengelolaan data logistik secara terhubung.               |
| 2   | Ahmed et al. [2]      |  2021 | Review dyadic analysis tentang IoT untuk supply chain visibility                           | IoT meningkatkan visibilitas rantai pasok, tetapi membutuhkan integrasi, interoperabilitas, dan tata kelola data.              |
| 3   | C.-L. Chen et al. [6] |  2021 | Perancangan sistem logistik traceable menggunakan GPS, RFID, dan blockchain                | RFID dapat mengidentifikasi barang, sedangkan GPS dari mobile reader dapat melengkapi catatan lokasi pengiriman.               |
| 4   | D'Ortona et al. [7]   |  2022 | Implementasi sistem IoT end-to-end open-source berbasis ESP32, MQTT, dan web control panel | MQTT broker dapat menghubungkan node perangkat dengan aplikasi pemantauan berbasis web.                                        |
| 5   | Silva et al. [8]      |  2021 | Evaluasi protokol MQTT, CoAP, dan OPC UA pada skenario IoT                                 | MQTT relevan untuk komunikasi IoT berbasis publish/subscribe, meskipun performa bergantung pada skenario dan kebutuhan sistem. |
| 6   | Kvak dan Straka [4]   |  2024 | Kajian penerapan IoT pada distribusi barang konsumsi                                       | IoT berperan dalam pengumpulan dan pemanfaatan data distribusi untuk meningkatkan proses logistik.                             |
| 7   | Hsu et al. [5]        |  2024 | Analisis enabler dan roadmap smart logistics menuju Industry 5.0                           | Smart logistics membutuhkan integrasi teknologi digital, kolaborasi stakeholder, dan perhatian pada keamanan informasi.        |
| 8   | Tan dan Sidhu [9]     |  2022 | Systematic review integrasi RFID dan IoT dalam supply chain management                     | RFID-IoT mendukung otomasi sensing, visibilitas proses, dan pengembangan sistem supply chain yang lebih terhubung.             |

Perbandingan temuan pada Tabel 1 menunjukkan empat pola utama. Pertama, IoT diposisikan sebagai teknologi pendukung visibilitas logistik melalui data perangkat, cloud, dan integrasi proses [1], [2], [4]. Kedua, RFID digunakan sebagai metode identifikasi objek, sedangkan GPS digunakan untuk menambahkan konteks lokasi pada catatan logistik [6], [7]. Ketiga, MQTT digunakan sebagai protokol komunikasi yang sesuai untuk pengiriman data IoT berbasis event dan telemetry [8], [9]. Keempat, smart logistics pada level strategis memerlukan integrasi yang lebih luas, termasuk optimasi, kolaborasi, keamanan, dan roadmap transformasi digital [3], [5].

Perbedaan utama antar studi terletak pada cakupan dan titik beratnya. Studi IoT-cloud dan smart logistics cenderung menekankan arsitektur luas, strategi, dan faktor pendukung sistem [1], [3], [5]. Studi RFID-GPS lebih dekat dengan traceability objek karena memetakan identitas barang dengan lokasi perangkat pembaca [6], [7]. Studi MQTT dan sistem end-to-end memberi dasar teknis tentang bagaimana data dari perangkat dapat mengalir ke aplikasi pemantauan [8], [9]. Dengan demikian, literatur menunjukkan keterkaitan antara identifikasi, lokasi, komunikasi, penyimpanan, dan visualisasi, tetapi tiap kelompok biasanya menonjolkan salah satu aspek tertentu.

### 2.5 Kerangka Pemikiran

Kerangka pemikiran penelitian ini berangkat dari permasalahan rendahnya visibilitas pelacakan paket ketika pencatatan status masih dilakukan secara manual. Permasalahan tersebut menimbulkan kebutuhan terhadap sistem yang mampu mengidentifikasi paket, merekam lokasi perangkat pembaca, mengirim data ke backend, menyimpan event sebagai bukti, serta menampilkan riwayat paket secara teramati.

Berdasarkan sintesis literatur, penelitian ini diposisikan sebagai pembuktian prototipe end-to-end berskala kecil, bukan sebagai pengembangan platform logistik produksi. Fokus penelitian diarahkan pada integrasi minimum antara RFID sebagai identitas paket, GPS sebagai konteks lokasi perangkat, MQTT sebagai kanal komunikasi event, backend sebagai media validasi dan penyimpanan data, serta dashboard/API sebagai sarana observasi.

Dengan demikian, solusi yang dirancang berupa prototipe IoT berbasis pendekatan device-centric. Dalam pendekatan ini, identitas paket diperoleh melalui RFID, lokasi diperoleh dari GPS perangkat mobile, data dikirim melalui MQTT, diproses dan disimpan oleh backend, kemudian diamati melalui dashboard/API. Hubungan antar komponen tersebut ditunjukkan pada Gambar II.1.

```text
RFID package scan + GPS telemetry
  -> ESP32/Wokwi simulated device
  -> MQTT broker
  -> backend validation and persistence
  -> PostgreSQL/Prisma database
  -> dashboard/API observation
```

GAMBAR II.1 KERANGKA PEMIKIRAN

Dengan kerangka tersebut, keberhasilan penelitian diukur dari kemampuan prototipe mengirim heartbeat, telemetry, dan scan event; menyimpan raw event; memperbarui status perangkat dan paket; memisahkan unknown RFID scan; serta menampilkan event melalui dashboard/API.

## 3. Metodologi Penelitian

### 3.1 Metode Penelitian

Metode penelitian yang digunakan adalah metode prototyping dengan pendekatan perancangan dan pengujian skenario. Metode ini dipilih karena objek penelitian berupa sistem IoT yang perlu dibuktikan melalui alur kerja perangkat, komunikasi data, backend, database, dan dashboard. Fokus metodologi bukan membangun platform logistik produksi, melainkan merancang prototipe terbatas yang dapat menunjukkan apakah event RFID dan telemetry GPS dapat dikirim, disimpan, dan diamati secara konsisten.

Prototipe disusun menggunakan simulasi perangkat ESP32 berbasis Wokwi, broker MQTT lokal, backend worker, PostgreSQL/Prisma, dan dashboard Next.js. Pengujian dilakukan melalui skenario operasional yang mewakili alur dasar pelacakan paket, seperti heartbeat perangkat, pengiriman telemetry GPS, scan RFID terdaftar, scan RFID tidak dikenal, duplicate scan, pembacaan timeline paket, dan observasi dashboard. Dengan metode ini, setiap komponen diuji berdasarkan bukti event, log, API response, atau tampilan dashboard, bukan berdasarkan asumsi desain semata.

### 3.2 Tahapan Penelitian

Tahapan penelitian disusun agar proses perancangan dan pengujian prototipe berjalan sistematis. Tahapan tersebut adalah sebagai berikut:

1. Identifikasi masalah, yaitu menentukan masalah utama berupa keterbatasan visibilitas pelacakan paket dan kebutuhan pencatatan event berbasis perangkat.
2. Studi literatur, yaitu mengkaji IoT, RFID, GPS, MQTT, smart logistics, dan penelitian terdahulu yang relevan dengan pelacakan logistik.
3. Analisis kebutuhan sistem, yaitu menentukan kebutuhan perangkat, perangkat lunak, data, dan batasan prototipe.
4. Perancangan sistem, yaitu menyusun arsitektur IoT, alur komunikasi MQTT, relasi perangkat-paket, dan alur observasi dashboard.
5. Implementasi prototipe, yaitu menyiapkan simulasi ESP32/Wokwi, broker MQTT, backend worker, database, API, dan dashboard.
6. Pengujian sistem, yaitu menjalankan skenario heartbeat, telemetry, scan RFID, unknown scan, duplicate scan, timeline API, dan observasi dashboard.
7. Analisis hasil, yaitu membandingkan hasil pengujian dengan tujuan dan batasan penelitian.
8. Penarikan kesimpulan, yaitu merumuskan pencapaian, keterbatasan, dan saran pengembangan.

### 3.3 Analisis Kebutuhan Sistem

Analisis kebutuhan sistem dibagi menjadi kebutuhan perangkat keras/simulasi dan kebutuhan perangkat lunak. Karena penelitian ini dibatasi sebagai prototipe simulasi, komponen fisik diposisikan sebagai model perangkat yang direpresentasikan di Wokwi. Tabel 2 menunjukkan komponen utama yang digunakan untuk membentuk perangkat IoT mobile, membaca identitas paket, menghasilkan telemetry lokasi, dan memberi indikator status perangkat.

**Tabel 2 Kebutuhan hardware dan Komponen IoT**

|  No | Komponen        | Modul                 | Spesifikasi                                                                    | Fungsi                                                               |
| --: | --------------- | --------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
|   1 | Microcontroller | ESP32                 | WiFi-capable microcontroller, disimulasikan di Wokwi                           | Pusat kendali perangkat, koneksi jaringan, dan publisher MQTT.       |
|   2 | GPS             | NEO-6M                | Modul GPS simulasi dengan data latitude, longitude, speed, dan fix state       | Menyediakan telemetry lokasi perangkat mobile.                       |
|   3 | RFID Reader     | PN532                 | Reader RFID/NFC berbasis I2C pada simulasi Wokwi                               | Membaca UID/tag paket dan memicu scan event.                         |
|   4 | RFID Tag        | Simulated card/tag    | UID deterministik seperti `DEADBEEF` dan `CAFEBABE`                            | Merepresentasikan identitas paket yang dipetakan ke EPC/tracking ID. |
|   5 | Indikator       | LED                   | LED status WiFi, MQTT, RFID, dan GPS                                           | Memberi indikasi visual kondisi koneksi dan pembacaan perangkat.     |
|   6 | Resistor        | Resistor simulasi     | Komponen pendukung rangkaian LED                                               | Membatasi arus pada rangkaian indikator.                             |
|   7 | Breadboard      | Breadboard simulasi   | Media perakitan rangkaian virtual                                              | Menghubungkan komponen simulasi perangkat.                           |
|   8 | Kabel           | Kabel jumper          | Koneksi antar pin ESP32, GPS, PN532, dan LED                                   | Menghubungkan jalur data dan daya pada simulasi.                     |
|   9 | Laptop          | Komputer pengembangan | Menjalankan editor, Wokwi/PlatformIO, broker, backend, database, dan dashboard | Lingkungan pengembangan dan pengujian lokal.                         |

Kebutuhan perangkat lunak meliputi alat untuk firmware, simulasi, komunikasi, backend, database, dan dashboard. Tabel 3 menunjukkan perangkat lunak yang digunakan dalam pengembangan dan pengujian prototipe.

**Tabel 3 Kebutuhan Software Pengembangan dan Deployment IoT**

|  No | Perangkat Lunak       | Fungsi                                                                             |
| --: | --------------------- | ---------------------------------------------------------------------------------- |
|   1 | Visual Studio Code    | Editor untuk firmware, backend, frontend, dan dokumentasi.                         |
|   2 | PlatformIO            | Build dan manajemen project firmware ESP32.                                        |
|   3 | Wokwi CLI & Simulator | Menjalankan simulasi ESP32, PN532, GPS, dan skenario RFID.                         |
|   4 | Mosquitto             | Broker MQTT lokal untuk telemetry, scan, heartbeat, dan command.                   |
|   5 | Node.js / pnpm        | Runtime dan package manager untuk backend worker dan aplikasi Next.js.             |
|   6 | Next.js               | Framework API route dan dashboard SimCon.                                          |
|   7 | MQTT.js               | MQTT client pada backend untuk subscribe/publish topic perangkat.                  |
|   8 | Zod                   | Validasi schema payload telemetry, scan, heartbeat, dan command.                   |
|   9 | Prisma                | ORM untuk akses data perangkat, paket, event, telemetry, heartbeat, dan raw event. |
|  10 | PostgreSQL            | Database penyimpanan data prototipe dan bukti event.                               |

### 3.4 Perancangan Sistem

Perancangan sistem menggunakan arsitektur IoT berlapis. Gambar III.1 menunjukkan hubungan antara perception layer, network layer, dan application layer. Perception layer berisi warehouse device, fleet device, dan package tag. Package tag berperan sebagai identitas pasif paket, sedangkan fleet device membaca tag dan membawa telemetry lokasi. Dalam ruang lingkup penelitian ini, perangkat difokuskan pada simulasi mobile device dengan RFID dan GPS.

GAMBAR III.1 ARSITEKTUR IOT LOGISTIC CONTROLS

Network layer pada Gambar III.1 berisi MQTT message broker sebagai penghubung antara perangkat dan aplikasi. Perangkat menerbitkan heartbeat, telemetry, dan scan event ke broker. Backend service berlangganan topic yang relevan, menerima payload, lalu memproses data berdasarkan jenis event. Pemisahan melalui broker membuat perangkat tidak berkomunikasi langsung dengan dashboard, sehingga alur data dapat dikendalikan melalui backend.

Application layer berisi backend service, PostgreSQL, dan Next.js dashboard. Backend service bertugas memvalidasi payload, menyimpan raw event, memperbarui device state, mencatat package event, dan menyimpan unknown scan jika EPC tidak ditemukan. PostgreSQL digunakan sebagai media persistence, sedangkan dashboard digunakan untuk observasi status perangkat, event feed, dan package timeline. Dengan rancangan ini, arsitektur prototipe mengikuti alur: perangkat menghasilkan data, MQTT mengirim data, backend memproses data, database menyimpan data, dan dashboard menampilkan data.

### 3.5 Flowchart Sistem

Gambar III.2 menunjukkan flowchart sistem dalam bentuk swimlane yang memisahkan peran package, device, app/database/network, dan dashboard. Alur dimulai dari paket yang sudah terdaftar dan memiliki tag RFID. Pada sisi perangkat, device melakukan setup, terhubung ke WiFi dan MQTT, lalu menerbitkan heartbeat. Heartbeat diterima backend dan ditampilkan pada dashboard sebagai status perangkat online.

GAMBAR III.2 FLOWCHART SYSTEM

Setelah koneksi awal terbentuk, perangkat memperoleh data GPS dan menerbitkan telemetry. Backend menerima telemetry, menyimpan data, dan memperbarui informasi lokasi perangkat. Dashboard kemudian menampilkan data lokasi atau status GPS sebagai bagian dari observasi sistem. Alur ini digunakan untuk memeriksa apakah data lokasi perangkat dapat sampai ke backend dan tersedia untuk kebutuhan pelacakan.

Pada alur scan, PN532 membaca RFID tag paket. Perangkat menerbitkan scan event melalui MQTT. Backend menerima scan, melakukan lookup EPC ke data paket, lalu memperbarui tracking paket jika EPC terdaftar. Setelah package tracking update dibuat, raw event tetap dicatat sebagai bukti data masuk. Dashboard menampilkan pembaruan daftar paket dan event update agar perubahan dapat diamati oleh peneliti/operator.

Flowchart juga memuat skenario kegagalan koneksi. Jika heartbeat tidak diterima dalam periode tertentu, backend dapat menandai perangkat sebagai offline dan dashboard memperbarui daftar perangkat. Jika perangkat mencoba reconnect, event yang tertahan dapat dikirim kembali sesuai mekanisme buffer pada firmware. Alur ini penting untuk menggambarkan bahwa sistem tidak hanya menguji event normal, tetapi juga kondisi koneksi terputus dan pemulihan koneksi.

### 3.6 Skenario Implementasi

Skenario implementasi disusun mengikuti urutan komponen dari infrastruktur ke observasi. Pertama, Mosquitto dijalankan sebagai broker MQTT lokal. Kedua, PostgreSQL dipastikan aktif dan Prisma digunakan untuk menyiapkan schema serta seed data yang berisi fasilitas, perangkat, dan paket/tag uji. Ketiga, backend worker dijalankan untuk berlangganan topic telemetry, scan, dan heartbeat dari perangkat.

Setelah backend siap, simulasi ESP32/Wokwi dijalankan dengan konfigurasi perangkat mobile, modul GPS, PN532, dan RFID tag simulasi. Perangkat mengirim heartbeat untuk menunjukkan status hidup, telemetry untuk posisi perangkat, dan scan event ketika tag terbaca. Event dikirim ke MQTT broker dan diproses backend. Dashboard `/simcon` dibuka untuk mengamati device state, terminal event feed, package event evidence, dan command panel bila skenario command ikut diuji.

Skenario implementasi utama meliputi pickup paket terdaftar, pembacaan dua paket, duplicate scan cooldown, scan RFID tidak dikenal, telemetry GPS periodik, heartbeat perangkat, offline timeout, dan command demonstrasi seperti force scan atau set cooldown. Setiap skenario diarahkan untuk menghasilkan bukti berupa log simulasi, raw MQTT event, data database, API response, atau tampilan dashboard.

### 3.7 Metode Pengujian

Metode pengujian dilakukan berbasis skenario. Parameter utama yang diamati adalah keberhasilan pengiriman data, kesesuaian payload, penyimpanan raw event, pembaruan state perangkat, pembaruan status paket, pemisahan unknown scan, dan keterlihatan data pada API/dashboard. Tabel 4 menunjukkan skenario uji yang digunakan untuk mengevaluasi prototipe.

**Tabel 4 Metode Pengujian Sistem**

| ID Pengujian | Skenario                | Observasi Utama                           | Kriteria Keberhasilan                                   |
| ------------ | ----------------------- | ----------------------------------------- | ------------------------------------------------------- |
| TC-01        | Device heartbeat        | Heartbeat MQTT, device state, raw event   | Heartbeat diterima, event tersimpan, perangkat online.  |
| TC-02        | GPS telemetry           | Koordinat, timestamp, telemetry record    | Posisi perangkat tersimpan dan tampil di API/dashboard. |
| TC-03        | Scan RFID terdaftar     | Scan payload, EPC lookup, package event   | EPC dikenali, event dibuat, timeline paket terbarui.    |
| TC-04        | Scan RFID tidak dikenal | Unknown scan, raw event                   | Unknown scan tercatat tanpa mengubah paket terdaftar.   |
| TC-05        | Duplicate scan cooldown | Jumlah event, duplicate handling          | Scan berulang tidak membuat pembaruan ganda.            |
| TC-06        | Package timeline API    | Response timeline, urutan event           | API menampilkan riwayat event sesuai hasil scan.        |
| TC-07        | Raw event API           | Raw telemetry, scan, heartbeat            | Raw event tersedia sebagai bukti data MQTT masuk.       |
| TC-08        | Dashboard realtime/SSE  | Device list, event feed, package evidence | Dashboard memperbarui data tanpa reload manual.         |
| TC-09        | Offline timeout         | Status perangkat, offline detector        | Perangkat menjadi offline setelah heartbeat timeout.    |
| TC-10        | Command demonstrasi     | DeviceCommand, MQTT command event         | Command tercatat dan dikirim ke topic perangkat.        |

Pengujian non-disruptive dilakukan pada 9 Mei 2026 dengan kondisi client, worker, perangkat simulasi, dan PostgreSQL sudah berjalan. Pengujian ini tidak menghentikan heartbeat perangkat dan tidak mengirim command baru ke perangkat, sehingga TC-09 dan TC-10 tidak dieksekusi pada putaran ini. Bukti pengujian disimpan pada `logs/tc-nondisruptive-2026-05-09-results.md`, output API pada `logs/tc-nondisruptive-2026-05-09-api-output.txt`, output database read-only pada `logs/tc-nondisruptive-2026-05-09-db-readonly-output.txt`, bukti Next Devtools pada `logs/tc-nondisruptive-2026-05-09-next-devtools-output.txt`, serta screenshot dashboard pada `logs/tc-08-simcon-dashboard-2026-05-09.png` dan `logs/tc-07-tc-08-terminal-feed-2026-05-09.png`.

Hasil pengujian tidak dinilai sebagai performa produksi. Evaluasi dibatasi pada bukti bahwa alur data prototipe berjalan sesuai skenario penelitian. Aspek seperti autentikasi produksi, broker ACL, geofence, live map, customer portal, ETA, route optimization, dan skalabilitas besar tidak menjadi parameter pengujian utama karena berada di luar batasan penelitian.

## 4. Hasil dan Pembahasan

### 4.1 Hasil Implementasi Sistem

Berdasarkan hasil implementasi, prototipe Logistic Controls berhasil dibangun sebagai sistem pelacakan paket logistik berbasis IoT dalam ruang lingkup simulasi. Sistem menggunakan ESP32 pada Wokwi sebagai perangkat mobile, PN532 sebagai RFID reader, GPS NEO-6M sebagai sumber telemetry lokasi, Mosquitto sebagai broker MQTT lokal, backend worker sebagai pemroses event, PostgreSQL/Prisma sebagai media penyimpanan, serta API dan dashboard `/simcon` sebagai sarana observasi.

Implementasi tersebut membentuk alur end-to-end dari pembacaan tag RFID dan telemetry GPS pada perangkat, pengiriman data melalui MQTT, validasi dan persistence pada backend, hingga penyajian status perangkat, raw event, dan package timeline pada dashboard/API. Dengan rancangan tersebut, sistem dapat digunakan untuk membuktikan keterhubungan antara identitas paket, lokasi perangkat pembaca, event komunikasi, database, dan antarmuka pemantauan dalam skenario penelitian yang terkendali.

#### 4.1.1 Implementasi Perangkat/Device Layer

Rancangan perangkat Logistic Controls diimplementasikan pada platform simulasi IoT populer Wokwi. Gambar IV.1 menjelaskan diagram perangkat yang tersusun dari microcontroller ESP32, RFID reader PN532, GPS NEO-6M, beserta indikator-indikator LED sebagai sinyal status perangkat meliputi konektivitas WiFi dan MQTT, status GPS, dan status pembacaan RFID.

Pada sisi firmware, ESP32 dikembangkan untuk menjalankan fungsi perangkat mobile logistik. Perangkat melakukan koneksi WiFi dan MQTT, menerbitkan heartbeat secara periodik, mengirim telemetry GPS, serta menerbitkan event scan ketika PN532 membaca tag RFID. Telemetry GPS berisi koordinat, kecepatan, status fix, dan urutan data, sedangkan heartbeat digunakan untuk menunjukkan status hidup perangkat dan menjadi dasar deteksi online atau offline pada backend.

RFID tag pada simulasi direpresentasikan menggunakan UID deterministik, antara lain `DEADBEEF` dan `CAFEBABE`, yang dipetakan ke identitas paket uji. Ketika tag terbaca, firmware membentuk payload scan berisi identitas perangkat, EPC paket, konteks scan, timestamp, dan data lokasi perangkat. Sistem juga menerapkan duplicate scan cooldown agar pembacaan tag berulang dalam periode singkat tidak menghasilkan pembaruan ganda. Selain itu, firmware menyediakan buffer event pada memori untuk menahan event ketika koneksi broker terganggu dan mengirimkannya kembali setelah koneksi pulih.

Perangkat juga mendukung command demonstrasi dari backend, seperti `force_scan`, `set_cooldown`, `update_role`, dan `reboot`. Fitur ini menunjukkan bahwa komunikasi tidak hanya berjalan dari perangkat ke backend, tetapi juga memungkinkan backend mengirim instruksi sederhana ke perangkat melalui topic command MQTT. Dalam ruang lingkup penelitian, command digunakan sebagai bukti kemampuan kontrol dasar, bukan sebagai fitur manajemen perangkat produksi.

Gambar IV.1 Diagram Perangkat

#### 4.1.2 Implementasi Network Layer

Network layer diimplementasikan menggunakan Mosquitto sebagai broker MQTT lokal. Perangkat mobile menerbitkan pesan ke topic telemetry, scan, dan heartbeat, sedangkan backend worker berlangganan pada topic tersebut untuk menerima data dari perangkat. Topic command digunakan oleh backend untuk mengirim instruksi ke perangkat. Pola publish/subscribe ini membuat perangkat tidak berkomunikasi langsung dengan dashboard, sehingga seluruh data perangkat tetap melewati backend sebagai titik validasi dan pencatatan.

Alur komunikasi MQTT pada prototipe mengikuti pemisahan jenis event. Telemetry digunakan untuk mengirim data GPS perangkat, scan digunakan untuk mengirim hasil pembacaan RFID, heartbeat digunakan untuk status hidup perangkat, dan cmd digunakan untuk command demonstrasi. Setiap pesan yang diterima backend disimpan sebagai raw MQTT event sebelum diproses lebih lanjut. Dengan cara ini, sistem memiliki jejak audit terhadap data yang masuk melalui broker, baik data tersebut berhasil diproses menjadi telemetry, heartbeat, package event, maupun unknown scan.

Validasi payload dilakukan pada backend menggunakan schema yang sesuai dengan jenis event. Payload yang valid diteruskan ke processor terkait, sedangkan data yang tidak sesuai dapat dikenali sebagai masalah format atau skenario yang perlu diperiksa. Pemisahan antara MQTT broker, worker, dan database membuat network layer berfungsi sebagai kanal transport event, bukan sebagai tempat logika bisnis utama.

#### 4.1.3 Implementasi Application Layer

Application layer terdiri atas backend worker, database PostgreSQL/Prisma, API route, realtime snapshot service, dan dashboard `/simcon`. Backend worker memproses event yang diterima dari MQTT. Telemetry processor menyimpan koordinat GPS dan memperbarui lokasi perangkat. Heartbeat processor menyimpan riwayat heartbeat dan memperbarui state perangkat. Scan processor melakukan lookup EPC ke data paket, membuat package event jika paket terdaftar, serta mencatat unknown scan jika tag tidak dikenal.

Database digunakan untuk menyimpan fasilitas, perangkat, paket, package event, telemetry, heartbeat, raw MQTT event, unknown scan, dan device command. Struktur ini memungkinkan pengujian tidak hanya dilihat dari tampilan dashboard, tetapi juga dari bukti data yang tersimpan. Raw event menjadi bukti bahwa pesan MQTT masuk ke backend, sedangkan tabel telemetry, heartbeat, package event, unknown scan, dan device command menunjukkan hasil pemrosesan sesuai jenis event.

API disediakan untuk mengamati hasil pemrosesan data. Endpoint device menampilkan state perangkat dan informasi telemetry/heartbeat terbaru. Endpoint raw event menampilkan pesan MQTT yang sudah diterima backend. Endpoint package timeline menampilkan riwayat event paket berdasarkan tracking ID. Endpoint command digunakan untuk membuat device command dan menerbitkannya ke topic perangkat. Selain itu, endpoint realtime SSE mengirim snapshot data untuk memperbarui dashboard ketika terjadi perubahan pada data backend.

Dashboard `/simcon` berfungsi sebagai antarmuka observasi penelitian. Dashboard menampilkan daftar perangkat, status koneksi, informasi lokasi, terminal feed berisi raw event, panel command perangkat mobile, dan package event evidence. Data awal dashboard diambil dari snapshot database, kemudian diperbarui melalui SSE. Dengan demikian, dashboard tidak hanya menjadi tampilan visual, tetapi juga alat untuk memeriksa apakah event dari perangkat telah masuk, diproses, disimpan, dan tersedia untuk pengamatan.

### 4.2 Hasil Pengujian

Pengujian dilakukan untuk mengetahui performa sistem berdasarkan beberapa skenario.

**Tabel 5 Hasil Pengujian Sistem**

| ID    | Skenario                | Parameter                                   | Status |
| ----- | ----------------------- | ------------------------------------------- | ------ |
| TC-01 | Device heartbeat        | Raw heartbeat, heartbeat row, device state  | Pass   |
| TC-02 | GPS telemetry           | Raw telemetry, telemetry row, koordinat GPS | Pass   |
| TC-03 | Scan RFID terdaftar     | Raw scan, EPC lookup, package event         | Pass   |
| TC-04 | Scan RFID tidak dikenal | Raw scan, unknown scan quarantine           | Pass   |
| TC-05 | Duplicate scan cooldown | Jumlah event dan duplicate handling         | Pass   |
| TC-06 | Package timeline API    | HTTP response dan isi timeline              | Pass   |
| TC-07 | Raw event API           | Raw telemetry, scan, heartbeat              | Pass   |
| TC-08 | Dashboard realtime/SSE  | Render dashboard, terminal feed, SSE        | Pass   |
| TC-09 | Offline timeout         | Offline detector                            | Pass   |
| TC-10 | Command demonstrasi     | DeviceCommand dan MQTT command event        | Pass   |

Hasil pengujian pada Tabel 5 menunjukkan bahwa seluruh skenario utama prototipe berjalan sesuai kriteria keberhasilan. Heartbeat perangkat dapat diterima, disimpan, dan digunakan untuk memperbarui status perangkat. Telemetry GPS dapat dikirim melalui MQTT, disimpan sebagai data telemetry, dan ditampilkan melalui API/dashboard. Scan RFID terdaftar berhasil diproses menjadi package event, sedangkan scan RFID tidak dikenal dipisahkan ke mekanisme unknown scan tanpa mengubah data paket terdaftar.

Pengujian duplicate scan cooldown menunjukkan bahwa pembacaan tag berulang tidak menghasilkan pembaruan ganda pada status paket. Package timeline API menampilkan riwayat event sesuai hasil scan, sedangkan raw event API menyediakan bukti pesan MQTT yang masuk ke backend. Dashboard `/simcon` berhasil menampilkan status perangkat, terminal feed, dan pembaruan data melalui SSE. Skenario offline timeout membuktikan bahwa perangkat dapat ditandai offline ketika heartbeat melewati ambang waktu, dan skenario command demonstrasi menunjukkan bahwa command dapat dicatat serta dikirim ke topic perangkat.

### 4.3 Pembahasan

Berdasarkan hasil implementasi dan pengujian, prototipe Logistic Controls menunjukkan bahwa alur pelacakan paket berbasis IoT dapat dibuktikan secara end-to-end pada skala penelitian. Data dimulai dari perangkat simulasi, dikirim melalui MQTT, diterima dan divalidasi backend, disimpan dalam database, lalu diamati melalui API dan dashboard. Keberhasilan ini menjawab kebutuhan utama penelitian, yaitu membuktikan bahwa event RFID dan telemetry GPS dapat digunakan sebagai dasar pembaruan status dan lokasi paket.

Pendekatan device-centric yang digunakan dalam penelitian ini terbukti sesuai untuk prototipe pelacakan paket. RFID berperan sebagai identitas paket, sedangkan GPS berasal dari perangkat mobile yang membaca tag. Dengan pendekatan tersebut, paket tidak perlu memiliki modul GPS sendiri. Lokasi paket dapat diinferensikan dari lokasi perangkat pembaca setelah scan terjadi. Pola ini membuat desain prototipe lebih sederhana dan sesuai dengan batasan penelitian yang hanya menggunakan satu perangkat mobile, satu fasilitas, dan sejumlah kecil tag RFID deterministik.

Penggunaan MQTT mendukung kebutuhan komunikasi event pada prototipe. Telemetry, heartbeat, scan, dan command dapat dipisahkan melalui topic yang berbeda, sehingga backend dapat memproses data berdasarkan jenis event. Broker MQTT juga menjaga pemisahan antara perangkat dan dashboard. Perangkat hanya perlu menerbitkan data ke broker, sedangkan backend bertanggung jawab melakukan validasi, penyimpanan, dan pembaruan state. Pemisahan ini membuat alur sistem lebih mudah diamati dan diuji.

Backend dan database berperan sebagai pusat pembuktian data. Penyimpanan raw event memberikan bukti bahwa pesan dari perangkat telah diterima. Penyimpanan telemetry, heartbeat, package event, unknown scan, dan device command menunjukkan hasil pemrosesan data setelah validasi. Dengan adanya API raw event dan package timeline, hasil pengujian dapat diperiksa tidak hanya melalui tampilan dashboard, tetapi juga melalui response data yang lebih terstruktur.

Dashboard `/simcon` memperkuat aspek observasi prototipe. Device table membantu memeriksa status perangkat dan data lokasi, terminal feed membantu menelusuri event MQTT terbaru, package evidence menunjukkan perubahan status paket, dan command panel menunjukkan jalur kontrol dasar dari aplikasi ke perangkat. Hasil ini sejalan dengan tujuan penelitian yang menempatkan dashboard sebagai alat observasi, bukan sebagai platform operasional logistik produksi.

### 4.4 Kelebihan dan Batasan Sistem

Implementasi sistem pada tahap ini memiliki beberapa kelebihan sebagai prototipe penelitian, tetapi tetap memiliki batasan yang perlu diperhatikan. Kelebihan menunjukkan kontribusi sistem terhadap pembuktian alur IoT end-to-end, sedangkan batasan menunjukkan ruang pengembangan di luar cakupan penelitian.

#### 4.4.1 Kelebihan

Kelebihan sistem yang dikembangkan adalah sebagai berikut:

1. Sistem membuktikan alur end-to-end dari perangkat, MQTT broker, backend, database, API, hingga dashboard observasi.
2. Integrasi RFID dan GPS berhasil memisahkan fungsi identifikasi paket dan penentuan lokasi perangkat pembaca.
3. Penyimpanan raw MQTT event, telemetry, heartbeat, package event, unknown scan, dan device command memberi bukti data yang dapat ditelusuri.
4. Dashboard `/simcon` menyediakan observasi perangkat, terminal event feed, package evidence, dan command panel dalam satu antarmuka.
5. Penggunaan Wokwi dan Mosquitto lokal membuat prototipe dapat diuji secara berulang tanpa membutuhkan perangkat fisik dan infrastruktur cloud.
6. Mekanisme duplicate scan cooldown, offline timeout, dan unknown scan quarantine membantu memperlihatkan respons sistem terhadap kondisi operasional dasar.

#### 4.4.2 Batasan

Batasan sistem yang dikembangkan adalah sebagai berikut:

1. Sistem masih berupa prototipe penelitian berskala kecil dan belum ditujukan sebagai platform logistik produksi.
2. Pengujian dilakukan pada simulasi ESP32/Wokwi, bukan pada perangkat RFID/GPS fisik di lingkungan pengiriman nyata.
3. Jumlah perangkat, fasilitas, dan tag RFID masih terbatas sehingga belum menggambarkan skenario armada besar atau multi-facility.
4. Dashboard hanya digunakan untuk observasi penelitian dan belum mencakup customer portal, RBAC, notifikasi, email, atau workflow operasional lengkap.
5. Sistem belum menyediakan live map, geofence, ETA, route optimization, atau analitik performa distribusi.
6. Keamanan produksi seperti HTTPS, autentikasi penuh, otorisasi berbasis role, broker ACL, dan hardening infrastruktur belum menjadi bagian implementasi.
7. Command perangkat masih digunakan sebagai demonstrasi kontrol dasar dan belum mencakup acknowledgement workflow yang lengkap.

## 5. Kesimpulan dan Saran

### 5.1 Kesimpulan

Berdasarkan hasil perancangan, implementasi, dan pengujian prototipe Logistic Controls, kesimpulan penelitian ini adalah sebagai berikut:

1. Arsitektur prototipe pelacakan paket logistik berbasis IoT berhasil dirancang dengan mengintegrasikan RFID, GPS, MQTT, backend, database, API, dan dashboard observasi. Arsitektur tersebut menunjukkan alur data dari perangkat simulasi menuju penyimpanan dan tampilan hasil pemantauan.
2. Simulasi perangkat ESP32/Wokwi berhasil digunakan sebagai perangkat mobile yang mengirim heartbeat, telemetry GPS, dan scan RFID. RFID digunakan untuk mengidentifikasi paket, sedangkan GPS digunakan untuk menyediakan konteks lokasi perangkat pembaca.
3. Backend berhasil memvalidasi payload MQTT, menyimpan raw event, memperbarui device state, mencatat package event, dan memisahkan scan RFID tidak dikenal ke unknown scan. Mekanisme ini membuat data perangkat dapat ditelusuri dari pesan masuk hingga hasil pemrosesan di database.
4. Dashboard/API berhasil digunakan untuk mengamati device state, raw event feed, command evidence, dan package timeline. Dengan demikian, hasil pengiriman data perangkat dapat diperiksa melalui tampilan dashboard maupun response API.
5. Hasil pengujian TC-01 sampai TC-10 menunjukkan bahwa alur end-to-end prototipe berjalan sesuai skenario penelitian. Prototipe mampu membuktikan hubungan antara scan RFID, telemetry GPS, komunikasi MQTT, persistence backend, dan observasi dashboard/API pada ruang lingkup riset terbatas.

### 5.2 Saran

Berdasarkan batasan sistem dan hasil penelitian, saran pengembangan lanjutan adalah sebagai berikut:

1. Penelitian berikutnya dapat menguji perangkat fisik ESP32, RFID reader, dan modul GPS di lingkungan nyata agar hasil simulasi dapat dibandingkan dengan kondisi operasional lapangan.
2. Jika sistem diarahkan menuju penggunaan produksi, perlu ditambahkan autentikasi, otorisasi, broker ACL, HTTPS, dan hardening infrastruktur agar komunikasi dan akses data lebih aman.
3. Fitur live map, geofence, ETA, route optimization, dan notifikasi dapat dikembangkan sebagai riset lanjutan setelah alur dasar telemetry, scan, dan persistence terbukti stabil.
4. Dataset pengujian dapat diperluas ke lebih banyak perangkat, fasilitas, dan tag RFID untuk melihat kemampuan prototipe pada skenario skalabilitas terbatas.
5. Mekanisme command acknowledgement perlu dilengkapi agar setiap command dari backend ke perangkat memiliki bukti round-trip yang jelas.
6. Dokumentasi dan bukti uji otomatis dapat ditambahkan agar evaluasi prototipe lebih repeatable, terutama untuk skenario scan paket, unknown scan, offline timeout, dan pembaruan dashboard.

## Daftar Pustaka

[1] I. Sergi, T. Montanaro, F. L. Benvenuto, and L. Patrono, "A smart and secure logistics system based on IoT and cloud technologies," _Sensors_, vol. 21, no. 6, Art. no. 2231, 2021, doi: 10.3390/s21062231.

[2] S. Ahmed _et al_., "Towards supply chain visibility using Internet of Things: A dyadic analysis review," _Sensors_, vol. 21, no. 12, Art. no. 4158, 2021, doi: 10.3390/s21124158.

[3] J. Chen, S. Xu, K. Liu, S. Yao, X. Luo, and H. Wu, "Intelligent transportation logistics optimal warehouse location method based on Internet of Things and blockchain technology," _Sensors_, vol. 22, no. 4, Art. no. 1544, 2022, doi: 10.3390/s22041544.

[4] K. Kvak and M. Straka, "The use of the Internet of Things in the distribution logistics of consumables," _Applied Sciences_, vol. 14, no. 8, Art. no. 3263, 2024, doi: 10.3390/app14083263.

[5] C.-H. Hsu, X.-Q. Cai, T.-Y. Zhang, and Y.-L. Ji, "Smart logistics facing Industry 5.0: Research on key enablers and strategic roadmap," _Sustainability_, vol. 16, no. 21, Art. no. 9183, 2024, doi: 10.3390/su16219183.

[6] C.-L. Chen, Z.-Y. Lim, H.-C. Liao, Y.-Y. Deng, and P. Chen, "A traceable and verifiable tobacco products logistics system with GPS and RFID technologies," _Applied Sciences_, vol. 11, no. 11, Art. no. 4939, 2021, doi: 10.3390/app11114939.

[7] C. D'Ortona, D. Tarchi, and C. Raffaelli, "Open-source MQTT-based end-to-end IoT system for smart city scenarios," _Future Internet_, vol. 14, no. 2, Art. no. 57, 2022, doi: 10.3390/fi14020057.

[8] D. Silva, L. I. Carvalho, J. Soares, and R. C. Sofia, "A performance analysis of Internet of Things networking protocols: Evaluating MQTT, CoAP, OPC UA," _Applied Sciences_, vol. 11, no. 11, Art. no. 4879, 2021, doi: 10.3390/app11114879.

[9] W. C. Tan and M. S. Sidhu, "Review of RFID and IoT integration in supply chain management," _Operations Research Perspectives_, vol. 9, Art. no. 100229, 2022, doi: 10.1016/j.orp.2022.100229.
