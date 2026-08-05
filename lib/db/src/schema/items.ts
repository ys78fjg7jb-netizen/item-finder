import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "lost" | "found"
  category: text("category").notNull(),
  color: text("color").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  locationDescription: text("location_description"),
  dateOfLoss: text("date_of_loss"), // YYYY-MM-DD string, when the item was lost
  status: text("status").notNull().default("open"), // "open" | "resolved"
  reporterName: text("reporter_name").notNull(),
  reporterContact: text("reporter_contact").notNull(),
  studentId: text("student_id"),
  grade: text("grade"), // e.g. "Year 10", "Grade 5"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;
