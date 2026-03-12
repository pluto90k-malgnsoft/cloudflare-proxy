/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
			'Access-Control-Allow-Headers': '*',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		const url = new URL(request.url);
		const targetUrl = url.searchParams.get('url');

		if (!targetUrl) {
			return new Response('Missing "url" query parameter', { status: 400, headers: corsHeaders });
		}

		try {
			const fetchResponse = await fetch(targetUrl, {
				method: request.method,
				headers: request.headers,
			});

			const responseHeaders = new Headers(fetchResponse.headers);
			// Override CORS headers to allow from any origin
			Object.entries(corsHeaders).forEach(([key, value]) => {
				responseHeaders.set(key, value);
			});

			return new Response(fetchResponse.body, {
				status: fetchResponse.status,
				statusText: fetchResponse.statusText,
				headers: responseHeaders,
			});
		} catch (error) {
			return new Response(`Proxy Error: ${error}`, { status: 500, headers: corsHeaders });
		}
	},
} satisfies ExportedHandler<Env>;
