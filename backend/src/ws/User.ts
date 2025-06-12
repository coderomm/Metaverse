import client from './client';
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
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    try {
                        if (!process.env.JWT_SECRET) {
                            console.error("Internal server error of JWT_SECRET missing");
                            this.ws.close()
                            return
                        }
                        const userId = (jwt.verify(token, process.env.JWT_SECRET) as JwtPayload).userId
                        if (!userId) {
                            console.error("Invalid token, closing WebSocket.");
                            this.ws.close()
                            return
                        }
                        this.id = userId
                        this.userId = userId
                        const space = await client.space.findFirst({
                            where: {
                                id: spaceId
                            }, include: {
                                map: true
                            }
                        })
                        if (!space) {
                            console.error(`Space not found: ${spaceId}`);
                            this.ws.close()
                            return
                        }
                        this.spaceId = spaceId
                        console.log(`1 Adding user ${this.id} to space ${spaceId}`);
                        RoomManager.getInstance().addUser(spaceId, this)
                        this.x = Math.floor(Math.random() * space?.width)
                        this.y = Math.floor(Math.random() * space?.height)
                        console.log(`2 User spawn coordinates: (${this.x}, ${this.y})`);
                        this.send({
                            type: "space-joined",
                            payload: {
                                spawn: {
                                    x: this.x,
                                    y: this.y
                                },
                                space: space,
                                users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id != this.id).map((u) => ({ id: u.id, userId: u.userId })) ?? [],
                                userId: this.userId
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
                    console.log(`User ${this.userId}, moveX is ${moveX} & moveY is ${moveY} `)
                    const space = await client.space.findFirst({
                        where: {
                            id: this.spaceId
                        }, include: {
                            map: true
                        }
                    })
                    if (!space) {
                        console.error(`Space not found: ${spaceId} `);
                        this.ws.close()
                        return
                    }
                    if ((moveX >= 0 && moveY >= 0 && moveX <= space.width && moveY <= space.height) && ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1))) {
                        this.x = moveX
                        this.y = moveY
                        RoomManager.getInstance().broadcast({
                            type: "movement",
                            payload: {
                                x: this.x,
                                y: this.y
                            },
                            userId: this.userId
                        }, this, this.spaceId!)
                        return
                    }
                    console.log(`movement - rejected for ${this.userId} user`)
                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        },
                        userId: this.userId
                    });
            }
        })
    }

    destroy() {
        console.log(`Destroying user ${this.id}.spaceId: ${this.spaceId} `);
        if (!this.spaceId) {
            console.warn(`Destroy called for user ${this.id} but spaceId is undefined.`);
            return;
        }
        RoomManager.getInstance().removeUser(this, this.spaceId!);
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId,
                connectionId: this.id,
            }
        }, this, this.spaceId!)
    }
    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}