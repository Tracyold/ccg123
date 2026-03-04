import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { event_type, message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get admin notification config
    const { data: config } = await supabase
      .from('admin_notification_config')
      .select('*')
      .single();

    if (!config) return new Response('No config', { status: 200 });

    // Check if this event type is enabled
    const eventMap: Record<string, string> = {
      purchase:        'notify_purchases',
      chat:            'notify_chat',
      inquiry:         'notify_inquiries',
      work_order:      'notify_work_orders',
      service_request: 'notify_service_requests',
    };

    const prefKey = eventMap[event_type];
    if (prefKey && !config[prefKey]) {
      return new Response('Notification disabled', { status: 200 });
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const from       = Deno.env.get('TWILIO_FROM')!;
    const to         = config.admin_phone;

    if (!to) return new Response('No admin phone', { status: 200 });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: to, Body: message }),
      }
    );

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});
