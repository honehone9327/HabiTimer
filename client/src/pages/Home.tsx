import { Settings } from "../components/Settings";
import { Timer } from "../components/Timer";
import { useStore } from "../lib/store";
import { useLocation } from "wouter";

export default function Home() {
  const { isTimerStarted, resetTimer } = useStore();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isTimerStarted) {
                  // タイマー開始中は確認ダイアログを表示
                  if (window.confirm('タイマーを終了して戻りますか？')) {
                    resetTimer();
                    setLocation('/');
                  }
                } else {
                  setLocation('/');
                }
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">ポモドーロタイマー</h1>
          </div>
        </header>

        <main className="w-full mx-auto">
          {isTimerStarted ? <Timer /> : <Settings />}
        </main>
      </div>
    </div>
  );
}
