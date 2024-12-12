import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { useDiaryStore, type DiaryEntry } from "../lib/diaryStore";
// ビデオ要素の参照のための型定義
type VideoRef = {
  focus: HTMLVideoElement | null;
  break: HTMLVideoElement | null;
};
import { Task } from "../lib/store";
import { Pause, Play, RotateCcw, Volume2, Coffee, User, CheckSquare, GripVertical, PartyPopper, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePomodoro } from "../hooks/usePomodoro";
import { useStore } from "../lib/store";
import useTimer from "../hooks/useTimer";
import { audioPlayer } from "../lib/audio";
import { BREAK_MUSIC_OPTIONS } from "../lib/constants";
import { MusicSelectDialog } from "./MusicSelectDialog";
import { BreakMusicSelectDialog } from "./BreakMusicSelectDialog";
import { AvatarSelectDialog } from "./AvatarSelectDialog";
import { Settings } from "./Settings";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";

const CrackerIcon = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
  >
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"
        stroke="#22C55E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  </motion.div>
);

export const Timer = () => {
  // State変数の定義
  const [isDragging, setIsDragging] = useState(false);
  const [showMusicDialog, setShowMusicDialog] = useState(false);
  const [showBreakMusicDialog, setShowBreakMusicDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskTime, setEditTaskTime] = useState(25);
  const [concentration, setConcentration] = useState<'good' | 'normal' | 'bad' | ''>('');
  const [achievements, setAchievements] = useState('');
  const [failures, setFailures] = useState('');
  const [challenges, setChallenges] = useState('');

  // Storeからの変数取得
  const { 
    isRunning,
    isTimerStarted,
    remainingTime,
    currentSet,
    sets,
    isBreak,
    focusTime,
    breakTime,
    goal,
    tasks,
    selectedAvatar,
    selectedMusic,
    selectedBreakMusic,
    displayMode,
    isTimerCompleted,
    setDisplayMode,
    updateTask,
    toggleTimer,
    resetTimer,
    setGoal,
    toggleTaskComplete,
    removeTask,
    addTask,
    reorderTasks
  } = useStore();

  const { motivationalQuote } = useTimer();

  // Refの設定
  const svgRef = useRef<SVGSVGElement>(null);
  const videoRef = useRef<VideoRef>({ focus: null, break: null });
  const prevRemainingTimeRef = useRef<number>(remainingTime);

  const { addEntry } = useDiaryStore();

  const handleCloseCompletionDialog = (open: boolean) => {
    if (!open && concentration) {
      // Save diary entry
      const entry: DiaryEntry = {
        date: new Date(),
        concentration,
        achievements,
        failures,
        challenges,
        completed_sets: sets,
        focus_time: focusTime,
        break_time: breakTime,
      };
      addEntry(entry);
      
      // Reset timer and inputs
      useStore.getState().resetTimer();
      useStore.getState().setIsTimerStarted(false);
      setConcentration('');
      setAchievements('');
      setFailures('');
      setChallenges('');
    }
    setShowCompletionDialog(open);
  };

  // 再生速度を固定するuseEffect
  useEffect(() => {
    const focusVideo = videoRef.current.focus;
    const breakVideo = videoRef.current.break;

    const handleRateChange = (video: HTMLVideoElement) => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
      }
    };

    if (focusVideo) {
      focusVideo.playbackRate = 1;
      focusVideo.addEventListener("ratechange", () => handleRateChange(focusVideo));
    }

    if (breakVideo) {
      breakVideo.playbackRate = 1;
      breakVideo.addEventListener("ratechange", () => handleRateChange(breakVideo));
    }

    return () => {
      if (focusVideo) {
        focusVideo.removeEventListener("ratechange", () => handleRateChange(focusVideo));
      }
      if (breakVideo) {
        breakVideo.removeEventListener("ratechange", () => handleRateChange(breakVideo));
      }
    };
  }, [isRunning, isBreak, selectedMusic, selectedBreakMusic]);

  // キーボードイベントの制御
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 再生速度の変更に関連するキーを無効化
      if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // コンテキストメニューの無効化
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // 集中時間の音源を制御
  useEffect(() => {
    const playFocusAudio = async () => {
      if (isRunning && !isBreak) {
        if (selectedMusic !== 'none') {
          await audioPlayer.play(selectedMusic, false, displayMode);
        } else {
          audioPlayer.stopFocus();
        }
      } else {
        audioPlayer.stopFocus();
      }
    };

    playFocusAudio();

    return () => {
      audioPlayer.stopFocus();
    };
  }, [isRunning, isBreak, selectedMusic, displayMode]);

  // 休憩時間の音源を制御
  useEffect(() => {
    const playBreakAudio = async () => {
      if (isRunning && isBreak) {
        if (selectedBreakMusic !== 'none') {
          await audioPlayer.play(selectedBreakMusic, true, displayMode);
        } else {
          audioPlayer.stopBreak();
        }
      } else {
        audioPlayer.stopBreak();
      }
    };

    playBreakAudio();

    return () => {
      audioPlayer.stopBreak();
    };
  }, [isRunning, isBreak, selectedBreakMusic, displayMode]);

  // カウントダウン開始時の音源切り替えとフェードアウト
  useEffect(() => {
    if (
      isRunning &&
      remainingTime > 0 &&
      remainingTime <= 3 &&
      remainingTime !== prevRemainingTimeRef.current
    ) {
      console.log('カウントダウン開始：', remainingTime);
      if (remainingTime === 3) {
        audioPlayer.playNHKTimeSignal();
        audioPlayer.fadeOutMainAudio(3);
      }
    }

    // カウントダウンがリセットされた場合、前回の残り時間を初期化
    if (!isRunning || remainingTime === 0) {
      prevRemainingTimeRef.current = 0;
    } else {
      prevRemainingTimeRef.current = remainingTime;
    }
  }, [isRunning, remainingTime]);

  // タイマー切り替わり音の制御
  useEffect(() => {
    if (remainingTime === 0) {
      audioPlayer.playTransitionSound();
    }
  }, [remainingTime]);

  // タイマー完了時のダイアログ制御
  useEffect(() => {
    if (isTimerCompleted) {
      setShowCompletionDialog(true);
    }
  }, [isTimerCompleted]);

  // オーディオイベントを監視
  useEffect(() => {
    const handleAudioPaused = (event: CustomEvent) => {
      if (showCompletionDialog) return;
      const { isBreak: eventIsBreak } = event.detail;
      if (isRunning && eventIsBreak === isBreak) {
        toggleTimer();
      }
    };

    const handleAudioPlayed = (event: CustomEvent) => {
      if (showCompletionDialog) return;
      const { isBreak: eventIsBreak } = event.detail;
      if (!isRunning && eventIsBreak === isBreak) {
        toggleTimer();
      }
    };

    window.addEventListener('audioPaused', handleAudioPaused as EventListener);
    window.addEventListener('audioPlayed', handleAudioPlayed as EventListener);

    return () => {
      window.removeEventListener('audioPaused', handleAudioPaused as EventListener);
      window.removeEventListener('audioPlayed', handleAudioPlayed as EventListener);
    };
  }, [isRunning, isBreak, toggleTimer, showCompletionDialog]);

  const { formatTime, handleCircleInteraction } = usePomodoro();
  
  const currentMaxTime = (isBreak ? breakTime : focusTime) * 60;
  const progress = (remainingTime / currentMaxTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = (circumference * (100 - progress)) / 100;

  const handleCircleInteractionHandler = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = clientX - centerX;
    const y = clientY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    let percentage = angle / (2 * Math.PI);

    percentage = Math.max(0, Math.min(1, percentage));
    handleCircleInteraction(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleCircleInteractionHandler(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleCircleInteractionHandler(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isTimerStarted) {
    return <Settings />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">今日の目標・がんばりたいこと</h3>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-3 text-sm border rounded-md"
                rows={2}
                placeholder="目標を入力してください"
              />
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="mb-4">
                <p className="text-sm text-center italic">
                  "{motivationalQuote}"
                </p>
              </div>

              <div className="relative w-full">
                <h2 className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-2xl font-bold flex items-center gap-2 ${selectedMusic === 'campfire' && displayMode === 'video' ? 'text-white' : 'text-gray-800'}`}>
                  <Clock className={`h-6 w-6 ${selectedMusic === 'campfire' && displayMode === 'video' ? 'text-white' : 'text-gray-800'}`} />
                  {isBreak ? '休憩時間' : '集中時間'}
                </h2>

                {displayMode === 'video' && (
                  <>
                    {isBreak ? (
                      selectedBreakMusic !== 'none' && (
                        <video
                          ref={(el) => { videoRef.current.break = el; }}
                          data-type="break"
                          key={`break-${selectedBreakMusic}`}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl [&::-webkit-media-controls-panel]:!hidden"
                          style={{ pointerEvents: 'none' }}
                          autoPlay
                          loop
                          muted={false}
                          playsInline
                          webkit-playsinline="true"
                          disablePictureInPicture
                          disableRemotePlayback
                          controls={false}
                          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                          onContextMenu={handleContextMenu}
                        >
                          <source 
                            src={BREAK_MUSIC_OPTIONS.find(opt => opt.id === selectedBreakMusic)?.videoSrc} 
                            type="video/mp4" 
                          />
                        </video>
                      )
                    ) : (
                      selectedMusic === 'campfire' && (
                        <video
                          ref={(el) => { videoRef.current.focus = el; }}
                          data-type="focus"
                          key={`focus-${selectedMusic}`}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl [&::-webkit-media-controls-panel]:!hidden"
                          style={{ pointerEvents: 'none' }}
                          autoPlay
                          loop
                          muted={false}
                          playsInline
                          webkit-playsinline="true"
                          disablePictureInPicture
                          disableRemotePlayback
                          controls={false}
                          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                          onContextMenu={handleContextMenu}
                          src="/audio/campfire.mp4"
                        />
                      )
                    )}
                  </>
                )}
                
                <div className="relative z-10 mt-12">
                  <div 
                    className="rounded-2xl p-6"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="relative w-full aspect-square">
                      <svg 
                        ref={svgRef}
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={isBreak ? '#22C55E' : '#3B82F6'}
                          strokeWidth="4"
                          strokeLinecap="round"
                          style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: dashOffset,
                            transition: isDragging ? 'none' : 'stroke-dashoffset 0.75s linear',
                          }}
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                        <div className={`text-6xl font-bold ${selectedMusic === 'campfire' && displayMode === 'video' ? 'text-white' : 'text-gray-800'} leading-tight`}>
                          {formatTime(remainingTime)}
                        </div>
                        <div className={`text-base ${selectedMusic === 'campfire' && displayMode === 'video' ? 'text-white/80' : 'text-gray-600'} mt-2`}>
                          {currentSet}/{sets}
                        </div>

                        {/* モード切り替えボタン - 一時的に非表示 */}
                        {false && (
                          <div className="flex justify-center mt-4">
                            <div className="flex rounded-full bg-gray-200 p-1">
                              <button
                                className={`flex-1 rounded-full px-4 py-1 text-xs ${
                                  displayMode === 'audio' ? 'bg-white shadow' : ''
                                }`}
                                onClick={() => setDisplayMode('audio')}
                              >
                                音声
                              </button>
                              <button
                                className={`flex-1 rounded-full px-4 py-1 text-xs ${
                                  displayMode === 'video' ? 'bg-white shadow' : ''
                                }`}
                                onClick={() => setDisplayMode('video')}
                              >
                                動画
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4 mt-6">
                      {/* 再生/一時停止ボタン */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12"
                        onClick={() => toggleTimer()}
                      >
                        {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>

                      {/* リセットボタン */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12"
                        onClick={() => resetTimer()}
                      >
                        <RotateCcw className="h-6 w-6" />
                      </Button>

                      {/* 音楽選択ボタン */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-white hover:bg-white/90 text-blue-500 w-12 h-12"
                        onClick={() => setShowMusicDialog(true)}
                      >
                        <Volume2 className="h-6 w-6" />
                      </Button>

                      {/* 休憩音源ボタン */}
                      <Button
                        variant="outline"
                        size="icon"
                        className={`bg-white hover:bg-white/90 ${isBreak ? 'text-green-500' : 'text-blue-500'} w-12 h-12`}
                        onClick={() => setShowBreakMusicDialog(true)}
                      >
                        <Coffee className="h-6 w-6" />
                      </Button>

                      {/* アバター選択ボタン */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-white hover:bg-white/90 text-blue-500 w-12 h-12"
                        onClick={() => setShowAvatarDialog(true)}
                      >
                        <User className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="p-6">
            {selectedAvatar !== 'none' ? (
              <div className="relative mt-16">
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg">
                  <div className="relative">
                    <p className="text-sm">{isBreak ? "良い休憩を！" : "今日も頑張ろう！"}</p>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                </div>

                <div className="w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden">
                  {selectedAvatar === 'bone-knight' ? (
                    <img
                      src="/assets/bone_knight.png"
                      alt="ボーンナイト"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className={`${selectedAvatar === 'none' ? 'mt-0' : 'mt-8'} p-4 rounded-lg`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  タスクリスト
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                >
                  追加
                </Button>
              </div>
              <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                reorderTasks(result.source.index, result.destination.index);
              }}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-40 overflow-y-auto">
                      <AnimatePresence>
                        {tasks.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center p-8 space-y-4"
                          >
                            <CrackerIcon />
                            <p className="text-lg font-medium text-green-600">
                              おめでとう！全てのタスクを完了しました！
                            </p>
                          </motion.div>
                        ) : (
                          tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <motion.div
                                    initial={{ x: 0, opacity: 1 }}
                                    exit={{ 
                                      x: -300, 
                                      opacity: 0,
                                      transition: { 
                                        duration: 0.3,
                                        ease: "easeOut"
                                      }
                                    }}
                                    className="flex items-center justify-between p-2 border rounded-lg"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <Checkbox
                                        checked={task.completed}
                                        onCheckedChange={() => toggleTaskComplete(task.id)}
                                      />
                                      <span className={task.completed ? "line-through text-gray-500" : ""}>
                                        {task.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500">{task.estimatedTime}分</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingTask(task);
                                          setEditTaskTitle(task.title);
                                          setEditTaskTime(task.estimatedTime);
                                          setShowEditTask(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-600"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクを追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">タスク名</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="タスクを入力"
              />
            </div>
            <div>
              <label className="text-sm">予想時間（分）</label>
              <Input
                type="number"
                min="1"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(parseInt(e.target.value))}
              />
            </div>
            <Button
              onClick={() => {
                if (newTaskTitle && newTaskTime > 0) {
                  addTask({
                    id: Date.now().toString(),
                    title: newTaskTitle,
                    estimatedTime: newTaskTime,
                    completed: false
                  });
                  setNewTaskTitle("");
                  setNewTaskTime(25);
                  setShowAddTask(false);
                }
              }}
            >
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">タスク名</label>
              <Input
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                placeholder="タスクを入力"
              />
            </div>
            <div>
              <label className="text-sm">予想時間（分）</label>
              <Input
                type="number"
                min="1"
                value={editTaskTime}
                onChange={(e) => setEditTaskTime(parseInt(e.target.value))}
              />
            </div>
            <Button
              onClick={() => {
                if (editingTask && editTaskTitle && editTaskTime > 0) {
                  updateTask(editingTask.id, {
                    title: editTaskTitle,
                    estimatedTime: editTaskTime,
                    completed: editingTask.completed
                  });
                  setShowEditTask(false);
                  setEditingTask(null);
                }
              }}
            >
              更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MusicSelectDialog open={showMusicDialog} onOpenChange={setShowMusicDialog} />
      <BreakMusicSelectDialog open={showBreakMusicDialog} onOpenChange={setShowBreakMusicDialog} />
      <AvatarSelectDialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog} />

      <Dialog 
        open={showCompletionDialog} 
        onOpenChange={handleCloseCompletionDialog}
      >
        <DialogContent className="text-center max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              お疲れ様でした！
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-3">
            <PartyPopper className="w-12 h-12 mx-auto text-green-500" />
            <p className="text-lg">今日も一日頑張りましたね！</p>
            <p className="text-sm text-gray-600">
              {sets}セット × {focusTime}分 の集中時間を達成しました
            </p>

            {/* PDCA用のUI */}
            {false && (
              <div className="text-left space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">今日の集中力はどうだった？</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant={concentration === 'good' ? 'default' : 'outline'} 
                      onClick={() => setConcentration('good')}
                    >
                      よかった
                    </Button>
                    <Button 
                      size="sm"
                      variant={concentration === 'normal' ? 'default' : 'outline'} 
                      onClick={() => setConcentration('normal')}
                    >
                      普通
                    </Button>
                    <Button 
                      size="sm"
                      variant={concentration === 'bad' ? 'default' : 'outline'} 
                      onClick={() => setConcentration('bad')}
                    >
                      いまいち
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="achievements" className="block mb-1 text-sm font-medium">できたこと（100文字まで）</Label>
                  <textarea
                    id="achievements"
                    maxLength={100}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={1}
                    placeholder="今日うまくいったことを記入"
                  />
                </div>

                <div>
                  <Label htmlFor="failures" className="block mb-1 text-sm font-medium">できなかったこと（100文字まで）</Label>
                  <textarea
                    id="failures"
                    maxLength={100}
                    value={failures}
                    onChange={(e) => setFailures(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={1}
                    placeholder="今日うまくいかなかったことを記入"
                  />
                </div>

                <div>
                  <Label htmlFor="challenges" className="block mb-1 text-sm font-medium">感じた課題（100文字まで）</Label>
                  <textarea
                    id="challenges"
                    maxLength={100}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={1}
                    placeholder="次回改善したい点など"
                  />
                </div>
              </div>
            )}
            <Button 
              size="sm"
              className="w-full mt-2" 
              onClick={() => handleCloseCompletionDialog(false)}
            >
              完了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};