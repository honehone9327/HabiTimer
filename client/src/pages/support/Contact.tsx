import { ChevronLeft, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export const Contact = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // 実際のAPIエンドポイントは未実装
    console.log('送信されたデータ:', data);
    
    toast({
      title: "送信完了",
      description: "お問い合わせを受け付けました。",
    });
    
    reset();
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
            <Mail className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">お問い合わせ</h1>
          </div>
        </header>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  {...register("name", { required: "お名前を入力してください" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "メールアドレスを入力してください",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "有効なメールアドレスを入力してください"
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">お問い合わせ内容</Label>
                <Textarea
                  id="message"
                  {...register("message", { required: "お問い合わせ内容を入力してください" })}
                  className="min-h-[150px]"
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                送信する
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
