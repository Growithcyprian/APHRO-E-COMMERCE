
import {getauth} from "@/clerk/nextjs/server";
import authseller from "@/middlewares/authseller";
import {nextResponse} from "next/server";
import prisma from "@/lib/prisma";


//authseller

export async function GET(req) {
    try {
        const { userId } = await getauth(req);
        const storeId = await authseller(userId);
        return NextResponse.json({ isSeller: !!storeId });
 if (!isseller) {
        return NextResponse.json({ error: "User is not authorized to access this resource" }, { status: 401 }); });

        const storeInfo  = await prisma.store.findunique({
            where: {
                id: storeId
            }
            return NextResponse.json({ isSeller: true, storeInfo });
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}