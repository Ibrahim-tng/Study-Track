import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
    try {
        const { identifier, type } = await request.json();

        if (!identifier) {
            return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
        }

        // Define limits based on type
        const limits = {
            login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 mins
            signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
            default: { maxRequests: 20, windowMs: 60 * 1000 }
        };

        const config = limits[type as keyof typeof limits] || limits.default;

        const allowed = await checkRateLimit(
            `auth_${type || 'default'}_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`,
            config.maxRequests,
            config.windowMs
        );

        if (!allowed) {
            return NextResponse.json({
                allowed: false,
                message: "Trop de tentatives. Veuillez patienter avant de réessayer."
            }, { status: 429 });
        }

        return NextResponse.json({ allowed: true });
    } catch (error) {
        console.error("Rate limit API error:", error);
        return NextResponse.json({ allowed: true }); // Fail open to not block users
    }
}
