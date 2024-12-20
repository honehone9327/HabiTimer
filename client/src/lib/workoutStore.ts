import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioPlayer } from "../lib/audio";
import { useEffect } from 'react';

export const TRAINER_MESSAGES = {
  'drill-sergeant': {
    exercise: [
      'あと何回できる！！頑張れ！',
      '甘えは許さないぞ！',
      '限界を超えろ！',
      'まだやれるだろ、甘えるな！',
      'その程度で満足するな、さらに上を目指せ！',
      '根性を見せろ、甘い休憩は後回しだ！',
      '動きを止めるな、理想は手を伸ばせば届くはずだ！',
      '弱音は不要、黙って前へ進め！',
      'もう一歩踏み出せ、限界は思い込みだ！',
      '中途半端は許されない、最後までやりきれ！',
      '気合を入れ直せ、鍛えたいなら本気を出せ！',
      '汗を惜しむな、努力なくして成果なし！',
      'さぼるな、君ならもっとできる！',
      '弱気になるな、今が踏ん張り時だ！',
      '一歩も引くな、負荷は自分を超えるチャンス！',
      '本気で鍛えたいなら、言い訳はやめろ！',
      '最後まで力を出し切れ、半端は捨てろ！',
      '限界を超える意思を見せろ、妥協するな！',
      '集中しろ、無駄な動きは一切許さない！',
      'サボる隙はない、今は全力を尽くせ！',
      'もう一段階上を目指せ、止まるな！',
      'できない？できるまでやる、それが本気！',
      '甘えた声は届かない、身体で結果を示せ！',
      '力を出せ、心を奮い立たせるんだ！',
      '弱点を克服するには、限界まで追い込め！',
      'まだ時間がある、足を止めるな！',
      '泣き言は要らない、今は行動のみ！',
      'たるんでいる暇はない、進むしかない！',
      '強くなりたいなら、この苦しみを耐え抜け！',
      '自分に挑め、妥協は許されない！',
      '努力なくして成長なし、立ち上がれ！',
      '目的を忘れるな、甘さが成果を遠ざける！',
      '終わりまで突き進め、後退は許されない！',
    ],
    rest: [
      '次はもっと追い込むぞ！',
      '休憩は短く！',
      '準備はいいか！',
      '少し休め、すぐに戻るんだ！',
      '短い休みだ、ダラダラするな！',
      '気を抜くな、次に備えろ！',
      'この休みは必要最低限、しっかり呼吸しろ！',
      '水分補給したら、すぐに動く準備を！',
      '甘えるな、休んだら即戻れ！',
      '気持ちを緩めすぎるな、また動くぞ！',
      '時間は限られてる、無駄にするな！',
      '一息ついたら即行動、覚えておけ！',
      '次のセットを意識しろ、余計なことは考えるな！',
      'ゴールはまだ先、ここで油断するな！',
      '必要な休みだけ取れ、それ以上は不要だ！',
      '自分を律して、怠惰を遠ざけろ！',
      '甘さは禁物、復帰に備えよ！',
      'この休みは戦略的、気を緩めるな！',
      '息を整えたら、すぐに本気モードに戻れ！',
      '休むのも鍛錬だ、集中を切らすな！',
      '一気に切り替えろ、だらけるな！',
      'ここで緩めたら成長は止まる、理解したか？',
      '休みといえども頭はクリアに、次へ備えろ！',
      '気合は持続させろ、休憩は通過点だ！',
      '目標を見失うな、ここで気を抜けば後退だ！',
      '疲れを感じたら、その分だけ前に出ろ！',
      '短い休みで十分、鍛えた意志を試せ！',
      '心を引き締めろ、ここで終わらせるな！',
      '休息は最低限、それが成長への道だ！',
      '油断は敗北、常に前進を意識しろ！',
      '甘い考えは捨てろ、時間は貴重だ！',
      'しっかり休んだら次へ飛び込め！',
      '中途半端は許されない、休み終わり次第動け！',
    ]
  },
  'friendly': {
    exercise: [
      'その調子！頑張ってます！',
      'もう少し！一緒に頑張りましょう！',
      'とてもいい感じです！',
      'その調子！しっかりフォームを意識してるね。',
      'いい感じ、笑顔で動けてるよ！',
      '今日も元気に身体を動かせて素敵だね！',
      '呼吸がスムーズだね、バッチリ！',
      '力強い動き、キラキラしてるよ！',
      '少しずつでOK、継続が大事だよ。',
      'そのペース、君らしいリズムだ！',
      '柔軟性が増してきた感じ、素晴らしい！',
      '姿勢がとても綺麗、さすが！',
      '笑顔で取り組むと、体も心も軽くなるね。',
      'この一歩一歩が、明日の自信になるよ！',
      '元気な汗が出てる、その努力は本物だ！',
      'すごい、前より動きがスムーズだね！',
      'ポジティブなエネルギーを放ってるよ。',
      'その意欲、すごく伝わってくる！',
      'リズムよく動けている、すごくナチュラル！',
      '楽しそうに動く姿が最高！',
      '進歩を実感できると嬉しいよね！',
      '安定したペース、いい調子だ！',
      'その集中、しっかり成果に繋がるよ！',
      '自分を信じて、着実に前に進もう。',
      '程よい負荷が成長の秘訣だね！',
      'コツコツやる姿が本当に素敵！',
      '息ぴったり、身体がよく応えてる！',
      'ちょっとずつ強くなってるのを感じるね！',
      'いいね、その勢いをキープして！',
      'リラックスした笑顔がとても良いよ。',
      '自分との対話が上手になっているね！',
      '身体が生き生きしてきたね、そのまま！',
      'ラストスパートも笑顔でいこう！',
    ],
    rest: [
      'しっかり休んでくださいね',
      '水分補給も忘れずに！',
      '次も一緒に頑張りましょう！',
      '一息ついて、水分補給してね。',
      'よく頑張ったね、ちょっと呼吸を整えよう。',
      'ナイスファイト！今は少しゆっくりしよう。',
      'その汗は努力の証拠、しばし安らぎを。',
      'ほんの少しの休みが、次へのパワーになるよ。',
      '身体を癒せば、次に挑む心が弾む！',
      '今は内側に力を蓄え、次の波に乗ろう！',
      '目標はまだ遠い、そのための小さな充電時間！',
      '深呼吸して、また高く飛ぶ準備を！',
      '自分を高めるには、休む勇気も必要だ！',
      'しばし静かに、闘志を養え！',
      'ここで得た余裕が、次の一歩を軽くする！',
      '努力した分、体も心も報われるはず！',
      '新たな可能性を感じるための静寂な時間。',
      '挑戦者には、休息も戦略の一部だ！',
      '一旦力を抜けば、再び強く握れる！',
      '立ち止まることで、目標がさらにはっきり見える！',
      '自分をいたわる行為が、継続の秘訣だ！',
      'エネルギーを満たせば、次の限界に挑める！',
      '振り返り、この瞬間を誇りに思おう！',
      '羽ばたく前に、静かに羽を整える時間。',
      '燃えた心を静め、次に燃え上がれ！',
      'この小休止が、さらなる成長の礎となる！',
      '行動の間に休息をはさむ、それが強者の知恵！',
      '余白があるからこそ、思い切り走れる！',
      '心と身体を結び直し、再び挑もう！',
      '今日の努力を味わい、明日への励みに！',
      '静かな勝利の凱歌を心で響かせよう！',
      '内なる強さを感じながら、呼吸を深めて。',
      '一息入れれば、さらに高い山も超えられる！',
      '再び目標へ飛び込むための、充電のひととき！',
    ]
  },
  'motivational': {
    exercise: [
      '自分を信じて！',
      '一歩一歩、着実に！',
      'あなたならできる！',
      'さぁ、限界を超える準備はできてる！',
      '今こそ自分を更新する時！',
      '苦しい瞬間が、君をより強くする！',
      '理想の自分は、その先に待っている！',
      '一歩前進するたび、壁は低くなる！',
      'この負荷が、明日の誇りになる！',
      '全力を出せば、その先に新たな景色がある！',
      '君ならできる、さあ挑戦を続けよう！',
      '妥協しないその意志が力に変わる！',
      'いま流す汗は、あとで自信に変わる！',
      'もう一押し、次のステージが見えてくる！',
      '力強い自分への扉が、ここで開く！',
      'あと少し踏ん張れば、未来が変わる！',
      '君の可能性はまだ眠っている、叩き起こせ！',
      '達成感は行動の先にしか生まれない！',
      '自らを超えた証を、ここで刻もう！',
      '苦しさは強さを鍛える砥石だ！',
      '継続こそ真の強さ、今がその証明時！',
      '掴みたい理想があるなら、今動くしかない！',
      '大きな目標ほど、燃える炎も高まる！',
      '速さより着実さ、その積み重ねが偉大な力に！',
      '君の意思が筋肉を作り、魂を熱くする！',
      '限界は幻、可能性は無限に広がる！',
      '己を信じて一歩前進、それが勝利への鍵！',
      '頑張る君を、未来の君が誇っている！',
      '努力が強さに、強さが自信に繋がる！',
      'ここで逃げない勇気が、成功を引き寄せる！',
      '今出した努力は、必ず報われる！',
      '気持ちを高めて、今を突破するんだ！',
      '身体が熱い、心が燃える、そのまま駆け抜けろ！',
    ],
    rest: [
      '良い休憩を！',
      'リフレッシュしましょう！',
      '次も頑張りましょう！',
      'よく戦った、その身体を労わろう！',
      '汗は努力の証拠、今はその成果を味わって。',
      '緊張を解き放てば、より強く再始動できる！',
      '少しの休みが、また火を灯してくれる！',
      '身体を癒せば、次に挑む心が弾む！',
      '今は内側に力を蓄え、次の波に乗ろう！',
      '目標はまだ遠い、そのための小さな充電時間！',
      '深呼吸して、また高く飛ぶ準備を！',
      '自分を高めるには、休む勇気も必要だ！',
      'しばし静かに、闘志を養え！',
      'ここで得た余裕が、次の一歩を軽くする！',
      '努力した分、体も心も報われるはず！',
      '新たな可能性を感じるための静寂な時間。',
      '挑戦者には、休息も戦略の一部だ！',
      '一旦力を抜けば、再び強く握れる！',
      '立ち止まることで、目標がさらにはっきり見える！',
      '自分をいたわる行為が、継続の秘訣だ！',
      'エネルギーを満たせば、次の限界に挑める！',
      '振り返り、この瞬間を誇りに思おう！',
      '羽ばたく前に、静かに羽を整える時間。',
      '燃えた心を静め、次に燃え上がれ！',
      'この小休止が、さらなる成長の礎となる！',
      '行動の間に休息をはさむ、それが強者の知恵！',
      '余白があるからこそ、思い切り走れる！',
      '心と身体を結び直し、再び挑もう！',
      '今日の努力を味わい、明日への励みに！',
      '静かな勝利の凱歌を心で響かせよう！',
      '内なる強さを感じながら、呼吸を深めて。',
      '一息入れれば、さらに高い山も超えられる！',
      '再び目標へ飛び込むための、充電のひととき！',
    ]
  }
};

export interface Exercise {
  id: string;
  name: string;
  custom?: boolean;
}

interface WorkoutState {
  exerciseTime: number;
  restTime: number;
  sets: number;
  isRunning: boolean;
  isTimerStarted: boolean;
  currentSet: number;
  isRest: boolean;
  remainingTime: number;
  selectedMusic: string;
  exercises: Exercise[];
  selectedExercise: string | null;
  trainerMode: string;
  currentMessage: string;
  timerId: number | null;
  showCompletionDialog: boolean;
  
  setExerciseTime: (time: number) => void;
  setTrainerMode: (mode: string) => void;
  updateTrainerMessage: () => void;
  setRestTime: (time: number) => void;
  setSets: (sets: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchMode: () => void;
  setSelectedMusic: (music: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (id: string) => void;
  setSelectedExercise: (id: string | null) => void;
  setShowCompletionDialog: (show: boolean) => void;
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: '腕立て' },
  { id: '2', name: 'スクワット' },
  { id: '3', name: 'プランク' },
];

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      exerciseTime: 30,
      restTime: 10,
      sets: 5,
      isRunning: false,
      isTimerStarted: false,
      currentSet: 1,
      isRest: false,
      remainingTime: 30,
      selectedMusic: 'なし',
      exercises: DEFAULT_EXERCISES,
      selectedExercise: null,
      trainerMode: 'friendly',
      currentMessage: 'トレーニングを始めましょう！',
      timerId: null,
      showCompletionDialog: false,

      setExerciseTime: (time) => set({ exerciseTime: time, remainingTime: time }),
      setTrainerMode: (mode) => set({ trainerMode: mode }),
      updateTrainerMessage: () => set((state) => {
        const messages = TRAINER_MESSAGES[state.trainerMode as keyof typeof TRAINER_MESSAGES];
        const messageType = state.isRest ? 'rest' : 'exercise';
        const messageList = messages[messageType];
        const randomIndex = Math.floor(Math.random() * messageList.length);
        return { currentMessage: messageList[randomIndex] };
      }),
      setRestTime: (time) => set({ restTime: time }),
      setSets: (sets) => set({ sets }),
      toggleTimer: () => {
        const state = get();
        if (state.isRunning) {
          if (state.timerId !== null) {
            clearInterval(state.timerId);
          }
          set({ 
            isRunning: false, 
            timerId: null 
          });
        } else {
          get().updateTrainerMessage();

          const id = window.setInterval(() => {
            const currentState = get();
            if (currentState.remainingTime > 0) {
              currentState.tick();
            } else {
              currentState.switchMode();
            }
          }, 1000);

          set({
            isRunning: true,
            isTimerStarted: true,
            timerId: id
          });
        }
      },

      resetTimer: () => {
        const state = get();
        if (state.timerId !== null) {
          clearInterval(state.timerId);
          set({ timerId: null });
        }
        set((state) => ({
          isRunning: false,
          isTimerStarted: false,
          currentSet: 1,
          isRest: false,
          remainingTime: state.exerciseTime,
          showCompletionDialog: false,
          currentMessage: 'トレーニングを始めましょう！',
        }));
      },

      tick: () => set((state) => {
        const newRemainingTime = Math.max(0, state.remainingTime - 1);
        if (state.isRunning && newRemainingTime === 3) {
          audioPlayer.playNHKTimeSignal();
        }
        return { remainingTime: newRemainingTime };
      }),

      switchMode: () => set((state) => {
        // ここでtransitionSoundを鳴らしても0秒時点で確実に鳴らしたい場合はuseEffectで補完する

        if (state.currentSet >= state.sets && !state.isRest) {
          if (state.timerId !== null) {
            clearInterval(state.timerId);
          }
          return {
            isRunning: false,
            timerId: null,
            currentSet: 1,
            isRest: false,
            remainingTime: state.exerciseTime,
            showCompletionDialog: true,
            currentMessage: 'トレーニングを始めましょう！',
          };
        }

        const isRest = !state.isRest;
        const currentSet = isRest ? state.currentSet : state.currentSet + 1;
        const newRemainingTime = (isRest ? state.restTime : state.exerciseTime);

        const messages = TRAINER_MESSAGES[state.trainerMode as keyof typeof TRAINER_MESSAGES];
        const messageType = isRest ? 'rest' : 'exercise';
        const messageList = messages[messageType];
        const randomIndex = Math.floor(Math.random() * messageList.length);
        const newMessage = messageList[randomIndex];

        return {
          isRest,
          currentSet,
          remainingTime: newRemainingTime,
          isRunning: true,
          currentMessage: newMessage,
        };
      }),
      setSelectedMusic: (music) => set({ selectedMusic: music }),
      addExercise: (exercise) => set((state) => ({
        exercises: [...state.exercises, exercise],
      })),
      removeExercise: (id) => set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
      })),
      setSelectedExercise: (id) => set({ selectedExercise: id }),
      setShowCompletionDialog: (show) => set({ showCompletionDialog: show }),
    }),
    {
      name: 'workout-storage',
    }
  )
);

// ここでuseWorkoutAudioEffectsを同一ファイル内に定義する
// これで別ファイル不要で、remainingTime === 0 時にtransitionSoundを鳴らすことができます。
export const useWorkoutAudioEffects = () => {
  const remainingTime = useWorkoutStore((state) => state.remainingTime);

  useEffect(() => {
    if (remainingTime === 0) {
      audioPlayer.playTransitionSound();
    }
  }, [remainingTime]);
};
