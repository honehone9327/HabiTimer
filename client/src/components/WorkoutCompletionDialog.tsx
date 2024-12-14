import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "../lib/workoutStore";
import { useEffect, useState } from "react";

// 各トレーナーモードごとの終了ダイアログ用コメントリスト
const COMPLETION_MESSAGES = {
  'drill-sergeant': [
    "終わったな。だがまだ満足するな！",
    "やり遂げたな、次はもっと高みを目指せ！",
    "これで終わりじゃない、鍛錬は続く！",
    "一つ乗り越えたな、次への準備を急げ！",
    "成し遂げたが、まだ道半ばだ！",
    "結果を出したなら、次は更なる壁を超える番だ！",
    "少しは成長したな、気を抜くなよ！",
    "達成感は一瞬、継続が真価を証明する！",
    "今回で満足するな、もっと上がある！",
    "余韻に浸る暇はない、さらなる挑戦が待っている！",
    "やり遂げた？ならば次ももっと苛烈に追い込め！",
    "成長した分、さらに強く求めよ！",
    "実力を上げたな、だが限界はまだ先！",
    "今日の成果は当たり前、次もやれ！",
    "達成した？ならば次も同じ苦痛に耐えろ！",
    "一歩進んだ程度で気を緩めるな！",
    "休むな、次へ踏み込む準備をしろ！",
    "達成感は毒にもなる、継続して価値を示せ！",
    "理想にはまだ遠い、慢心するな！",
    "満足など無用、前進あるのみ！",
    "進歩したな、だがそれで終わりと思うな！",
    "目標を超えたら、さらに高い目標を立てろ！",
    "今日は上手くやった、だが明日はどうだ？",
    "一回の勝利で安心するな、次の戦いがある！",
    "さあ、休んだら即復帰、強くなれ！",
    "情けは不要、次の自分を追い込め！",
    "達成？笑わせるな、それは通過点だ！",
    "ようやく一段上がったな、さっさと次を目指せ！",
    "結果を出した分、期待も高まるぞ！",
    "いいだろう、次はもっと強度を上げるぞ！",
  ],
  'friendly': [
    "お疲れ様！今日もよく動けたね！",
    "素晴らしい達成感！身体も心も喜んでるよ！",
    "汗をかいた分、笑顔が増えたね！",
    "前より強くなった自分を感じて、誇らしいね！",
    "一歩ずつ積み重ねて、ここまで来た！",
    "素敵な頑張りを見せてくれてありがとう！",
    "継続は力なり、今日もそれを証明したね！",
    "ハイタッチしたいくらいの頑張りだったよ！",
    "自分を信じた成果が、今ここにある！",
    "ゆっくり深呼吸して、この達成感を味わおう！",
    "どんどん良くなってる、続けるってすごいね！",
    "元気いっぱいの努力に拍手！",
    "身体が軽く感じるでしょう？頑張った証拠だね！",
    "笑顔で終われるトレーニング、最高だ！",
    "いい調子、次回もまた一緒に頑張ろう！",
    "努力した分、ちゃんと報われてるよ！",
    "大きな山を越えたみたいな爽快感だね！",
    "自分への信頼が、また一段強まったはず！",
    "今日は良い動きだった、次へのモチベになるね！",
    "こうして成果を実感できるって嬉しい！",
    "がんばったぶん、明日がもっと楽しみになる！",
    "身体も心もパワーアップ！よくやった！",
    "君の努力が輝いているよ、素敵！",
    "いい汗だったね、その調子で進んでいこう！",
    "トレーニング後の爽快感、クセになりそう！",
    "君の頑張りが未来を明るくする！",
    "今日積んだ努力が明日のエネルギーだ！",
    "自分を動かした分、自分を信じられる！",
    "その頑張りにありがとう！また挑戦しよう！",
    "よくやった！今夜はぐっすり眠れそうだね！",
  ],
  'motivational': [
    "見事にやり遂げた、その努力は本物だ！",
    "目標へ一歩近づいた、次は更に上を目指そう！",
    "身体と心が鍛えられ、確実に進化した！",
    "今日の達成感は、明日の挑戦の燃料だ！",
    "限界を超えた瞬間こそ成長の証！",
    "理想に向かう階段を、また一段登った！",
    "大きな誇りを胸に、さらに前へ進もう！",
    "汗と努力が結果となって輝いている！",
    "達成感に浸ったら、もう次の目標が待ってる！",
    "自分を超えた結果、この力は揺るがない！",
    "妥協しない君が、ここに誇りを残した！",
    "強くなった自分を感じ取れ、それが報酬だ！",
    "燃える意志を形にできた、次回も攻め続けよう！",
    "自分との約束を守った、その信頼は揺らがない！",
    "苦しい分だけ大きくなった自信がそこにある！",
    "努力が報われる瞬間を掴んだ、素晴らしい！",
    "今の君なら、もっと高く跳べるだろう！",
    "一度得た力はもう君のもの、さらなる高みへ！",
    "目指す山があるなら、今日の努力はその基礎だ！",
    "汗は誇り、呼吸は強さ、君は前進した！",
    "自分を奮い立たせた結果、成果を実感できる！",
    "次はどこまで行けるか、楽しみになってきた！",
    "可能性は拡大中、壁はもう低く見える！",
    "地道な努力が、揺るぎない強さを育てた！",
    "目標へ挑む勢いが増した、今がチャンスだ！",
    "迷いや不安を超えた今、君は強い！",
    "今日の汗が明日の成功を呼ぶ！",
    "前に進んだ分、次のハードルも乗り越えられる！",
    "頑張った証がここにある、誇りに思え！",
    "満足せず、更に上を目指せる自分になった！",
  ],
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

  // 選択されたコメントを保持するローカルステート
  const [selectedMessage, setSelectedMessage] = useState<string>('');

  // ダイアログが開いたときにランダムなコメントを選択
  useEffect(() => {
    if (showCompletionDialog && trainerMode && COMPLETION_MESSAGES[trainerMode as keyof typeof COMPLETION_MESSAGES]) {
      const messages = COMPLETION_MESSAGES[trainerMode as keyof typeof COMPLETION_MESSAGES];
      const randomIndex = Math.floor(Math.random() * messages.length);
      setSelectedMessage(messages[randomIndex]);
    }
  }, [showCompletionDialog, trainerMode]);

  const exerciseName = selectedExercise 
    ? exercises.find(e => e.id === selectedExercise)?.name 
    : '';

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
            <p className="text-xl font-medium">{selectedMessage}</p>
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
