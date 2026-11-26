import "server-only";

import { MongoServerError, ObjectId, type WithId } from "mongodb";
import { connectToDatabase } from "./dbconnect";
import { formatRelativeTime } from "./products";
import { normalizeEmail } from "./auth-users";

export type ChatCategory = "거래" | "동네" | "문의";

type ChatParticipant = {
  userId: string;
  name: string;
};

type ChatRoomDocument = {
  participants: ChatParticipant[];
  participantKey: string;
  subject: string;
  category: ChatCategory;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadBy: Record<string, number>;
};

type ChatMessageDocument = {
  roomId: ObjectId;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
};

export type ChatRoomSummary = {
  id: string;
  peerName: string;
  subject: string;
  category: ChatCategory;
  lastMessage: string;
  time: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  time: string;
};

function toChatRoom(
  room: WithId<ChatRoomDocument>,
  currentUserId: string,
): ChatRoomSummary {
  const peer = room.participants.find(
    (participant) => participant.userId !== currentUserId,
  );

  return {
    id: room._id.toString(),
    peerName: peer?.name ?? "reown 이웃",
    subject: room.subject,
    category: room.category,
    lastMessage: room.lastMessage,
    time: room.lastMessageAt
      ? formatRelativeTime(room.lastMessageAt)
      : "새 대화",
    unreadCount: room.unreadBy?.[currentUserId] ?? 0,
  };
}

function toChatMessage(message: WithId<ChatMessageDocument>): ChatMessage {
  return {
    id: message._id.toString(),
    senderId: message.senderId,
    senderName: message.senderName,
    content: message.content,
    time: formatRelativeTime(message.createdAt),
  };
}

export async function listChatRooms(
  currentUserId: string,
): Promise<ChatRoomSummary[]> {
  const { db } = await connectToDatabase();
  const rooms = db.collection<ChatRoomDocument>("chat_rooms");
  await rooms.createIndex({ "participants.userId": 1, updatedAt: -1 });

  const documents = await rooms
    .find({ "participants.userId": currentUserId })
    .sort({ updatedAt: -1 })
    .toArray();

  return documents.map((room) => toChatRoom(room, currentUserId));
}

export async function startChatRoom(input: {
  currentUserId: string;
  currentUserName: string;
  recipientEmail: string;
  subject: string;
  category: ChatCategory;
}): Promise<
  | { room: ChatRoomSummary; created: boolean }
  | { error: "recipient-not-found" | "cannot-chat-with-self" }
> {
  const { db } = await connectToDatabase();
  const users = db.collection<{ name: string; email: string }>("users");
  const recipient = await users.findOne({
    email: normalizeEmail(input.recipientEmail),
  });

  if (!recipient) {
    return { error: "recipient-not-found" };
  }

  return createChatRoom(input, {
    userId: recipient._id.toString(),
    name: recipient.name,
  });
}

export async function startChatRoomWithUser(input: {
  currentUserId: string;
  currentUserName: string;
  recipientUserId: string;
  subject: string;
  category: ChatCategory;
}): Promise<
  | { room: ChatRoomSummary; created: boolean }
  | { error: "recipient-not-found" | "cannot-chat-with-self" }
> {
  if (!ObjectId.isValid(input.recipientUserId)) {
    return { error: "recipient-not-found" };
  }

  const { db } = await connectToDatabase();
  const recipient = await db
    .collection<{ name: string; email: string }>("users")
    .findOne({ _id: new ObjectId(input.recipientUserId) });

  if (!recipient) {
    return { error: "recipient-not-found" };
  }

  return createChatRoom(input, {
    userId: recipient._id.toString(),
    name: recipient.name,
  });
}

async function createChatRoom(
  input: {
    currentUserId: string;
    currentUserName: string;
    subject: string;
    category: ChatCategory;
  },
  recipient: { userId: string; name: string },
): Promise<
  | { room: ChatRoomSummary; created: boolean }
  | { error: "recipient-not-found" | "cannot-chat-with-self" }
> {
  if (recipient.userId === input.currentUserId) {
    return { error: "cannot-chat-with-self" };
  }

  const { db } = await connectToDatabase();
  const participants: ChatParticipant[] = [
    { userId: input.currentUserId, name: input.currentUserName },
    { userId: recipient.userId, name: recipient.name },
  ];
  const participantKey = [
    ...participants.map((participant) => participant.userId).sort(),
    input.category.toLocaleLowerCase(),
    input.subject.toLocaleLowerCase(),
  ].join(":");
  const rooms = db.collection<ChatRoomDocument>("chat_rooms");
  await rooms.createIndex({ participantKey: 1 }, { unique: true });

  const existing = await rooms.findOne({ participantKey });
  if (existing) {
    return {
      room: toChatRoom(existing, input.currentUserId),
      created: false,
    };
  }

  const now = new Date();
  const room: ChatRoomDocument = {
    participants,
    participantKey,
    subject: input.subject,
    category: input.category,
    createdAt: now,
    updatedAt: now,
    lastMessage: "대화를 시작해 보세요.",
    lastMessageAt: null,
    unreadBy: {},
  };

  try {
    const result = await rooms.insertOne(room);
    return {
      room: toChatRoom({ ...room, _id: result.insertedId }, input.currentUserId),
      created: true,
    };
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) {
      throw error;
    }

    const concurrentRoom = await rooms.findOne({ participantKey });
    if (!concurrentRoom) {
      throw error;
    }

    return {
      room: toChatRoom(concurrentRoom, input.currentUserId),
      created: false,
    };
  }
}

export async function listChatMessages(
  roomId: string,
  currentUserId: string,
): Promise<{ room: ChatRoomSummary; messages: ChatMessage[] } | null> {
  if (!ObjectId.isValid(roomId)) {
    return null;
  }

  const { db } = await connectToDatabase();
  const rooms = db.collection<ChatRoomDocument>("chat_rooms");
  const room = await rooms.findOne({
    _id: new ObjectId(roomId),
    "participants.userId": currentUserId,
  });

  if (!room) {
    return null;
  }

  const messages = db.collection<ChatMessageDocument>("chat_messages");
  await messages.createIndex({ roomId: 1, createdAt: 1 });
  const documents = await messages
    .find({ roomId: room._id })
    .sort({ createdAt: -1, _id: -1 })
    .limit(100)
    .toArray();

  await rooms.updateOne(
    { _id: room._id },
    { $set: { [`unreadBy.${currentUserId}`]: 0 } },
  );

  return {
    room: toChatRoom(
      { ...room, unreadBy: { ...room.unreadBy, [currentUserId]: 0 } },
      currentUserId,
    ),
    messages: documents.reverse().map(toChatMessage),
  };
}

export async function sendChatMessage(input: {
  roomId: string;
  currentUserId: string;
  content: string;
}): Promise<ChatMessage | null> {
  if (!ObjectId.isValid(input.roomId)) {
    return null;
  }

  const { db } = await connectToDatabase();
  const rooms = db.collection<ChatRoomDocument>("chat_rooms");
  const roomId = new ObjectId(input.roomId);
  const room = await rooms.findOne({
    _id: roomId,
    "participants.userId": input.currentUserId,
  });

  if (!room) {
    return null;
  }

  const sender = room.participants.find(
    (participant) => participant.userId === input.currentUserId,
  );
  if (!sender) {
    return null;
  }

  const createdAt = new Date();
  const message: ChatMessageDocument = {
    roomId,
    senderId: input.currentUserId,
    senderName: sender.name,
    content: input.content,
    createdAt,
  };
  const messages = db.collection<ChatMessageDocument>("chat_messages");
  await messages.createIndex({ roomId: 1, createdAt: 1 });
  const result = await messages.insertOne(message);

  const unreadIncrements = Object.fromEntries(
    room.participants
      .filter((participant) => participant.userId !== input.currentUserId)
      .map((participant) => [`unreadBy.${participant.userId}`, 1]),
  );
  await rooms.updateOne(
    { _id: roomId },
    {
      $set: {
        lastMessage: input.content,
        lastMessageAt: createdAt,
        updatedAt: createdAt,
      },
      $inc: unreadIncrements,
    },
  );

  return toChatMessage({ ...message, _id: result.insertedId });
}
