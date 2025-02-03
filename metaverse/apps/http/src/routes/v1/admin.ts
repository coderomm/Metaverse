import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../schema-types";
import client from "@repo/db/client";
export const adminRouter = Router();

adminRouter.use(adminMiddleware)

adminRouter.post("/element", async (req, res) => {
    try {
        const parsedData = CreateElementSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: `Validation failed: ${parsedData.error.format()}`, errors: parsedData.error.format() });
            return;
        }

        const element = await client.element.create({
            data: {
                width: parsedData.data.width,
                height: parsedData.data.height,
                static: parsedData.data.static,
                imageUrl: parsedData.data.imageUrl,
            }
        });

        res.json({ id: element.id });
    } catch (error) {
        console.error("Error creating element:", error);
        res.status(500).json({ message: `Internal server error: ${error} ` });
    }
});

adminRouter.put("/element/:elementId", async (req, res) => {
    try {
        const parsedData = UpdateElementSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: `Validation failed: ${parsedData.error.format()}`, errors: parsedData.error.format() });
            return;
        }

        await client.element.update({
            where: { id: req.params.elementId },
            data: { imageUrl: parsedData.data.imageUrl }
        });

        res.json({ message: "Element updated" });
    } catch (error) {
        console.error("Error updating element:", error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
});

adminRouter.post("/avatar", async (req, res) => {
    try {
        const parsedData = CreateAvatarSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: `Validation failed: ${parsedData.error.format()}`, errors: parsedData.error.format() });
            return;
        }

        const avatar = await client.avatar.create({
            data: {
                name: parsedData.data.name,
                imageUrl: parsedData.data.imageUrl
            }
        });

        res.json({ avatarId: avatar.id });
    } catch (error) {
        console.error("Error creating avatar:", error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
});

adminRouter.post("/map", async (req, res) => {
    try {
        const parsedData = CreateMapSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: `Validation failed: ${parsedData.error.format()}`, errors: parsedData.error.format() });
            return;
        }

        const dimensions = parsedData.data.dimensions.split("x");
        if (dimensions.length !== 2) {
            res.status(400).json({ message: "Invalid dimensions format" });
            return;
        }

        const map = await client.map.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(dimensions[0]),
                height: parseInt(dimensions[1]),
                thumbnail: parsedData.data.thumbnail,
                mapElements: {
                    create: parsedData.data.defaultElements.map(e => ({
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y
                    }))
                }
            }
        });

        res.json({ id: map.id });
    } catch (error) {
        console.error("Error creating map:", error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
});

adminRouter.get('/secret', (req, res) => {
    try {
        res.status(200).json({ message: 'Welcome admin! This is the secret info.' });
    } catch (error) {
        console.error("Error accessing secret route:", error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
});