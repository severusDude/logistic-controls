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

1. Bagaimana merancang arsitektur prototipe sistem pelacakan paket logistik berbasis IoT menggunakan RFID, GPS, MQTT, backend, dan dashboard sederhana?
2. Bagaimana mengimplementasikan simulasi perangkat ESP32 yang mampu mengirim telemetry GPS, heartbeat, dan event scan RFID ke broker MQTT?
3. Bagaimana backend memvalidasi payload MQTT, menyimpan raw event, memperbarui data perangkat, dan mencatat event paket berdasarkan RFID EPC?
4. Bagaimana dashboard/API dapat digunakan untuk mengamati status perangkat, riwayat event, dan timeline paket pada prototipe penelitian?
5. Bagaimana hasil pengujian prototipe berdasarkan skenario telemetry, heartbeat, scan RFID terdaftar, scan RFID tidak dikenal, dan pembaruan status paket?

### 1.3 Tujuan Penelitian

Tujuan dari penelitian ini adalah sebagai berikut:

1. Merancang arsitektur prototipe pelacakan paket logistik berbasis IoT dengan komponen RFID, GPS, MQTT, backend persistence, dan dashboard/API observasi.
2. Mengimplementasikan simulasi perangkat ESP32 berbasis Wokwi yang merepresentasikan perangkat mobile dengan kemampuan membaca tag RFID dan mengirim telemetry GPS.
3. Mengimplementasikan komunikasi data menggunakan MQTT untuk pengiriman telemetry, heartbeat, dan event scan dari perangkat menuju backend.
4. Mengimplementasikan backend yang memvalidasi payload, menyimpan raw MQTT event, memperbarui state perangkat, mencatat event paket, dan memisahkan scan RFID tidak dikenal.
5. Menyediakan dashboard/API sederhana untuk mengamati device state, terminal event, dan package timeline sebagai bukti alur pelacakan.
6. Menguji prototipe menggunakan skenario yang telah ditentukan untuk menilai keberhasilan pengiriman data, penyimpanan event, dan pembaruan status paket.

### 1.4 Manfaat Penelitian

Manfaat yang diharapkan dari penelitian ini adalah sebagai berikut:

1. Memberikan kontribusi akademik berupa rancangan dan implementasi prototipe pelacakan paket logistik berbasis IoT pada ruang lingkup simulasi.
2. Menunjukkan penerapan integrasi RFID dan GPS untuk menghubungkan identitas paket dengan posisi perangkat dalam skenario logistik sederhana.
3. Memberikan contoh pemanfaatan MQTT, backend validation, dan database persistence untuk membangun alur data IoT yang dapat diaudit melalui raw event.
4. Menyediakan dasar pembelajaran praktis mengenai pengembangan sistem IoT end-to-end, mulai dari perangkat, komunikasi, backend, hingga dashboard observasi.
5. Menjadi referensi awal bagi penelitian selanjutnya yang ingin mengembangkan fitur lanjutan seperti deployment perangkat fisik, keamanan broker, autentikasi pengguna, geofence, peta interaktif, notifikasi, atau optimasi rute.

### 1.5 Batasan Masalah

Agar penelitian lebih terarah dan sesuai dengan kapasitas prototipe, batasan masalah dalam penelitian ini adalah sebagai berikut:

1. Sistem yang dikembangkan merupakan prototipe penelitian, bukan sistem logistik komersial atau deployment produksi.
2. Perangkat IoT direpresentasikan menggunakan simulasi ESP32/Wokwi dengan perilaku GPS dan RFID, bukan perangkat keras fisik yang dipasang pada kendaraan atau paket sebenarnya.
3. Paket direpresentasikan sebagai tag RFID deterministik dalam skenario pengujian, dengan jumlah paket terbatas pada skala prototipe.
4. Lokasi paket diperoleh melalui pendekatan device-centric, yaitu paket dikaitkan dengan lokasi GPS perangkat mobile setelah RFID tag terbaca.
5. Komunikasi data menggunakan broker MQTT lokal untuk telemetry, heartbeat, scan event, dan command demonstrasi.
6. Backend dibatasi pada validasi payload, penyimpanan raw event, pembaruan device state, pencatatan package event, penyimpanan telemetry, heartbeat, dan unknown scan.
7. Database menggunakan PostgreSQL dengan Prisma sebagai ORM sesuai kebutuhan penyimpanan data prototipe.
8. Dashboard/API yang disediakan hanya digunakan untuk observasi penelitian, yaitu melihat status perangkat, event feed, command sederhana, dan package timeline.
9. Penelitian tidak membahas customer tracking portal, role-based access control, peta interaktif, geofence, notification center, email, route optimization, estimasi waktu kedatangan, multi-tenant deployment, atau pengujian skalabilitas besar.
10. Aspek keamanan produksi seperti HTTPS, autentikasi penuh, otorisasi pengguna, broker ACL, dan hardening infrastruktur tidak diimplementasikan, tetapi dicatat sebagai keterbatasan dan arah pengembangan.

## Daftar Pustaka

[1] I. Sergi, T. Montanaro, F. L. Benvenuto, and L. Patrono, "A smart and secure logistics system based on IoT and cloud technologies," *Sensors*, vol. 21, no. 6, Art. no. 2231, 2021, doi: 10.3390/s21062231.

[2] S. Ahmed *et al*., "Towards supply chain visibility using Internet of Things: A dyadic analysis review," *Sensors*, vol. 21, no. 12, Art. no. 4158, 2021, doi: 10.3390/s21124158.

[3] J. Chen, S. Xu, K. Liu, S. Yao, X. Luo, and H. Wu, "Intelligent transportation logistics optimal warehouse location method based on Internet of Things and blockchain technology," *Sensors*, vol. 22, no. 4, Art. no. 1544, 2022, doi: 10.3390/s22041544.

[4] K. Kvak and M. Straka, "The use of the Internet of Things in the distribution logistics of consumables," *Applied Sciences*, vol. 14, no. 8, Art. no. 3263, 2024, doi: 10.3390/app14083263.

[5] C.-H. Hsu, X.-Q. Cai, T.-Y. Zhang, and Y.-L. Ji, "Smart logistics facing Industry 5.0: Research on key enablers and strategic roadmap," *Sustainability*, vol. 16, no. 21, Art. no. 9183, 2024, doi: 10.3390/su16219183.
