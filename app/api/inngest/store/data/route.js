
import prisma from "@/lib/prisma"
import {nextResponse} from "next/server"
//Get store info and products


export async function GET(req) {
    try {
        //Get store username fom query params
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        
        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        // get store info and instock products with ratings

        const store = await prisma.store.findunique({
            where: {
                username: username
            },
            include: {
                products: {
                    include: {
                        ratings: true
                    }
                }
            }
        })
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        return NextResponse.json({ store })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }