import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_value: number;
  total_cost: number;
  total_return: number;
  return_percentage: number;
  created_at: Date;
  updated_at: Date;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  etf_symbol: string;
  etf_name?: string;
  shares: number;
  average_cost: number;
  current_price?: number;
  current_value: number;
  total_return: number;
  return_percentage: number;
  weight_percentage: number;
  purchase_date: Date;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  user_id: string;
}

export interface AddHoldingRequest {
  portfolio_id: string;
  etf_symbol: string;
  shares: number;
  purchase_price: number;
  purchase_date: string;
  user_id: string;
}

// GET - Buscar portfolios do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const portfolioId = searchParams.get("portfolio_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    if (portfolioId) {
      // Buscar portfolio específico com holdings
      const portfolio = await getPortfolioWithHoldings(portfolioId, userId);
      if (!portfolio) {
        return NextResponse.json(
          { error: "Portfolio não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(portfolio);
    } else {
      // Buscar todos os portfolios do usuário
      const portfolios = await getUserPortfolios(userId);
      return NextResponse.json({
        portfolios,
        total: portfolios.length
      });
    }

  } catch (error) {
    console.error("Erro ao buscar portfolios:", error);
    return NextResponse.json(
      { error: "Falha ao buscar portfolios" },
      { status: 500 }
    );
  }
}

// POST - Criar novo portfolio
export async function POST(request: NextRequest) {
  try {
    const body: CreatePortfolioRequest = await request.json();
    const { name, description, user_id } = body;

    // Validações
    if (!name || !user_id) {
      return NextResponse.json(
        { error: "Nome e user_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar limite de portfolios por usuário (máximo 10)
    const userPortfoliosCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM public.portfolios WHERE user_id = $1`,
      user_id
    ) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (Number(userPortfoliosCount[0]?.count || 0) >= 10) {
      return NextResponse.json(
        { error: "Limite de 10 portfolios atingido" },
        { status: 400 }
      );
    }

    // Criar portfolio
    const insertQuery = `
      INSERT INTO public.portfolios (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, created_at
    `;
    
    const result = await prisma.$queryRawUnsafe(
      insertQuery, 
      user_id, 
      name, 
      description || null
    ) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const portfolio = result[0];

    return NextResponse.json({
      message: "Portfolio criado com sucesso",
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        created_at: portfolio.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar portfolio:", error);
    return NextResponse.json(
      { error: "Falha ao criar portfolio" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar portfolio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("id");
    const userId = searchParams.get("user_id");

    if (!portfolioId || !userId) {
      return NextResponse.json(
        { error: "id e user_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o portfolio pertence ao usuário
    const checkQuery = `
      SELECT id FROM public.portfolios 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await prisma.$queryRawUnsafe(checkQuery, portfolioId, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: "Portfolio não encontrado ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Deletar holdings primeiro (cascade deveria fazer isso, mas garantindo)
    await prisma.$queryRawUnsafe(
      `DELETE FROM public.portfolio_holdings WHERE portfolio_id = $1`,
      portfolioId
    );

    // Deletar portfolio
    await prisma.$queryRawUnsafe(
      `DELETE FROM public.portfolios WHERE id = $1 AND user_id = $2`,
      portfolioId, userId
    );

    return NextResponse.json({
      message: "Portfolio deletado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao deletar portfolio:", error);
    return NextResponse.json(
      { error: "Falha ao deletar portfolio" },
      { status: 500 }
    );
  }
}

// Funções auxiliares
async function getUserPortfolios(userId: string) {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.created_at,
      p.updated_at,
      COALESCE(ph_summary.total_holdings, 0) as total_holdings,
      COALESCE(ph_summary.total_value, 0) as total_value,
      COALESCE(ph_summary.total_cost, 0) as total_cost,
      COALESCE(ph_summary.total_return, 0) as total_return,
      CASE 
        WHEN ph_summary.total_cost > 0 
        THEN (ph_summary.total_return / ph_summary.total_cost * 100)
        ELSE 0 
      END as return_percentage
    FROM public.portfolios p
    LEFT JOIN (
      SELECT 
        portfolio_id,
        COUNT(*) as total_holdings,
        SUM(shares * current_price) as total_value,
        SUM(shares * average_cost) as total_cost,
        SUM((current_price - average_cost) * shares) as total_return
      FROM public.portfolio_holdings
      GROUP BY portfolio_id
    ) ph_summary ON p.id = ph_summary.portfolio_id
    WHERE p.user_id = $1
    ORDER BY p.updated_at DESC
  `;

  const portfolios = await prisma.$queryRawUnsafe(query, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  return portfolios.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    total_holdings: Number(p.total_holdings),
    total_value: Number(p.total_value),
    total_cost: Number(p.total_cost),
    total_return: Number(p.total_return),
    return_percentage: Number(p.return_percentage),
    created_at: p.created_at,
    updated_at: p.updated_at
  }));
}

async function getPortfolioWithHoldings(portfolioId: string, userId: string): Promise<Portfolio | null> {
  // Buscar portfolio
  const portfolioQuery = `
    SELECT id, user_id, name, description, created_at, updated_at
    FROM public.portfolios 
    WHERE id = $1 AND user_id = $2
  `;
  const portfolioResult = await prisma.$queryRawUnsafe(portfolioQuery, portfolioId, userId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (portfolioResult.length === 0) {
    return null;
  }

  const portfolio = portfolioResult[0];

  // Buscar holdings
  const holdingsQuery = `
    SELECT 
      ph.id,
      ph.portfolio_id,
      ph.etf_symbol,
      ph.shares,
      ph.average_cost,
      ph.purchase_date,
      e.name as etf_name,
      e.returns_12m,
      COALESCE(ph.current_price, 100) as current_price,
      (ph.shares * COALESCE(ph.current_price, 100)) as current_value,
      ((COALESCE(ph.current_price, 100) - ph.average_cost) * ph.shares) as total_return,
      CASE 
        WHEN ph.average_cost > 0 
        THEN (((COALESCE(ph.current_price, 100) - ph.average_cost) / ph.average_cost) * 100)
        ELSE 0 
      END as return_percentage
    FROM public.portfolio_holdings ph
    LEFT JOIN public.etfs e ON ph.etf_symbol = e.symbol
    WHERE ph.portfolio_id = $1
    ORDER BY ph.purchase_date DESC
  `;

  const holdings = await prisma.$queryRawUnsafe(holdingsQuery, portfolioId) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Calcular totais do portfolio
  const totalValue = holdings.reduce((sum, h) => sum + Number(h.current_value), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (Number(h.shares) * Number(h.average_cost)), 0);
  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

  // Calcular weights
  const holdingsWithWeights = holdings.map(h => ({
    id: h.id,
    portfolio_id: h.portfolio_id,
    etf_symbol: h.etf_symbol,
    etf_name: h.etf_name,
    shares: Number(h.shares),
    average_cost: Number(h.average_cost),
    current_price: Number(h.current_price),
    current_value: Number(h.current_value),
    total_return: Number(h.total_return),
    return_percentage: Number(h.return_percentage),
    weight_percentage: totalValue > 0 ? (Number(h.current_value) / totalValue) * 100 : 0,
    purchase_date: h.purchase_date
  }));

  return {
    id: portfolio.id,
    user_id: portfolio.user_id,
    name: portfolio.name,
    description: portfolio.description,
    total_value: totalValue,
    total_cost: totalCost,
    total_return: totalReturn,
    return_percentage: returnPercentage,
    created_at: portfolio.created_at,
    updated_at: portfolio.updated_at,
    holdings: holdingsWithWeights
  };
} 