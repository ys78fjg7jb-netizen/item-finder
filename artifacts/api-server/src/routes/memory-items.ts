import { Router } from "express";
import {
  ListItemsQueryParams,
  CreateItemBody,
  UpdateItemBody,
} from "@workspace/api-zod";

type ItemRecord = {
  id: number;
  type: string;
  category: string;
  color: string;
  brand: string;
  description: string;
  imageUrl: string | null;
  locationDescription: string | null;
  dateOfLoss: string | null;
  status: string;
  reporterName: string;
  reporterContact: string;
  studentId: string | null;
  grade: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const items: ItemRecord[] = [];
let nextId = 1;
const router = Router();

function filteredItems(query: unknown): ItemRecord[] | null {
  const parsed = ListItemsQueryParams.safeParse(query);
  if (!parsed.success) return null;
  const { type, category, color, brand, status } = parsed.data;
  return items
    .filter((item) => !type || item.type === type)
    .filter((item) => !category || item.category === category)
    .filter((item) => !color || item.color === color)
    .filter((item) => !brand || item.brand === brand)
    .filter((item) => !status || item.status === status)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

router.get("/items", (req, res) => {
  const result = filteredItems(req.query);
  if (!result) {
    res.status(400).json({ error: "Invalid filter parameters" });
    return;
  }
  res.json(result);
});

router.get("/items/stats", (_req, res) => {
  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;
  const totalResolved = items.filter((i) => i.status === "resolved").length;
  const totalOpen = items.filter((i) => i.status === "open").length;
  const categoryCounts = new Map<string, number>();
  for (const item of items) categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  res.json({
    totalLost,
    totalFound,
    totalResolved,
    totalOpen,
    categoryBreakdown: [...categoryCounts].map(([category, count]) => ({ category, count })),
  });
});

router.get("/items/recent", (_req, res) => {
  res.json([...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10));
});

router.post("/items", (req, res) => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = new Date();
  const item: ItemRecord = {
    id: nextId++,
    type: parsed.data.type,
    category: parsed.data.category,
    color: parsed.data.color,
    brand: parsed.data.brand,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl ?? null,
    locationDescription: parsed.data.locationDescription ?? null,
    dateOfLoss: parsed.data.dateOfLoss ?? null,
    status: "open",
    reporterName: parsed.data.reporterName,
    reporterContact: parsed.data.reporterContact,
    studentId: parsed.data.studentId ?? null,
    grade: parsed.data.grade ?? null,
    createdAt: now,
    updatedAt: now,
  };
  items.push(item);
  res.status(201).json(item);
});

router.get("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

router.patch("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  const parsed = UpdateItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  Object.assign(item, parsed.data, { updatedAt: new Date() });
  res.json(item);
});

router.delete("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((candidate) => candidate.id === id);
  if (index < 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  items.splice(index, 1);
  res.status(204).send();
});

router.patch("/items/:id/resolve", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  item.status = "resolved";
  item.updatedAt = new Date();
  res.json(item);
});

export default router;
