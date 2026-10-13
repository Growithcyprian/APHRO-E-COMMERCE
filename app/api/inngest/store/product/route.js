import { getauth } from "@/client/nextjs/server"
import { authseller } from "@/client/utils/authseller"
import {nextResponse} from "next/server"
import imagekit from "@/lib/imagekit"
import prisma from "@/lib/prisma"

//add new product

export async function POST(req) {
    try {
        const { userId } = await getauth(req);
        const storeId = await authseller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "User is not authorized to add products" }, { status: 401 });
        }
        // Get the data from the form
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const image = formData.getall("image");

        if (!name || !description || !mrp || !price || !category || !image.length < 1) {
            return NextResponse.json({ error: "not authorized" }, { status: 400 });
        }

        //uploading image to imagekit

        const imagesurl = await Promise.all(
            image.map(async (img) => {
                const buffer = Buffer.from(img.split(",")[1], "base64");
                const response = await imagekit.upload({
                    file: buffer,
                    fileName: img.name,
                    folder: "products",
                })
        const url = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "1024" },
            ]
        })

            return url
            })
        )
        await prisma.product.create({

            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imagesurl,
                storeId
            }
        })

        return NextResponse.json({ message: "Product created successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
 // get all products of a seller 

 export async function GET(req) {
    try {
        const { userId } = await getauth(req);
        const storeId = await authseller(userId);
        if (!storeId) {
            return NextResponse.json({ error: "User is not authorized to view products" }, { status: 401 });
        }
        const products = await prisma.product.findMany({
            where: {
                storeId
            }
        });
        return NextResponse.json({ products }, { status: 200 });

    }
    catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}