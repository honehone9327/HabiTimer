import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/authStore";

export const Checkout = () => {
  const { planId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Get billingCycle from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const initialBillingCycle = searchParams.get('billingCycle') as "monthly" | "yearly" || "monthly";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(initialBillingCycle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "プランが選択されていません。",
      });
      return;
    }

    try {
      // サブスクリプション更新の実行
      await useAuthStore.getState().updateSubscription(planId, billingCycle);
      
      // 最新のユーザーデータを取得
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'ユーザーデータの取得に失敗しました');
      }
      
      const data = await response.json();
      
      // Zustandのstoreを更新
      useAuthStore.setState({ user: data.user });
      
      toast({
        title: "決済処理完了",
        description: `サブスクリプション（${billingCycle === "monthly" ? "月額" : "年額"}）の登録が完了しました。`,
      });
      
      setLocation('/mypage');
    } catch (error) {
      console.error('Subscription update error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "サブスクリプションの更新に失敗しました。",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <header className="flex items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">お支払い情報</h1>
          </div>
        </header>

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">支払い周期の選択</h2>
              <RadioGroup
                value={billingCycle}
                onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1">
                    <div>月額プラン</div>
                    <div className="text-sm text-gray-500">毎月のお支払い</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly" className="flex-1">
                    <div className="flex items-center gap-2">
                      年額プラン
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        30%お得
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">年間一括のお支払い</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">カード番号</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">有効期限</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvc">セキュリティコード</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                支払いを確定する
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
