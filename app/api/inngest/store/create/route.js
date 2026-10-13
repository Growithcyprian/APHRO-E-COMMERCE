import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import imagekit from "@/lib/imagekit";

export async function POST(request) {
    try {
        // Get the currently signed-in Clerk user
        const { userId, isAuthenticated } = await auth();

        if (!isAuthenticated || !userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        // Get form data
        const formData = await request.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const image = formData.get("image");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");

        // Validate required fields
        if (
            !name ||
            !username ||
            !description ||
            !image ||
            !email ||
            !contact ||
            !address
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Make sure the uploaded value is actually a file
        if (!(image instanceof File)) {
            return NextResponse.json(
                { error: "Invalid image file" },
                { status: 400 }
            );
        }

        // Check if user already created a store
        const existingStore = await prisma.store.findFirst({
            where: {
                userId: userId,
            },
        });

        if (existingStore) {
            return NextResponse.json({
                status: existingStore.status,
            });
        }

        // Normalize username
        const normalizedUsername = username.toLowerCase().trim();

        // Check if username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: {
                username: normalizedUsername,
            },
        });

        if (isUsernameTaken) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 400 }
            );
        }

        // Upload store logo to ImageKit
        const response = await imagekit.files.upload({
            file: image,
            fileName: image.name,
            folder: "logos",
        });

        // Create store in database
        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                email,
                username: normalizedUsername,
                contact,
                address,
                logo: response.url,
            },
        });

        // Link store to user
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                store: {
                    connect: {
                        id: newStore.id,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Applied, waiting for approval",
        });
    } catch (error) {
        console.error("Create store error:", error);

        return NextResponse.json(
            {
                error: error?.message || "Something went wrong while creating the store",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { userId, isAuthenticated } = await auth();

        if (!isAuthenticated || !userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const store = await prisma.store.findFirst({
            where: {
                userId: userId,
            },
        });

        if (store) {
            return NextResponse.json({
                status: store.status,
            });
        }

        return NextResponse.json({
            status: "not registered",
        });
    } catch (error) {
        console.error("Get store status error:", error);

        return NextResponse.json(
            {
                error: error?.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
