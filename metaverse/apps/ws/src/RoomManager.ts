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
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user])
            return;
        }
        const existingUsers = this.rooms.get(spaceId) ?? [];
        console.log('existingUsers = ', existingUsers)
        const isAlreadyConnected = existingUsers.some((u) => u.userId === user.userId || u.id === user.id);
        console.log('isAlreadyConnected = ', isAlreadyConnected)
        if (!isAlreadyConnected) {
            this.rooms.set(spaceId, [...existingUsers, user]);
        }
        console.log(`User connected: ${user.userId} (connectionId: ${user.id}).`);
        console.log(`Current users in room ${spaceId}:`, RoomManager.getInstance().rooms.get(spaceId)?.map(u => u.userId));
    }

    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!roomId) {
            console.error(`Error: roomId is undefined in broadcast for user ${user.id}`);
            return;
        }
        if (!this.rooms.has(roomId)) {
            return
        }
        this.rooms.get(roomId)?.forEach((u) => {
            if (u.id !== user.id) {
                u.send(message)
            }
        })
    }
}