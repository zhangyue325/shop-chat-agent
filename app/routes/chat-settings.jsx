import { getChatSettings } from "../services/chat-settings.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const settings = await getChatSettings(shop);

  return Response.json(settings, {
    headers: corsHeaders,
  });
}

export async function action() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
