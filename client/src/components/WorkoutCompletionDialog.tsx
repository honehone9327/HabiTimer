import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "../lib/workoutStore";

const COMPLETION_MESSAGES = {
  'drill-sergeant': 'よくやった！限界を超えて成長したな！',
  'friendly': '素晴らしい！目標を達成できましたね！',
  'motivational': '信じていた通り、あなたならできると！'
};

export const WorkoutCompletionDialog = () => {
  const { 
    showCompletionDialog,
    setShowCompletionDialog,
    trainerMode,
    sets,
    exercises,
    selectedExercise
  } = useWorkoutStore();

  const exerciseName = selectedExercise 
    ? exercises.find(e => e.id === selectedExercise)?.name 
    : '';

  const message = COMPLETION_MESSAGES[trainerMode as keyof typeof COMPLETION_MESSAGES];

  return (
    <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <DialogTitle>トレーニング完了！</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 py-2">
          <div className="flex justify-center">
            <div className="text-6xl">🏆</div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-medium">{message}</p>
            <p className="text-gray-600">
              {exerciseName}を{sets}セット完了しました！
            </p>
          </div>
          <Button 
            onClick={() => setShowCompletionDialog(false)}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
