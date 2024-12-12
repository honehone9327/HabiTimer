import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { useDiaryStore, type DiaryEntry } from "@/lib/diaryStore";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useLocation } from "wouter";
import { CalendarIcon, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DiaryPage = () => {
  const [, setLocation] = useLocation();
  const [date, setDate] = useState<Date>(new Date());
  const { entries, getEntryByDate, updateEntry } = useDiaryStore();
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | undefined>(undefined);
  const [hasData, setHasData] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    concentration: 'good' as 'good' | 'normal' | 'bad',
    achievements: '',
    failures: '',
    challenges: '',
    completed_sets: 0,
    focus_time: 0,
    break_time: 0,
  });

  useEffect(() => {
    const entry = getEntryByDate(date);
    if (entry) {
      setCurrentEntry(entry);
      setHasData(true);
    } else {
      setCurrentEntry(undefined);
      setHasData(false);
    }
  }, [date, entries]);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-sm">戻る</span>
            </button>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 text-gray-800">
              <CalendarIcon className="w-8 h-8 text-blue-500" />
              成長ダイアリー
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/monthly-summary")}
              className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              月次まとめへ
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/tomorrow-plan")}
              className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              明日の計画へ
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-lg w-full"
                locale={ja}
              />
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {hasData ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-700">
                          {date && format(date, 'yyyy年MM月dd日', { locale: ja })}の記録
                        </h2>
                        {currentEntry && (
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {currentEntry.completed_sets}セット達成
                            </div>
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              集中: {currentEntry.focus_time}分
                            </div>
                            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              休憩: {currentEntry.break_time}分
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            今日の集中力
                          </h3>
                          <div className="flex gap-2">
                            {currentEntry && (
                              <span className={`px-3 py-1 ${
                                currentEntry.concentration === 'good' ? 'bg-blue-500' :
                                currentEntry.concentration === 'normal' ? 'bg-yellow-500' :
                                'bg-red-500'
                              } text-white rounded-full text-sm`}>
                                {currentEntry.concentration === 'good' ? 'よかった' :
                                 currentEntry.concentration === 'normal' ? '普通' : '悪かった'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            できたこと
                          </h3>
                          <p className="p-3 bg-white border rounded-lg text-sm text-gray-700">
                            {currentEntry?.achievements || '記録なし'}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            できなかったこと
                          </h3>
                          <p className="p-3 bg-white border rounded-lg text-sm text-gray-700">
                            {currentEntry?.failures || '記録なし'}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            感じた課題
                          </h3>
                          <p className="p-3 bg-white border rounded-lg text-sm text-gray-700">
                            {currentEntry?.challenges || '記録なし'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            if (currentEntry) {
                              setEditForm({
                                concentration: currentEntry.concentration,
                                achievements: currentEntry.achievements || '',
                                failures: currentEntry.failures || '',
                                challenges: currentEntry.challenges || '',
                                completed_sets: currentEntry.completed_sets,
                                focus_time: currentEntry.focus_time,
                                break_time: currentEntry.break_time,
                              });
                              setShowEditDialog(true);
                            }
                          }}
                        >
                          記録を編集
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full py-12"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">記録がありません</h3>
                      <p className="text-sm text-gray-500">
                        この日の記録はまだ作成されていません
                      </p>
                      <Button className="mt-4" onClick={() => setHasData(true)}>
                        新しく記録する
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>記録を編集</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">集中力</label>
                        <select 
                          className="w-full p-2 border rounded-lg bg-background"
                          value={editForm.concentration}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            concentration: e.target.value as 'good' | 'normal' | 'bad' 
                          }))}
                        >
                          <option value="good">よかった</option>
                          <option value="normal">普通</option>
                          <option value="bad">悪かった</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">できたこと</label>
                        <textarea
                          className="w-full min-h-[80px] p-2 border rounded-lg bg-background resize-none"
                          value={editForm.achievements}
                          onChange={(e) => setEditForm(prev => ({ ...prev, achievements: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">できなかったこと</label>
                        <textarea
                          className="w-full min-h-[80px] p-2 border rounded-lg bg-background resize-none"
                          value={editForm.failures}
                          onChange={(e) => setEditForm(prev => ({ ...prev, failures: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">感じた課題</label>
                        <textarea
                          className="w-full min-h-[80px] p-2 border rounded-lg bg-background resize-none"
                          value={editForm.challenges}
                          onChange={(e) => setEditForm(prev => ({ ...prev, challenges: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">達成セット数</label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded-lg bg-background"
                            value={editForm.completed_sets}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              completed_sets: parseInt(e.target.value) || 0 
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">集中時間（分）</label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded-lg bg-background"
                            value={editForm.focus_time}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              focus_time: parseInt(e.target.value) || 0 
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">休憩時間（分）</label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded-lg bg-background"
                            value={editForm.break_time}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              break_time: parseInt(e.target.value) || 0 
                            }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={() => {
                            if (date) {
                              updateEntry(date, editForm);
                              setShowEditDialog(false);
                            }
                          }}
                        >
                          更新
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
