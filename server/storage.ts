import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { type InsertUser, type User } from "@shared/schema";

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Users";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySlug?(slug: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
}

export class DynamoDBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { Item } = await ddbDocClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));
    return Item as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { Items } = await ddbDocClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      }));
      return (Items && Items.length > 0) ? (Items[0] as User) : undefined;
    } catch (error) {
      console.error("Error getting user by email from DynamoDB:", error);
      throw error;
    }
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    try {
      const { Items } = await ddbDocClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "uniqueSlug = :slug",
        ExpressionAttributeValues: { ":slug": slug },
      }));
      return (Items && Items.length > 0) ? (Items[0] as User) : undefined;
    } catch (error) {
      console.error("Error getting user by slug from DynamoDB:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Creating user in DynamoDB:", insertUser.email);
    const newUser: User = {
      ...insertUser,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString() as any,
      email: insertUser.email || `${Date.now()}@persona.local`,
      password: insertUser.password || "",
      name: insertUser.name || null,
      role: insertUser.role || null,
      bio: insertUser.bio || null,
      instagram: insertUser.instagram || null,
      linkedin: insertUser.linkedin || null,
      whatsapp: insertUser.whatsapp || null,
      website: insertUser.website || null,
      uniqueSlug: (insertUser as any).uniqueSlug || null,
      cards: insertUser.cards || [],
    };
    try {
      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newUser,
      }));
      console.log("Successfully created user:", newUser.id);
      return newUser;
    } catch (error) {
      console.error("Error creating user in DynamoDB:", error);
      throw error;
    }
  }

  async updateUser(id: string, partialUser: Partial<InsertUser>): Promise<User> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(partialUser).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpression.length === 0) {
      const user = await this.getUser(id);
      if (!user) throw new Error("User not found");
      return user;
    }

    const { Attributes } = await ddbDocClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    }));

    return Attributes as User;
  }
}

export const storage = new DynamoDBStorage();
