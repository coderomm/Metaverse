import { User } from "./User";

type OutgoingMessage = any;

export class RoomManager {
    rooms: Map<string, User[]> = new Map();
    static instance: RoomManager

    private constructor() {
        this.rooms = new Map()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager()
        }
        return this.instance
    }

    public removeUser(user: User, spaceId: string) {
        if (!this.rooms.has(spaceId)) {
            return
        }
        this.rooms.set(spaceId, (this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? []))
    }

    public addUser(spaceId: string, user: User) {
        console.log(`Adding user ${user.id} to room ${spaceId}`);
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user])
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user])
        console.log(`Current users in room ${spaceId}:`, this.rooms.get(spaceId)?.map((u) => u.id));
    }

    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!roomId) {
            console.error(`Error: roomId is undefined in broadcast for user ${user.id}`);
            return;
        }
        console.log(`Broadcasting message to room ${roomId}, excluding user ${user.id}`);
        if (!this.rooms.has(roomId)) {
            return
        }
        console.log(`Users in room ${roomId}: ${this.rooms.get(roomId)?.map((u) => u.id)}`);
        this.rooms.get(roomId)?.forEach((u) => {
            if (u.id !== user.id) {
                console.log(`Sending message to user ${u.id}`);
                u.send(message)
            }
        })
    }
}