import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkoutStore } from "../lib/workoutStore";

interface TrainerModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRAINER_MODES = [
  { id: 'drill-sergeant', name: '厳しい指導' },
  { id: 'friendly', name: 'フレンドリー' },
  { id: 'motivational', name: 'モチベーション重視' },
];

export const TrainerModeDialog: React.FC<TrainerModeDialogProps> = ({ open, onOpenChange }) => {
  const { trainerMode, setTrainerMode, updateTrainerMessage } = useWorkoutStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              <DialogTitle>トレーナーモードを選択</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 py-2">
          <div className="grid gap-4">
            {TRAINER_MODES.map((mode) => (
              <Button
                key={mode.id}
                variant={trainerMode === mode.id ? "default" : "outline"}
                onClick={() => {
                  setTrainerMode(mode.id);
                  updateTrainerMessage();  // 追加
                  onOpenChange(false);
                }}
                className={trainerMode === mode.id ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {mode.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TrainerButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <User className="h-4 w-4" />
      </Button>
      <TrainerModeDialog open={open} onOpenChange={setOpen} />
    </>
  );
};