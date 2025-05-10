import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  studentId: text("student_id").unique(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Elections table
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  department: text("department"),
  status: text("status").notNull().default("scheduled"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  type: text("type").notNull().default("campus-wide"),
});

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  manifesto: text("manifesto").notNull(),
  photoURL: text("photo_url"),
  electionId: integer("election_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Votes table
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Voter activity table for real-time feed
export const voterActivity = pgTable("voter_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  electionId: integer("election_id").notNull(),
  electionTitle: text("election_title").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  email: true,
  displayName: true,
  studentId: true,
  role: true,
});

export const insertElectionSchema = createInsertSchema(elections).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  department: true,
  status: true,
  createdBy: true,
  type: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  department: true,
  manifesto: true,
  photoURL: true,
  electionId: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  electionId: true,
  candidateId: true,
  userId: true,
});

export const insertVoterActivitySchema = createInsertSchema(voterActivity).pick({
  userId: true,
  userName: true,
  userInitials: true,
  electionId: true,
  electionTitle: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertElection = z.infer<typeof insertElectionSchema>;
export type Election = typeof elections.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertVoterActivity = z.infer<typeof insertVoterActivitySchema>;
export type VoterActivity = typeof voterActivity.$inferSelect;
