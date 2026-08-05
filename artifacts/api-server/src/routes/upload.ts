import { Router } from "express";
import { createWriteStream, mkdirSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { IncomingMessage } from "http";

const router = Router();

const UPLOADS_DIR = join(process.cwd(), "uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

// Parse a multipart/form-data body manually — only handles a single file field "image"
async function parseMultipart(
  req: IncomingMessage & { headers: Record<string, string | string[] | undefined> },
): Promise<{ filename: string; ext: string; buffer: Buffer } | null> {
  return new Promise((resolve, reject) => {
    const contentType = (req.headers["content-type"] as string) ?? "";
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      resolve(null);
      return;
    }
    const boundary = "--" + boundaryMatch[1];

    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const bodyStr = body.toString("binary");

      const boundaryBuf = Buffer.from(boundary, "binary");
      const parts: Buffer[] = [];
      let start = 0;
      let pos = bodyStr.indexOf(boundary);
      while (pos !== -1) {
        if (start > 0) {
          // strip trailing \r\n before boundary
          parts.push(body.slice(start, pos - 2));
        }
        start = pos + boundary.length + 2; // skip boundary + \r\n
        pos = bodyStr.indexOf(boundary, start);
      }

      for (const part of parts) {
        const headerEnd = part.indexOf("\r\n\r\n");
        if (headerEnd === -1) continue;
        const headerStr = part.slice(0, headerEnd).toString();
        const fileData = part.slice(headerEnd + 4);

        const dispositionMatch = headerStr.match(/filename="([^"]+)"/i);
        const nameMatch = headerStr.match(/name="([^"]+)"/i);
        if (nameMatch && nameMatch[1] === "image" && dispositionMatch) {
          const filename = dispositionMatch[1];
          const ext = extname(filename) || ".jpg";
          resolve({ filename, ext, buffer: fileData });
          return;
        }
      }
      resolve(null);
    });
  });
}

// POST /upload
router.post("/upload", async (req, res): Promise<void> => {
  try {
    const result = await parseMultipart(req as any);
    if (!result) {
      res.status(400).json({ error: "No image file found in request" });
      return;
    }

    const uniqueName = randomUUID() + result.ext;
    const filePath = join(UPLOADS_DIR, uniqueName);

    await new Promise<void>((resolve, reject) => {
      const ws = createWriteStream(filePath);
      ws.write(result.buffer);
      ws.end();
      ws.on("finish", resolve);
      ws.on("error", reject);
    });

    const imageUrl = `/api/uploads/${uniqueName}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
