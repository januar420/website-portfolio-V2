export const dynamic = "force-static";

export default function TestEmailJs() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test EmailJS</h1>
      <p className="mb-4">
        Halaman ini tidak tersedia dalam mode static export. Silakan jalankan dalam mode development.
      </p>
      <p>
        <a href="/" className="text-blue-500 hover:underline">
          Kembali ke halaman utama
        </a>
      </p>
    </div>
  );
} 