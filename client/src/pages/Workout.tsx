import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Pause, Play, RotateCcw, Pencil, Trash, Dumbbell, Sparkles, Repeat, CheckSquare, Trophy, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import { usePreviousPath } from "../hooks/usePreviousPath";
import { useState, FC } from "react";
import { Exercise, useWorkoutStore } from "../lib/workoutStore";
import { useWorkout } from "../hooks/useWorkout";
import { TrainerButton } from "../components/TrainerModeDialog";
import { WorkoutCompletionDialog } from "../components/WorkoutCompletionDialog";

interface ProgressDisplayProps {
  progress: number;
  remainingTime: number;
  currentSet: number;
  sets: number;
  formatTime: (time: number) => string;
  isRest: boolean;
}

const ProgressDisplay: FC<ProgressDisplayProps> = ({ 
  progress, 
  remainingTime, 
  currentSet, 
  sets, 
  formatTime,
  isRest 
}) => {
  const completedTrophies = Array(currentSet - 1).fill(0);
  
  // 関数: 配列を指定したサイズで分割
  const chunkArray = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  // トロフィーを10個ずつのチャンクに分割
  const trophyChunks = chunkArray(completedTrophies, 10);

  return (
    <div className="relative h-64 w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full bg-green-100 rounded-lg overflow-hidden">
          <div 
            className={`w-full transition-all duration-1000 ${
              isRest 
                ? 'bg-gradient-to-b from-blue-500 to-blue-400' 
                : 'bg-gradient-to-t from-green-500 to-green-400'
            }`}
            style={{ 
              height: `${isRest ? 100 - progress : progress}%`,
              boxShadow: isRest 
                ? '0 0 10px rgba(59, 130, 246, 0.3)' 
                : '0 0 10px rgba(34, 197, 94, 0.3)'
            }}
          />
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 bg-white/80 p-4 rounded-lg">
          <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
            {formatTime(remainingTime)}
          </div>
          <div className="text-lg text-gray-500 mb-2">
            {currentSet}/{sets}セット
          </div>
          {/* トロフィーアイコンの表示をGridレイアウトに変更 */}
          <div className="flex flex-col items-center">
            {trophyChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="grid grid-cols-10 gap-2 mb-2 w-full">
                {chunk.map((_, index) => (
                  <Trophy key={index} className="w-6 h-6 text-yellow-500" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Workout = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setNewExercise(exercise.name);
    setShowAddExercise(true);
  };

  const handleDeleteExercise = (id: string) => {
    setDeleteConfirmId(id);
  };
  const { 
    exerciseTime,
    restTime,
    sets,
    isRunning,
    isTimerStarted,
    currentSet,
    isRest,
    remainingTime,
    exercises,
    selectedExercise,
    currentMessage,
    updateTrainerMessage,
    setExerciseTime,
    setRestTime,
    setSets,
    toggleTimer,
    resetTimer,
    addExercise,
    removeExercise,
    setSelectedExercise
  } = useWorkoutStore();

  const { formatTime } = useWorkout();
  
  const currentMaxTime = remainingTime;
  const progress = (remainingTime / (isRest ? restTime : exerciseTime)) * 100;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = (circumference * (100 - progress)) / 100;

  const handleAddExercise = () => {
    if (newExercise.trim()) {
      addExercise({
        id: Date.now().toString(),
        name: newExercise.trim(),
        custom: true
      });
      setNewExercise("");
      setShowAddExercise(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isRunning) {
                  // タイマー実行中は確認ダイアログを表示
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
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">ワークアウト</h1>
          </div>
          
        </header>

        {isTimerStarted ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {isRest ? '休憩時間' : '運動時間'}
              </h2>

              <div className="w-full max-w-md mx-auto mb-6">
                <ProgressDisplay 
                  progress={(remainingTime / (isRest ? restTime : exerciseTime)) * 100}
                  remainingTime={remainingTime}
                  currentSet={currentSet}
                  sets={sets}
                  formatTime={formatTime}
                  isRest={isRest}
                />
              </div>

              <div className="flex justify-center space-x-4 mb-4">
                {/* 一時停止/再開ボタン */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                {/* リセットボタン */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <TrainerButton />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4 text-center">
                <p className="text-lg font-medium text-gray-800">{currentMessage}</p>
              </div>

              {selectedExercise && (
                <div className="text-center mt-4">
                  <h3 className="font-semibold">現在のエクササイズ:</h3>
                  <p>{exercises.find(e => e.id === selectedExercise)?.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    運動時間
                  </label>
                  <Slider
                    value={[exerciseTime]}
                    onValueChange={(value) => setExerciseTime(value[0])}
                    min={10}
                    max={180}
                    step={5}
                  />
                  <div className="text-right text-sm text-gray-600">{exerciseTime}秒</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    休憩時間
                  </label>
                  <Slider
                    value={[restTime]}
                    onValueChange={(value) => setRestTime(value[0])}
                    min={5}
                    max={60}
                    step={5}
                  />
                  <div className="text-right text-sm text-gray-600">{restTime}秒</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    セット数
                  </label>
                  <Slider
                    value={[sets]}
                    onValueChange={(value) => setSets(value[0])}
                    min={1}
                    max={30}
                    step={1}
                  />
                  <div className="text-right text-sm text-gray-600">{sets}セット</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      エクササイズ
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddExercise(true)}
                    >
                      追加
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {exercises.map((exercise) => (
                      <div key={exercise.id} className="relative group">
                        <Button
                          variant={selectedExercise === exercise.id ? "default" : "outline"}
                          onClick={() => setSelectedExercise(exercise.id)}
                          className="w-full pr-16"
                        >
                          {exercise.name}
                        </Button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditExercise(exercise);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExercise(exercise.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-red-500"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* トレーナーモード選択 */}
                <div className="flex justify-center space-x-4 mb-4">
                  <TrainerButton />
                </div>

                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={toggleTimer}
                  disabled={!selectedExercise}
                >
                  START
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? 'エクササイズを編集' : 'エクササイズを追加'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <Input
                placeholder="エクササイズ名"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
              />
              <Button onClick={() => {
                if (editingExercise) {
                  if (newExercise.trim()) {
                    // 編集の場合は既存のエクササイズを更新
                    removeExercise(editingExercise.id);
                    addExercise({
                      ...editingExercise,
                      name: newExercise.trim()
                    });
                    setEditingExercise(null);
                  }
                } else {
                  handleAddExercise();
                }
                setNewExercise("");
                setShowAddExercise(false);
              }}>
                {editingExercise ? '更新' : '追加'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>エクササイズを削除</DialogTitle>
            </DialogHeader>
            <p>このエクササイズを削除してもよろしいですか？</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                キャンセル
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (deleteConfirmId) {
                    removeExercise(deleteConfirmId);
                  }
                  setDeleteConfirmId(null);
                }}
              >
                削除
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <WorkoutCompletionDialog />
      </div>
    </div>
  );
};

export default Workout;
