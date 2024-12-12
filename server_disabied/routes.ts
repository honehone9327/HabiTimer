import express, { type Express, Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { db } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import cors from "cors";

// JWT設定
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// アップロードディレクトリの設定
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// アップロードディレクトリの作成を確認
(async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
})();

// Multerの設定
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB制限
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
  },
});

interface AuthRequest extends Request {
  user?: any;
}

// 認証ミドルウェア
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export function registerRoutes(app: Express) {
  // CORSミドルウェアを追加
  app.use(cors());

  // アップロードされたファイルの提供
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        password_hash: hashedPassword,
        name,
        points: 0,
        is_verified: false,
        plan_type: 'free',
        subscription_plan: 'free',
        billing_cycle: 'monthly'
      }).returning();

      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          points: newUser.points,
          plan_type: newUser.plan_type,
          subscription_plan: newUser.subscription_plan,
          billing_cycle: newUser.billing_cycle
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          points: user.points,
          plan_type: user.plan_type,
          avatar_url: user.avatar_url,
          subscription_plan: user.subscription_plan,
          billing_cycle: user.billing_cycle
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          points: user.points,
          plan_type: user.plan_type,
          avatar_url: user.avatar_url,
          subscription_plan: user.subscription_plan,
          billing_cycle: user.billing_cycle
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error while fetching user data' });
    }
  });

  app.put('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const userId = req.user.id;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(password, salt);
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          points: updatedUser.points,
          plan_type: updatedUser.plan_type,
          avatar_url: updatedUser.avatar_url,
          subscription_plan: updatedUser.subscription_plan,
          billing_cycle: updatedUser.billing_cycle
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // アバターアップロードエンドポイント
  app.post('/api/auth/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // ファイルサイズの検証（8MB以下）
      if (req.file.size > 8 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size exceeds 8MB limit' });
      }

      // ファイル形式の検証
      if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type. Only JPEG and PNG are allowed' });
      }

      const fileExt = path.extname(req.file.originalname).toLowerCase();
      const fileName = `avatar-${req.user.id}-${Date.now()}${fileExt}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      
      // 古いアバター画像の削除
      const [currentUser] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
      if (currentUser.avatar_url) {
        const oldFilePath = path.join(process.cwd(), 'public', currentUser.avatar_url);
        try {
          await fs.access(oldFilePath);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }

      // 新しいアバター画像の保存
      await fs.writeFile(filePath, req.file.buffer);
      const avatarUrl = `/uploads/${fileName}`;

      // ユーザーレコードの更新
      const [updatedUser] = await db.update(users)
        .set({ avatar_url: avatarUrl })
        .where(eq(users.id, req.user.id))
        .returning();

      res.json({ 
        message: 'Avatar uploaded successfully',
        avatarUrl,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          points: updatedUser.points,
          plan_type: updatedUser.plan_type,
          avatar_url: updatedUser.avatar_url,
          subscription_plan: updatedUser.subscription_plan,
          billing_cycle: updatedUser.billing_cycle
        }
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });

  // サブスクリプション更新エンドポイント
  app.put('/api/auth/subscription', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { planId, billingCycle } = req.body;
      const userId = req.user.id;

      if (!planId) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }

      // プランとbillingCycleの検証
      if (!['free', 'premium', 'ai'].includes(planId)) {
        return res.status(400).json({ message: 'Invalid plan type' });
      }
      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(400).json({ message: 'Invalid billing cycle' });
      }

      // ユーザーのサブスクリプション更新
      const [updatedUser] = await db
        .update(users)
        .set({
          subscription_plan: planId,
          billing_cycle: billingCycle,
          subscription_start: new Date(),
          subscription_end: planId === 'free' ? null : new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        })
        .where(eq(users.id, userId))
        .returning();

      res.json({
        message: 'Subscription updated successfully',
        user: {
          ...updatedUser,
          billing_cycle: updatedUser.billing_cycle
        }
      });
    } catch (error) {
      console.error('Subscription update error:', error);
      res.status(500).json({ message: 'Failed to update subscription' });
    }
  });
}
