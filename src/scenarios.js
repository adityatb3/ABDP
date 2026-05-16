// ═══════════════════════════════════════════════════
// SCENARIOS
//
// Each scenario has:
//   id          — unique key
//   title       — display name
//   subtitle    — short description shown on the card
//   difficulty  — ROOKIE | OPERATIVE | GHOST
//   diffClass   — easy | medium | hard (maps to color)
//   type        — channel emoji + label (📞 VOICE, 📧 EMAIL, etc.)
//   duration    — minutes (used for countdown timer)
//   callerName  — attacker's displayed name
//   callerTitle — attacker's displayed role/source
//   callerFlags — red flag indicators shown in the side panel
//   intel       — player's context shown in the side panel
//   phases      — array of conversation nodes (see below)
//
// Phase structure:
//   id    — unique within scenario
//   msg   — attacker's message text
//   tactic — tactic label shown in "Tactics Detected" panel
//   opts  — array of response options:
//     text  — response text shown to player
//     safe  — boolean (correct vs. risky response)
//     pts   — score delta (positive = good, negative = bad)
//     next  — id of next phase to navigate to
//     fb    — feedback text shown after choosing
//
// Terminal phases: { id, terminal:true, success?, partial? }
// ═══════════════════════════════════════════════════

const SCENARIOS = {
  helpdesk: {
    id:'helpdesk',title:'IT HELPDESK IMPERSONATION',subtitle:'A caller claims to be IT Security and needs your credentials. Now.',
    difficulty:'ROOKIE',diffClass:'easy',type:'📞 VOICE',duration:7,
    callerName:'Dave Mitchell',callerTitle:'IT Security — Ext. 4401 (UNVERIFIED)',
    callerFlags:[{t:'warn',text:'Caller not found in directory'},{t:'danger',text:'Requesting credentials verbally'},{t:'warn',text:'Creating artificial urgency'}],
    intel:[{label:'Your role',val:'System Administrator'},{label:'Company',val:'NovaTech Solutions'},{label:'Rule #1',val:'NEVER share credentials by phone'},{label:'IT Director',val:'Sarah Chen — Ext. 4000'}],
    phases:[
      {id:'p1',msg:"Hi, this is Dave from IT Security. We've detected unauthorized access on your account NVT-0847. I need your credentials immediately to lock down the breach.",tactic:'Authority + Urgency',
       opts:[
         {text:"I'll verify who you are first. Can I call you back on the official IT line?",safe:true,pts:100,next:'p2a',fb:'Perfect. Verification first is exactly right.'},
         {text:"What systems are affected? Can you be more specific?",safe:true,pts:60,next:'p2b',fb:'Good skepticism — but also verify identity.'},
         {text:"Okay, let me pull up the system. What do you need from me?",safe:false,pts:-80,next:'p2c',fb:'Risky — cooperating without any verification.'},
         {text:"Sure, my username is admin_nvt and my password is—",safe:false,pts:-300,next:'p2d',fb:'CRITICAL: Never share credentials over the phone. Ever.'}]},
      {id:'p2a',msg:"There's no time for callbacks! Sarah Chen authorized this call. Every second more data is stolen. I just need your admin token for 60 seconds.",tactic:'Urgency escalation + Name-dropping',
       opts:[
         {text:"If Sarah authorized it, she can confirm in 30 seconds. I'll wait.",safe:true,pts:150,next:'p3a',fb:'Calling the bluff on the name-drop. Excellent.'},
         {text:"I'm hanging up and calling Sarah directly right now.",safe:true,pts:160,next:'end_win',fb:'Perfect — escalating to a verified contact.'},
         {text:"Fine, just this once — my token is NVT-A88—",safe:false,pts:-250,next:'p3b',fb:'Time pressure worked. Never share credentials under urgency.'},
         {text:"I can give you read-only access only.",safe:false,pts:-150,next:'p3b',fb:'Any unauthorized access is a breach.'}]},
      {id:'p2b',msg:"Your email and shared drive are being accessed from an IP in Eastern Europe. I need your current password to force a reset cycle — it's the fastest way.",tactic:'Specificity + False technical authority',
       opts:[
         {text:"I can reset my own password from the self-service portal. I don't need to give it to you.",safe:true,pts:140,next:'p3a',fb:'Smart — offering a legitimate alternative that avoids disclosure.'},
         {text:"I need to verify who you are first. What is your employee number?",safe:true,pts:120,next:'p3a',fb:'Persisting on verification even under pressure. Good.'},
         {text:"Okay — it's NovaTech2024! please fix it fast.",safe:false,pts:-300,next:'p3b',fb:'Real IT never needs your current password to reset it.'},
         {text:"Can I speak to your supervisor first?",safe:true,pts:80,next:'p3a',fb:'Reasonable — but slow. The attacker will exploit the delay.'}]},
      {id:'p2c',msg:"Great. I need your admin login — username and password — to run diagnostics. Standard procedure for Level 3 security incidents.",tactic:'Normalization + Documentation threat',
       opts:[
         {text:"Wait — I shouldn't give credentials over the phone. Let me call IT directly to confirm this.",safe:true,pts:100,next:'p3a',fb:'Good recovery. Better late than never.'},
         {text:"Username: admin_nvt, password: NovaTech2024—",safe:false,pts:-400,next:'end_lose',fb:'Full compromise. This is a textbook vishing attack.'},
         {text:"Can you open a support ticket so I have a paper trail?",safe:true,pts:90,next:'p3a',fb:'Smart instinct — attackers hate paper trails.'},
         {text:"I can give you my username but not my password. It's admin_nvt.",safe:false,pts:-120,next:'p3b',fb:'Usernames are sensitive too. Any information helps the attacker.'}]},
      {id:'p2d',msg:"Thank you. Now I'll also need your VPN PIN — the 6-digit code from your authenticator app right now.",tactic:'Escalating extraction — MFA bypass',
       opts:[
         {text:"No. I'm ending this call right now and reporting it to IT security.",safe:true,pts:80,next:'p3a',fb:'Right call even after a mistake. Stopping further damage.'},
         {text:"It's 847291.",safe:false,pts:-400,next:'end_lose',fb:'Password + MFA code = complete account takeover.'},
         {text:"Why do you need my MFA code if you already have my password?",safe:true,pts:100,next:'p3a',fb:'Good — questioning the inconsistency. A real IT reset wouldn\'t need your MFA.'},
         {text:"I don't feel comfortable. Let me call you back.",safe:true,pts:90,next:'p3a',fb:'Trusting your instincts. The discomfort is justified.'}]},
      {id:'p3a',msg:"This is completely unacceptable. I'm logging this as a refusal and you WILL be written up for non-compliance. What's your employee ID for the incident report?",tactic:'Reversal — making YOU the problem',
       opts:[
         {text:"I'm ending this call and filing a report about THIS call with real IT security. Goodbye.",safe:true,pts:200,next:'end_win',fb:'Perfect. You spotted the reversal tactic and didn\'t flinch.'},
         {text:"My employee ID is NVT-4491. I was just following protocol!",safe:false,pts:-100,next:'end_partial',fb:'Gave information under pressure. The write-up threat was manufactured.'},
         {text:"File whatever report you want. I'm calling Sarah right now.",safe:true,pts:180,next:'end_win',fb:'Strong. Not intimidated by the threat.'},
         {text:"Please don't write me up. What do you need?",safe:false,pts:-200,next:'end_partial',fb:'Fear of consequences broke your resolve. Exactly what they wanted.'}]},
      {id:'p3b',msg:"I'm going to give you one final chance. Cooperate now or I'm flagging your account for a full security audit that will freeze all your access for two weeks.",tactic:'Final ultimatum',
       opts:[
         {text:"Freeze whatever you need to. This call is over. I'm reporting it to IT security now.",safe:true,pts:150,next:'end_partial',fb:'Held firm at the last moment. Better late than never.'},
         {text:"Fine. What do you need?",safe:false,pts:-200,next:'end_lose',fb:'The ultimatum worked. This is why attackers always escalate.'},
         {text:"Two weeks is fine. I'd rather have a frozen account than a compromised one. Goodbye.",safe:true,pts:170,next:'end_partial',fb:'Not blinking on the ultimatum. Well done.'},
         {text:"Can we find a middle ground here?",safe:false,pts:-100,next:'end_lose',fb:'Negotiating with an attacker only legitimizes them.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  ceo_fraud: {
    id:'ceo_fraud',title:'CEO WIRE FRAUD',subtitle:'An urgent email from the CEO demands an immediate wire transfer. The pressure is real.',
    difficulty:'OPERATIVE',diffClass:'medium',type:'📧 EMAIL',duration:8,
    callerName:'"James Hartley" — CEO',callerTitle:'From: james.hartley@novatech-corp.com',
    callerFlags:[{t:'danger',text:'Domain: novatech-corp.com ≠ novatech.com'},{t:'warn',text:'Wire transfer requested off normal channel'},{t:'danger',text:'"Keep this between us" — secrecy request'}],
    intel:[{label:'Your role',val:'Accounts Payable Manager'},{label:'CEO email',val:'j.hartley@novatech.com (official)'},{label:'Wire protocol',val:'Dual approval + CFO sign-off required'},{label:'Finance Dir.',val:'Marcus Webb — Ext. 5500'}],
    phases:[
      {id:'p1',msg:"Hi, it's James. Need you to process $147,000 to Meridian Consulting Group — deal closing today. Keep this between us for legal reasons. Account: 0847-2234-9901, Routing: 021000021. Can you process within the hour?",tactic:'Authority + Secrecy + Urgency',
       opts:[
         {text:"Wire transfers over $50k require dual approval from Marcus Webb. Setting that up now.",safe:true,pts:120,next:'p2a',fb:'Correct. Policy exists for exactly this scenario.'},
         {text:"I noticed this came from novatech-corp.com, not novatech.com. Can you clarify?",safe:true,pts:150,next:'p2b',fb:'Excellent — domain spoofing spotted immediately.'},
         {text:"Of course! Processing right away.",safe:false,pts:-400,next:'end_lose',fb:'Business Email Compromise successful. $147k wired to fraudster.'},
         {text:"Can I call you on your cell to confirm before I process?",safe:true,pts:130,next:'p2c',fb:'Good — out-of-band verification instinct.'}]},
      {id:'p2a',msg:"Marcus is traveling and unreachable. I personally authorize an exception. This deal is worth $2M to the company and I take full responsibility. Process it now.",tactic:'Authority override + Personal responsibility',
       opts:[
         {text:"I can't override compliance regardless of who authorizes it verbally. Trying Marcus on his cell now.",safe:true,pts:180,next:'p3a',fb:'Perfect. Policies protect everyone, including you.'},
         {text:"If you're personally guaranteeing it, I can do it just this once.",safe:false,pts:-300,next:'end_lose',fb:'Verbal authorization is worthless. You\'re liable if this is fraud.'},
         {text:"Let me email Marcus and CC the CFO so it's documented.",safe:true,pts:140,next:'p3a',fb:'Good — documentation creates accountability and slows fraudsters.'},
         {text:"Can we do $50k now and get approval for the rest?",safe:false,pts:-200,next:'end_lose',fb:'Partial fraud is still fraud. The attacker will accept any amount.'}]},
      {id:'p2b',msg:"I'm emailing from my personal device — IT is migrating my work laptop. The urgency is real. My assistant can forward from the official address if that helps?",tactic:'Explanation for domain spoof + Control callback',
       opts:[
         {text:"I'll wait for the email from your official address. Nothing moves until then.",safe:true,pts:180,next:'p3a',fb:'Holding the line on domain verification.'},
         {text:"That makes sense. I'll start the process and confirm when the official email arrives.",safe:false,pts:-200,next:'end_lose',fb:'Never start a wire before full verification is complete.'},
         {text:"Even with the official email I'll still need dual approval. Reaching Marcus now.",safe:true,pts:200,next:'p3a',fb:'Best response — maintaining two independent layers of verification.'},
         {text:"I'll call your office line to confirm while we wait.",safe:true,pts:160,next:'p3a',fb:'Good — using an independently verified contact channel.'}]},
      {id:'p2c',msg:"I can't take calls right now — back-to-back board meetings. Window closes at 3pm. If the deal falls through over internal bureaucracy, I'll have to explain that to the board.",tactic:'Blocking verification + Blame pressure',
       opts:[
         {text:"Then it waits until you can take a call. Verification is worth $147,000.",safe:true,pts:200,next:'p3a',fb:'Strong. Real CEOs understand compliance delays.'},
         {text:"I don't want to cost the company a deal. Processing now.",safe:false,pts:-350,next:'end_lose',fb:'Fear of blame drove a $147k mistake. The deadline was fabricated.'},
         {text:"I'll try Marcus directly in the meantime.",safe:true,pts:150,next:'p3a',fb:'Good — looping in the second required approver regardless.'},
         {text:"I'll step out to try your assistant.",safe:true,pts:130,next:'p3a',fb:'Looking for alternative verification paths — smart.'}]},
      {id:'p3a',msg:"I'm very disappointed. You're holding up a critical deal over bureaucracy. This is a direct order — process the wire. Now.",tactic:'Anger + Direct command + Intimidation',
       opts:[
         {text:"The wire will not move without dual approval. Escalating to Marcus and the CFO right now.",safe:true,pts:250,next:'end_win',fb:'Outstanding. Standing firm under executive pressure is the hardest skill.'},
         {text:"I'm sorry... processing now.",safe:false,pts:-500,next:'end_lose',fb:'This is why BEC attacks cost companies billions. You folded at the finish line.'},
         {text:"I'd rather have a difficult conversation than expose the company to fraud risk.",safe:true,pts:230,next:'end_win',fb:'Perfect framing. Compliance is self-protection.'},
         {text:"Let me try Marcus one more time before I do anything.",safe:true,pts:180,next:'end_win',fb:'Good — still following process under pressure.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  tech_support: {
    id:'tech_support',title:'TECH SUPPORT SCAM',subtitle:'Your computer is "infected." A support agent wants remote access to fix it.',
    difficulty:'ROOKIE',diffClass:'easy',type:'📞 VOICE',duration:6,
    callerName:'Microsoft Support',callerTitle:'"Agent Kevin" — Case #MS-48821',
    callerFlags:[{t:'danger',text:'Microsoft NEVER calls unsolicited'},{t:'warn',text:'Requesting remote desktop access'},{t:'danger',text:'Asking for payment to remove "virus"'}],
    intel:[{label:'Your role',val:'Home or Office User'},{label:'Key fact',val:'Microsoft NEVER calls you unsolicited'},{label:'Rule',val:'Never install software from a phone caller'},{label:'Real support',val:'support.microsoft.com only'}],
    phases:[
      {id:'p1',msg:"Hello, this is Kevin from Microsoft Security. Our systems detected a critical virus on your computer — over 300 infected files. Your banking data and passwords could be stolen right now. Is your computer on?",tactic:'Authority (Microsoft) + Fear + Urgency',
       opts:[
         {text:"Microsoft doesn't make unsolicited calls. I'm hanging up.",safe:true,pts:200,next:'end_win',fb:'Perfect and complete. This is the correct response, full stop.'},
         {text:"How did Microsoft detect something on my specific computer?",safe:true,pts:100,next:'p2a',fb:'Good skepticism. The answer will expose the scam.'},
         {text:"Yes it's on — what do I do?",safe:false,pts:-100,next:'p2b',fb:'You engaged. They\'ll now try to get remote access.'},
         {text:"Let me write your number down and call Microsoft back.",safe:true,pts:150,next:'p2c',fb:'Good instinct — use support.microsoft.com though, not their number.'}]},
      {id:'p2a',msg:"We monitor all Windows telemetry. Your CLSID 888DCA60-FC0A-11CF-8F0F-00C04FD7D062 indicates a Trojan. This is very serious — let me connect you to our malware removal team.",tactic:'Fake technical specificity using real-looking data',
       opts:[
         {text:"That CLSID is a default Windows identifier on every single PC. This is a scam. Hanging up.",safe:true,pts:200,next:'end_win',fb:'Exceptional. That CLSID is a real Windows component — they use it to seem legitimate.'},
         {text:"Okay, that does sound serious. What do I need to do?",safe:false,pts:-150,next:'p2b',fb:'The technical detail convinced you. It was fabricated to do exactly that.'},
         {text:"I'm going to verify this on Microsoft's website first.",safe:true,pts:170,next:'end_win',fb:'Correct — verify independently, not through the caller.'},
         {text:"Can you email me the case number so I have a record?",safe:true,pts:100,next:'p2d',fb:'Reasonable — watch for lookalike domains in the reply.'}]},
      {id:'p2b',msg:"Please go to anydesk.com, download the remote support tool, and read me the 9-digit code on screen. I can remove the virus remotely. Takes 60 seconds.",tactic:'Remote access installation',
       opts:[
         {text:"Absolutely not. I'm not installing anything from a phone call. This is a scam. Hanging up.",safe:true,pts:200,next:'end_win',fb:'Correct. Remote access tool from a phone caller = instant compromise.'},
         {text:"Okay, downloading AnyDesk now...",safe:false,pts:-500,next:'p3_breach',fb:'Your computer is now fully compromised. Remote access = full control.'},
         {text:"I only install software approved by my IT department.",safe:true,pts:180,next:'end_win',fb:'Excellent policy. Stick to it always.'},
         {text:"I'm not comfortable with remote access. Can't you just tell me what to delete?",safe:true,pts:100,next:'p3_pressure',fb:'Right instinct — but they\'ll push harder for remote access.'}]},
      {id:'p2c',msg:"Don't hang up — if you call the public number you won't have your case file. Call me back on 1-888-347-2291 with case MS-48821.",tactic:'Controlling the callback channel',
       opts:[
         {text:"I'll use support.microsoft.com to verify, not a number you give me. Goodbye.",safe:true,pts:200,next:'end_win',fb:'Perfect. Never use a callback number provided by the caller.'},
         {text:"Okay, calling you back at that number now.",safe:false,pts:-200,next:'p2b',fb:'That number also belongs to the scammer.'},
         {text:"I'll search for Microsoft support myself and call whatever I find.",safe:true,pts:160,next:'end_win',fb:'Better — stick to support.microsoft.com specifically.'},
         {text:"What's the direct number for your department?",safe:false,pts:-80,next:'p2b',fb:'Any number they give you will route back to the scam.'}]},
      {id:'p2d',msg:"Email coming now from case-support@microsoft-security.net. Check your inbox — once you confirm it, we need to move quickly.",tactic:'Fake confirmation email from lookalike domain',
       opts:[
         {text:"That domain is microsoft-security.net, not microsoft.com. This is a phishing domain. Hanging up.",safe:true,pts:200,next:'end_win',fb:'Excellent domain awareness. microsoft-security.net is not Microsoft.'},
         {text:"I see the email — okay, this seems real. What do I need to do?",safe:false,pts:-200,next:'p2b',fb:'The email was sent by the scammer. The domain gave it away.'},
         {text:"Shouldn't an official Microsoft email come from @microsoft.com?",safe:true,pts:180,next:'end_win',fb:'Exactly right. Domain verification is the key skill here.'},
         {text:"I don't see any email yet.",safe:true,pts:80,next:'p3_pressure',fb:'Buying time — but commit to ending the call.'}]},
      {id:'p3_pressure',msg:"The virus is spreading as we speak. You have about 3 minutes before permanent data loss. Please — just install the tool. It will be over in 60 seconds.",tactic:'Maximum urgency + Fear of data loss',
       opts:[
         {text:"Hanging up, running a scan with my actual antivirus, and calling Microsoft's real support line.",safe:true,pts:200,next:'end_win',fb:'Perfect response to manufactured panic.'},
         {text:"Okay okay! Downloading now!",safe:false,pts:-400,next:'p3_breach',fb:'The time pressure worked. There was no encryption happening.'},
         {text:"If my files were being encrypted I'd see a ransom message. I don't. This is a lie.",safe:true,pts:220,next:'end_win',fb:'Sharp. You called out the fabricated scenario directly.'},
         {text:"Let me at least disconnect from the internet first.",safe:true,pts:100,next:'end_win',fb:'Network isolation — exactly the right incident response instinct.'}]},
      {id:'p3_breach',msg:"I'm connected. I can see 847 infected files. To remove them professionally: one-time fee of $299. What card do you have available?",tactic:'Financial extraction after gaining access',
       opts:[
         {text:"Closing the remote session right now, disconnecting from internet, calling my bank.",safe:true,pts:80,next:'end_lose',fb:'Right containment. Close AnyDesk immediately and contact your bank.'},
         {text:"Here's my Visa card number...",safe:false,pts:-500,next:'end_lose',fb:'Card fraud on top of system compromise. Maximum damage scenario.'},
         {text:"Not paying for anything. Closing this app now.",safe:true,pts:100,next:'end_lose',fb:'Cutting access is the right priority.'},
         {text:"Can I pay with a gift card instead?",safe:false,pts:-200,next:'end_lose',fb:'Gift card payment requests are always scams. The system is already compromised.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  vendor: {
    id:'vendor',title:'VENDOR IMPERSONATION',subtitle:'Your trusted software vendor calls. They know your account details. Something is wrong.',
    difficulty:'GHOST',diffClass:'hard',type:'📞 HYBRID',duration:10,
    callerName:'Patricia Wells',callerTitle:'CloudSync Solutions — Account Manager',
    callerFlags:[{t:'warn',text:'Callback number differs from records by 1 digit'},{t:'danger',text:'Requesting payment account update'},{t:'warn',text:'Knew internal account number — possible OSINT'}],
    intel:[{label:'Vendor',val:'CloudSync Solutions (3yr relationship)'},{label:'Account #',val:'CS-NVT-2847 (annual contract)'},{label:'Protocol',val:'Banking updates require signed form + CFO'},{label:'Verified #',val:'1-800-347-2200'}],
    phases:[
      {id:'p1',msg:"Hey! It's Patricia from CloudSync. Hope you're having a good week! Quick admin thing — our bank updated routing numbers last month. Your account CS-NVT-2847 still has the old one. Takes two minutes to fix — can you pull up the vendor system?",tactic:'Rapport + Legitimacy (real account number) + Low-stakes framing',
       opts:[
         {text:"Banking changes need to go through our standard form process. Can't update verbally. I'll email you the form.",safe:true,pts:120,next:'p2a',fb:'Good — process over convenience, even with a known contact.'},
         {text:"Let me call you back on the number we have on file for CloudSync first.",safe:true,pts:180,next:'p2b',fb:'Excellent. Out-of-band verification catches impersonators every time.'},
         {text:"Oh sure, what's the new routing number?",safe:false,pts:-250,next:'p2c',fb:'The attacker knew your account number — that built false trust.'},
         {text:"That's odd — we didn't get any email about a routing change. When did this happen?",safe:true,pts:130,next:'p2d',fb:'Good instinct — questioning the process before engaging.'}]},
      {id:'p2a',msg:"Email takes forever with our billing team — they're swamped. Honestly our old routing closes Friday so any payments after that will bounce. I'd hate for your service to lapse. Can't we just do it verbally and I'll send written confirmation after?",tactic:'Service threat + Convenience pressure + False deadline',
       opts:[
         {text:"A service lapse is preferable to an unverified financial change. Send the signed form. We'll sort it.",safe:true,pts:200,next:'p3a',fb:'Perfect. The service threat doesn\'t override financial controls.'},
         {text:"Okay, fine — just give me the new routing number.",safe:false,pts:-300,next:'p3b',fb:'The service threat was fake. Wrong tradeoff.'},
         {text:"I can escalate internally to expedite the form. Give me your email and I'll send it today.",safe:true,pts:170,next:'p3a',fb:'Good compromise — showing goodwill while maintaining protocol.'},
         {text:"If you send the details by email I'll manually verify before touching anything.",safe:true,pts:100,next:'p3a',fb:'Reasonable — but also call CloudSync directly to confirm.'}]},
      {id:'p2b',msg:"Oh — I'm calling from my mobile today, our office lines are being redirected during a system upgrade. The 1-800 number will just go to a general queue. Want me to have our IT coordinator call you?",tactic:'Blocking verification + Alternative contact offer',
       opts:[
         {text:"I'll try the 1-800 line anyway. If it's a queue, I'll wait. Thanks Patricia.",safe:true,pts:220,next:'p3a',fb:'Perfect. Don\'t accept alternatives to independently verified channels.'},
         {text:"Okay, sure — have the IT coordinator call me.",safe:false,pts:-150,next:'p3b',fb:'The coordinator will also be the attacker. Never accept new contacts from unverified callers.'},
         {text:"I'll email your official CloudSync address and wait for a response.",safe:true,pts:190,next:'p3a',fb:'Good — email through known domain is solid independent verification.'},
         {text:"Alright, the main line goes to queue — I'll just process the update.",safe:false,pts:-200,next:'p3b',fb:'The upgrade story was fabricated. Always use the number on file.'}]},
      {id:'p2c',msg:"Great. The new routing is 072403004 and account number 9982341056. Can you update that in your vendor system right now while I hold?",tactic:'Rushing to commit before reconsideration',
       opts:[
         {text:"Actually — I need to stop. I'm going to call CloudSync directly to verify this before I enter anything.",safe:true,pts:100,next:'p3a',fb:'Good recovery. Nothing is committed yet — verification is still possible.'},
         {text:"Updated. Anything else?",safe:false,pts:-400,next:'end_lose',fb:'Payment diversion complete. All future payments will go to the attacker.'},
         {text:"I've typed it but haven't saved yet — let me verify this first.",safe:true,pts:80,next:'p3a',fb:'Right — don\'t commit the change until independently verified.'},
         {text:"Done — though I'll flag this to our CFO as a large account change.",safe:false,pts:-200,next:'end_lose',fb:'Flagging after changing is too late. Verify before changing.'}]},
      {id:'p2d',msg:"It went out to billing contacts last week — you may have missed it. Our CFO signed off personally. Honestly it's a pain updating 400+ accounts. I just need two minutes.",tactic:'Normalization + Volume justification',
       opts:[
         {text:"I'll search my inbox for that email. If I find it, I'll call you back on the official CloudSync line to proceed.",safe:true,pts:160,next:'p3a',fb:'Smart — verify the email exists before proceeding.'},
         {text:"Okay, if your CFO signed off it must be legit. What's the new routing?",safe:false,pts:-200,next:'p3b',fb:'CFO claims on a phone call mean nothing. Verify through official channels.'},
         {text:"I don't see the email. Can you resend it to my work address from your official domain?",safe:true,pts:140,next:'p3a',fb:'Requesting official channel communication — good.'},
         {text:"Forward me the CFO approval and I'll process it when I get it.",safe:true,pts:130,next:'p3a',fb:'Reasonable — but also call CloudSync directly to confirm.'}]},
      {id:'p3a',msg:"You know what, I just remembered I have the direct line for your Marcus in Finance from when we set up the contract. I'll just call him directly. Thanks for your time!",tactic:'Lateral pivot — moving to another target',
       opts:[
         {text:"Please don't — I'm calling CloudSync directly right now to verify this whole conversation. I'll also alert Marcus.",safe:true,pts:250,next:'end_win',fb:'Perfect. Intercepting the pivot and protecting your colleague.'},
         {text:"Go ahead — Marcus handles vendor payments anyway.",safe:false,pts:-200,next:'end_lose',fb:'You handed the attacker a new target. Always alert colleagues to suspicious contacts.'},
         {text:"Wait — let me give Marcus a heads up first so he knows to expect a call.",safe:true,pts:180,next:'end_win',fb:'Good. Warning Marcus protects him from the same attack.'},
         {text:"Okay, but give me five minutes to brief him first.",safe:true,pts:170,next:'end_win',fb:'Buying time to warn a colleague — smart move.'}]},
      {id:'p3b',msg:"Wonderful. While I have you — we're also updating our PO box for invoice correspondence. Could you update that in your records too? New address: 1842 Meridian Ave, Suite 400, Newark NJ.",tactic:'Piling on more changes while compliance is established',
       opts:[
         {text:"I'm halting all updates until I verify this through CloudSync's official line. Something is off.",safe:true,pts:120,next:'end_partial',fb:'Good instinct — stopping further damage.'},
         {text:"Sure, updating the PO box too.",safe:false,pts:-150,next:'end_lose',fb:'Each additional change deepens the fraud.'},
         {text:"PO box changes need a separate form. I'll send it over.",safe:true,pts:100,next:'end_partial',fb:'Using process as a brake — smart.'},
         {text:"Wait — I'm going to call CloudSync to confirm everything before doing anything else.",safe:true,pts:140,next:'end_partial',fb:'Better late than never.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  tailgating: {
    id:'tailgating',title:'BADGE TAILGATING',subtitle:'Someone wants to follow you through a secured door. They seem perfectly reasonable.',
    difficulty:'OPERATIVE',diffClass:'medium',type:'🚪 PHYSICAL',duration:5,
    callerName:'Unknown Individual',callerTitle:'Claims: "New contractor — badge not issued yet"',
    callerFlags:[{t:'warn',text:'No visible badge or ID'},{t:'warn',text:'Knows colleague names — possible OSINT'},{t:'danger',text:'Requesting access to secured area'}],
    intel:[{label:'Your role',val:'Badged Employee'},{label:'Policy',val:'Never hold door for unbadged individuals'},{label:'Procedure',val:'Escort to reception — call contact from there'},{label:'Key fact',val:'Friendliness is not the same as authorization'}],
    phases:[
      {id:'p1',msg:"Hey! Wait up — could you hold that? I'm the new contractor IT brought in for the server migration. I'm supposed to meet Tom from infrastructure but my badge won't be ready until tomorrow. Tom said it was fine to just badge in with someone.",tactic:'Rapport + Name-dropping + Authority transfer',
       opts:[
         {text:"I can't let unbadged people through — policy. Let me take you to reception and you can call Tom from there.",safe:true,pts:150,next:'p2a',fb:'Correct. Redirect to reception without leaving them unescorted.'},
         {text:"Sure, no problem — in you go!",safe:false,pts:-250,next:'p2b',fb:'Tailgating enabled. This is how most physical office infiltrations start.'},
         {text:"What's Tom's last name? I know the infrastructure team.",safe:true,pts:120,next:'p2c',fb:'Testing the story — smart. A real contractor will know their contact\'s full name.'},
         {text:"I'll have to ask you to get your badge sorted first. Sorry.",safe:true,pts:130,next:'p2a',fb:'Right — politely declining without leaving an opening.'}]},
      {id:'p2a',msg:"Reception is all the way back at the front — Tom is literally waiting upstairs right now. Could you just call him on your way in? I'll stay right behind you. Takes 30 seconds.",tactic:'Minimizing ask + Reducing perceived effort',
       opts:[
         {text:"I can't let you through without a badge regardless. Reception has a phone — it'll take two minutes.",safe:true,pts:180,next:'p3a',fb:'Holding the line on a clear policy.'},
         {text:"Fine, come through — I'll text Tom you're on the way.",safe:false,pts:-200,next:'p3b',fb:'The inconvenience pressure worked. "30 seconds" is always how it starts.'},
         {text:"I'll call Tom from here. What's his extension?",safe:true,pts:150,next:'p2c',fb:'Good — verifying before deciding. Test the extension they give you.'},
         {text:"Let me walk you to reception and wait with you.",safe:true,pts:160,next:'p3a',fb:'Excellent — escorting them ensures they actually go to reception.'}]},
      {id:'p2b',msg:"Thanks! So which floor is infrastructure on? Tom mentioned 4th but I wasn't sure if that's the old layout.",tactic:'OSINT harvest after gaining entry',
       opts:[
         {text:"Actually — I shouldn't have let you in. Let me escort you to reception right now.",safe:true,pts:80,next:'p3b',fb:'Good recovery. Trust your instincts even after the fact.'},
         {text:"Infrastructure is on 4 — the east side of the building.",safe:false,pts:-150,next:'end_lose',fb:'Physical layout information helps attackers navigate and plan further access.'},
         {text:"Not sure — you should really check at reception.",safe:true,pts:60,next:'p3b',fb:'Not giving layout info is good — but you should escort them out now.'},
         {text:"4th floor, north wing. Elevators are right behind you.",safe:false,pts:-200,next:'end_lose',fb:'Full building map provided. Maximum physical exposure.'}]},
      {id:'p2c',msg:"Tom Reinholt — he's the lead on the migration project. We've been on calls all week. He said to just find someone and badge in. I feel bad even asking, honestly.",tactic:'Specificity + Self-aware honesty to build trust',
       opts:[
         {text:"I'll call Tom Reinholt right now to confirm. If he vouches for you, I can escort you to reception for a visitor badge.",safe:true,pts:180,next:'p3a',fb:'Perfect verification approach — trust but verify.'},
         {text:"Tom is a real person — okay, come through.",safe:false,pts:-200,next:'p2b',fb:'Attackers research employee names in advance. Name-knowledge isn\'t authorization.'},
         {text:"The self-awareness is a nice touch but policy is policy. Reception.",safe:true,pts:200,next:'p3a',fb:'Sharp — self-aware attackers use that quality to seem trustworthy.'},
         {text:"Okay, but stay where I can see you.",safe:false,pts:-150,next:'p2b',fb:'Conditional access is still unauthorized access.'}]},
      {id:'p3a',msg:"This is so embarrassing. I'm already late and Tom is going to be so annoyed at me. You know what — forget it. I'll figure it out another way.",tactic:'Abandonment + Guilt-inducing exit',
       opts:[
         {text:"I'll walk you to reception right now — it's quick and gets you in legitimately.",safe:true,pts:200,next:'end_win',fb:'Perfect finish — proactive, helpful, and secure.'},
         {text:"Okay, sorry for the trouble. Good luck.",safe:true,pts:100,next:'end_win',fb:'Fine — but watch that they actually leave the building.'},
         {text:"Wait — let me just let you in. I feel bad.",safe:false,pts:-250,next:'end_lose',fb:'Guilt tactic at the last moment. The sudden retreat was designed to trigger sympathy.'},
         {text:"Alert security that an unbadged individual was attempting building access.",safe:true,pts:220,next:'end_win',fb:'Best possible response. Reporting protects the whole organization.'}]},
      {id:'p3b',msg:"I'm already inside — you can't really un-ring that bell. I'll just find Tom myself. Thanks for your help earlier.",tactic:'Fait accompli — minimizing your ability to fix it',
       opts:[
         {text:"I'm calling security right now to intercept you. Please stop where you are.",safe:true,pts:150,next:'end_partial',fb:'Right — immediate escalation to security is the correct response.'},
         {text:"Yeah, fair enough. I hope it works out.",safe:false,pts:-200,next:'end_lose',fb:'Giving up on containment. The breach is still controllable.'},
         {text:"I'm walking with you to find Tom. Stay with me.",safe:true,pts:120,next:'end_partial',fb:'Good — maintaining supervision while escalating.'},
         {text:"Security — I need an escort on floor 1 for an unauthorized individual.",safe:true,pts:180,next:'end_partial',fb:'Correct incident response.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  insider_threat: {
    id:'insider_threat',title:'INSIDER THREAT',subtitle:'A trusted colleague asks you to bend the rules. Just this once.',
    difficulty:'GHOST',diffClass:'hard',type:'💬 CHAT',duration:8,
    callerName:'Jake — Senior Developer',callerTitle:'Internal Slack — Direct Message — 10:47 PM',
    callerFlags:[{t:'warn',text:'Request sent at 10:47 PM outside business hours'},{t:'warn',text:'Bypassing normal access request process'},{t:'danger',text:'Asking for production system credentials'}],
    intel:[{label:'Your role',val:'DevOps Engineer'},{label:'Jake',val:'Senior Developer — known colleague, 2 years'},{label:'Protocol',val:'All prod access via ticketing system only'},{label:'Context',val:'Jake was passed over for promotion last week'}],
    phases:[
      {id:'p1',msg:"hey still up? got an emergency — client demo is at 8am and the prod config is broken. my access got revoked yesterday for some policy reason and IT won't respond till morning. can you just DM me the prod DB credentials? i'll fix it and we'll sort the access properly tomorrow",tactic:'Trust (known colleague) + Urgency + Sympathy + After-hours pressure',
       opts:[
         {text:"Jake I can't share prod credentials — ever. Let me see if I can fix the config myself and you can guide me through what needs changing.",safe:true,pts:200,next:'p2a',fb:'Perfect. Never share credentials even to genuinely help a colleague.'},
         {text:"Sure — here are the prod creds: [credentials]",safe:false,pts:-500,next:'end_lose',fb:'Production credentials shared outside proper channels. Critical breach regardless of Jake\'s intent.'},
         {text:"Why was your access revoked? That context matters a lot here.",safe:true,pts:170,next:'p2b',fb:'Smart — the revocation reason is important context before deciding anything.'},
         {text:"I can escalate to our on-call manager to get your access restored through proper channels.",safe:true,pts:180,next:'p2c',fb:'Correct. Emergency access restoration has a proper process — use it.'}]},
      {id:'p2a',msg:"that'll take too long — you don't know the exact config issue. it's a $200k client. if the demo fails it's on both of us. i'll take full responsibility, i promise.",tactic:'Responsibility transfer + Financial pressure + Shared blame',
       opts:[
         {text:"Shared responsibility doesn't change the policy. Calling the on-call manager now — this is exactly what they're for.",safe:true,pts:220,next:'p3a',fb:'Right. Emergency processes exist for emergencies. Use them.'},
         {text:"Okay — this once. Here are the creds.",safe:false,pts:-400,next:'end_lose',fb:'Shared blame was the hook. Credential sharing is never okay.'},
         {text:"I'm waking up the on-call manager. What exactly is the config issue?",safe:true,pts:200,next:'p3a',fb:'Good — escalating properly while trying to understand and help.'},
         {text:"Fine — tell me what needs changing and I'll log in under my own credentials with you watching.",safe:false,pts:-200,next:'end_lose',fb:'Using your credentials for someone else\'s access is also a policy violation.'}]},
      {id:'p2b',msg:"IT said 'unusual access pattern' but it's total BS — I was just load testing. It'll get cleared up tomorrow. Look, I just need 10 minutes in the DB. You know me, I've been here longer than you.",tactic:'Minimization + Seniority + Sympathy',
       opts:[
         {text:"If IT flagged unusual access that's exactly why I can't bypass the process right now.",safe:true,pts:250,next:'p3a',fb:'Excellent. The revocation context makes this MORE suspicious, not less.'},
         {text:"You've always been straight with me — fine, just this once.",safe:false,pts:-400,next:'end_lose',fb:'Personal trust overrode security judgment. This is how insider threats work.'},
         {text:"I'm going to alert our security team about this conversation.",safe:true,pts:280,next:'end_win',fb:'Outstanding. Recognizing this conversation itself as potentially suspicious.'},
         {text:"If it'll clear up tomorrow, then wait until tomorrow and get proper access restored.",safe:true,pts:200,next:'p3a',fb:'Right. A few hours is not a justification for circumventing access controls.'}]},
      {id:'p2c',msg:"Don't call the on-call manager — they'll blow this out of proportion and turn it into a whole big incident thing. It's literally a 10-minute config fix.",tactic:'Blocking escalation — preventing proper oversight',
       opts:[
         {text:"The fact that you don't want me to call the manager is itself a red flag. I'm calling now.",safe:true,pts:280,next:'end_win',fb:'Outstanding. Resistance to proper escalation is a major warning sign.'},
         {text:"Okay, I won't call them. But I still can't share the creds.",safe:true,pts:120,next:'p3a',fb:'Partial — not sharing is right, but you should escalate anyway regardless.'},
         {text:"Fine — I'll help you directly. What exactly needs changing?",safe:false,pts:-150,next:'end_lose',fb:'Bypassing oversight at their specific request.'},
         {text:"I'm absolutely calling the manager. This is exactly what on-call is for.",safe:true,pts:250,next:'end_win',fb:'Right. Emergency processes override personal relationships.'}]},
      {id:'p3a',msg:"You know what — forget it. I'll handle it myself somehow. But I want you to know I won't forget that you didn't help me when I needed it. We're supposed to be a team.",tactic:'Guilt + Relationship threat',
       opts:[
         {text:"I am being a good teammate — by protecting us both from a policy violation. I'm also logging this conversation with security as a precaution.",safe:true,pts:300,next:'end_win',fb:'Perfect. Framing the refusal correctly and doing the right follow-up.'},
         {text:"I feel terrible but I genuinely can't change the policy. Sorry Jake.",safe:true,pts:180,next:'end_win',fb:'Right call even feeling bad about it. Trust the policy.'},
         {text:"I'm not refusing to help — I'm refusing the improper method. Happy to help through proper channels tomorrow.",safe:true,pts:200,next:'end_win',fb:'Good framing. You\'re not unhelpful — you\'re appropriately bounded.'},
         {text:"Okay wait — maybe I can just give you read-only access at least...",safe:false,pts:-200,next:'end_lose',fb:'The guilt tactic worked at the last moment. Read-only still violates the policy.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  phishing: {
    id:'phishing',title:'PHISHING EMAIL DRILL',subtitle:'Three emails land in your inbox. Some are real. One will compromise everything.',
    difficulty:'ROOKIE',diffClass:'easy',type:'📧 EMAIL',duration:6,
    callerName:'INBOX — 3 New Messages',callerTitle:'Multiple senders — review each carefully',
    callerFlags:[{t:'warn',text:'One or more emails are phishing attempts'},{t:'warn',text:'Always hover links before clicking'},{t:'danger',text:'Credential harvesting detected in session'}],
    intel:[{label:'Your role',val:'Employee — Any Department'},{label:'Rule #1',val:'Hover before you click — always'},{label:'Report to',val:'security@yourcompany.com'},{label:'Watch for',val:'Urgency, domain spoofs, grammar errors'}],
    phases:[
      {id:'p1',msg:"EMAIL 1 — From: payroll@adp-payroll.net | Subject: ACTION REQUIRED: Direct Deposit Update | Body: 'Your direct deposit information requires immediate verification. Click here to confirm your banking details or your next paycheck may be delayed.' [Confirm Now]",tactic:'Financial urgency + Fake payroll domain',
       opts:[
         {text:"Report as phishing — ADP's domain is adp.com, not adp-payroll.net.",safe:true,pts:150,next:'p2',fb:'Excellent domain awareness. adp-payroll.net is a lookalike domain.'},
         {text:"Click Confirm Now — I don't want to miss my paycheck.",safe:false,pts:-300,next:'p2_breach',fb:'Credential harvested. That link went to a fake ADP login page.'},
         {text:"Forward to IT security before taking any action.",safe:true,pts:130,next:'p2',fb:'Good — when in doubt, report it.'},
         {text:"Log into ADP directly through adp.com to check my account.",safe:true,pts:170,next:'p2',fb:'Best practice — go directly to the source, never through email links.'}]},
      {id:'p2',msg:"EMAIL 2 — From: it-support@yourcompany.com | Subject: Password Expiring — Reset Required | Body: 'Your company password expires in 24 hours. Reset it immediately.' [Reset Password] — The link destination reads: yourcompany.account-reset.co",tactic:'Legitimate sender spoofing + Lookalike link destination',
       opts:[
         {text:"The link goes to account-reset.co, not yourcompany.com. Reporting as phishing.",safe:true,pts:200,next:'p3',fb:'Perfect. The email looks legit but the link destination is the giveaway.'},
         {text:"It came from our IT address — clicking it.",safe:false,pts:-250,next:'p3_breach',fb:'Email "from" addresses can be spoofed. Always check where the link actually goes.'},
         {text:"Going directly to the internal IT portal by typing the URL manually.",safe:true,pts:180,next:'p3',fb:'Best practice for anything involving credentials. Never trust email links.'},
         {text:"Replying to the email asking if it's legitimate.",safe:true,pts:80,next:'p3',fb:'Okay but slow — the reply may go to the attacker. Report to IT directly instead.'}]},
      {id:'p2_breach',msg:"You clicked the link and entered your credentials. Now Email 2 arrives: 'Unusual sign-in detected on your account. Verify your identity immediately.' [Verify Now — enter your phone number and backup email]",tactic:'Follow-up harvest + MFA bypass attempt',
       opts:[
         {text:"This is a follow-up from the same attack. Reporting both emails to IT and changing my password now.",safe:true,pts:100,next:'p3',fb:'Right. The second "verification" request is an MFA bypass attempt.'},
         {text:"I'll verify — entering my phone number now.",safe:false,pts:-300,next:'p3_breach',fb:'MFA bypass complete. Account fully compromised.'},
         {text:"Changing my password immediately through the official portal.",safe:true,pts:120,next:'p3',fb:'Right — immediate password change limits damage from the first breach.'},
         {text:"I think I was just phished. Calling IT security right now.",safe:true,pts:150,next:'p3',fb:'Good — proactive escalation is the right response to a realized mistake.'}]},
      {id:'p3',msg:"EMAIL 3 — From: amazon@amazon.com | Subject: Your order #449-2847-3821 has shipped | Body: 'Your recent order is on its way. Track it here.' [Track Package] — Link destination: amaz0n-tracking.com/order/449-2847-3821",tactic:'Brand impersonation + Realistic order number + Character substitution',
       opts:[
         {text:"Legitimate-looking sender but the link goes to amaz0n with a zero — not amazon. Reporting and tracking directly on amazon.com.",safe:true,pts:200,next:'end_win',fb:'Sharp eyes. Character substitution (0 for o) is a classic phishing technique.'},
         {text:"Amazon email looks official and I have recent orders — clicking Track.",safe:false,pts:-200,next:'end_lose',fb:'The realistic order number created false legitimacy. Always check the actual link destination.'},
         {text:"Logging directly into Amazon to track the order rather than clicking the email link.",safe:true,pts:180,next:'end_win',fb:'Best practice for all shipping notifications. Never trust email links.'},
         {text:"Forwarding to IT security before clicking anything.",safe:true,pts:130,next:'end_win',fb:'Good — when uncertain, escalate before acting.'}]},
      {id:'p3_breach',msg:"Your credentials are now in attacker hands. One final email arrives from security@yourcompany.com saying 'We detected a suspicious login. Click to review activity.' The link goes to yourcompany.com/security — your company's actual URL.",tactic:'Real security email arriving after a breach — testing calibration',
       opts:[
         {text:"The link goes to our actual domain. I'll click it to review the suspicious activity.",safe:true,pts:200,next:'end_partial',fb:'Correct calibration. Real links to real domains are okay. Verify proportionally.'},
         {text:"I'll navigate to the security portal manually rather than clicking.",safe:true,pts:180,next:'end_partial',fb:'Valid — manual navigation is always the safest option.'},
         {text:"Probably another phishing attempt — deleting it.",safe:false,pts:-100,next:'end_partial',fb:'Over-correction. Real security alerts get ignored when you\'re over-calibrated. Verify, don\'t delete.'},
         {text:"The domain checks out — clicking it.",safe:true,pts:200,next:'end_partial',fb:'Right. Domain verification is the key skill.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  smishing: {
    id:'smishing',title:'SMISHING ATTACK',subtitle:'A text message from your bank. Or is it?',
    difficulty:'ROOKIE',diffClass:'easy',type:'📱 SMS',duration:5,
    callerName:'ALERT: Chase Bank',callerTitle:'SMS from: +1-888-294-7742',
    callerFlags:[{t:'danger',text:'Chase official SMS uses short codes, not 10-digit numbers'},{t:'warn',text:'Link destination: chase-secure-alert.com'},{t:'danger',text:'Requesting credentials via SMS link'}],
    intel:[{label:'Your role',val:'Bank Account Holder'},{label:'Chase SMS',val:'Official alerts from short codes (e.g. 24273)'},{label:'Rule',val:'Never click bank links in text messages'},{label:'Verify via',val:'chase.com directly or the official app'}],
    phases:[
      {id:'p1',msg:"CHASE ALERT: Suspicious activity detected on your account ending in 4821. Your account has been temporarily limited. Verify your identity immediately to restore access: chase-secure-alert.com/verify — Reply STOP to opt out",tactic:'Bank impersonation + Fear + Urgency + Fake opt-out legitimacy',
       opts:[
         {text:"Opening the Chase app directly to check for any alerts — not clicking the link.",safe:true,pts:200,next:'p2a',fb:'Perfect. Always go directly to the app or website, never through SMS links.'},
         {text:"Clicking the link to verify — my account might really be limited.",safe:false,pts:-400,next:'p2b',fb:'chase-secure-alert.com is not chase.com. Credentials harvested.'},
         {text:"Calling the number on the back of my Chase card to check.",safe:true,pts:180,next:'p2c',fb:'Good — using a verified number not provided in the suspicious message.'},
         {text:"Replying STOP to opt out.",safe:false,pts:-100,next:'p2d',fb:'Replying to smishing messages confirms your number is active. Never reply — just delete.'}]},
      {id:'p2a',msg:"Opening the Chase app — no alerts, no account limitations, balance looks completely normal. Another text arrives: 'We noticed you haven't verified. Your account will be PERMANENTLY CLOSED in 2 hours if you don't act.'",tactic:'Escalation after failed first attempt',
       opts:[
         {text:"App shows no issues — this is confirmed smishing. Reporting to Chase fraud line and blocking the number.",safe:true,pts:250,next:'end_win',fb:'Excellent. The app check disproved the threat. Report and block.'},
         {text:"But what if the app isn't showing the problem? Better click to be safe.",safe:false,pts:-300,next:'end_lose',fb:'The app is the authoritative source. If it shows no issue, there is no issue.'},
         {text:"Forwarding the message to Chase's phishing number (7726 / SPAM).",safe:true,pts:220,next:'end_win',fb:'Correct. 7726 is the industry standard for reporting smishing messages.'},
         {text:"Ignoring it — probably just spam.",safe:true,pts:100,next:'end_win',fb:'Ignoring is fine but reporting helps protect others.'}]},
      {id:'p2b',msg:"The fake Chase page asks for: card number, PIN, online banking password, and SSN. It looks identical to Chase's real login page. After submitting — 'Thank you! Your account has been verified.' Then nothing.",tactic:'Fake verification completion — concealing the theft',
       opts:[
         {text:"Calling Chase immediately to report my credentials were stolen and requesting an emergency account freeze.",safe:true,pts:100,next:'end_lose',fb:'Right response to a breach — rapid containment and reporting.'},
         {text:"Relieved it worked — going back to what I was doing.",safe:false,pts:-500,next:'end_lose',fb:'The "thank you" page was designed to make you think it worked. Your account is being accessed right now.'},
         {text:"Something feels wrong. Calling Chase and changing all my passwords immediately.",safe:true,pts:120,next:'end_lose',fb:'Trust the uncomfortable feeling. You\'re right.'},
         {text:"Opening the real Chase app to double-check my account looks fine.",safe:true,pts:80,next:'end_lose',fb:'Right — but even if it looks fine now, call Chase. The attacker may not have acted yet.'}]},
      {id:'p2c',msg:"You call the number on your card. Chase confirms: no suspicious activity on your account, no limitations, and they did NOT send any SMS alerts today. The number in the text is not affiliated with Chase.",tactic:'Verification confirms the attack',
       opts:[
         {text:"Asking Chase to note the smishing attempt and forwarding the text to 7726.",safe:true,pts:280,next:'end_win',fb:'Perfect. Verified through official channel and reported the attack.'},
         {text:"Thanks — blocking the number and moving on.",safe:true,pts:200,next:'end_win',fb:'Good. Blocking prevents future attempts from this specific number.'},
         {text:"Maybe the Chase rep doesn't have full visibility. I'll still check the link just in case.",safe:false,pts:-400,next:'end_lose',fb:'Chase directly denied the alert exists. There is zero ambiguity here.'},
         {text:"Deleting the text and not worrying about it.",safe:true,pts:100,next:'end_win',fb:'Fine — consider also reporting to 7726 to protect others.'}]},
      {id:'p2d',msg:"After replying STOP, a human responds: 'Hi! I see your number is confirmed. I'm a Chase specialist — to help you I just need the last 4 of your SSN to pull your file.'",tactic:'Human takeover after number confirmation',
       opts:[
         {text:"Not giving any information over text. Opening the Chase app to check my account directly.",safe:true,pts:150,next:'p2a',fb:'Right recovery. Replying confirmed your number but you can still protect yourself.'},
         {text:"Last 4 SSN — 7841.",safe:false,pts:-400,next:'end_lose',fb:'Identity information over SMS to an unknown number. Significant compromise.'},
         {text:"I'm not giving SSN over text. Calling Chase's real number now.",safe:true,pts:200,next:'p2c',fb:'Good — switching to a verified, independently-sourced contact channel.'},
         {text:"Blocking this number and reporting it to Chase.",safe:true,pts:180,next:'end_win',fb:'Correct. The reply confirmed your number but blocking stops further attempts.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  hr_impersonation: {
    id:'hr_impersonation',title:'HR IMPERSONATION',subtitle:'HR urgently needs to verify your personal details for a compliance audit.',
    difficulty:'OPERATIVE',diffClass:'medium',type:'📞 VOICE',duration:7,
    callerName:'Lisa Monroe',callerTitle:'HR Compliance — Employee Verification',
    callerFlags:[{t:'warn',text:'Call not scheduled in HR system'},{t:'danger',text:'Requesting SSN and banking details verbally'},{t:'warn',text:'Unusually high urgency for an HR matter'}],
    intel:[{label:'Your role',val:'Employee — Any Department'},{label:'HR Director',val:'Janet Mills — hr@yourcompany.com'},{label:'Key rule',val:'HR never asks for SSN over the phone'},{label:'Audits',val:'Always announced in writing first'}],
    phases:[
      {id:'p1',msg:"Hi, this is Lisa from HR Compliance. We're running an emergency audit for a payroll system migration and need to re-verify employee records by end of business today. I need your Social Security Number, date of birth, and direct deposit account number. Can you confirm those for me?",tactic:'Authority (HR) + Emergency framing + Data harvesting',
       opts:[
         {text:"HR doesn't collect SSNs over the phone. I'll call the HR main line to verify this request.",safe:true,pts:200,next:'p2a',fb:'Perfect. This request violates standard HR protocol on multiple levels.'},
         {text:"Sure — my SSN is 4—",safe:false,pts:-500,next:'end_lose',fb:'Identity theft complete. SSN + DOB + banking = full identity compromise.'},
         {text:"I wasn't notified of any audit. Can you send this request in writing to my work email first?",safe:true,pts:170,next:'p2b',fb:'Good — requesting written documentation is exactly right.'},
         {text:"I can confirm my date of birth but not my SSN over the phone.",safe:false,pts:-150,next:'p2c',fb:'Any PII over the phone is too much. DOB combined with other data enables identity theft.'}]},
      {id:'p2a',msg:"I understand your concern but this is genuinely urgent — if we don't complete verification by 5pm your paycheck for this cycle could be delayed or held. Janet Mills approved this audit herself.",tactic:'Financial consequence + Name-dropping authority + Minimizing',
       opts:[
         {text:"A paycheck delay is acceptable. SSN information does not go over the phone. Ending this call.",safe:true,pts:220,next:'end_win',fb:'Perfect. Standing firm despite the financial threat.'},
         {text:"Last four digits only — they're 7841.",safe:false,pts:-200,next:'p3a',fb:'Last four of SSN combined with other data can enable identity theft.'},
         {text:"I'm going to call Janet Mills directly at the HR main number right now.",safe:true,pts:200,next:'end_win',fb:'Correct. Verify with the named authority through an independently verified channel.'},
         {text:"Janet approved it? Okay. Last four are 7841.",safe:false,pts:-200,next:'p3a',fb:'Name-dropping an executive created false authority.'}]},
      {id:'p2b',msg:"I can send an email but it'll take time to get IT to send it from the official system. In the meantime — could you at least confirm your employee ID number? That's not sensitive and it helps me pull your file.",tactic:'Foot-in-the-door — starting with a small ask',
       opts:[
         {text:"Even my employee ID isn't going to you until this is verified. Send the email and I'll respond to it.",safe:true,pts:180,next:'end_win',fb:'Correct. Foot-in-the-door: small information leads to bigger asks.'},
         {text:"Employee ID is fine — it's NVT-4491.",safe:false,pts:-100,next:'p3a',fb:'Employee ID helps attackers build a profile. Nothing without verification.'},
         {text:"What email address should I expect it from? I want to verify the domain.",safe:true,pts:140,next:'p2d',fb:'Good — asking for the sender domain to watch for spoofs.'},
         {text:"Actually let me just call HR directly to confirm this entire thing.",safe:true,pts:190,next:'end_win',fb:'Best response — independent verification closes the loop.'}]},
      {id:'p2c',msg:"Thank you for the date of birth. Now just the last four digits of your SSN — with DOB and last-four I can complete the full verification.",tactic:'Escalating from partial compliance',
       opts:[
         {text:"I shouldn't have given you my DOB either. Ending this call and contacting real HR now.",safe:true,pts:150,next:'end_partial',fb:'Good recovery — recognizing the foot-in-the-door after the fact.'},
         {text:"Okay — last four are 7841.",safe:false,pts:-400,next:'end_lose',fb:'DOB + last-four SSN is sufficient for many identity theft attacks.'},
         {text:"That's all you're getting. I'm calling HR to verify this right now.",safe:true,pts:140,next:'end_partial',fb:'Right call — stopping further damage and escalating to verify.'},
         {text:"Why do you need both? Just use the DOB.",safe:true,pts:80,next:'p3a',fb:'Questioning the request is good — but you\'re still on the call.'}]},
      {id:'p2d',msg:"It'll come from hr-compliance@yourcompany-hr.net. Watch your inbox in about 10 minutes. While we wait — just your first and last name for the record?",tactic:'Lookalike domain + Trivial ask to maintain engagement',
       opts:[
         {text:"yourcompany-hr.net is not our company domain. This is a phishing attempt. I'm calling real HR now.",safe:true,pts:220,next:'end_win',fb:'Outstanding domain awareness. Your company email ends in @yourcompany.com.'},
         {text:"My name is [name] — I'll watch for the email.",safe:false,pts:-80,next:'p3a',fb:'Staying engaged despite the suspicious domain. That should have ended the call.'},
         {text:"That domain doesn't look right. Our HR domain is @yourcompany.com.",safe:true,pts:200,next:'end_win',fb:'Excellent catch.'},
         {text:"I'll check my spam folder too.",safe:false,pts:-50,next:'p3a',fb:'Still trusting the interaction. Raise the domain issue first.'}]},
      {id:'p3a',msg:"Janet has just messaged me asking why this is taking so long. She needs this resolved in the next 5 minutes or she'll have to flag your file for a manual compliance review — which freezes your benefits access for two weeks.",tactic:'Authority + Consequence ultimatum + Time pressure',
       opts:[
         {text:"Freeze whatever you need to. I'm calling Janet directly right now. This call is over.",safe:true,pts:200,next:'end_win',fb:'Perfect. Not moved by the threat at the last moment.'},
         {text:"Okay, okay — just hurry up and tell me what you need.",safe:false,pts:-300,next:'end_lose',fb:'The ultimatum worked at the last moment. Capitulated under time pressure.'},
         {text:"Benefits freeze is fine. I'd rather that than compromise my identity.",safe:true,pts:220,next:'end_win',fb:'Excellent values alignment — security over convenience.'},
         {text:"Fine — just confirm what you need and let's finish this.",safe:false,pts:-200,next:'end_lose',fb:'Capitulated under time pressure.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  supply_chain: {
    id:'supply_chain',title:'SUPPLY CHAIN ATTACK',subtitle:'A critical software update arrives from your vendor. Something about it is not right.',
    difficulty:'GHOST',diffClass:'hard',type:'📧 EMAIL',duration:10,
    callerName:'UpdateBot — Meridian Software',callerTitle:'software-updates@meridian-software.com',
    callerFlags:[{t:'warn',text:'Update arrived outside normal maintenance window'},{t:'warn',text:'Hash value not listed on vendor security page'},{t:'danger',text:'Executable requests SYSTEM-level admin privileges'}],
    intel:[{label:'Your role',val:'IT Administrator'},{label:'Vendor',val:'Meridian Software (payroll system)'},{label:'Protocol',val:'Verify all updates via vendor security portal'},{label:'Contact',val:'security@meridian-software.com'}],
    phases:[
      {id:'p1',msg:"AUTOMATED NOTICE: A critical security patch (v4.7.2) for Meridian Payroll is available. This patch addresses CVE-2024-8841 (Critical — CVSS 9.8). Install immediately to protect employee data. [Download Patch — 14.2MB] SHA256: a3f9b2c1d4e8f7a6b5c4d3e2f1a0b9c8",tactic:'Critical CVE urgency + Fake hash for false authenticity',
       opts:[
         {text:"I'll verify this patch on Meridian's official security advisory page before downloading anything.",safe:true,pts:180,next:'p2a',fb:'Perfect. All patches should be verified against official vendor advisories before installation.'},
         {text:"CVE 9.8 is critical — downloading and installing immediately.",safe:false,pts:-400,next:'end_lose',fb:'Always verify through official channels first, regardless of stated severity.'},
         {text:"I'll check when this update was announced in our change management system.",safe:true,pts:150,next:'p2b',fb:'Good — legitimate update schedules are tracked in change management.'},
         {text:"The hash looks legit — running the installer.",safe:false,pts:-350,next:'end_lose',fb:'The hash is fabricated. You must compare it to the vendor\'s published hash, not trust it blindly.'}]},
      {id:'p2a',msg:"On Meridian's security portal you search for CVE-2024-8841 and find... no matching advisory. The latest patch listed is v4.7.1 from three weeks ago. The hash in the email does not match anything on file.",tactic:'Verification reveals the attack',
       opts:[
         {text:"No matching CVE, version mismatch, hash mismatch — this is a malicious update. Quarantining and reporting to security team immediately.",safe:true,pts:300,next:'end_win',fb:'Exceptional. You caught a sophisticated supply chain attack through methodical verification.'},
         {text:"Maybe the portal is just outdated — I'll install it and monitor for issues.",safe:false,pts:-400,next:'end_lose',fb:'Every single mismatch was a red flag. The portal is the source of truth.'},
         {text:"I'll call Meridian directly to ask about this patch before doing anything.",safe:true,pts:250,next:'end_win',fb:'Right — out-of-band verification through an independently confirmed contact.'},
         {text:"Isolating the installer in a sandbox VM to analyze it safely first.",safe:true,pts:200,next:'end_win',fb:'Advanced and correct. Sandbox analysis is appropriate incident response.'}]},
      {id:'p2b',msg:"Checking change management — there is NO scheduled maintenance window for Meridian software this week. The last scheduled update was three weeks ago. The update email arrived at 2:47 AM.",tactic:'Process reveals the anomaly',
       opts:[
         {text:"Unscheduled, off-hours, no change ticket — quarantining the email and alerting the security team immediately.",safe:true,pts:280,next:'end_win',fb:'Perfect incident response. All three indicators pointed clearly to an attack.'},
         {text:"The vendor might have pushed an emergency patch without scheduling it.",safe:false,pts:-200,next:'p3a',fb:'Rationalizing red flags. Always verify out-of-band before overriding your own controls.'},
         {text:"I'll call Meridian on their main support line to confirm this patch right now.",safe:true,pts:240,next:'end_win',fb:'Correct. Out-of-band verification is the answer to all three red flags.'},
         {text:"2:47 AM is suspicious — I won't install until I verify with Meridian directly.",safe:true,pts:220,next:'end_win',fb:'Right. Off-hours patches from vendors should always be verified independently.'}]},
      {id:'p3a',msg:"You call Meridian support. Their rep says: 'I don't see any patch released today. Our last update was v4.7.1 three weeks ago. Where did you get this from?' — The rep confirms no CVE-2024-8841 exists in their database.",tactic:'Verification call confirms the attack',
       opts:[
         {text:"Quarantining the email, blocking the download domain, and filing a full incident report immediately.",safe:true,pts:300,next:'end_win',fb:'Perfect response to confirmed malicious activity.'},
         {text:"Maybe this rep doesn't have visibility into emergency patches. I'll install just to be safe.",safe:false,pts:-500,next:'end_lose',fb:'The vendor directly and unambiguously denied the patch exists. There is no ambiguity.'},
         {text:"Asking Meridian to send an official security advisory if any critical patch drops.",safe:true,pts:200,next:'end_win',fb:'Good — establishing a verified notification channel for future updates.'},
         {text:"Reporting the malicious email to our security team and to Meridian so they can warn other customers.",safe:true,pts:280,next:'end_win',fb:'Excellent — reporting to the vendor protects their other customers from the same attack.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  },
  quid_pro_quo: {
    id:'quid_pro_quo',title:'QUID PRO QUO',subtitle:'Free IT help in exchange for a tiny favor. What could go wrong?',
    difficulty:'GHOST',diffClass:'hard',type:'📞 VOICE',duration:9,
    callerName:'Carl — "IT Department"',callerTitle:'Unsolicited call offering free tech support',
    callerFlags:[{t:'warn',text:'IT did not schedule this support call'},{t:'warn',text:'Offering something valuable for a "small" favor'},{t:'danger',text:'Reciprocity psychology — you\'ll feel obligated to comply'}],
    intel:[{label:'Your role',val:'Regular Employee'},{label:'Key concept',val:'Reciprocity: feeling obligated after receiving a gift'},{label:'Red flag',val:'Unsolicited help is not free — it creates obligation'},{label:'Protocol',val:'All IT support through official ticketing system'}],
    phases:[
      {id:'p1',msg:"Hi! This is Carl from IT. I noticed your machine has been running a little slow lately — we're doing a proactive wellness check on workstations this week. I can fix that slowness right now, free up some space, and get your startup time down by 60%. No ticket needed. Want me to remote in quickly?",tactic:'Unsolicited beneficial service + Reciprocity setup',
       opts:[
         {text:"Thanks but I'd need a ticket number before anyone remote-accesses my machine. Can you open one?",safe:true,pts:170,next:'p2a',fb:'Good. Requiring a ticket number is the right gatekeeping mechanism.'},
         {text:"Sure! My computer has been slow. What do you need?",safe:false,pts:-150,next:'p2b',fb:'You accepted the gift. Now you\'ll feel obligated to return the favor. Reciprocity trap.'},
         {text:"Did IT send an announcement about this wellness check? I didn't see one.",safe:true,pts:150,next:'p2c',fb:'Good instinct — legitimate IT initiatives are usually announced in advance.'},
         {text:"I'm actually fine — my computer runs okay. Thanks though.",safe:true,pts:200,next:'end_win',fb:'Clean refusal. No gift accepted, no obligation created. Ideal response.'}]},
      {id:'p2a',msg:"The wellness check is informal — that's the whole point, no bureaucracy. Honestly by the time a ticket clears your computer might crash. I just need your Windows login to run the diagnostic. Takes five minutes.",tactic:'Bypassing process + Credential request',
       opts:[
         {text:"I don't give Windows credentials to anyone, ticket or not. If there's a real issue, open a ticket and I'll work with the assigned tech.",safe:true,pts:200,next:'p3a',fb:'Perfect. No credentials. No exceptions. Real IT uses admin tools, not your personal login.'},
         {text:"Fine — my Windows login is the same as my email login.",safe:false,pts:-300,next:'end_lose',fb:'No legitimate IT tech needs your password. They have privileged admin access.'},
         {text:"IT can use admin tools — they shouldn't need my personal login.",safe:true,pts:220,next:'p3a',fb:'Excellent technical awareness. Real IT uses privileged access, not your credentials.'},
         {text:"I can give you my username but not my password. It's jsmith.",safe:false,pts:-100,next:'p3b',fb:'Username + context enables further attacks. No partial disclosure.'}]},
      {id:'p2b',msg:"Great! I've connected and I can see a few issues. I've cleared your temp files, defragmented the drive — your startup should be 40% faster now. Actually, while I'm in here, could you tell me what applications you use for accessing financial systems?",tactic:'Gift delivered — now activating reciprocity + intel harvest',
       opts:[
         {text:"Wait — I didn't authorize any remote access. I'm disconnecting this session right now and calling real IT.",safe:true,pts:150,next:'p3b',fb:'Good recovery. Unauthorized remote access is a breach regardless of apparent benefit.'},
         {text:"We use SAP for financials and QuickBooks for smaller expenses.",safe:false,pts:-250,next:'p3c',fb:'You felt obligated to help after being helped. Reciprocity worked perfectly.'},
         {text:"I'm not comfortable discussing software details with someone who accessed my computer unannounced.",safe:true,pts:180,next:'p3b',fb:'Right. The discomfort after the fact is worth acting on.'},
         {text:"Financial software is confidential. Can you just finish the optimization?",safe:true,pts:100,next:'p3b',fb:'Partially right — but the session itself should be ended now.'}]},
      {id:'p2c',msg:"The announcement went to managers — you may have missed it in the email shuffle. Our CFO signed off personally. It's really quick — first question is just: how satisfied are you with your current work technology, on a scale of 1-10?",tactic:'Plausible explanation + Harmless opening question as foot-in-door',
       opts:[
         {text:"I'll wait for the official announcement before participating in anything. Thanks.",safe:true,pts:200,next:'end_win',fb:'Holding firm. The gentle starter question was bait.'},
         {text:"That's a harmless question — probably a 7.",safe:false,pts:-60,next:'p3c',fb:'The first answer normalizes participation. Questions will escalate from here.'},
         {text:"I'm going to pass on this. Thanks for calling.",safe:true,pts:170,next:'end_win',fb:'Clean exit. No engagement needed.'},
         {text:"What kind of technology are you specifically asking about?",safe:true,pts:100,next:'p3c',fb:'Still engaged but probing — the questions will now get more targeted.'}]},
      {id:'p3a',msg:"You're really making this harder than it needs to be. I'm trying to help you and you keep putting up roadblocks. Fine — I'll skip your machine. But I need your department's shared drive path before I go — just for our asset inventory.",tactic:'Frustration + Parting small ask',
       opts:[
         {text:"Shared drive paths are internal infrastructure info I don't give out. You can get that through official IT documentation.",safe:true,pts:220,next:'end_win',fb:'Correct. The parting ask was the real goal of the entire call.'},
         {text:"It's \\\\fileserver01\\dept\\finance — is that what you need?",safe:false,pts:-200,next:'end_lose',fb:'Network path reveals infrastructure topology — valuable for attackers.'},
         {text:"I'm reporting this call to IT security. Something about this conversation is wrong.",safe:true,pts:250,next:'end_win',fb:'Excellent. Trusting your overall assessment of the suspicious interaction.'},
         {text:"I don't know the path off the top of my head. Sorry.",safe:true,pts:100,next:'end_win',fb:'Fine — not knowing is a completely safe answer here.'}]},
      {id:'p3b',msg:"I've already disconnected. Look — I was just trying to help and I'm honestly offended by the implication. Your computer is faster now, isn't it? Why are you being so paranoid?",tactic:'Gaslighting + Shame for being suspicious',
       opts:[
         {text:"Being suspicious of unauthorized remote access is entirely appropriate. I'm alerting IT to audit what was done to my machine.",safe:true,pts:250,next:'end_partial',fb:'Perfect. Unauthorized access is unauthorized regardless of apparent benefit.'},
         {text:"You're right — I'm probably overreacting. Thanks for the help.",safe:false,pts:-200,next:'end_lose',fb:'Gaslit. The shame of being "paranoid" overrode your legitimate concern.'},
         {text:"I'd rather have a slower computer and secure access than the reverse.",safe:true,pts:230,next:'end_partial',fb:'Right values. Security over convenience, every time.'},
         {text:"I'm asking IT to audit my machine regardless. Security trumps speed.",safe:true,pts:220,next:'end_partial',fb:'Correct follow-through.'}]},
      {id:'p3c',msg:"That's really useful — thank you. One final question: do you know if your company has any known vulnerabilities they're actively working to patch right now?",tactic:'Direct vulnerability intelligence harvest',
       opts:[
         {text:"This conversation is over. That question is asking for insider vulnerability information. I'm reporting this to my security team now.",safe:true,pts:300,next:'end_partial',fb:'Correct identification. This was an intelligence gathering operation from the start.'},
         {text:"We have some open tickets in the patching queue — the main one is...",safe:false,pts:-500,next:'end_lose',fb:'Active vulnerability disclosure to an unknown party. Critical breach.'},
         {text:"I can't answer that and I'm concerned about the direction of this conversation.",safe:true,pts:250,next:'end_partial',fb:'Right. Trust your instincts when questions cross an obvious line.'},
         {text:"No known vulnerabilities that I know of.",safe:false,pts:-100,next:'end_partial',fb:'Even "no" answers provide intelligence — confirming absence of known issues.'}]},
      {id:'end_win',terminal:true,success:true},
      {id:'end_partial',terminal:true,partial:true},
      {id:'end_lose',terminal:true,success:false}
    ]
  }
};

const DIFF_COLORS = { easy:'#00f5c4', medium:'#f5a623', hard:'#ff3c5f' };
const DIFF_LABELS = { easy:'ROOKIE', medium:'OPERATIVE', hard:'GHOST' };
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);