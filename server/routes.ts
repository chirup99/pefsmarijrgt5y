import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { users, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 12;

import { AccessToken } from "livekit-server-sdk";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/livekit/token", async (req, res) => {
    const roomName = "pitch-room";
    const participantName = "user-" + Math.floor(Math.random() * 1000);
    
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      return res.status(500).json({ error: "LiveKit credentials not configured" });
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      }
    );
    at.addGrant({ roomJoin: true, room: roomName });

    res.json({ token: await at.toJwt() });
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { password: _, ...safeUser } = user;
      res.status(200).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      let user;
      if (input.email) {
        const existingUser = await storage.getUserByEmail(input.email);
        if (existingUser) {
          // If user exists, update their profile with the new details and cards
          const { password: _, ...updateData } = input as any;
          const updatedUser = await storage.updateUser(existingUser.id, updateData);
          
          let userWithSlug = updatedUser;
          // Ensure uniqueSlug exists on update if missing
          if (!existingUser.uniqueSlug) {
            let uniqueSlug = "";
            const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            let isUnique = false;
            let attempts = 0;
            while (!isUnique && attempts < 10) {
              attempts++;
              uniqueSlug = "";
              for (let i = 0; i < 5; i++) {
                uniqueSlug += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              const existing = await db.select().from(users).where(eq(users.uniqueSlug, uniqueSlug));
              if (existing.length === 0) isUnique = true;
            }
            if (isUnique) {
              userWithSlug = await storage.updateUser(existingUser.id, { uniqueSlug } as any);
            }
          }
          
          const { password: __, ...safeUser } = userWithSlug;
          return res.status(200).json(safeUser);
        }
      }

      const hashedPassword = input.password ? await bcrypt.hash(input.password, SALT_ROUNDS) : await bcrypt.hash(Math.random().toString(), SALT_ROUNDS);
      
      // Generate a unique 5-character slug
      let uniqueSlug = "";
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        attempts++;
        uniqueSlug = "";
        for (let i = 0; i < 5; i++) {
          uniqueSlug += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await db.select().from(users).where(eq(users.uniqueSlug, uniqueSlug));
        if (existing.length === 0) {
          isUnique = true;
        }
      }

      if (!isUnique) {
        throw new Error("Could not generate a unique slug");
      }

      console.log("Creating user with slug:", uniqueSlug);
      user = await storage.createUser({ 
        ...input, 
        email: input.email || `${Date.now()}@persona.local`,
        password: hashedPassword,
        uniqueSlug
      });
      
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    // ... existing patch route
  });

  app.get("/api/user/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const user = await (storage as any).getUserBySlug(slug);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
