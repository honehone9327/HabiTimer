import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bell, HelpCircle, Mail, Settings, User, ChevronLeft, FileText, Shield } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import { usePreviousPath } from "../hooks/usePreviousPath";
import { useToast } from "@/hooks/use-toast";

const AVATAR_OPTIONS = [
  { id: 'default', icon: '👤' },
  { id: 'smile', icon: '😊' },
  { id: 'cool', icon: '😎' },
  { id: 'ninja', icon: '🥷' },
  { id: 'cat', icon: '😺' },
];

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile, token } = useAuthStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ファイルサイズは8MB以下にしてください。",
      });
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "JPEGまたはPNG形式のファイルを選択してください。",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.json().then(data => data.message));
      }

      const data = await response.json();
      setPreviewUrl(data.avatarUrl);
      
      if (data.user) {
        useAuthStore.setState({ user: data.user });
      }

      toast({
        title: "成功",
        description: "アバター画像を更新しました。",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "アバターのアップロードに失敗しました。",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updateData: Record<string, string> = {};
      let hasChanges = false;
      
      if (formData.name && formData.name !== user?.name) {
        updateData.name = formData.name;
        hasChanges = true;
      }
      
      if (formData.email && formData.email !== user?.email) {
        updateData.email = formData.email;
        hasChanges = true;
      }
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        hasChanges = true;
      }

      if (hasChanges) {
        await updateProfile(updateData);
      }
      
      toast({
        title: "プロフィールを更新しました",
        description: "変更が正常に保存されました。",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "プロフィールの更新に失敗しました。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>アバター</Label>
              <div className="mt-2 space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-24 h-24">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="アバタープレビュー"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="max-w-xs"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  JPEGまたはPNG形式、最大8MB
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">ニックネーム</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">新しいパスワード（変更する場合のみ）</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "更新中..." : "更新"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const MyPage = () => {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const currentPlan = user?.subscription_plan || 'free';

  const supportItems = [
    { icon: Bell, label: "お知らせ", href: "/support/notifications" },
    { icon: HelpCircle, label: "よくあるご質問", href: "/support/faq" },
    { icon: Mail, label: "お問い合わせ", href: "/support/contact" },
    { icon: Settings, label: "アカウント設定", href: "/support/account-settings" },
    { icon: FileText, label: "利用規約", href: "/support/terms" },
    { icon: Shield, label: "プライバシーポリシー", href: "/support/privacy" }
  ];

  const subscriptionPlans = [
    {
      name: "Freeプラン",
      price: "¥0",
      period: "月額",
      features: ["基本的なタイマー機能", "シンプルな統計", "標準テーマ"]
    },
    {
      name: "プレミアムプラン",
      price: "¥980",
      period: "月額",
      yearlyPrice: "¥8,232",
      yearlyPeriod: "年額",
      discount: "30%オフ",
      features: ["無制限のタスク", "詳細な統計", "カスタムテーマ", "広告非表示", "優先サポート"]
    },
    {
      name: "AIプラン",
      price: "¥1,980",
      period: "月額",
      yearlyPrice: "¥16,632",
      yearlyPeriod: "年額",
      discount: "30%オフ",
      features: ["プレミアム機能すべて", "AIアシスタント", "優先サポート", "カスタムワークアウトプラン"]
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <header className="flex items-center mb-8">
            <button
              onClick={() => setLocation(usePreviousPath.getState().previousPath)}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">マイページ</h1>
          </header>

          <div className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="ユーザーアバター"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{user?.name || 'ゲストユーザー'}</h2>
                    <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditProfile(true)}
                      className="mt-2"
                    >
                      プロフィール編集
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans - Currently hidden */}
            {false && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">サブスクリプション</h3>
                  <div className="space-y-4">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                          (plan.name.toLowerCase().includes('プレミアム') && currentPlan === 'premium') ||
                          (plan.name.toLowerCase().includes('ai') && currentPlan === 'ai') ||
                          (plan.name.toLowerCase().includes('free') && currentPlan === 'free')
                            ? 'border-green-500 bg-green-50' 
                            : 'hover:border-green-500'
                        }`}
                        onClick={() => setLocation(`/subscription/${plan.name.toLowerCase().includes('プレミアム') ? 'premium' : plan.name.toLowerCase().includes('ai') ? 'ai' : 'free'}`)}
                      >
                        {((plan.name.toLowerCase().includes('プレミアム') && currentPlan === 'premium') ||
                          (plan.name.toLowerCase().includes('ai') && currentPlan === 'ai') ||
                          (plan.name.toLowerCase().includes('free') && currentPlan === 'free')) && (
                          <div className="mb-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                              現在のプラン（{user?.billing_cycle === "yearly" ? "年額" : "月額"}）
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{plan.name}</h4>
                          <div className="text-right">
                            <div className="text-green-600 font-medium">{plan.price}{plan.period}</div>
                            {plan.yearlyPrice && (
                              <div className="text-sm">
                                <span className="text-green-600">{plan.yearlyPrice}{plan.yearlyPeriod}</span>
                                <span className="ml-1 text-red-500 text-xs">{plan.discount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ul className="text-sm text-gray-600">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center space-x-2">
                              <span>・{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information - Currently hidden */}
            {false && user?.subscription_plan !== 'free' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">お支払い情報</h3>
                  
                  {/* カード情報の表示 */}
                  <div className="mb-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">カード情報</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">**** **** **** 1011</span>
                          <span className="text-sm text-gray-500">有効期限: 2028/2</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ご請求先情報の変更</span>
                        <Button
                          variant="link"
                          className="text-blue-500 p-0 h-auto"
                          onClick={() => setShowPaymentDialog(true)}
                        >
                          変更
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">請求書・領収書</span>
                        <Button
                          variant="link"
                          className="text-blue-500 p-0 h-auto"
                          onClick={() => setShowPaymentDialog(true)}
                        >
                          一覧表示
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Support Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">サポート</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {supportItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 p-4"
                      onClick={() => setLocation(item.href)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm text-center sm:text-left">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={() => {
                logout();
                setLocation('/auth');
              }}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </div>

      <EditProfileDialog 
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
      />

      {/* Payment Dialog - Currently hidden */}
      {false && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>お支払い情報</DialogTitle>
              <DialogDescription>
                以下の設定は外部サイトにて行います。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">外部サイトでできること：</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• カード情報の変更</li>
                  <li>• 請求先情報の変更</li>
                  <li>• 請求書・領収書の確認</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPaymentDialog(false)}
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
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MyPage;
