import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;   // ✅ await the params Promise
    const produceId = Number(id);

    if (Number.isNaN(produceId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { restockTrigger, customThreshold } = await request.json();

    const updateData: any = {};
    if (restockTrigger) updateData.restockTrigger = restockTrigger;
    if (customThreshold !== undefined) {
      updateData.customThreshold = parseFloat(customThreshold);
    }

    const updatedProduce = await prisma.produce.update({
      where: { id: produceId },
      data: updateData,
    });

    return NextResponse.json(updatedProduce, { status: 200 });
  } catch (error) {
    console.error("Error updating produce restock info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
