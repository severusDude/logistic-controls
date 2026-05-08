# Draft Laporan Proyek IoT Logistic Controls

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
