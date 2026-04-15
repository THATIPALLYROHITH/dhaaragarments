import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  onShopClick: () => void;
}

const Hero = ({ onShopClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary to-background opacity-50"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="inline-block px-4 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-bold tracking-widest mb-4">
              NEW COLLECTION
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 sm:mb-8 leading-none">
            ELEGANCE
            <br />
            <span className="bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
              REFINED
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 px-4 leading-relaxed">
            Discover timeless sophistication with our meticulously crafted collection
            <br className="hidden sm:block" />
            of premium garments for the modern individual
          </p>
          
          <Button
            size="lg"
            className="bg-primary hover:bg-accent text-primary-foreground font-bold text-sm sm:text-base px-8 py-6 h-auto transition-all duration-300 group shadow-lg hover:shadow-xl"
            onClick={onShopClick}
          >
            EXPLORE COLLECTION
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Video Showcase */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4 animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-secondary transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.02]">
              <video
                className="w-full h-auto"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/store-video.mp4" type="video/mp4" />
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Upload your store video as 'store-video.mp4' to the public folder</p>
                </div>
              </video>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 sm:bottom-12 left-0 right-0">
        <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent mx-auto"></div>
      </div>
    </section>
  );
};

export default Hero;
