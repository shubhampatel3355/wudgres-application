create extension if not exists pg_net;

create or replace function public.fast2sms_send_otp(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  phone_num text;
  otp_code text;
begin
  -- 1. Extract phone and OTP from the Supabase Auth event payload
  -- Supabase provides the phone in E.164 format (e.g., +919999999999)
  -- Fast2SMS strictly requires a 10-digit Indian number, so we strip the country code.
  phone_num := right(regexp_replace(event->'user'->>'phone', '\D', '', 'g'), 10);
  otp_code := event->'sms'->>'otp';

  -- 2. Call the Fast2SMS API asynchronously using pg_net
  perform net.http_post(
      url := 'https://www.fast2sms.com/dev/otp/send',
      headers := '{"Authorization": "j3tHHQQLPtsfBr0A8SDJNuMxEum2NGmJoeX5PbWY99T5SjuUHTdMR72V11j2", "Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
          'mobile', phone_num,
          'otp_id', '5398db254c',
          'otp', otp_code
      )
  );

  -- 3. Return the event back to Supabase so the Auth flow can continue
  return event;
end;
$$;
