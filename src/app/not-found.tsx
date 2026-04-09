import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#00f2ff]/10 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#ec5b13]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8 p-8 md:p-12 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-[#00f2ff] to-[#0077a8] text-transparent bg-clip-text drop-shadow-sm select-none">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Không tìm thấy trang
          </h2>
          <p className="text-base md:text-lg text-zinc-400 max-w-md mx-auto">
            Trang bạn đang cố gắng truy cập không tồn tại, đã bị phân tích hóa, hoặc không còn trong không gian số của chúng tôi.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-black bg-gradient-to-r from-[#00f2ff] to-[#00b4d2] rounded-full hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" height="20" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
        
        {/* Animated UI subtle detail */}
        <div className="absolute top-4 right-4 flex space-x-1 opacity-40">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
}
