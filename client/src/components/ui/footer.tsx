import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => {
  const [, setLocation] = useLocation();

  return (
    <footer className="w-full py-4 mt-auto border-t bg-background">
      <div className="container mx-auto">
        {false && (
        <div className="flex justify-center mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:text-blue-500 flex items-center gap-2"
                  onClick={() => setLocation('/diary')}
                >
                  <Sprout className="h-5 w-5" />
                  <span className="text-sm">成長ダイアリー</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>これまで積み重ねた努力の記録。成長を振り返ろう！</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
        
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} funsunevery
        </div>
      </div>
    </footer>
  );
};

export default Footer;
