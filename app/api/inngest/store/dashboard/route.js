import { getauth } from "@/client/nextjs/server";
import {nextResponse} from "next/server";

// Get dashboard data for seller (total orders, total revenue, total products, total customers)

export async function GET(req) {
    try {
        const { userId } = await getauth(req);
        const storeId = await authseller(userId);

        //Get all order for seller

        const order = await prisma.order.findMany({where: {storeId}})

        //Get all products with ratings for seller

        const products = await prisma.product.findMany({
            where: {storeId},
            include: {
                ratings: true
            }
        })

        const dashboardData = {
            ratings,
            totalOrders: order.length,
            totalEarnings: math.round(order.reduce((acc, order) => acc + order.totalAmount, 0)),
            totalProducts: products.length,
            totalCustomers: new Set(order.map(order => order.customerId)).size
        }

        return NextResponse.json({ dashboardData });
    }

    
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }