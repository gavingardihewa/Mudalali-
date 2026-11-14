import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Server-side AI Advisor endpoint for natural language Mudalali questions
app.post('/api/mudalali-advisor', async (req, res) => {
  try {
    const { question, contextData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        usingFallback: true,
        answer: null,
        message: 'No GEMINI_API_KEY configured. Using deterministic SME calculations.'
      });
    }

    const systemPrompt = `You are "Senior Mudalali", an experienced, savvy, and realistic Sri Lankan business consultant advising an SME business owner.
The user runs a business with branches (Pettah, Kandy, Negombo, Galle), selling on credit (Naya Potha), instalment hire-purchase (Wara Potha), physical inventory, and cheques (PDCs).
You are given the business's live current financials:
- Current Cash in Drawer: LKR ${contextData?.cashInDrawer?.toLocaleString() || 0}
- Collections This Month: LKR ${contextData?.collectionsThisMonth?.toLocaleString() || 0}
- Total Outstanding Credit (Naya): LKR ${contextData?.totalCredit?.toLocaleString() || 0}
- Overdue Instalments (Wara): LKR ${contextData?.overdueInstalments?.toLocaleString() || 0}
- Supplier Cheques Owed: LKR ${contextData?.supplierLiabilities?.toLocaleString() || 0}
- Unpaid Debtors: ${JSON.stringify(contextData?.unpaidDebtors || [])}
- Highest Margin Items: ${JSON.stringify(contextData?.highMarginProducts || [])}
- Branch Metrics: ${JSON.stringify(contextData?.branchesSummary || [])}

Provide practical, direct, street-smart advice tailored specifically to the Sri Lankan business context.
Use LKR (Rs.), reference real locations/practices (e.g. Pettah trading, commercial bank cheques, route collectors, customer trust/vishwasa).
Format clearly with short bullet points, actionable next steps, and bold key numbers. Keep response concise, authoritative, and helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction: systemPrompt
      }
    });

    return res.status(200).json({
      usingFallback: false,
      answer: response.text
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/mudalali-advisor:', error);
    return res.status(200).json({
      usingFallback: true,
      error: error?.message || 'Failed to generate AI response. Falling back to local calculations.'
    });
  }
});

// Setup Vite middlewares or static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
      watch: null
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  // Fallback for HTML entry point
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      // Suppress Vite HMR WebSocket errors before Vite client executes (per environment constraints)
      template = template.replace(
        '<head>',
        `<head><script>
          window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && (e.reason.message?.includes('WebSocket') || e.reason.message?.includes('vite') || e.reason.stack?.includes('@vite/client'))) {
              e.preventDefault();
              e.stopImmediatePropagation?.();
            }
          }, true);
          window.addEventListener('error', function(e) {
            if (e.message && (e.message.includes('WebSocket') || e.filename?.includes('@vite/client'))) {
              e.preventDefault();
              e.stopImmediatePropagation?.();
            }
          }, true);
        </script>`
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mudalali SME OS Server running on http://0.0.0.0:${PORT}`);
});
