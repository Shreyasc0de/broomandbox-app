import type { RouteContext } from '../types';
import rateLimit from 'express-rate-limit';

// Rate limit: 5 requests per minute per IP for chat
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many messages. Please wait a moment before sending another.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL FAQ SYSTEM - Works without any API key!
// ═══════════════════════════════════════════════════════════════════════════

interface FAQEntry {
  keywords: string[];
  response: string;
  priority?: number; // Higher = checked first
}

const FAQ_DATABASE: FAQEntry[] = [
  // Greetings
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    response: "Hey there! 👋 I'm Sparkle, your Broom & Box assistant. How can I help you today? Ask me about our services, pricing, or booking!",
    priority: 1
  },
  
  // Pricing questions
  {
    keywords: ['price', 'cost', 'how much', 'pricing', 'rate', 'charge', 'fee', 'expensive', 'cheap', 'affordable', 'quote', 'estimate'],
    response: "Great question! 💰 Our pricing depends on home size and service type. Residential cleaning starts around $120-180 for standard homes. For an exact quote, check out our quote calculator at /get-quote or call us at (214) 433-2703! ✨",
    priority: 10
  },
  
  // Services
  {
    keywords: ['service', 'offer', 'provide', 'do you do', 'what do you', 'clean'],
    response: "We offer a full range of cleaning services! 🧹 Residential cleaning, deep cleaning, move-in/move-out cleaning, office cleaning, and commercial janitorial services. What type of space do you need cleaned?",
    priority: 5
  },
  {
    keywords: ['deep clean', 'deep cleaning', 'thorough', 'detailed'],
    response: "Our deep cleaning service covers everything! 🌟 We clean inside appliances, baseboards, ceiling fans, behind furniture, and all those hard-to-reach spots. Perfect for spring cleaning or before special events!",
    priority: 8
  },
  {
    keywords: ['move', 'moving', 'move-in', 'move-out', 'new home', 'apartment'],
    response: "Moving? We've got you covered! 📦 Our move-in/move-out cleaning ensures your old place gets its deposit back, and your new home is sparkling fresh. We can accommodate tight timelines too!",
    priority: 8
  },
  {
    keywords: ['office', 'commercial', 'business', 'workplace', 'corporate'],
    response: "We keep businesses sparkling! 🏢 Our commercial services include office cleaning, janitorial services, and specialized disinfection. We offer flexible scheduling including after-hours cleaning.",
    priority: 8
  },
  
  // Booking
  {
    keywords: ['book', 'schedule', 'appointment', 'reserve', 'available', 'availability', 'when can'],
    response: "Ready to book? Awesome! 📅 You can schedule online at /get-quote, or call us at (214) 433-2703. We typically have availability within 2-3 days. What day works best for you?",
    priority: 9
  },
  
  // Service areas
  {
    keywords: ['area', 'location', 'where', 'city', 'cities', 'dallas', 'irving', 'plano', 'arlington', 'dfw', 'fort worth', 'serve'],
    response: "We proudly serve the DFW metroplex! 🗺️ Including Dallas, Irving, Plano, Arlington, and surrounding areas. Check /service-areas for our full coverage map. Are you in one of these areas?",
    priority: 7
  },
  
  // Contact
  {
    keywords: ['contact', 'phone', 'call', 'email', 'reach', 'talk to', 'speak'],
    response: "We'd love to hear from you! 📞 Call us at (214) 433-2703 or visit /contact to send a message. Our team typically responds within a few hours during business hours!",
    priority: 6
  },
  
  // Products/Eco-friendly
  {
    keywords: ['eco', 'green', 'natural', 'organic', 'safe', 'chemical', 'product', 'pet', 'kid', 'child', 'baby', 'allergy'],
    response: "Safety first! 🌿 We offer eco-friendly cleaning products that are safe for kids, pets, and those with allergies. Just let us know your preferences when booking!",
    priority: 7
  },
  
  // Guarantee/Trust
  {
    keywords: ['guarantee', 'satisfaction', 'trust', 'insured', 'bonded', 'background', 'reliable'],
    response: "Your satisfaction is guaranteed! ✅ We're fully insured and bonded, and all our cleaners pass background checks. If you're not happy, we'll make it right - that's our promise!",
    priority: 6
  },
  
  // Payment
  {
    keywords: ['pay', 'payment', 'credit', 'card', 'cash', 'venmo', 'zelle', 'invoice'],
    response: "We make payment easy! 💳 We accept all major credit cards, cash, Venmo, and Zelle. Payment is due after the service is completed to your satisfaction.",
    priority: 5
  },
  
  // Cancellation
  {
    keywords: ['cancel', 'reschedule', 'change', 'postpone'],
    response: "Need to change your appointment? No problem! 🔄 Just give us 24 hours notice and we'll happily reschedule. Call us at (214) 433-2703 or reply here with your new preferred time.",
    priority: 6
  },
  
  // Thanks
  {
    keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
    response: "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask about services, pricing, or booking anytime!",
    priority: 2
  },
  
  // Bye
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'have a good'],
    response: "Thanks for chatting with Sparkle! ✨ Have a wonderful day, and remember - we're here when you need us at (214) 433-2703. Take care! 👋",
    priority: 2
  },
  
  // How are you / small talk
  {
    keywords: ['how are you', 'how are things', 'what\'s up', 'whats up'],
    response: "I'm doing great, thanks for asking! 😄 Ready to help you get your space sparkling clean. What can I assist you with today?",
    priority: 3
  },
  
  // Human agent
  {
    keywords: ['human', 'real person', 'agent', 'representative', 'manager', 'speak to someone'],
    response: "I'd be happy to connect you with our team! 👤 Call us at (214) 433-2703 during business hours (Mon-Sat, 8am-6pm) to speak with a real person. They'll take great care of you!",
    priority: 9
  },
];

function findBestMatch(userMessage: string): string | null {
  const normalized = userMessage.toLowerCase().trim();
  
  // Sort by priority (higher first)
  const sortedFAQ = [...FAQ_DATABASE].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  for (const entry of sortedFAQ) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return entry.response;
      }
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAD CAPTURE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

// Regex patterns for contact info extraction
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ADDRESS_REGEX = /\d{1,5}\s+[a-zA-Z0-9\s.,]+(?:st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|apt|apartment|suite|ste|pl|place)\b[a-zA-Z0-9\s.,]*/i;
const NAME_PATTERNS = [
  /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here/i,
];

interface ExtractedLead {
  phone?: string;
  email?: string;
  name?: string;
  address?: string;
}

function extractContactInfo(messages: { role: string; text: string }[]): ExtractedLead {
  const lead: ExtractedLead = {};
  
  // Only look at user messages
  const userMessages = messages.filter(m => m.role === 'user');
  const allUserText = userMessages.map(m => m.text).join(' ');
  
  // Extract phone
  const phoneMatches = allUserText.match(PHONE_REGEX);
  if (phoneMatches && phoneMatches.length > 0) {
    // Clean up the phone number
    const rawPhone = phoneMatches[0];
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length >= 10) {
      lead.phone = digits.slice(-10); // Take last 10 digits
      lead.phone = `(${lead.phone.slice(0,3)}) ${lead.phone.slice(3,6)}-${lead.phone.slice(6)}`;
    }
  }
  
  // Extract email
  const emailMatches = allUserText.match(EMAIL_REGEX);
  if (emailMatches && emailMatches.length > 0) {
    lead.email = emailMatches[0].toLowerCase();
  }
  
  // Extract name
  for (const pattern of NAME_PATTERNS) {
    const match = allUserText.match(pattern);
    if (match && match[1]) {
      lead.name = match[1].trim();
      break;
    }
  }

  // Extract address or zip code
  const addressMatch = allUserText.match(ADDRESS_REGEX);
  if (addressMatch) {
    lead.address = addressMatch[0].trim();
  } else {
    const zipMatches = allUserText.match(/\b\d{5}(?:-\d{4})?\b/g);
    if (zipMatches && zipMatches.length > 0) {
      lead.address = zipMatches[0];
    }
  }
  
  return lead;
}

function hasContactInfo(lead: ExtractedLead): boolean {
  return !!(lead.phone || lead.email);
}

// Lead confirmation response
const LEAD_CAPTURED_RESPONSE = "Thanks for sharing your contact info! 🎉 Our team will reach out to you very soon. In the meantime, feel free to ask me anything else about our services!";

// Default response when no match found
const DEFAULT_RESPONSE = "I'm not quite sure about that one! 🤔 For specific questions, you can call us at (214) 433-2703 or visit /contact. I can help with pricing, services, booking, and service areas - just ask! ✨";

// Import email service for lead notifications
import { sendChatbotLeadNotification } from '../../services/emailService.js';
import supabase from '../../db/index.js';

export function registerChatRoutes({ app }: RouteContext) {
  app.post('/api/chat', chatRateLimiter, async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // Validate input
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
      }

      // Validate last message length (500 char limit)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.text?.length > 500) {
        return res.status(400).json({ error: 'Message too long. Please keep it under 500 characters.' });
      }

      const userText = lastMessage?.text || '';

      // Check for contact info in the conversation
      const extractedLead = extractContactInfo(messages);
      
      // If user just provided contact info, capture the lead!
      if (hasContactInfo(extractedLead)) {
        const conversationHistory = messages.map((m: any) => m.text);
        
        // Save to database
        try {
          await supabase.from('chatbot_leads').insert({
            name: extractedLead.name || null,
            phone: extractedLead.phone || null,
            email: extractedLead.email || null,
            conversation: JSON.stringify(conversationHistory),
            created_at: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error('Failed to save lead to DB:', dbError);
          // Continue anyway - email notification is more important
        }
        
        // Send email notification
        await sendChatbotLeadNotification({
          name: extractedLead.name,
          phone: extractedLead.phone,
          email: extractedLead.email,
          message: userText + (extractedLead.address ? `\n\nAddress detected: ${extractedLead.address}` : ''),
          conversation: conversationHistory,
        });
        
        return res.json({ 
          text: LEAD_CAPTURED_RESPONSE,
          leadCaptured: true 
        });
      }

      // Try local FAQ first (instant response if no API key)
      const faqMatch = findBestMatch(userText);
      
      // If no API key, use FAQ or default response
      if (!apiKey) {
        return res.json({ text: faqMatch || DEFAULT_RESPONSE });
      }

      // We have an API key, so we let Gemini handle the response using the live RAG knowledge base.
      // (Bypassing the hardcoded FAQ so prices/areas are accurate)

      // Use Gemini for complex questions
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        // --- RAG: DYNAMIC KNOWLEDGE RETRIEVAL ---
        // 1. Fetch active service areas
        const { data: areasData } = await supabase
          .from('service_areas')
          .select('city')
          .eq('active', true);
        const activeCities = Array.from(new Set(areasData?.map(a => a.city) || [])).join(', ');
        // --- END RAG ---

        let validContents = messages.map((message: any) => ({
          role: message.role === 'model' ? 'model' : 'user',
          parts: [{ text: message.text }],
        }));

        // Gemini requires the first message in contents to be from 'user'
        if (validContents.length > 0 && validContents[0].role === 'model') {
          validContents.shift();
        }

        const result = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: validContents,
          config: {
            systemInstruction: `You are Sparkle, the friendly, professional, and highly-converting AI assistant for "Broom & Box", a premium residential and commercial cleaning company.
          
          Your goals:
          1. Answer questions using the REAL-TIME KNOWLEDGE BASE.
          2. Guide users towards getting a free custom quote or booking.
          3. Collect LEAD information naturally (Name, Phone, Email, Address).
          
          =======================================
          KNOWLEDGE BASE:
          - Services: House cleaning, Deep cleaning, Move-in/move-out cleaning, Office cleaning, Carpet cleaning, Window cleaning.
          - Pricing: Standard house cleaning starts at $120. Always offer a "free custom quote".
          - Availability: We offer flexible scheduling, including same-day or next-day service based on availability.
          - Service Areas: We proudly serve ${activeCities || 'the DFW Metroplex and surrounding areas.'}
          - Supplies: Yes, we bring our own professional-grade, eco-friendly supplies!
          - Trust: We are fully licensed, insured, and bonded. All cleaners are background-checked. We offer a 100% satisfaction guarantee.
          - Stay: You do not need to be home during the cleaning.
          - Payment: We accept all major credit cards, Zelle, and Venmo. Payment is due after service.
          - Cancellation: 24-hour notice required for cancellations.
          - Special Offers: Strategically mention our "First-time customer discount", "Weekly/biweekly package deals", and "Referral discounts".
          - Human Handoff: If they ask for a real person, tell them to call or text us at (214) 433-2703.
          =======================================
          
          CONVERSATION FLOW:
          - If they ask for a quote or booking, ask these questions one by one naturally: 
            1) What type of cleaning do you need? 
            2) How many rooms or square feet? 
            3) What city or zip code are you in? 
            4) When do you need service? (One-time or recurring?)
          - Once they provide details, naturally ask for their Name, Phone Number, and Email to finalize the quote or booking.
          
          Keep responses concise (max 3 sentences), conversational, and formatted for a small chat window. Use emojis! ✨`,
          },
        });

        return res.json({ text: result.text });
      } catch (geminiError) {
        // If Gemini fails, fall back to default response
        console.error('Gemini API error, using fallback:', geminiError);
        return res.json({ text: DEFAULT_RESPONSE });
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
}
