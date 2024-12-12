import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Clock, Dumbbell } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "../lib/authStore";

export const Welcome = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-4xl font-bold text-center mb-8">タイマー選択</h1>
        
        <div className="grid gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-6 border-2 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all w-full relative z-10"
                  onClick={() => setLocation('/home')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">ポモドーロタイマー</h2>
                      <p className="text-sm text-gray-600">
                        集中と休憩を交互に行い、効率的に作業を進めましょう
                      </p>
                    </div>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>集中と休憩を交互に行うポモドーロテクニックを使用</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-6 border-2 rounded-lg hover:border-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all w-full relative z-10"
                  onClick={() => setLocation('/workout')}
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">ワークアウト</h2>
                      <p className="text-sm text-gray-600">
                        運動時間を計測し、健康的な生活を送りましょう
                      </p>
                    </div>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>タイマーを使用して効果的なワークアウトを実施</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
