import authseller from "@/lib/authseller";
import { getauth } from "@/clerk/nextjs/server";
import prisma from "@/lib/prisma";
import (NextResponse) from "next/server";



//toggle stock status of a product

export async function POST(req) {
    try {
        const { userId } = await getauth(req);
        const storeId = await authseller(userId);  
        if (!productid) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        if (!storeId) {
            return NextResponse.json({ error: "User is not authorized to toggle stock status" }, { status: 401 });
        } 

//check if product exist

        const product = await prisma.product.findFirst({
            where: {
                id: productid,
                storeId: storeId
            }
        })
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

await prisma.product.update({
            where: {
                id: productid
            },
            data: {
                inStock: !product.inStock
            }
        });
        return NextResponse.json({ message: "Stock status updated successfully" });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}