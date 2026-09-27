-- The client that always sends p_pin (0009-0011's PIN-taking overloads) is live in prod:
-- nothing calls these four pre-PIN signatures any more (checked src/ and tests/). Lockdown:
-- revoke then drop each, so PostgREST can no longer resolve a call that omits p_pin. The
-- PIN-taking overloads, get_party_version, update_party, set_party_pin, delete_party and
-- verify_party_pin are untouched.

revoke execute on function monete.get_party(text) from public, anon, authenticated;
drop function monete.get_party(text);

revoke execute on function monete.append_rsvp(text, jsonb) from public, anon, authenticated;
drop function monete.append_rsvp(text, jsonb);

revoke execute on function monete.update_rsvp(text, text, jsonb) from public, anon, authenticated;
drop function monete.update_rsvp(text, text, jsonb);

revoke execute on function monete.remove_rsvp(text, text) from public, anon, authenticated;
drop function monete.remove_rsvp(text, text);

notify pgrst, 'reload schema';
