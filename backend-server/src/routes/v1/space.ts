import { Router } from "express";
import client from "../../client";
import { userMiddleware } from "../../middlewares/user";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../schema-types";
export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Validation failed", errors: parsedData.error.format() });
        return;
    }

    try {
        let space;

        if (!parsedData.data.mapId) {
            const dimensions = parsedData.data.dimensions.split("x");
            if (dimensions.length !== 2) {
                res.status(400).json({ message: "Invalid dimensions format" });
                return;
            }

            space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: parseInt(dimensions[0]),
                    height: parseInt(dimensions[1]),
                    creatorId: req.userId!,
                },
            });
        } else {
            const map = await client.map.findUnique({
                where: { id: parsedData.data.mapId },
                select: {
                    mapElements: true,
                    width: true,
                    height: true,
                    thumbnail: true,
                },
            });

            if (!map) {
                res.status(404).json({ message: "Map not found" });
                return;
            }

            space = await client.$transaction(async () => {
                const createdSpace = await client.space.create({
                    data: {
                        name: parsedData.data.name,
                        width: map.width,
                        height: map.height,
                        creatorId: req.userId!,
                        mapId: parsedData.data.mapId,
                        thumbnail: map.thumbnail,
                    },
                });

                await client.spaceElements.createMany({
                    data: map.mapElements.map(e => ({
                        spaceId: createdSpace.id,
                        elementId: e.elementId,
                        x: e.x!,
                        y: e.y!,
                    })),
                });

                return createdSpace;
            });
        }

        await client.recentVisitedSpace.upsert({
            where: {
                userId_spaceId: { userId: req.userId!, spaceId: space.id },
            },
            update: { visitedAt: new Date() },
            create: { userId: req.userId!, spaceId: space.id },
        });

        res.json({ spaceId: space.id });
    } catch (error: any) {
        console.error("Error creating space:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    try {
        const parsedData = DeleteElementSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ message: "Invalid element data", errors: parsedData.error.format() });
            return;
        }

        const spaceElement = await client.spaceElements.findFirst({
            where: { id: parsedData.data.id },
            include: { space: true }
        });

        if (!spaceElement) {
            res.status(404).json({ message: "Element not found" });
            return;
        }

        if (spaceElement.space.creatorId !== req.userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        await client.spaceElements.delete({ where: { id: parsedData.data.id } });
        res.json({ message: "Element deleted" });

    } catch (error: any) {
        console.error("Error deleting element:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    try {
        const spaceId = req.params.spaceId;

        const space = await client.space.findUnique({
            where: { id: spaceId },
            select: { creatorId: true }
        })

        if (!space) {
            res.status(400).json({ message: "Space not found" })
            return
        }

        if (space.creatorId !== req.userId) {
            res.status(403).json({ message: "Unauthorized" })
            return
        }

        await client.$transaction([
            client.recentVisitedSpace.deleteMany({ where: { spaceId } }),
            client.space.delete({ where: { id: spaceId } })
        ]);

        res.json({ message: "Space deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting space:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: { creatorId: req.userId! }
        });

        res.json({ spaces });
    } catch (error: any) {
        console.error("Error fetching spaces:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    try {
        const parsedData = AddElementSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({ message: "Validation failed" })
            return
        }
        const space = await client.space.findUnique({
            where: {
                id: req.body.spaceId,
                creatorId: req.userId!
            }, select: {
                width: true,
                height: true
            }
        })

        if (req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width! || req.body.y > space?.height!) {
            res.status(400).json({ message: "Point is outside of the boundary" })
            return
        }

        if (!space) {
            res.status(400).json({ message: "Space not found" })
            return
        }

        await client.spaceElements.create({
            data: {
                spaceId: req.body.spaceId,
                elementId: req.body.elementId,
                x: req.body.x,
                y: req.body.y
            }
        })
        res.json({ message: "Element added" })
    } catch (error: any) {
        console.error("Error adding element in space: ", error);
        res.status(500).json({ message: "Internal error while adding element in space: " + error.message });
    }
})

spaceRouter.get("/recent", userMiddleware, async (req, res) => {
    try {
        const recentSpaces = await client.recentVisitedSpace.findMany({
            where: {
                userId: req.userId!,
            },
            include: {
                space: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        width: true,
                        height: true,
                    },
                },
            },
            orderBy: {
                visitedAt: "desc",
            },
            take: 10,
        });
        if (recentSpaces.length === 0) {
            res.json({ recentSpaces: [] });
            return;
        }
        const formattedSpaces = recentSpaces.map((recent) => ({
            id: recent.space.id,
            name: recent.space.name,
            thumbnail: recent.space.thumbnail,
            dimensions: `${recent.space.width}x${recent.space.height}`,
            visitedAt: recent.visitedAt,
        }));
        res.json({
            recentSpaces: formattedSpaces,
        });
    } catch (error: any) {
        console.error("Error fetching recent spaces:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
    const { spaceId } = req.params;

    try {
        const space = await client.space.findUnique({
            where: { id: spaceId },
            include: { spaceElements: { include: { element: true } }, map: true }
        });

        if (!space) {
            res.status(404).json({ message: "Space not found" });
            return;
        }

        await client.recentVisitedSpace.upsert({
            where: { userId_spaceId: { userId: req.userId!, spaceId } },
            update: { visitedAt: new Date() },
            create: { userId: req.userId!, spaceId },
        });

        res.json({
            dimensions: `${space.width}x${space.height}`,
            elements: space.spaceElements.map(e => ({
                id: e.id,
                element: {
                    id: e.element.id,
                    imageUrl: e.element.imageUrl,
                    width: e.element.width,
                    height: e.element.height,
                    static: e.element.static
                },
                x: e.x,
                y: e.y
            }))
        });
    } catch (error: any) {
        console.error("Error fetching space details:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});