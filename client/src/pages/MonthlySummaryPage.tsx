import { ChevronLeft, BarChart2, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export const MonthlySummaryPage = () => {
  const [, setLocation] = useLocation();
  const [month, setMonth] = useState(new Date());

  const goToPrevMonth = () => {
    const prev = new Date(month);
    prev.setMonth(month.getMonth() - 1);
    setMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(month);
    next.setMonth(month.getMonth() + 1);
    setMonth(next);
  };

  const monthStr = `${month.getFullYear()}年${month.getMonth() + 1}月`;

  // ダミーデータ
  const totalSets = 120;
  const bestStreak = 14;
  const insights = "タスク見積り精度が向上し、集中力が平均して高まった";

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm">戻る</span>
            </button>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 text-gray-800">
              <BarChart2 className="w-8 h-8 text-blue-500" />
              月次まとめ
            </h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/diary")} 
            className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            ダイアリーへ戻る
          </Button>
        </header>

        <div className="mb-10 p-6 bg-white border rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">{monthStr} のハイライト 🌐</h2>
            <p className="text-sm text-gray-600">「継続は力なり」：今月の成長を振り返り、次へ繋げましょう。</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* 月次集計カード */}
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">月間サマリー</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>合計達成セット数</span>
                  <span className="font-bold text-gray-800">{totalSets}セット</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>最長継続日数</span>
                  <span className="font-bold text-gray-800">{bestStreak}日</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>考察</span>
                  <span className="text-right text-gray-800">{insights}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* グラフや可視化エリア（ダミー） */}
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">進捗グラフ</h2>
              <div className="text-center text-sm text-gray-500">
                <div className="w-full h-32 bg-gradient-to-r from-green-100 to-green-300 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-green-800">ここにグラフが表示されます</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">今月の気づきやメモ</h2>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 border rounded-lg">
                ・集中タイムを始める前の5分ストレッチが有効だった<br />
                ・午前中に難しいタスクを詰め込むと達成率が上がった<br />
                ・PDCAを回すには、夕方の記録時間をもう少し確保したい
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MonthlySummaryPage;
