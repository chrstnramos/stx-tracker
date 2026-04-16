import { useState, useEffect, useCallback } from "react";
import { saveProgress, subscribeToProgress, isFirebase } from "./storage.js";

const WEEKS = [
  {
    week: 1, dates: "Apr 14–18",
    objective: "GHL Account Setup + ClickUp Automations (Easiest Wins) + Colleen Knowledge Transfer Begins",
    tasks: [
      { id: "w1t1", owner: "Christian + John", task: "Complete GHL setup checklist Steps 1–11. Verify all integrations. Document in GHL Configuration Reference." },
      { id: "w1t2", owner: "Ren + Colleen", task: "Begin Colleen-to-Ren knowledge transfer. Screen-capture every process: Shopify orders, client emails, vendor ordering, ClickUp tasks, Google Drive filing." },
      { id: "w1t3", owner: "Ren", task: "Build ClickUp Automations #1–3 (Mockup Sent Follow-Up, Stale PRE PURCHASE Alert, New Task Assignment Notification)." },
      { id: "w1t4", owner: "Sonny", task: "Grant Shopify admin API access for GHL integration. Update 10x15 Showstopper product page." },
    ],
    done: "GHL account fully configured. 3 ClickUp automations live. Colleen transfer 50% complete. All setup documented.",
    blockers: "Sonny must provide Shopify API access by Tue Apr 15 or GHL–Shopify integration is delayed.",
    designTeam: "Not involved this week. Designers continue normal workflow.",
    automationIds: ["cu1", "cu2", "cu3"],
  },
  {
    week: 2, dates: "Apr 21–25",
    objective: "Complete ClickUp Automations + Email Templates + Colleen Knowledge Transfer Completion",
    tasks: [
      { id: "w2t1", owner: "Christian + John", task: "Build ClickUp automations #4–10. Set up Zapier account and first zap: ClickUp status change → GHL webhook." },
      { id: "w2t2", owner: "Ren + Colleen", task: "Complete knowledge transfer by Fri Apr 25. Colleen documents top 20 email scenarios with example responses." },
      { id: "w2t3", owner: "Ren", task: "Draft email template content for 14 GHL templates using Coordinator System Prompt and Email Scenario Playbook." },
      { id: "w2t4", owner: "Sonny", task: "Review/approve email template language. Final brand voice sign-off. Launch manual re-engagement outreach for 11 CRITICAL tier unpurchased clients." },
    ],
    done: "All 10 ClickUp automations live. Zapier connected. 14 email templates drafted. Colleen transfer 100% complete.",
    blockers: "None expected if Week 1 blockers resolved.",
    designTeam: "Not involved yet. John may briefly demo ClickUp automation changes to designers.",
    automationIds: ["cu4", "cu5", "cu6", "cu7", "cu8", "cu9", "cu10"],
  },
  {
    week: 3, dates: "Apr 28 – May 2",
    objective: "Build First GHL Workflows (Order Confirmation + Artwork Request)",
    tasks: [
      { id: "w3t1", owner: "Christian + John", task: "Build GHL Workflow #1: New Shopify Order → Order Confirmation Email. Build GHL Workflow #2: No Artwork After 24hrs → Artwork Request Email." },
      { id: "w3t2", owner: "Ren", task: "Finalize and load all 14 email templates into GHL. Test email deliverability (Gmail, Outlook, Yahoo). Report spam issues to Christian." },
      { id: "w3t3", owner: "Sonny", task: "Review first two live workflows. Christian demos, Sonny approves or requests changes." },
    ],
    done: "Two GHL workflows live and tested. All email templates loaded. Coordinator email workload reduced ~20%.",
    blockers: "If Shopify–GHL integration has issues, fall back to Zapier as trigger mechanism.",
    designTeam: "Not directly involved. Muriel informed that ClickUp notifications are active.",
    automationIds: ["ghl1", "ghl2"],
  },
  {
    week: 4, dates: "May 5–9",
    objective: "Mockup Delivery + Approval Workflows + Stale Lead Sequences",
    tasks: [
      { id: "w4t1", owner: "Christian + John", task: "Build GHL Workflows #3 (Mockup Ready → email), #4 (Approved → notify), #5 (Stale lead email sequence Day 7/21/45)." },
      { id: "w4t2", owner: "Ren", task: "Test Workflows 3–4 on real non-critical tasks. Document issues. Begin cleaning 181 Design Request folders in Google Drive (tag by tier)." },
      { id: "w4t3", owner: "Sonny", task: "Review stale lead email sequence content. Approve 3-email DID NOT PURCHASE sequence." },
    ],
    done: "Five GHL workflows live. Stale lead sequence running. Coordinator spends <15 min/day on routine status-update emails.",
    blockers: "ClickUp–GHL webhook must be reliable. If webhooks drop, use Zapier as backup. Lead sequence needs approved content from Sonny by Monday.",
    designTeam: "Muriel, Kiara, Maria TEST the mockup notification workflow Tue–Thu. Log issues in shared Google Sheet.",
    automationIds: ["ghl3", "ghl4", "ghl5"],
  },
  {
    week: 5, dates: "May 12–16",
    objective: "Tracking/Shipping Workflows + DID NOT PURCHASE Sequence + Google Drive Organization",
    tasks: [
      { id: "w5t1", owner: "Christian + John", task: "Build GHL Workflow #6 (Tracking → email + Shopify fulfillment). Build Workflow #7 (DID NOT PURCHASE re-engagement 3-email). Begin planning Google Drive auto-folder creation." },
      { id: "w5t2", owner: "Ren", task: "Continue Google Drive cleanup. Move stale folders per tier system. Fully adopt new GHL workflows for daily work." },
      { id: "w5t3", owner: "Sonny", task: "Review DID NOT PURCHASE email sequence. Decide on 60-day artwork deletion policy (real or soft deadline?)." },
    ],
    done: "Seven GHL workflows live. DID NOT PURCHASE sequence running. Google Drive cleanup 50% complete.",
    blockers: "Tracking workflow depends on Shopify fulfillment data structure. May need custom webhook parsing.",
    designTeam: "Not directly involved this week.",
    automationIds: ["ghl6", "ghl7"],
  },
  {
    week: 6, dates: "May 19–23",
    objective: "Post-Delivery Automations + Google Drive Auto-Folder + First Full System Test",
    tasks: [
      { id: "w6t1", owner: "Christian + John", task: "Build GHL Workflows #8 (Review request), #9 (Setup instructions), #10 (Split shipment). Build Google Drive auto-folder via Zapier/Make." },
      { id: "w6t2", owner: "Ren", task: "Run FIRST FULL SYSTEM TEST: 3 real orders through entire automated pipeline. Document every failure point." },
      { id: "w6t3", owner: "Sonny", task: "Create/record setup instructions video for tent assembly (needed for Workflow #9). Review system test results." },
    ],
    done: "All 10 GHL workflows live. Google Drive auto-folder working. Full pipeline tested. Baseline time savings documented.",
    blockers: "Setup instructions content must exist before Workflow #9 can go live. Ship with placeholder if not ready.",
    designTeam: "Full team participates in system test. Log at least 3 observations each in shared testing log.",
    automationIds: ["ghl8", "ghl9", "ghl10"],
  },
  {
    week: 7, dates: "May 26–30",
    objective: "Fix Everything That Broke + AI Design Brief Agent (V1) + Refinement",
    tasks: [
      { id: "w7t1", owner: "Christian + John", task: "Fix all Week 6 system test issues. Begin building V1 AI Design Brief Generator (reads ClickUp → visits client site → generates brief)." },
      { id: "w7t2", owner: "Ren", task: "Full adoption of automated workflows. Flag recurring issues. Begin writing how-to guides for each workflow." },
      { id: "w7t3", owner: "Sonny", task: "Review Week 6 test results. Go/no-go on problem workflows. Investigate Adobe team subscription cost." },
    ],
    done: "All Week 6 issues resolved. AI Brief Generator V1 usable for 3/5 test cases. Workflow documentation started.",
    blockers: "AI Brief Generator requires Claude/GPT API access. Christian must set up via n8n or GHL AI agent.",
    designTeam: "Muriel blind-tests 5 AI briefs vs human briefs and rates quality. 3-day testing period.",
    automationIds: ["da1"],
  },
  {
    week: 8, dates: "Jun 2–6",
    objective: "Design Team Automations + Freepik Integration + Mockup Script Improvements",
    tasks: [
      { id: "w8t1", owner: "Christian", task: "Build Freepik API integration (keywords → 5–10 background images)." },
      { id: "w8t2", owner: "John", task: "Fix mockup script batch file select. Add PNG export (replace JPEG). Roll out to Muriel with 30-min training." },
      { id: "w8t3", owner: "Ren", task: "Write complete Workflow Playbook (every automation, what it does, failure steps, contacts)." },
    ],
    done: "Freepik search tool working in basic form. Mockup script updated. Muriel actively testing.",
    blockers: "Freepik API needs paid plan (Sonny approval). Mockup script depends on John's Illustrator scripting.",
    designTeam: "Muriel tests updated mockup script for ALL new tasks. Logs every issue. 5 full business days.",
    automationIds: ["da2", "da3"],
  },
  {
    week: 9, dates: "Jun 9–13",
    objective: "Mockup Script Full Rollout + Illustrator-to-Mockup Chain V1 + Refinement",
    tasks: [
      { id: "w9t1", owner: "Christian + John", task: "Fix mockup script issues from Muriel's feedback. Roll out to Kiara + Maria. Begin Illustrator → 3D Mockup chain V1 (semi-automated)." },
      { id: "w9t2", owner: "Ren", task: "Complete Workflow Playbook. Train backup coordinators. Update all ClickUp task templates." },
      { id: "w9t3", owner: "Sonny", task: "Review design team feedback. Approve full rollout. Strategic review: which tasks still take most time?" },
    ],
    done: "All 3 designers using mockup script. Illustrator chain V1 works for simple projects. Playbook complete.",
    blockers: "If Muriel found major issues in Week 8, Kiara/Maria rollout may need to wait.",
    designTeam: "ALL 3 designers use mockup script for every task. 30-min joint feedback session Wed.",
    automationIds: ["da4"],
  },
  {
    week: 10, dates: "Jun 16–20",
    objective: "End-to-End Stress Test + Edge Case Handling + Documentation",
    tasks: [
      { id: "w10t1", owner: "Christian + John", task: "Build edge case handlers (webhook failures, email bounces, missing data). Add error alert notifications." },
      { id: "w10t2", owner: "Ren", task: "Run SECOND FULL SYSTEM TEST with 5 real orders. Compare time-per-order vs pre-automation baseline." },
      { id: "w10t3", owner: "Sonny", task: "Review all documentation. Ensure every team member can explain systems. Plan for if Christian/John are unavailable." },
    ],
    done: "Error handling in place for all 10 GHL workflows. Measurable time savings documented. Team can operate independently.",
    blockers: "None expected. Hardening and polish week.",
    designTeam: "Continue mockup script. Report post-Week-9 issues. Muriel reviews Illustrator chain V1 output.",
    automationIds: [],
  },
  {
    week: 11, dates: "Jun 23–27",
    objective: "Final Review + Success Measurement + Q3 Planning",
    tasks: [
      { id: "w11t1", owner: "Christian + John", task: "Fix remaining stress test issues. Create System Health Dashboard (automation status, errors, metrics)." },
      { id: "w11t2", owner: "Ren", task: "Compile final metrics report: time saved/order, emails automated/week, tasks auto-created, lead follow-up compliance." },
      { id: "w11t3", owner: "Sonny", task: "Final review of all systems. Approve Q3 roadmap for advanced automations. Celebrate wins with team." },
    ],
    done: "All automations live and documented. Metrics baseline established. Q3 roadmap drafted. Team confident.",
    blockers: "June 30 = Tue. Have everything wrapped by Fri Jun 27.",
    designTeam: "All designers fully operational. Final feedback session: what would make workflow faster? Input feeds Q3 plan.",
    automationIds: [],
  },
];

const CLICKUP_AUTOMATIONS = [
  { id: "cu1", num: 1, name: "Mockup Sent Follow-Up", category: "clickup", week: 1, buildTime: "30 min", owner: "Ren", trigger: "ClickUp task in 'Mockup Sent' status for 3 days with no activity.", condition: "IF status is still Mockup Sent AND no comments or status changes in 3 days → trigger.", actions: ["Tag assignee in ClickUp with comment: 'Mockup sent 3 days ago, no client response. Follow up.'", "Optionally send GHL notification to coordinator."], tool: "ClickUp built-in automation (no external tools needed).", testMethod: "Create test task, set to Mockup Sent, wait 3 days (or adjust to 5 min for testing). Verify tag and comment appear.", mistakes: "Make sure automation checks for NO activity, not just no status change. Any activity should reset the 3-day clock." },
  { id: "cu2", num: 2, name: "Stale PRE PURCHASE Alert", category: "clickup", week: 1, buildTime: "30 min", owner: "Ren", trigger: "7 days no activity on a PRE PURCHASE task.", condition: "IF task status = PRE PURCHASE AND no updates for 7 days → fire.", actions: ["Tag assignee in ClickUp to follow up."], tool: "ClickUp built-in automation.", testMethod: "Create test PRE PURCHASE task, let it sit, verify alert fires after 7 days.", mistakes: "Ensure it checks for any activity, not just status changes." },
  { id: "cu3", num: 3, name: "New Task Assignment Notification", category: "clickup", week: 1, buildTime: "30 min", owner: "Ren", trigger: "Task created + assignee set.", condition: "IF assignee field is populated → notify.", actions: ["Notify assigned designer instantly via ClickUp notification."], tool: "ClickUp built-in automation.", testMethod: "Create task, assign designer, verify they receive notification immediately.", mistakes: "Verify notification settings are enabled for all designers in their ClickUp accounts." },
  { id: "cu4", num: 4, name: "Missing Due Date Alert", category: "clickup", week: 2, buildTime: "30 min", owner: "Christian + John", trigger: "Task is in POST PURCHASE + no due date set.", condition: "IF status = any POST PURCHASE sub-status AND due date field is empty → prompt assignee.", actions: ["Prompt assignee to add a due date to the task."], tool: "ClickUp built-in automation.", testMethod: "Create POST PURCHASE task without due date. Verify alert fires.", mistakes: "May need to exclude tasks in 'Not Started' status if due date isn't known yet." },
  { id: "cu5", num: 5, name: "DID NOT PURCHASE Re-Engagement Tag", category: "clickup", week: 2, buildTime: "30 min", owner: "Christian + John", trigger: "Status set to DID NOT PURCHASE.", condition: "IF status changes to DID NOT PURCHASE → fire.", actions: ["Tag task with 'Re-Engage'.", "Assign task to Sonny for outreach decision."], tool: "ClickUp built-in automation.", testMethod: "Move test task to DID NOT PURCHASE. Verify tag applied and Sonny assigned.", mistakes: "Make sure this doesn't re-fire if task is moved back and forth between statuses." },
  { id: "cu6", num: 6, name: "Auto-Move to PRE PURCHASE", category: "clickup", week: 2, buildTime: "15 min", owner: "Christian + John", trigger: "New task created + no status set.", condition: "IF new task AND status is blank → auto-set.", actions: ["Auto-set status to PRE PURCHASE."], tool: "ClickUp built-in automation.", testMethod: "Create new task without setting status. Verify it auto-moves to PRE PURCHASE.", mistakes: "May conflict with Zapier-created tasks that already have status. Test both paths." },
  { id: "cu7", num: 7, name: "Vendor Notification on Approval", category: "clickup", week: 2, buildTime: "30 min", owner: "Christian + John", trigger: "Status changes to 'Approved for Production'.", condition: "IF status = Approved for Production → fire.", actions: ["Prompt coordinator to submit files to vendor."], tool: "ClickUp built-in automation.", testMethod: "Move test task to Approved for Production. Verify coordinator notification.", mistakes: "This pairs with GHL Workflow #4. Make sure both fire but don't duplicate." },
  { id: "cu8", num: 8, name: "Completed Task Archive", category: "clickup", week: 2, buildTime: "30 min", owner: "Christian + John", trigger: "Status changes to COMPLETED.", condition: "IF status = COMPLETED → fire.", actions: ["Add completion date stamp to task.", "Add completion comment with date."], tool: "ClickUp built-in automation.", testMethod: "Move test task to COMPLETED. Verify date stamp and comment appear.", mistakes: "Make sure timestamp uses Central Time to match team timezone." },
  { id: "cu9", num: 9, name: "Auto-Sync Designer + Assignee", category: "clickup", week: 2, buildTime: "30 min", owner: "Christian + John", trigger: "Assignee field is set on a task.", condition: "IF assignee set → auto-fill Designer field.", actions: ["Auto-fill Designer custom field to match the assignee."], tool: "ClickUp built-in automation.", testMethod: "Assign a task to Muriel. Verify Designer field auto-populates.", mistakes: "If assignee is Ren (coordinator), Designer field should NOT auto-fill. Add condition for designer assignees only." },
  { id: "cu10", num: 10, name: "Weekly Pipeline Summary", category: "clickup", week: 2, buildTime: "1–3 hrs", owner: "Christian + John", trigger: "Scheduled: Every Monday at 9:00 AM Central.", condition: "None. Fires every Monday regardless.", actions: ["Count tasks per status: PRE PURCHASE, POST PURCHASE (+ sub-statuses), DID NOT PURCHASE, COMPLETED.", "Format summary message.", "Send to Slack, email, or post as ClickUp comment."], tool: "ClickUp Dashboard (simplest) or Zapier scheduled workflow.", testMethod: "Build dashboard, trigger manually, verify counts match manual count.", mistakes: "ClickUp dashboards count subtasks by default. Count top-level tasks only." },
];

const GHL_WORKFLOWS = [
  { id: "ghl1", num: 1, name: "Shopify Order → Confirmation Email", category: "ghl", week: 3, buildTime: "2–3 hrs", owner: "Christian + John", trigger: "Shopify → GHL detects new paid order (status = paid).", condition: "IF payment = paid AND not draft/test → proceed. IF pending/failed → stop.", actions: ["Create/update contact with customer name, email, order details.", "Apply tag 'New Order'.", "Send Order Confirmation email with name + order # merged.", "Log email in contact activity timeline."], tool: "GHL Workflow with Shopify native integration.", testMethod: "Place test Shopify order (Bogus Gateway). Verify email within 5 min. Check name/order #. Test desktop + mobile.", mistakes: "Don't use shipping address as name. Merge First + Last Name. Filter out draft/test orders." },
  { id: "ghl2", num: 2, name: "No Artwork 24hrs → Request Email", category: "ghl", week: 3, buildTime: "1–2 hrs", owner: "Christian + John", trigger: "GHL starts when Order Confirmation email is sent.", condition: "Wait 24hrs → check 'Artwork Received' tag. IF NO → send. IF YES → stop.", actions: ["Wait 24 hours after order confirmation.", "Check for 'Artwork Received' tag.", "If no tag → send Artwork Request email.", "Wait 48hrs → send second reminder if still no tag.", "After 5 days → alert coordinator to follow up personally."], tool: "GHL Workflow with wait steps and conditional branching.", testMethod: "Create test contact, trigger confirmation, don't add tag. Verify email fires at 24hrs. Then add tag and verify second reminder does NOT fire.", mistakes: "Biggest mistake: forgetting to add 'Artwork Received' tag when files arrive. Train Ren to tag immediately." },
  { id: "ghl3", num: 3, name: "Mockup Ready → Delivery Email", category: "ghl", week: 4, buildTime: "3–4 hrs", owner: "Christian + John", trigger: "ClickUp status → 'Mockup Ready' → webhook → Zapier → GHL.", condition: "IF task has Drive link AND client email → proceed. IF missing → alert coordinator.", actions: ["V1: Send coordinator notification to review and click Send.", "V2 (later): Auto-send mockup email with Drive link. Coordinator gets copy."], tool: "ClickUp webhook → Zapier → GHL Workflow.", testMethod: "Change real task to Mockup Ready. Check Zapier logs. Verify GHL gets data. Verify email with correct name + Drive link.", mistakes: "ClickUp webhooks deactivate after errors. Check Space Settings → Webhooks. Verify Drive link works." },
  { id: "ghl4", num: 4, name: "Approved → Notify Designer + Coordinator", category: "ghl", week: 4, buildTime: "2 hrs", owner: "Christian + John", trigger: "ClickUp status → 'Approved for Production'.", condition: "IF Designer Assigned is filled → notify. IF empty → alert coordinator.", actions: ["Notify designer: '[Client] approved. Prepare print-ready files.'", "Notify coordinator: '[Client] approved. Submit vendor order.'", "Update GHL pipeline to Approved."], tool: "ClickUp webhook → Zapier → GHL Workflow.", testMethod: "Change test task to Approved. Verify both designer and coordinator notified within 5 min.", mistakes: "Designer Assigned must always be filled or notification goes nowhere." },
  { id: "ghl5", num: 5, name: "Stale Lead Sequence (7/21/45/60 Days)", category: "ghl", week: 4, buildTime: "2–3 hrs", owner: "Christian + John", trigger: "Contact enters DID NOT PURCHASE stage in GHL.", condition: "At each step: has contact ordered? IF YES → exit. IF NO → continue.", actions: ["Day 7: Friendly check-in.", "Day 21: Value reminder (event season coming).", "Day 45: Urgency (files archiving at 60 days).", "Day 60: Final notice. Auto-tag Archived."], tool: "GHL Workflow with email sequence and wait steps.", testMethod: "Add test contact to DID NOT PURCHASE. Skip waits in test mode. Verify each email. Test exit condition with 'Purchased' tag.", mistakes: "CRITICAL: Build exit condition at EVERY step. Without it, purchased clients still get follow-ups." },
  { id: "ghl6", num: 6, name: "Tracking # → Email + Shopify Fulfillment", category: "ghl", week: 5, buildTime: "3–4 hrs", owner: "Christian + John", trigger: "Coordinator enters tracking number in GHL or ClickUp.", condition: "IF tracking # not empty AND Shopify order # present → proceed.", actions: ["Send Tracking Number email to client.", "Zapier calls Shopify API to mark fulfilled.", "ClickUp status auto-updates to 'Shipped'."], tool: "GHL Workflow (email) + Zapier (Shopify API).", testMethod: "Enter tracking for test order. Verify client email, Shopify fulfilled, ClickUp status changed.", mistakes: "V1 handles one tracking #. Coordinator manually sends second. Multi-tracking in V2." },
  { id: "ghl7", num: 7, name: "DID NOT PURCHASE 3-Email Sequence", category: "ghl", week: 5, buildTime: "2–3 hrs", owner: "Christian + John", trigger: "ClickUp status → DID NOT PURCHASE → GHL pipeline.", condition: "At each step, check for purchase. Exit if purchased.", actions: ["Email 1: Re-engagement with mockup reference.", "Email 2: Social proof / urgency.", "Email 3: Final notice (files archiving)."], tool: "GHL Workflow drip sequence.", testMethod: "Trigger status change, verify all 3 emails on schedule. Test exit condition.", mistakes: "Always build exit condition at every email step." },
  { id: "ghl8", num: 8, name: "Post-Delivery Review Request", category: "ghl", week: 6, buildTime: "1–2 hrs", owner: "Christian + John", trigger: "ClickUp status → 'Delivered' → webhook to GHL.", condition: "Wait 4 days. IF no review → send request. Wait 7 more days → personal follow-up. IF Complaint/Damage tag → SKIP.", actions: ["Day 4: Review request email with Judge.me link.", "Day 11: Personal follow-up (warm tone)."], tool: "GHL Workflow with wait steps.", testMethod: "Change test to Delivered. Verify email at Day 4 (test mode). Verify follow-up at Day 11.", mistakes: "Do NOT send for problem orders. Add Complaint/Damage Claim exclusion." },
  { id: "ghl9", num: 9, name: "Shipped → Setup Instructions Email", category: "ghl", week: 6, buildTime: "1–2 hrs", owner: "Christian + John", trigger: "ClickUp status → Shipped.", condition: "IF tent/canopy → send setup video. Other products → general care tips.", actions: ["Send setup instructions email with video link.", "Include product-specific care tips."], tool: "GHL Workflow.", testMethod: "Change test to Shipped. Verify correct email per product type.", mistakes: "Video must exist first. Use placeholder if Sonny hasn't recorded yet." },
  { id: "ghl10", num: 10, name: "Split Shipment Notification", category: "ghl", week: 6, buildTime: "1–2 hrs", owner: "Christian + John", trigger: "Second tracking number entered or manual trigger.", condition: "IF order has multiple tracking numbers → fire.", actions: ["Send proactive email: 'Order ships in multiple boxes.'", "Reassure: frame + fabric ship separately."], tool: "GHL Workflow (semi-manual V1).", testMethod: "Enter second tracking. Verify notification.", mistakes: "V1 may need manual trigger. Full auto depends on multi-tracking detection." },
];

const DESIGN_AUTOMATIONS = [
  { id: "da1", num: 1, name: "AI Design Brief Generator (V1)", category: "design", week: 7, buildTime: "2–3 wks", owner: "Christian + John", trigger: "New ClickUp task with client info.", condition: "Task has client name/website URL.", actions: ["AI reads ClickUp task description.", "Visits client website, scrapes brand colors + industry.", "Generates structured design brief.", "Posts to ClickUp or Google Drive."], tool: "n8n or GHL AI agent with Claude/GPT API.", testMethod: "5 real tasks. Muriel blind-tests AI vs human briefs. Pass = 3/5 usable.", mistakes: "V1 works ~70% of cases. Weak for clients with minimal web presence." },
  { id: "da2", num: 2, name: "Mockup Script: Batch Select + PNG", category: "design", week: 8, buildTime: "1–2 days", owner: "John", trigger: "Designer runs mockup script in Illustrator.", condition: "N/A (script improvement).", actions: ["Fix batch file select (currently one at a time).", "Replace JPEG export with PNG."], tool: "Adobe Illustrator ExtendScript (JavaScript).", testMethod: "Muriel tests 5 full days. Logs issues in Google Sheet.", mistakes: "ExtendScript is Illustrator-specific, not standard JS." },
  { id: "da3", num: 3, name: "Freepik Background Search Tool", category: "design", week: 8, buildTime: "1–2 wks", owner: "Christian", trigger: "Designer enters keywords.", condition: "Freepik API key + paid plan active.", actions: ["Designer enters keywords.", "Tool calls Freepik REST API.", "Returns 5–10 background options.", "Designer selects + downloads."], tool: "Freepik REST API via n8n or Make.com.", testMethod: "3 designers test 10 briefs over 1 week. Rate: usable / close / miss.", mistakes: "Result quality depends on keyword specificity." },
  { id: "da4", num: 4, name: "Illustrator → 3D Mockup Chain V1", category: "design", week: 9, buildTime: "2–3 wks", owner: "John + Christian", trigger: "Designer triggers mockup script.", condition: "Design exported from Illustrator.", actions: ["Script exports design file.", "Sent to 3D rendering tool.", "Produces presentation-ready image.", "Designer reviews before sending."], tool: "ExtendScript + 3D rendering API.", testMethod: "John tests 3 days, Muriel tests 3 simple projects. Full rollout after Muriel confirms.", mistakes: "NOT fully automated. Designer = quality control. Complex orders need manual handling." },
];

const FUTURE_AUTOMATIONS = [
  { id: "fu1", name: "RGB → CMYK Conversion Maintaining Vibrancy", timeline: "Q3–Q4 2026", description: "ICC color profiles in Illustrator. Testing per printer/material. Ongoing R&D.", status: "Ongoing R&D" },
  { id: "fu2", name: "AI Generates Design Concepts (3 Options)", timeline: "2027", description: "Requires fine-tuned image generation models trained on STX brand style. Months of setup.", status: "Not realistic before 2027" },
  { id: "fu3", name: "AI Minor Revisions in Illustrator", timeline: "2027+", description: "AI that understands Illustrator file structure. Cutting-edge, not production-ready.", status: "Not realistic before 2027+" },
  { id: "fu4", name: "Fully Autonomous Email (No Review)", timeline: "N/A", description: "Sending without human review = unacceptable client risk. Keep semi-automated.", status: "Not recommended" },
  { id: "fu5", name: "Google Drive Auto-Folder Creation", timeline: "Wks 5–7", description: "Google Drive API via Zapier/Make. OAuth setup needed. Partially achievable Q2.", status: "Partial by Q2" },
  { id: "fu6", name: "Shopify → Auto-Create ClickUp Task", timeline: "Wks 5–7", description: "Zapier: Shopify order → ClickUp task. Needs field mapping + fallback logic.", status: "Partial by Q2" },
];

const ALL_AUTOMATIONS = [...CLICKUP_AUTOMATIONS, ...GHL_WORKFLOWS, ...DESIGN_AUTOMATIONS];
const CAT = {
  clickup: { bg: "#18162e", border: "#7B68EE", text: "#B8ACFF", badge: "#7B68EE", badgeText: "#fff", label: "ClickUp" },
  ghl: { bg: "#142214", border: "#4CAF50", text: "#8BC34A", badge: "#4CAF50", badgeText: "#fff", label: "GHL" },
  design: { bg: "#2a1616", border: "#FF7043", text: "#FFAB91", badge: "#FF7043", badgeText: "#fff", label: "Design" },
  future: { bg: "#122828", border: "#26C6DA", text: "#80DEEA", badge: "#26C6DA", badgeText: "#000", label: "Future" },
};

export default function App() {
  const [view, setView] = useState("timeline");
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedAutos, setExpandedAutos] = useState({});
  const [catFilter, setCatFilter] = useState("all");
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Subscribe to realtime changes (Firebase) or poll (localStorage)
  useEffect(() => {
    const unsubscribe = subscribeToProgress((data) => {
      setChecked(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  const toggle = useCallback((id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveProgress(next);
  }, [checked]);

  const resetAll = useCallback(() => {
    setChecked({});
    saveProgress({});
    setConfirmReset(false);
  }, []);

  const allTaskIds = WEEKS.flatMap(w => w.tasks.map(t => t.id));
  const allAutoIds = ALL_AUTOMATIONS.map(a => a.id);
  const allIds = [...allTaskIds, ...allAutoIds];
  const completedCount = allIds.filter(id => checked[id]).length;
  const totalCount = allIds.length;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const weekProgress = (w) => {
    const ids = [...w.tasks.map(t => t.id), ...w.automationIds];
    const done = ids.filter(id => checked[id]).length;
    return { done, total: ids.length, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  };

  const Checkbox = ({ id, size = 20 }) => (
    <div onClick={(e) => { e.stopPropagation(); toggle(id); }} style={{
      width: size, height: size, borderRadius: 5, border: `2px solid ${checked[id] ? "#4CAF50" : "#555"}`,
      background: checked[id] ? "#4CAF50" : "transparent", flexShrink: 0, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
    }}>
      {checked[id] && <span style={{ color: "#fff", fontSize: size * 0.6, fontWeight: 800, lineHeight: 1 }}>✓</span>}
    </div>
  );

  const ProgressBar = ({ value, color = "#667eea", height = 6, style: s = {} }) => (
    <div style={{ background: "#1a1a2a", borderRadius: height, height, overflow: "hidden", ...s }}>
      <div style={{ height: "100%", borderRadius: height, background: value === 100 ? "#4CAF50" : color, width: `${value}%`, transition: "width 0.4s ease" }} />
    </div>
  );

  if (!loaded) return <div style={{ background: "#08080e", color: "#666", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#08080e", color: "#f0f0f0", minHeight: "100vh", padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } button:hover { opacity: 0.85; } @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#667eea,#764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>STX PROMO</span>
          <span style={{ fontSize: 13, color: "#888" }}>Automation Roadmap Q2 2026</span>
          <span style={{ background: isFirebase() ? "#4CAF5022" : "#FFC10722", color: isFirebase() ? "#4CAF50" : "#FFC107", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, border: `1px solid ${isFirebase() ? "#4CAF5044" : "#FFC10744"}`, marginLeft: "auto" }}>
            {isFirebase() ? "LIVE SYNC" : "LOCAL MODE"}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Apr 14 – Jun 30 · 11 Weeks · {isFirebase() ? "Real-time sync across all team members" : "Browser-local storage (add Firebase config for team sync)"}</div>
      </div>

      {/* Progress Panel */}
      <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: "18px 20px", margin: "16px 0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Project Completion</div>
            <div style={{ fontSize: 36, fontWeight: 800, background: pct === 100 ? "linear-gradient(135deg,#4CAF50,#8BC34A)" : "linear-gradient(135deg,#667eea,#764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1, marginTop: 4 }}>{pct}%</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{completedCount}/{totalCount} items · {totalCount - completedCount} remaining</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} style={{ background: "#1a1a2a", border: "1px solid #333", borderRadius: 6, color: "#888", fontSize: 10, padding: "5px 12px", cursor: "pointer" }}>Reset All</button>
            ) : (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#FF8A80" }}>Sure?</span>
                <button onClick={resetAll} style={{ background: "#3a1515", border: "1px solid #FF5252", borderRadius: 5, color: "#FF8A80", fontSize: 10, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>Yes, Reset</button>
                <button onClick={() => setConfirmReset(false)} style={{ background: "#1a1a2a", border: "1px solid #333", borderRadius: 5, color: "#888", fontSize: 10, padding: "4px 10px", cursor: "pointer" }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
        <ProgressBar value={pct} height={10} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
          {[
            { ids: CLICKUP_AUTOMATIONS.map(a => a.id), label: "ClickUp", color: "#7B68EE" },
            { ids: GHL_WORKFLOWS.map(a => a.id), label: "GHL", color: "#4CAF50" },
            { ids: DESIGN_AUTOMATIONS.map(a => a.id), label: "Design", color: "#FF7043" },
            { ids: allTaskIds, label: "Tasks", color: "#FFC107" },
          ].map((g, i) => {
            const d = g.ids.filter(id => checked[id]).length;
            const p = g.ids.length ? Math.round((d / g.ids.length) * 100) : 0;
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 4 }}>{g.label}</div>
                <ProgressBar value={p} color={g.color} height={5} />
                <div style={{ fontSize: 10, color: g.color, marginTop: 3, fontWeight: 700 }}>{d}/{g.ids.length}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, color: "#666", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Weekly Completion</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4 }}>
            {WEEKS.map(w => {
              const wp = weekProgress(w);
              return (
                <div key={w.week} style={{ textAlign: "center" }}>
                  <div style={{ background: "#0d0d14", borderRadius: 6, height: 44, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", border: `1px solid ${wp.pct === 100 ? "#4CAF5044" : "#1e1e30"}` }}>
                    <div style={{ background: wp.pct === 100 ? "#4CAF50" : wp.pct > 0 ? "#667eea" : "#1a1a2a", height: `${Math.max(wp.pct, 4)}%`, transition: "height 0.4s", borderRadius: "0 0 5px 5px" }} />
                  </div>
                  <div style={{ fontSize: 9, color: wp.pct === 100 ? "#4CAF50" : "#666", marginTop: 3, fontWeight: 700 }}>W{w.week}</div>
                  <div style={{ fontSize: 8, color: "#555" }}>{wp.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "#111118", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[{ key: "timeline", label: "Weekly Timeline" }, { key: "automations", label: "All Automations" }, { key: "future", label: "Future / Q3+" }].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} style={{
            background: view === t.key ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent",
            color: view === t.key ? "#fff" : "#888", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Timeline */}
      {view === "timeline" && WEEKS.map(w => {
        const wp = weekProgress(w);
        const exp = !!expandedWeeks[w.week];
        const weekAutos = ALL_AUTOMATIONS.filter(a => w.automationIds.includes(a.id));
        return (
          <div key={w.week} style={{ background: "#111118", border: `1px solid ${wp.pct === 100 ? "#4CAF5044" : "#2a2a3a"}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div onClick={() => setExpandedWeeks(p => ({ ...p, [w.week]: !p[w.week] }))} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: wp.pct === 100 ? "linear-gradient(135deg,#4CAF50,#8BC34A)" : "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 15 }}>{wp.pct === 100 ? "✓" : w.week}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: "#f0f0f0", fontWeight: 700, fontSize: 14 }}>Week {w.week}</span>
                  <span style={{ color: "#666", fontSize: 11 }}>{w.dates}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: wp.pct === 100 ? "#4CAF50" : "#888", marginLeft: "auto" }}>{wp.done}/{wp.total} · {wp.pct}%</span>
                </div>
                <div style={{ color: "#999", fontSize: 11, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.objective}</div>
                <ProgressBar value={wp.pct} height={4} style={{ marginTop: 6 }} />
              </div>
              <span style={{ color: "#555", fontSize: 16, transform: exp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
            </div>
            {exp && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1e1e30" }}>
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Tasks</div>
                  {w.tasks.map(t => (
                    <div key={t.id} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <Checkbox id={t.id} />
                      <div style={{ flex: 1 }}>
                        <span style={{ color: "#B8ACFF", fontSize: 11, fontWeight: 600 }}>{t.owner}</span>
                        <div style={{ color: checked[t.id] ? "#555" : "#ddd", fontSize: 13, lineHeight: 1.5, textDecoration: checked[t.id] ? "line-through" : "none" }}>{t.task}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {weekAutos.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ color: "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Automations ({weekAutos.length})</div>
                    {weekAutos.map(a => {
                      const c = CAT[a.category];
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <Checkbox id={a.id} size={18} />
                          <span style={{ background: c.badge, color: c.badgeText, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{c.label}</span>
                          <span style={{ color: c.text, fontSize: 12 }}>#{a.num}</span>
                          <span style={{ color: checked[a.id] ? "#555" : "#ddd", fontSize: 13, textDecoration: checked[a.id] ? "line-through" : "none", flex: 1 }}>{a.name}</span>
                          <span style={{ color: "#555", fontSize: 10 }}>{a.buildTime}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <InfoBox label="Definition of Done" text={w.done} color="#8BC34A" />
                  <InfoBox label="Blockers" text={w.blockers} color="#FF8A80" />
                </div>
                <InfoBox label="Design Team" text={w.designTeam} color="#FFAB91" style={{ marginTop: 8 }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Automations */}
      {view === "automations" && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { key: "all", label: `All (${ALL_AUTOMATIONS.length})` },
              { key: "clickup", label: `ClickUp (${CLICKUP_AUTOMATIONS.length})`, color: "#7B68EE" },
              { key: "ghl", label: `GHL (${GHL_WORKFLOWS.length})`, color: "#4CAF50" },
              { key: "design", label: `Design (${DESIGN_AUTOMATIONS.length})`, color: "#FF7043" },
            ].map(f => (
              <button key={f.key} onClick={() => setCatFilter(f.key)} style={{
                background: catFilter === f.key ? (f.color || "#667eea") + "33" : "#111118",
                color: catFilter === f.key ? (f.color || "#667eea") : "#888",
                border: `1px solid ${catFilter === f.key ? (f.color || "#667eea") + "66" : "#2a2a3a"}`,
                borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>{f.label}</button>
            ))}
          </div>
          {(catFilter === "all" ? ALL_AUTOMATIONS : ALL_AUTOMATIONS.filter(a => a.category === catFilter)).map(a => {
            const c = CAT[a.category];
            const exp = !!expandedAutos[a.id];
            return (
              <div key={a.id} style={{ background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <Checkbox id={a.id} />
                  <div onClick={() => setExpandedAutos(p => ({ ...p, [a.id]: !p[a.id] }))} style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ background: c.badge, color: c.badgeText, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 }}>{c.label}</span>
                    <span style={{ color: checked[a.id] ? "#555" : "#f0f0f0", fontWeight: 600, fontSize: 13, textDecoration: checked[a.id] ? "line-through" : "none", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ color: c.text, marginRight: 5 }}>#{a.num}</span>{a.name}
                    </span>
                    <span style={{ color: "#555", fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>Wk {a.week} · {a.buildTime}</span>
                    <span style={{ color: "#555", fontSize: 14, transform: exp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
                  </div>
                </div>
                {exp && (
                  <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${c.border}22` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                      <SmallDetail label="Owner" value={a.owner} />
                      <SmallDetail label="Tool" value={a.tool} />
                    </div>
                    <SmallBlock label="Trigger" value={a.trigger} />
                    <SmallBlock label="Conditions" value={a.condition} />
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Actions</span>
                      {a.actions.map((x, i) => (
                        <div key={i} style={{ color: "#ddd", fontSize: 12, lineHeight: 1.5, paddingLeft: 14, position: "relative", marginTop: 2 }}>
                          <span style={{ position: "absolute", left: 0, color: c.text }}>→</span>{x}
                        </div>
                      ))}
                    </div>
                    <SmallBlock label="How to Test" value={a.testMethod} />
                    <SmallBlock label="Common Mistakes" value={a.mistakes} color="#FF8A80" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Future */}
      {view === "future" && (
        <div>
          <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ color: "#e0e0e0", fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ color: "#80DEEA" }}>Bottom line:</strong> 60–70% of manual workflows automated by June 30. Another 20–30% semi-automated. Final 10% (AI designs, Illustrator autonomy) is a 2026–2027 project.
            </div>
          </div>
          {FUTURE_AUTOMATIONS.map(f => (
            <div key={f.id} style={{ background: CAT.future.bg, border: `1px solid ${CAT.future.border}33`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ background: CAT.future.badge, color: CAT.future.badgeText, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{f.timeline}</span>
                <span style={{ color: "#f0f0f0", fontWeight: 600, fontSize: 13, flex: 1 }}>{f.name}</span>
              </div>
              <div style={{ color: "#bbb", fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{f.description}</div>
              <div style={{ fontSize: 11, color: f.status.includes("Not") || f.status.includes("not") ? "#FF8A80" : "#80DEEA" }}>{f.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, text, color, style = {} }) {
  return (
    <div style={{ background: "#0d0d14", borderRadius: 8, padding: "10px 12px", border: "1px solid #1e1e30", ...style }}>
      <div style={{ color: color || "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "#ccc", fontSize: 12, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function SmallDetail({ label, value }) {
  return (
    <div>
      <span style={{ color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      <div style={{ color: "#ddd", fontSize: 12, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SmallBlock({ label, value, color = "#ddd" }) {
  return (
    <div style={{ marginTop: 8 }}>
      <span style={{ color: "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      <div style={{ color, fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>{value}</div>
    </div>
  );
}
