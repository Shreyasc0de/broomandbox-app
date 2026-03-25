let app: any;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      // Dynamically import the server module so we can catch initialization errors
      const serverModule = await import('../server.js');
      app = serverModule.default;
    }
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Boot Error:", error);
    return res.status(500).json({ 
      error: "Vercel Boot Error", 
      message: error.message || String(error),
      stack: error.stack 
    });
  }
}
