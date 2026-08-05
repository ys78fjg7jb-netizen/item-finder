import { Router } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, itemsTable } from "@workspace/db";
import {
  ListItemsQueryParams,
  CreateItemBody,
  GetItemParams,
  UpdateItemParams,
  UpdateItemBody,
  DeleteItemParams,
  ResolveItemParams,
} from "@workspace/api-zod";

const router = Router();

// GET /items
router.get("/items", async (req, res): Promise<void> => {
  const parsed = ListItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, category, color, brand, status } = parsed.data;
  const conditions = [];

  if (type) conditions.push(eq(itemsTable.type, type));
  if (category) conditions.push(eq(itemsTable.category, category));
  if (color) conditions.push(eq(itemsTable.color, color));
  if (brand) conditions.push(eq(itemsTable.brand, brand));
  if (status) conditions.push(eq(itemsTable.status, status));

  const items = await db
    .select()
    .from(itemsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(itemsTable.createdAt));

  res.json(items);
});

// GET /items/stats — must come before /items/:id
router.get("/items/stats", async (req, res): Promise<void> => {
  const allItems = await db.select().from(itemsTable);

  const totalLost = allItems.filter((i) => i.type === "lost").length;
  const totalFound = allItems.filter((i) => i.type === "found").length;
  const totalResolved = allItems.filter((i) => i.status === "resolved").length;
  const totalOpen = allItems.filter((i) => i.status === "open").length;

  const categoryMap: Record<string, number> = {};
  for (const item of allItems) {
    categoryMap[item.category] = (categoryMap[item.category] ?? 0) + 1;
  }
  const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
  }));

  res.json({ totalLost, totalFound, totalResolved, totalOpen, categoryBreakdown });
});

// GET /items/recent — must come before /items/:id
router.get("/items/recent", async (req, res): Promise<void> => {
  const items = await db
    .select()
    .from(itemsTable)
    .orderBy(desc(itemsTable.createdAt))
    .limit(10);

  res.json(items);
});

// POST /items
router.post("/items", async (req, res): Promise<void> => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(itemsTable)
    .values({
      type: parsed.data.type,
      category: parsed.data.category,
      color: parsed.data.color,
      brand: parsed.data.brand,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl ?? null,
      locationDescription: parsed.data.locationDescription ?? null,
      reporterName: parsed.data.reporterName,
      reporterContact: parsed.data.reporterContact,
      status: "open",
    })
    .returning();

  res.status(201).json(item);
});

// GET /items/:id
router.get("/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

// PATCH /items/:id
router.patch("/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(itemsTable)
    .set({
      ...(parsed.data.category !== undefined && { category: parsed.data.category }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      ...(parsed.data.brand !== undefined && { brand: parsed.data.brand }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl }),
      ...(parsed.data.locationDescription !== undefined && {
        locationDescription: parsed.data.locationDescription,
      }),
      ...(parsed.data.reporterName !== undefined && { reporterName: parsed.data.reporterName }),
      ...(parsed.data.reporterContact !== undefined && {
        reporterContact: parsed.data.reporterContact,
      }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      updatedAt: new Date(),
    })
    .where(eq(itemsTable.id, id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

// DELETE /items/:id
router.delete("/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(itemsTable).where(eq(itemsTable.id, id));
  res.status(204).send();
});

// PATCH /items/:id/resolve
router.patch("/items/:id/resolve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db
    .update(itemsTable)
    .set({ status: "resolved", updatedAt: new Date() })
    .where(eq(itemsTable.id, id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

export default router;
