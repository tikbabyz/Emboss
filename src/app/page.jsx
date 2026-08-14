import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/Inoac.png";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-[#03045E] via-[#023E8A] to-[#00B4D8] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg bg-white/30 backdrop-blur-md p-15 rounded-2xl shadow-lg">
        <Image src={Logo} alt="Inoac Logo" width={120} height={120} className="mx-auto mb-6 drop-shadow-lg" style={{ width: "auto", height: "auto" }} />
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">E-Production Report</h1>
        <p className=" text-white  text-lg font-semibold mb-1">EMBOSS</p>
        <p className=" text-white  text-sm mb-10">INOAC Industries (Thailand) Co., Ltd.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-[#023E8A] text-white font-bold rounded-xl shadow-lg hover:bg-blue-950 transition-colors text-base"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-[#FBB02D] text-white font-bold rounded-xl shadow-lg hover:bg-yellow-700  transition-colors text-base"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </main>
  );
}
