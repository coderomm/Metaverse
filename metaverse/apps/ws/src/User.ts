import client from '@repo/db/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { WebSocket } from "ws";
import { RoomManager } from './RoomManager';

type OutgoingMessage = any;

function getRandomString(l: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < l; i++) {
        res += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return res;
}

export class User {
    public id: string;
    public userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.initHandlers()
    }

    initHandlers() {
        this.ws.on('message', async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    console.log("Received join request:", parsedData);
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    try {
                        console.log("JWT Secret on server:", process.env.JWT_SECRATE);
                        const userId = (jwt.verify(token, process.env.JWT_SECRATE || 'JWT_SECRATE') as JwtPayload).userId
                        if (!userId) {
                            console.log("Invalid token, closing WebSocket.");
                            this.ws.close()
                            return
                        }
                        this.userId = userId
                        const space = await client.space.findFirst({
                            where: {
                                id: spaceId
                            }
                        })
                        if (!space) {
                            console.log(`Space not found: ${spaceId}`);
                            this.ws.close()
                            return
                        }
                        this.spaceId = spaceId
                        console.log(`Adding user ${this.id} to space ${spaceId}`);
                        RoomManager.getInstance().addUser(spaceId, this)
                        this.x = Math.floor(Math.random() * space?.width)
                        this.y = Math.floor(Math.random() * space?.height)
                        console.log(`User spawn coordinates: (${this.x}, ${this.y})`);
                        this.send({
                            type: "space-joined",
                            payload: {
                                spawn: {
                                    x: this.x,
                                    y: this.y
                                },
                                users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
                            }
                        })
                        RoomManager.getInstance().broadcast({
                            type: "user-joined",
                            payload: {
                                userId: this.userId,
                                x: this.x,
                                y: this.y
                            }
                        }, this, this.spaceId!)
                    } catch (error) {
                        console.error("Error in join handler:", error);
                        this.ws.close();
                    }
                    break;

                case "move":
                    const moveX = parsedData.payload.x
                    const moveY = parsedData.payload.y
                    const xDisplacement = Math.abs(this.x - moveX)
                    const yDisplacement = Math.abs(this.y - moveY)
                    if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) {
                        this.x = moveX
                        this.y = moveY
                        RoomManager.getInstance().broadcast({
                            type: "movement",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        }, this, this.spaceId!)
                        return
                    }

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    });
            }
        })
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!)
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }
    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}