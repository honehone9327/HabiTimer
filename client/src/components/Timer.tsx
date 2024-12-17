import { useState, useRef, useEffect } from "react";
import { Clock, Pause, Play, RotateCcw, Volume2, Coffee, User, CheckSquare, GripVertical, PartyPopper, Pencil } from "lucide-react";
import { useDiaryStore, type DiaryEntry } from "../lib/diaryStore";
import { Task } from "../lib/store";
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

// アバターオプションは①で示したものと同じ
const AVATAR_OPTIONS = [
  { id: 'none', label: 'なし' },
  { id: 'ShisouSigurd', label: '屍装シグルド（しそうシグルド）' },
  { id: 'HakuchouMelva', label: '白蝶メルヴァ（はくちょうメルヴァ）' },
  { id: 'YugetsuRosaria', label: '幽月ロザリア（ゆうげつロザリア）' },
  { id: 'YoumonArador', label: '妖紋アラドール（ようもんアラドール）' },
  { id: 'Kurogamaru', label: '黒牙丸（くろがまる）' },
  { id: 'ChuusaNoel', label: '宙彩ノエル（ちゅうさいノエル）' },
  { id: 'ShidenKagura', label: '紫電カグラ（しでんカグラ）' },
  { id: 'SouuLuxel', label: '蒼羽リュクセル（そううリュクセル）' },
  { id: 'MetalcoreZX', label: 'メタルコアZX（メタルコアゼットエックス）' },
  { id: 'ShinyoiAquva', label: '深宵アクヴァ（しんよいアクヴァ）' },
  { id: 'FuwariBerry', label: 'ふわりベリィ（ふわりベリィ）' },
  { id: 'KakugaRenji', label: '赫牙蓮二（かくがれんじ）' }
];

// 集中時間用コメントリスト
const focusComments: string[] = [
  "その集中、まるで光を集めるレンズだよ！",
  "よし、そのまま突き進もう！",
  "今の勢いを大切に、あともう少し！",
  "いい流れだね、そのペースを守ろう！",
  "視線は目標へ一直線、ブレない姿がカッコいい！",
  "頭の中がクリアになってきたね、その調子！",
  "心が整っているよ、その集中は本物だ！",
  "焦らず丁寧に進めていこう、今がその時！",
  "この一瞬に全力を注げば、成果は後からついてくる！",
  "君の努力が、今まさに形になりつつあるよ！",
  "周りを気にせず、自分のペースでいこう！",
  "いいね、その意志の強さを信じて！",
  "明確なゴールが見えてきた、そのまま攻めよう！",
  "自分との対話に没頭できている、素晴らしい！",
  "一気に山を登るような迫力を感じるよ！",
  "深呼吸して、次の一手を確実に踏み出そう！",
  "その手元、その思考、すべてがゴールへ繋がってる！",
  "目の前の課題はもうすぐクリアできそうだ！",
  "迷いが消えた集中の中、才能が花開く！",
  "安定したリズムが心地いい、そのまま進め！",
  "結果は後からついてくる、今は過程に没頭だ！",
  "軸がぶれない、その集中こそ最高の武器だ！",
  "見えているね、目標への一直線が！",
  "その地道な一歩が大いなる前進になる。",
  "頭の中が整理されて、クリアな思考が輝いている！",
  "わずかな雑念も、今の君には入る隙がない！",
  "この時のために準備してきた、今がその出番だ！",
  "自信を胸に、ラストスパートだ！",
  "いい感じだ、もうひと踏ん張りしよう！",
  "いける！この集中が君を高みへ導く！",
];

// 休憩時間用コメントリスト
const breakComments: string[] = [
  "お疲れ様、まずは深呼吸でリセットしよう。",
  "ちょっと肩の力を抜いて、体をほぐそう。",
  "よくやった分、今は心と頭をほどいてあげて。",
  "短い休息が次へのガソリンになるよ。",
  "一息ついて、頭の中をスッキリさせよう。",
  "この休憩で、また前進する力が生まれる。",
  "脳をクールダウンさせて、次へ備えよう。",
  "頑張った自分に少しのご褒美を。",
  "目を閉じて、意識を解放してみて。",
  "小さな休みが、大きな成果へと繋がる。",
  "気持ちをリセットして、また集中できるよ。",
  "軽くストレッチして、体と頭を解放しよう。",
  "少し歩いて、体に新鮮な空気を通そう。",
  "コーヒーでも、お茶でも、好きな飲み物で一服を。",
  "緊張を手放す時間、それが今。",
  "このひとときが、次の集中をもっと強くする。",
  "成果を噛みしめながら、心を穏やかに。",
  "風通りを良くして、新たな発想を迎えよう。",
  "静かな瞬間が、次の行動に灯りをともす。",
  "ゆっくりした呼吸で、頭を空っぽにしよう。",
  "今はただ、何も考えずに身体を休めて。",
  "心身をリラックスさせて、新鮮なスタートを。",
  "この短い休みが、次の勝利の下地になる。",
  "少し遠くを見て、目と心をほぐそう。",
  "頑張った記憶を噛みしめて、次への活力に。",
  "耳をすまして、静かな自分を感じて。",
  "頭の中に余白を作って、次へ備えよう。",
  "疲れを感じるのは成長の証、今は癒やしの時間だ。",
  "自分をいたわることも、成功には欠かせない要素だ。",
  "さあ、次に踏み出すためのエネルギーを充電しよう。",
];

// 終了ダイアログ用コメントリスト
const completionComments: string[] = [
  "集中できた時間が、しっかり成果につながりましたね。",
  "今日の積み重ねが、明日以降の前進に生かされますよ。",
  "ご自分を誇れる取り組みでしたね。",
  "ひとつひとつ確実に前へ進んでいるのが感じられます。",
  "努力の結晶が今、確かな達成感となっておりますね。",
  "ご自身のペースを大切にしながら、よく頑張られました。",
  "短い時間にもしっかり集中できたことは大きな一歩です。",
  "地道な取り組みが、着実にあなたを支えていますね。",
  "静かな意志をもって取り組まれた姿勢が素晴らしかったです。",
  "日々の継続が、確かな成長へとつながっていますね。",
  "少しずつ積み上げた努力が、見えない力になっていきます。",
  "本当にお疲れ様でした。ご自身に優しく、次へつなげましょう。",
  "区切りをしっかりつけて、ご自分を労わることも大切ですね。",
  "毎回の積み重ねが、新たな可能性を開いていくでしょう。",
  "ここまでしっかり取り組まれたこと、誇りに思ってください。",
  "丁寧な集中時間が、あなたの自信となって蓄積されています。",
  "小さな前進が大きな成果への道標となるはずです。",
  "落ち着いて続けられた分、確かな前向きさが育っていますね。",
  "しっかりと目標に向き合う姿は、とても素敵でした。",
  "あなたの努力が、一歩ずつ理想に近づけていますよ。",
  "ここで得た集中力は、今後の大きな財産となるでしょう。",
  "一度に大きく進めずとも、確かな前進が見て取れますね。",
  "達成感を胸に、次回も笑顔で取り組めそうですね。",
  "今日積んだ一歩が、明日をさらに明るくしてくれます。",
  "あなたの粘り強さが、確実に自信へと変わっていくでしょう。",
  "穏やかな集中が、心地よい達成感に繋がりましたね。",
  "一日の締めくくりにふさわしい取り組みでした。",
  "努力を重ねることが、確かな手応えを生み出しています。",
  "この集中時間を重ねるほど、理想との距離が縮まりますね。",
  "本日の成果を胸に、また新たな目標に向かっていけますよ。",
];

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
  
  // コメント用の状態変数
  const [currentComment, setCurrentComment] = useState<string>("");

  // 終了ダイアログ用コメントの状態変数
  const [completionComment, setCompletionComment] = useState<string>("");

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
  const videoRef = useRef<{ focus: HTMLVideoElement | null, break: HTMLVideoElement | null }>({ focus: null, break: null });
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
    if (!open) {
      setCompletionComment('');
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
      const randomIndex = Math.floor(Math.random() * completionComments.length);
      setCompletionComment(completionComments[randomIndex]);
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

  // コメントの選択ロジック
  useEffect(() => {
    if (isBreak) {
      // 休憩時間のコメントをランダムに選択
      const randomIndex = Math.floor(Math.random() * breakComments.length);
      setCurrentComment(breakComments[randomIndex]);
    } else {
      // 集中時間のコメントをランダムに選択
      const randomIndex = Math.floor(Math.random() * focusComments.length);
      setCurrentComment(focusComments[randomIndex]);
    }
  }, [isBreak]);

  if (!isTimerStarted) {
    return <Settings />;
  }

  // 選択中のアバターオプション
  const avatarOption = AVATAR_OPTIONS.find((avatar) => avatar.id === selectedAvatar);
  // 拡張子分岐（bone_knightのみpng、それ以外はjpg）
  const avatarExtension = avatarOption && avatarOption.id === 'none'
    ? ''
    : avatarOption && avatarOption.id === 'bone_knight'
      ? 'png'
      : 'jpg';

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
            {avatarOption && avatarOption.id !== 'none' ? (
              <div className="relative mt-16">
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg">
                  <div className="relative">
                    <p className="text-sm">{currentComment}</p>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                </div>

                <div className="w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden">
                  {avatarOption.id !== 'none' && (
                    <img
                      src={`/assets/${avatarOption.id}.${avatarExtension}`}
                      alt={avatarOption.label}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            ) : null}

            <div className={`${avatarOption && avatarOption.id !== 'none' ? 'mt-8' : 'mt-0'} p-4 rounded-lg`}>
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
            <p className="text-lg">{completionComment}</p>
            <p className="text-sm text-gray-600">
              {sets}セット × {focusTime}分 の集中時間を達成しました
            </p>

            {/* PDCA用UI（今回は使用しないためfalse） */}
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
