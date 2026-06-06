import Image from 'next/image'
import bannerImg from '../../../public/auth-banner.png'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#FFFFFF] flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(59,130,246,0.15)] rounded-3xl overflow-hidden">
        
        {/* Left side: Banner image */}
        <div className="hidden md:flex w-1/2 relative bg-transparent items-center justify-center p-6">
          <Image
            src={bannerImg}
            alt="MindTrack Wellness Concept"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Right side: Auth forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12">
          {children}
        </div>
        
      </div>
    </div>
  )
}
