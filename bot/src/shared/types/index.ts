import { type ConversationFlavor } from "@grammyjs/conversations";
import { type Context, type SessionFlavor } from "grammy";

export type SessionData = Record<string, never>;
export type MyContext = ConversationFlavor<Context & SessionFlavor<SessionData>>;