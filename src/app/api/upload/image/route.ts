import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

function fileToBase64(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { message: "Faltan variables de Cloudinary" },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const folder = String(formData.get("folder") || "central-turnos");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No se recibió ninguna imagen" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "La imagen no puede superar los 4MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = fileToBase64(buffer, file.type);

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: "image",
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("UPLOAD_IMAGE_ERROR", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error al subir imagen",
      },
      { status: 500 }
    );
  }
}