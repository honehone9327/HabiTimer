import { useState } from "react";
import { User, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "../lib/store";

const AVATAR_OPTIONS = [
  { id: 'none', label: 'なし' },
  { id: 'bone-knight', label: 'ボーンナイト' }
];

interface AvatarSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AvatarSelectDialog: React.FC<AvatarSelectDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { selectedAvatar, setSelectedAvatar } = useStore();

  const handleRandomSelect = () => {
    const availableOptions = AVATAR_OPTIONS.filter(avatar => avatar.id !== 'none');
    if (availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      const randomAvatar = availableOptions[randomIndex];
      setSelectedAvatar(randomAvatar.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <DialogTitle>アバターを選択</DialogTitle>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-purple-500 border-purple-500"
                onClick={handleRandomSelect}
              >
                <Shuffle className="h-4 w-4" />
                ランダム選択
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 py-2">
          <div className="grid gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <Button
                key={avatar.id}
                variant={selectedAvatar === avatar.id ? "default" : "outline"}
                className={`${
                  selectedAvatar === avatar.id 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'hover:text-purple-500'
                }`}
                onClick={() => {
                  setSelectedAvatar(avatar.id);
                  onOpenChange(false);
                }}
              >
                {avatar.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AvatarButton = () => {
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
      <AvatarSelectDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
