import { useState, useEffect } from "react";
import { Coffee, Shuffle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "../lib/store";
import { BREAK_MUSIC_OPTIONS } from "../lib/constants";
import { audioPlayer } from "../lib/audio";

interface BreakMusicSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BreakMusicSelectDialog: React.FC<BreakMusicSelectDialogProps> = ({ open, onOpenChange }) => {
  const { selectedBreakMusic, setSelectedBreakMusic, isBreak, isRunning } = useStore();

  const handleRandomSelect = () => {
    const availableOptions = BREAK_MUSIC_OPTIONS.filter(music => music.id !== 'none');
    if (availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      const randomMusic = availableOptions[randomIndex];
      console.log('Randomly selected break music:', randomMusic.id);
      setSelectedBreakMusic(randomMusic.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-green-500" />
              <DialogTitle>休憩時の音楽を選択</DialogTitle>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-green-500 border-green-500"
                onClick={handleRandomSelect}
              >
                <Shuffle className="h-4 w-4" />
                ランダム再生
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 py-2">
          <div className="grid gap-4">
            {BREAK_MUSIC_OPTIONS.map((music) => (
              <Button
                key={music.id}
                variant={selectedBreakMusic === music.id ? "default" : "outline"}
                className={`${
                  selectedBreakMusic === music.id 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'hover:text-green-500'
                }`}
                onClick={() => {
                  console.log('Selected new break music:', music.id);
                  setSelectedBreakMusic(music.id);
                  onOpenChange(false);
                }}
              >
                {music.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const BreakMusicButton = () => {
  const [open, setOpen] = useState(false);
  const { isBreak } = useStore();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={`hover:text-green-500 ${isBreak ? 'text-green-500' : ''}`}
        onClick={() => setOpen(true)}
      >
        <Coffee className="h-4 w-4" />
      </Button>
      <BreakMusicSelectDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
