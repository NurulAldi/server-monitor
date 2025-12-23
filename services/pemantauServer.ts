import { dapatkanKoleksi } from "../lib/mongodb";

// Tipe data bacaan server (disesuaikan agar mudah dikonsumsi Chart.js/Recharts)
export type BacaanServer = {
  waktu: number; // timestamp (ms)
  cpu: number; // persentase 0-100
  mem: number; // persentase 0-100
  disk: number; // persentase 0-100
  suhu: number; // derajat Celcius
  alert?: boolean;
  pesanAlert?: string | null;
};

class PemantauServer {
  private riwayat: BacaanServer[] = [];
  private batasRiwayat = 300; // jumlah titik maksimum di memori (mis. 300 * 2s = 10 menit)
  private pembuatInterval: NodeJS.Timeout | null = null;
  private alertTerakhir: BacaanServer | null = null;

  constructor() {
    this.mulaiSimulasi();
  }

  // Mulai simulasi (setInterval tiap 2 detik)
  public mulaiSimulasi() {
    if (this.pembuatInterval) return;
    this.pembuatInterval = setInterval(() => this.buatBacaan(), 2000);
  }

  // Hentikan (untuk keperluan test atau cleanup)
  public hentikanSimulasi() {
    if (this.pembuatInterval) {
      clearInterval(this.pembuatInterval);
      this.pembuatInterval = null;
    }
  }

  // Menghasilkan bacaan acak dan memeriksa alert threshold
  private async buatBacaan() {
    const bacaan: BacaanServer = {
      waktu: Date.now(),
      cpu: this.acakDalamRentang(5, 100),
      mem: this.acakDalamRentang(10, 95),
      disk: this.acakDalamRentang(5, 95),
      suhu: this.acakDalamRentang(18, 95),
      alert: false,
      pesanAlert: null,
    };

    // Logika alert: CPU > 90% atau suhu > 80°C
    if (bacaan.cpu > 90) {
      bacaan.alert = true;
      bacaan.pesanAlert = `CPU tinggi: ${bacaan.cpu.toFixed(1)}%`;
    }
    if (bacaan.suhu > 80) {
      bacaan.alert = true;
      const pesan = `Suhu tinggi: ${bacaan.suhu.toFixed(1)}°C`;
      bacaan.pesanAlert = bacaan.pesanAlert ? `${bacaan.pesanAlert}; ${pesan}` : pesan;
    }

    // Simpan ke riwayat lokal
    this.riwayat.push(bacaan);
    if (this.riwayat.length > this.batasRiwayat) this.riwayat.shift();

    // Jika ada alert, simpan ke DB collection 'alerts' dan simpan alertTerakhir
    if (bacaan.alert) {
      this.alertTerakhir = bacaan;
      try {
        const koleksi = await dapatkanKoleksi("alerts");
        await koleksi.insertOne({
          waktu: new Date(bacaan.waktu),
          cpu: bacaan.cpu,
          suhu: bacaan.suhu,
          pesan: bacaan.pesanAlert,
        });
      } catch (err) {
        // Tidak menggagalkan proses simulasi; log di konsol untuk debugging
        // (Jangan gunakan console.log di production heavy workloads tanpa logger)
        // eslint-disable-next-line no-console
        console.error("Gagal menyimpan alert ke DB:", err);
      }
    }
  }

  private acakDalamRentang(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Ambil status terbaru (objek tunggal)
  public ambilStatusTerbaru(): BacaanServer | null {
    return this.riwayat.length ? this.riwayat[this.riwayat.length - 1] : null;
  }

  // Ambil riwayat (terbaru dulu). limit opsional
  public ambilRiwayat(limit = 120): BacaanServer[] {
    if (limit <= 0) return [];
    const mulai = Math.max(0, this.riwayat.length - limit);
    return this.riwayat.slice(mulai);
  }

  // Ambil alert terakhir jika ada
  public ambilAlertTerakhir(): BacaanServer | null {
    return this.alertTerakhir;
  }
}

// Ekspor singleton sehingga simulasi berjalan sekali di server
export const pemantauServer = new PemantauServer();
export default PemantauServer;
