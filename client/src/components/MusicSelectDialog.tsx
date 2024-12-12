import { useState, useEffect } from "react";
import { Volume2, Shuffle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "../lib/store";
import { MUSIC_OPTIONS } from "../lib/constants";
import { audioPlayer } from "../lib/audio";
import { useLocation } from "wouter";

interface MusicSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MusicSelectDialog: React.FC<MusicSelectDialogProps> = ({ open, onOpenChange }) => {
  const { selectedMusic, setSelectedMusic, isRunning } = useStore();
  const [location] = useLocation();

  // 音源再生はTimerコンポーネントで一元管理

  const handleRandomSelect = () => {
    const availableOptions = MUSIC_OPTIONS.filter(music => music.id !== 'none');
    if (availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      const randomMusic = availableOptions[randomIndex];
      console.log('Randomly selected music:', randomMusic.id);
      setSelectedMusic(randomMusic.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-500" />
              <DialogTitle>音楽を選択</DialogTitle>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-500 border-blue-500"
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
            {MUSIC_OPTIONS.map((music) => (
              <Button
                key={music.id}
                variant={selectedMusic === music.id ? "default" : "outline"}
                onClick={() => {
                  console.log('Selected new music:', music.id);
                  setSelectedMusic(music.id);
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

export const MusicButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <MusicSelectDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
