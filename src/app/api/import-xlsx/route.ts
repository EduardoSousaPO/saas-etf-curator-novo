// src/app/api/import-xlsx/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import Prisma client
import * as XLSX from "xlsx";
import { z } from "zod";

// Garantir que Buffer exista no ambiente
declare const Buffer: any;

// Helper functions for parsing (ensure these are robust)
function parseNumberField(value: any): number | null {
  if (value === null || typeof value === "undefined" || String(value).trim() === "") {
    return null;
  }
  let sValue = String(value);
  sValue = sValue.replace(/%/g, "").replace(/,/g, ".").trim();
  if (sValue === "-" || sValue.toLowerCase() === "n/a" || sValue.toLowerCase() === "nan") {
    return null;
  }
  const num = parseFloat(sValue);
  return isNaN(num) ? null : num;
}

function parseDateField(value: any): Date | null {
  if (!value) return null;
  let dateObj: Date;
  if (typeof value === "number") { // Excel date serial number
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    dateObj = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
  } else if (value instanceof Date) {
    dateObj = value;
  } else if (typeof value === "string") {
    dateObj = new Date(value);
     // Check if the date string was valid, if not, try to parse common formats like DD/MM/YYYY or MM/DD/YYYY
    if (isNaN(dateObj.getTime())) {
        const parts = value.split(/\/|-/);
        if (parts.length === 3) {
            // Attempt DD/MM/YYYY
            let tempDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(tempDate.getTime())) {
                dateObj = tempDate;
            } else {
                // Attempt MM/DD/YYYY
                tempDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
                if (!isNaN(tempDate.getTime())) {
                    dateObj = tempDate;
                }
            }
        }
    }
  } else {
    return null;
  }

  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    // Return as Date object for Prisma. Prisma will handle DB formatting.
    return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  }
  return null;
}


// Schema for the data expected from Excel, before transformation for Prisma
const rawEtfRecordSchema = z.object({
  symbol: z.string().min(1),
  name: z.any().optional(),
  description: z.any().optional(),
  category: z.any().optional(),
  exchange: z.any().optional(),
  inception_date: z.any().optional(),
  total_assets: z.any().optional(),
  volume: z.any().optional(),
  ten_year_return: z.any().optional(),
  returns_12m: z.any().optional(),
  returns_24m: z.any().optional(),
  returns_36m: z.any().optional(),
  volatility_12m: z.any().optional(),
  volatility_24m: z.any().optional(),
  volatility_36m: z.any().optional(),
  ten_year_volatility: z.any().optional(),
  sharpe_12m: z.any().optional(),
  sharpe_24m: z.any().optional(),
  sharpe_36m: z.any().optional(),
  ten_year_sharpe: z.any().optional(),
  max_drawdown: z.any().optional(),
  dividends_12m: z.any().optional(),
  dividends_24m: z.any().optional(),
  dividends_36m: z.any().optional(),
  dividends_all_time: z.any().optional(),
  dividend_yield: z.any().optional(),
  start_date: z.any().optional(),
  end_date: z.any().optional(),
});

const rawEtfArraySchema = z.array(rawEtfRecordSchema);

export async function POST(request: NextRequest) {
  // TODO: Add admin-only access control here

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      return NextResponse.json({ error: "Invalid file type. Only .xlsx is allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawJsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null }) as unknown[];

    const validationResult = rawEtfArraySchema.safeParse(rawJsonData);
    if (!validationResult.success) {
      console.error("XLSX raw data validation error:", validationResult.error.issues);
      return NextResponse.json(
        { error: "Invalid data structure in XLSX file.", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const etfsToProcess = validationResult.data;
    let processedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // DEBUGGING CONSOLE LOGS
    console.log("--- DEBUGGING PRISMA INSTANCE ---");
    console.log("Is prisma defined?", !!prisma);
    if (prisma) {
      console.log("prisma object keys:", Object.keys(prisma));
      console.log("Is prisma.etfs defined?", !!prisma.etfs);
      if (prisma.etfs) {
        console.log("prisma.etfs object keys:", Object.keys(prisma.etfs));
      } else {
        console.log("prisma.etfs is UNDEFINED");
      }
    } else {
      console.log("prisma is UNDEFINED");
    }
    console.log("--- END DEBUGGING ---");

    for (const rawEtf of etfsToProcess) {
      if (!rawEtf.symbol || String(rawEtf.symbol).trim() === "") {
        errorCount++;
        errors.push({ etf: rawEtf, error: "Missing symbol" });
        continue;
      }
      
      const symbol = String(rawEtf.symbol).trim();

      const dataToUpsert = {
        name: rawEtf.name ? String(rawEtf.name) : null,
        description: rawEtf.description ? String(rawEtf.description) : null,
        category: rawEtf.category ? String(rawEtf.category) : null,
        exchange: rawEtf.exchange ? String(rawEtf.exchange) : null,
        inception_date: parseDateField(rawEtf.inception_date),
        total_assets: parseNumberField(rawEtf.total_assets),
        volume: parseNumberField(rawEtf.volume),
        ten_year_return: parseNumberField(rawEtf.ten_year_return),
        returns_12m: parseNumberField(rawEtf.returns_12m),
        returns_24m: parseNumberField(rawEtf.returns_24m),
        returns_36m: parseNumberField(rawEtf.returns_36m),
        volatility_12m: parseNumberField(rawEtf.volatility_12m),
        volatility_24m: parseNumberField(rawEtf.volatility_24m),
        volatility_36m: parseNumberField(rawEtf.volatility_36m),
        ten_year_volatility: parseNumberField(rawEtf.ten_year_volatility),
        sharpe_12m: parseNumberField(rawEtf.sharpe_12m),
        sharpe_24m: parseNumberField(rawEtf.sharpe_24m),
        sharpe_36m: parseNumberField(rawEtf.sharpe_36m),
        ten_year_sharpe: parseNumberField(rawEtf.ten_year_sharpe),
        max_drawdown: parseNumberField(rawEtf.max_drawdown),
        dividends_12m: parseNumberField(rawEtf.dividends_12m),
        dividends_24m: parseNumberField(rawEtf.dividends_24m),
        dividends_36m: parseNumberField(rawEtf.dividends_36m),
        dividends_all_time: parseNumberField(rawEtf.dividends_all_time),
        dividend_yield: parseNumberField(rawEtf.dividend_yield),
        start_date: parseDateField(rawEtf.start_date),
        end_date: parseDateField(rawEtf.end_date),
      };
      
      // Adicionar log para visualizar valores importantes
      if (processedCount < 5 || Math.random() < 0.05) {
        console.log(`DEBUG ETF ${symbol}:`, {
          original: {
            returns_12m: rawEtf.returns_12m,
            volatility_12m: rawEtf.volatility_12m,
            sharpe_12m: rawEtf.sharpe_12m,
            dividend_yield: rawEtf.dividend_yield
          },
          processed: {
            returns_12m: dataToUpsert.returns_12m,
            volatility_12m: dataToUpsert.volatility_12m,
            sharpe_12m: dataToUpsert.sharpe_12m,
            dividend_yield: dataToUpsert.dividend_yield
          }
        });
      }

      try {
        // Ensure prisma and prisma.etfs are defined before calling upsert
        if (!prisma || !prisma.etfs) {
            const errorMsg = `Prisma client or prisma.etfs is not available. Prisma defined: ${!!prisma}, prisma.etfs defined: ${!!prisma?.etfs}`;
            console.error(errorMsg);
            errors.push({ symbol: symbol, error: errorMsg });
            errorCount++;
            continue; // Skip this record
        }
        
        // First try to find existing ETF by symbol using findFirst instead of findUnique
        const existingEtf = await prisma.etfs.findFirst({
          where: { 
            symbol: {
              equals: symbol
            }
          }
        });
        
        if (existingEtf) {
          // Update existing record
          await prisma.etfs.update({
            where: { id: existingEtf.id },
            data: dataToUpsert,
          });
        } else {
          // Create new record
          await prisma.etfs.create({
            data: { symbol: symbol, ...dataToUpsert },
          });
        }
        
        processedCount++;
      } catch (e) {
        errorCount++;
        errors.push({ symbol: symbol, error: (e as Error).message });
        console.error(`Error processing ETF ${symbol}:`, e);
      }
    }

    if (errorCount > 0) {
      return NextResponse.json(
        { 
          message: `File processed with some errors. ${processedCount} records upserted, ${errorCount} failed.`,
          errors 
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json({ message: `File imported successfully! ${processedCount} records processed.` }, { status: 200 });

  } catch (e) {
    const error = e as Error;
    console.error("Import API error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred." }, { status: 500 });
  }
}

