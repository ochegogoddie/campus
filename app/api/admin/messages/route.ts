import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const adminMessageSchema = z
  .object({
    audience: z.enum(["FREELANCER", "CLIENT", "USER"]),
    recipientId: z.string().optional(),
    content: z.string().min(1).max(2000),
  })
  .superRefine((value, ctx) => {
    if (value.audience === "USER" && !value.recipientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientId"],
        message: "Select a recipient for a direct admin message.",
      });
    }

    if (value.audience !== "USER" && value.recipientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientId"],
        message: "Recipient is only allowed for direct messages.",
      });
    }
  });

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await isAdmin();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { audience, recipientId, content } = adminMessageSchema.parse(body);

    const recipients =
      audience === "USER"
        ? await prisma.user.findMany({
            where: {
              id: recipientId,
              NOT: { id: session.user.id },
            },
            select: { id: true, name: true, role: true },
            take: 1,
          })
        : await prisma.user.findMany({
            where: { role: audience },
            select: { id: true, name: true, role: true },
          });

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No matching recipients were found for this message." },
        { status: 404 }
      );
    }

    const sentAt = new Date();
    const senderName = session.user.name || "Platform Admin";

    await prisma.$transaction([
      prisma.message.createMany({
        data: recipients.map((recipient) => ({
          content,
          senderId: session.user.id,
          recipientId: recipient.id,
          createdAt: sentAt,
        })),
      }),
      prisma.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.id,
          type: "message",
          title:
            audience === "USER"
              ? "Admin message"
              : `Admin announcement for ${audience.toLowerCase()}s`,
          message: `${senderName} sent you a message.`,
          createdAt: sentAt,
        })),
      }),
    ]);

    const summary =
      audience === "USER"
        ? `Direct message sent to ${recipients[0]?.name || "the selected user"}.`
        : `Message sent to ${recipients.length} ${audience.toLowerCase()}${recipients.length === 1 ? "" : "s"}.`;

    return NextResponse.json({
      message: summary,
      sentCount: recipients.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    console.error("Error sending admin messages:", error);
    return NextResponse.json(
      { error: "Failed to send admin message." },
      { status: 500 }
    );
  }
}
