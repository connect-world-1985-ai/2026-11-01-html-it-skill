Clickable prototype for the usability test on Thursday 2026-11-06: password reset in the patient portal.
Flow: 1 "Forgot password?" link on the login screen -> 2 enter email -> 3 "Check your inbox" screen, "Resend" enabled after 60 s -> 4 set a new password (rules: at least 12 characters, not one of the last 5) with a live rule checklist -> 5 success, back to login.
Error paths: an unknown email shows the same screen as step 3 (no account enumeration, SEC-31); an expired link (older than 30 minutes) shows "This link has expired" with a button to send a new one.
Testers click through on a laptop. The moderator must be able to reset to the start and jump to any screen.
Context: SEC-31 is the security rule "never reveal whether an account exists".
