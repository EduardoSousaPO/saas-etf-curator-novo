import { supabase } from "../src/lib/supabaseClient";
import { mockEtfData } from "./mock-etf-data";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Function to convert mock data to XLSX and save it
const createMockXlsx = (filePath: string) => {
  const worksheet = XLSX.utils.json_to_sheet(mockEtfData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ETFs");
  XLSX.writeFile(workbook, filePath);
  console.log(`Mock XLSX file created at ${filePath}`);
};

const importMockData = async () => {
  console.log("Starting mock data import...");

  // Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE are set in your actual .env for this script to run locally
  // For this script, we are using the client instance which might have RLS limitations for direct upsert without service_role.
  // Ideally, for a script like this, you would use the service_role key for unrestricted access.

  // For the purpose of this script, we will simulate the upsert logic.
  // In a real scenario, this script would run in an environment with service_role access or call an admin-privileged API endpoint.

  const { data, error } = await supabase.from("etfs").upsert(
    mockEtfData.map((etf) => ({
      symbol: etf.symbol,
      name: etf.name,
      description: etf.description,
      category: etf.category,
      exchange: etf.exchange,
      inception_date: etf.inception_date ? new Date(etf.inception_date).toISOString().split('T')[0] : null,
      total_assets: etf.total_assets,
      volume: etf.volume,
      ten_year_return: etf.ten_year_return,
      returns_12m: etf.returns_12m,
      returns_24m: etf.returns_24m,
      returns_36m: etf.returns_36m,
      volatility_12m: etf.volatility_12m,
      volatility_24m: etf.volatility_24m,
      volatility_36m: etf.volatility_36m,
      ten_year_volatility: etf.ten_year_volatility,
      sharpe_12m: etf.sharpe_12m,
      sharpe_24m: etf.sharpe_24m,
      sharpe_36m: etf.sharpe_36m,
      ten_year_sharpe: etf.ten_year_sharpe,
      max_drawdown: etf.max_drawdown,
      dividends_12m: etf.dividends_12m,
      dividends_24m: etf.dividends_24m,
      dividends_36m: etf.dividends_36m,
      dividends_all_time: etf.dividends_all_time,
      dividend_yield: etf.dividend_yield,
      start_date: etf.start_date ? new Date(etf.start_date).toISOString().split('T')[0] : null,
      end_date: etf.end_date ? new Date(etf.end_date).toISOString().split('T')[0] : null,
      // updated_at is handled by the database
    })),
    { onConflict: "symbol" } // Upsert based on the symbol
  );

  if (error) {
    console.error("Error importing mock data:", error.message);
  } else {
    console.log("Mock data imported successfully:", data);
  }
};

const main = async () => {
  const mockXlsxFilePath = path.join(__dirname, "mock_etfs.xlsx");
  createMockXlsx(mockXlsxFilePath);
  // await importMockData(); // Uncomment to actually try to import to Supabase
  console.log("Mock data script finished. To import, ensure Supabase is configured and uncomment importMockData() call.");
};

main().catch(console.error);

