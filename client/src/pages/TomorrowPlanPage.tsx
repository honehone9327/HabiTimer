import { ChevronLeft, ClipboardList, Plus, Trash2, Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { Task } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Checkbox } from "@/components/ui/checkbox";

export const TomorrowPlanPage = () => {
  const [, setLocation] = useLocation();
  const { tasks, addTask, removeTask, toggleTaskComplete, reorderTasks, updateTask } = useStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskTime, setEditTaskTime] = useState(25);

  const handleAddTask = () => {
    setShowAddTask(true);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-yellow-50 to-white">
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
              <ClipboardList className="w-8 h-8 text-yellow-500" />
              明日への計画
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
            <h2 className="text-xl font-bold text-gray-700 mb-2">明日を最高の一日にするために 🍀</h2>
            <p className="text-sm text-gray-600">小さな目標を立てることで、スタートダッシュを決めよう！</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-md border-0 bg-white mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">明日のタスクリスト</h2>
              <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                reorderTasks(result.source.index, result.destination.index);
              }}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-4">
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-700 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleTaskComplete(task.id)}
                                />
                                <span className={task.completed ? "line-through text-gray-400" : ""}>
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTask(task.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="新しいタスクを入力..."
                  className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setShowAddTask(true);
                    }
                  }}
                />
                <Button onClick={() => setShowAddTask(true)} variant="default" size="sm" className="inline-flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  追加
                </Button>
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
                            id: crypto.randomUUID(),
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
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">明日へのメッセージ</h2>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 border rounded-lg">
                「早起きして深呼吸、冷静な頭でタスクに挑もう。<br />
                すべては一歩ずつ、確実に進めていくことが成功への鍵。」
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
    </div>
  );
};

export default TomorrowPlanPage;
