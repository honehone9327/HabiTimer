import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PLAN_DETAILS = {
  free: {
    name: "Freeプラン",
    price: "¥0/月",
    features: [
      "基本的なタイマー機能",
      "シンプルな統計",
      "標準テーマ"
    ],
    description: "基本的な機能を無料で利用できるプランです。"
  },
  premium: {
    name: "プレミアムプラン",
    monthlyPrice: "¥980/月",
    yearlyPrice: "¥8,232/年 (30%オフ)",
    features: [
      "無制限のタスク",
      "詳細な統計",
      "カスタムテーマ",
      "広告非表示",
      "優先サポート"
    ],
    description: "より高度な機能とカスタマイズオプションを提供するプランです。",
    isPopular: true
  },
  ai: {
    name: "AIプラン",
    monthlyPrice: "¥1,980/月",
    yearlyPrice: "¥16,632/年 (30%オフ)",
    features: [
      "プレミアム機能すべて",
      "AIアシスタント",
      "優先サポート",
      "カスタムワークアウトプラン",
      "進捗分析レポート"
    ],
    description: "AI機能を活用した最上位のプランです。"
  }
};

export const PlanDetails = () => {
  const { planId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { toast } = useToast();
  
  const currentPlan = user?.subscription_plan || 'free';
  const isCurrentPlan = planId === currentPlan;
  
  const plan = PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS];
  
  if (!plan) {
    return <div>プランが見つかりません</div>;
  }

  const handleCancelSubscription = async () => {
    try {
      await useAuthStore.getState().updateSubscription('free', 'monthly');
      
      toast({
        title: "解約完了",
        description: "サブスクリプションを解約しました。",
      });
      
      setShowCancelModal(false);
      setLocation('/mypage');
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "解約処理に失敗しました。",
      });
    }
  };

  const handleSubscribe = () => {
    setLocation(`/subscription/checkout/${planId}?billingCycle=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <header className="flex items-center mb-8">
          <button
            onClick={() => setLocation('/mypage')}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
        </header>

        <div className="flex justify-center mb-6">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
            className="mr-2"
          >
            月額
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
          >
            年額
          </Button>
        </div>

        <Card className="relative overflow-hidden">
          {(plan as any).isPopular && (
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">人気プラン</span>
              </div>
            </div>
          )}
          <CardContent className="p-6">
            {isCurrentPlan && (
              <div className="absolute top-4 left-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  現在のプラン
                </div>
              </div>
            )}
            {isCurrentPlan && planId !== 'free' && (
              <div className="absolute top-16 right-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  解約する
                </Button>
              </div>
            )}
            <div className="text-center mb-6">
              {'monthlyPrice' in plan ? (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-green-600">
                    {billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                  </h2>
                  <p className="text-xl text-green-500">
                    {isCurrentPlan 
                      ? `${user?.billing_cycle === 'yearly' ? '年額' : '月額'}契約中` 
                      : billingCycle === 'yearly' 
                        ? '年額プラン（30%オフ）' 
                        : '月額プラン'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-green-600">{plan.price}</h2>
                </div>
              )}
              <p className="text-gray-600 mt-4">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">含まれる機能：</h3>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isCurrentPlan && planId !== 'free' && (
              <div className="w-full">
                <Button
                  onClick={() => handleSubscribe()}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={user?.billing_cycle === billingCycle}
                >
                  {billingCycle === 'yearly' ? '年額プランに変更' : '月額プランに変更'}
                </Button>
              </div>
            )}
            {planId !== 'free' && !isCurrentPlan && (
              <Button
                onClick={handleSubscribe}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                このプランに申し込む
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AIプランの自動更新解除</DialogTitle>
            <DialogDescription>
              ご加入いただいているAIプランの自動更新を解除しますか？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center mb-2">ご加入中のプラン：{plan.name} - {user?.billing_cycle === 'yearly' ? '年払い' : '月払い'}</p>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={handleCancelSubscription}
            >
              解除する
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCancelModal(false)}
            >
              もどる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isCurrentPlan && planId !== 'free' && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">ご請求先情報の設定</h2>
            <p className="text-gray-600 mb-6">以下の設定は外部サイトにて行います。</p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">以下の設定は外部サイトにて行います。</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 支払い方法の変更</li>
                  <li>• ご請求先情報の変更</li>
                  <li>• 請求書・領収書一覧の表示</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/mypage')}
                >
                  キャンセル
                </Button>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.open('https://billing.stripe.com/p/login/test', '_blank')}
                >
                  外部サイトへ移動
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanDetails;
