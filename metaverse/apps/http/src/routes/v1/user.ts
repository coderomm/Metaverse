import { Router } from "express";
import client from "@repo/db/client";
import { userMiddleware } from "../../middlewares/user";
import { UpdateMetadataSchema } from "../../schema-types";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    console.log('req.body ==== ', req.body)
    const parsedData = UpdateMetadataSchema.safeParse(req.body)
    console.log('parsedData === ', parsedData.data)
    if (!parsedData.success) {
        res.status(400).json({ message: "Metadata validation failed" })
        return
    }
    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.json({ message: "User metadata updated" })
    } catch (e) {
        res.status(400).json({ message: "Internal server error" })
    }
})

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdString).slice(1, userIdString?.length - 1).split(",");
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select: {
            avatar: true,
            id: true
        }
    })

    res.json({
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })
})

userRouter.get('/me', userMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return
        }

        const user = await client.user.findUnique({
            where: { id: userId },
            include: { avatar: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return
        }

        res.json({
            user: {
                email: user.email,
                role: user.role,
                avatarId: user.avatarId,
                imageUrl: user.avatar?.imageUrl
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized' });
        return
    }
});