import { useEffect, useState } from "react";

interface DiscountCountdownProps {
  expiresAt: string;
}

const DiscountCountdown = ({ expiresAt }: DiscountCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      <div className="text-center">
        <div className="bg-primary/10 text-primary font-bold text-lg px-3 py-2 rounded-md min-w-[50px]">
          {timeLeft.days}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 font-medium">DAYS</div>
      </div>
      <span className="text-xl font-bold text-primary">:</span>
      <div className="text-center">
        <div className="bg-primary/10 text-primary font-bold text-lg px-3 py-2 rounded-md min-w-[50px]">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 font-medium">HRS</div>
      </div>
      <span className="text-xl font-bold text-primary">:</span>
      <div className="text-center">
        <div className="bg-primary/10 text-primary font-bold text-lg px-3 py-2 rounded-md min-w-[50px]">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 font-medium">MIN</div>
      </div>
      <span className="text-xl font-bold text-primary">:</span>
      <div className="text-center">
        <div className="bg-primary/10 text-primary font-bold text-lg px-3 py-2 rounded-md min-w-[50px]">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 font-medium">SEC</div>
      </div>
    </div>
  );
};

export default DiscountCountdown;
