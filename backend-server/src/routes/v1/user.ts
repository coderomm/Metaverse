import { Router } from "express";
import client from "../../client";
import { userMiddleware } from "../../middlewares/user";
import { UpdateMetadataSchema } from "../../schema-types";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Metadata validation failed", errors: parsedData.error.format() });
        return;
    }

    try {
        const avatar = await client.avatar.findUnique({ where: { id: parsedData.data.avatarId } });
        if (!avatar) {
            res.status(400).json({ message: "Invalid avatarId, avatar does not exist" });
            return;
        }

        await client.user.update({
            where: { id: req.userId },
            data: { avatarId: parsedData.data.avatarId },
        });

        res.json({ message: "User metadata updated" });
    } catch (error: any) {
        console.error("Error updating metadata:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

userRouter.get("/metadata/bulk", async (req, res) => {
    try {
        let userIds: string[] = [];

        if (typeof req.query.ids === "string") {
            try {
                userIds = JSON.parse(req.query.ids);
                if (!Array.isArray(userIds)) throw new Error("Invalid format");
            } catch (error) {
                res.status(400).json({ message: "Invalid user IDs format" });
                return;
            }
        }

        if (userIds.length === 0) {
            res.json({ avatars: [] });
            return;
        }

        const metadata = await client.user.findMany({
            where: { id: { in: userIds } },
            select: { avatar: true, id: true },
        });

        res.json({
            avatars: metadata.map((m) => ({
                userId: m.id,
                avatarId: m.avatar?.imageUrl || null,
            })),
        });
    } catch (error: any) {
        console.error("Error fetching bulk metadata:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

userRouter.get("/me", userMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await client.user.findUnique({
            where: { id: userId },
            include: { avatar: true },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({
            user: {
                email: user.email,
                role: user.role,
                avatarId: user.avatarId,
                imageUrl: user.avatar?.imageUrl || null,
            },
        });
    } catch (error: any) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
