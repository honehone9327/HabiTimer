import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MusicButton } from "./MusicSelectDialog";
import { AvatarButton } from "./AvatarSelectDialog";
import { BreakMusicSelectDialog } from "./BreakMusicSelectDialog";
import { User, Trash, GripVertical, Clock, Coffee, Repeat, CheckSquare, Hourglass, Pencil } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import { useStore } from "../lib/store";
import { Task } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export const Settings = () => {
  const { user } = useAuthStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showBreakMusicDialog, setShowBreakMusicDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskTime, setEditTaskTime] = useState(25);
  
  const { toast } = useToast();
  const { 
    focusTime, 
    breakTime, 
    sets,
    goal,
    tasks,
    isTimerStarted,
    timerHistory,
    setFocusTime,
    setBreakTime,
    setSets,
    setGoal,
    toggleTimer,
    addTask,
    removeTask,
    toggleTaskComplete,
    reorderTasks,
    updateTask,
    clearTimerHistory,
    applyTimerSettings
  } = useStore();

  const totalTime = (focusTime + breakTime) * sets;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Pomodoro Timer</h2>
          
          <div className="space-y-6">
            {/* 目標設定 */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">今日の目標・がんばりたいこと</label>
              <textarea
                className="w-full p-2 text-sm border rounded-md"
                rows={2}
                placeholder="目標を入力してください"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            {/* タスクリスト */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  タスクリスト
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  disabled={tasks.length >= 10}
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
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      <AnimatePresence>
                        {tasks.map((task, index) => (
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
                                  className="flex items-center justify-between p-2 border rounded-lg bg-background"
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
                                  <div className="flex items-center space-x-2">
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
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTask(task.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* タイマー設定 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  集中時間
                </label>
                <Slider
                  value={[focusTime]}
                  onValueChange={(value) => setFocusTime(value[0])}
                  min={15}
                  max={60}
                  step={5}
                />
                <div className="text-right text-sm text-gray-600">{focusTime}分</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  休憩時間
                </label>
                <Slider
                  value={[breakTime]}
                  onValueChange={(value) => setBreakTime(value[0])}
                  min={5}
                  max={15}
                  step={5}
                />
                <div className="text-right text-sm text-gray-600">{breakTime}分</div>
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
                  max={20}
                  step={1}
                />
                <div className="text-right text-sm text-gray-600">{sets}セット</div>
              </div>

              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-center flex items-center justify-center gap-2">
                  <Hourglass className="h-4 w-4" />
                  トータル: {hours > 0 ? `${hours}時間` : ''} {minutes}分
                </p>
              </div>
            </div>

            {/* 音楽とアバター設定 */}
            <div className="flex justify-center space-x-4">
              <MusicButton />
              <Button
                variant="outline"
                size="icon"
                className="hover:text-green-500"
                onClick={() => setShowBreakMusicDialog(true)}
              >
                <Coffee className="h-4 w-4" />
              </Button>
              <AvatarButton />
            </div>

            {/* STARTボタン */}
            <Button 
              className="w-full"
              onClick={() => {
                if (!isTimerStarted) {
                  toggleTimer();
                }
              }}
            >
              START
            </Button>

            {/* タイマー履歴セクション */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  最近の記録
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useStore.getState().clearTimerHistory()}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {timerHistory.map((history, index) => (
                  <div
                    key={history.completedAt.toString()}
                    className="relative"
                  >
                    <div className="absolute top-1 right-1 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 hover:bg-red-100 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          useStore.getState().removeTimerHistory(index);
                          toast({
                            title: "履歴を削除しました",
                            description: "選択した履歴を削除しました。",
                          });
                        }}
                      >
                        <Trash className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                    <div
                      onClick={() => {
                        applyTimerSettings(history);
                        toast({
                          title: "設定を適用しました",
                          description: "タイマーの設定を履歴から復元しました。",
                        });
                      }}
                      className="p-3 pr-8 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200 border border-transparent hover:border-gray-200 relative group"
                    >
                      <div className="flex justify-between items-center text-gray-600">
                        <span>{new Date(history.completedAt).toLocaleString('ja-JP', { 
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}</span>
                        <span>{history.completedSets}セット完了</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-gray-500">
                        <span>集中: {history.focusTime}分</span>
                        <span>休憩: {history.breakTime}分</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-gray-400 text-xs">
                        <span>集中BGM: {history.focusMusic}</span>
                        <span>休憩BGM: {history.breakMusic}</span>
                      </div>
                      <div className="mt-1 text-gray-400 text-xs">
                        <span>アバター: {history.avatar}</span>
                      </div>
                      
                      {/* クリック可能を示すテキスト追加 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium text-blue-600">
                          クリックして設定を適用
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {timerHistory.length === 0 && (
                  <div className="text-center text-gray-500 text-sm p-2">
                    記録はまだありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タスク追加ダイアログ */}
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

      {/* 休憩時BGM選択ダイアログ */}
      <BreakMusicSelectDialog 
        open={showBreakMusicDialog} 
        onOpenChange={setShowBreakMusicDialog} 
      />

      {/* タスク編集ダイアログ */}
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
    </>
  );
};
