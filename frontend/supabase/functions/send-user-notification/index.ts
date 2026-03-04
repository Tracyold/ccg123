import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { event_type, work_order_id, user_id, message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get user SMS preferences
    const { data: prefs } = await supabase
      .from('user_sms_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!prefs?.opt_in_work_orders) {
      return new Response('User opted out', { status: 200 });
    }

    const phone = prefs.phone;
    if (!phone) return new Response('No user phone', { status: 200 });

    // Build message if not provided
    let body = message;
    if (!body && work_order_id) {
      const eventMessages: Record<string, string> = {
        work_order_confirmed: 'Your work order has been confirmed by Cutting Corners Gems. We will be in touch soon.',
        work_order_complete:  'Your work order is complete! Log in to your account to view details.',
        work_order_cancelled: 'Your work order has been cancelled. Please contact us if you have questions.',
      };
      body = eventMessages[event_type] || 'You have an update on your work order from Cutting Corners Gems.';
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const from       = Deno.env.get('TWILIO_FROM')!;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: phone, Body: body }),
      }
    );

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});
