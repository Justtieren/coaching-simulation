window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
window.Script1 = function()
{
  var p = GetPlayer();
var seed = Number(p.GetVar("SessionSeed")||0);
if (!seed) { 
  seed = Math.floor(Math.random()*2147483647);
  p.SetVar("SessionSeed", seed);
}

}

window.Script2 = function()
{
  /* ==========================================================
   Coaching Simulation – CLEAN TOP HALF (before banks)
   ========================================================== */

var player = GetPlayer();

/* -------------------------------------
   0. Read Storyline variables
------------------------------------- */

var qId            = Number(player.GetVar("QuestionID")) || 1;   // 1–7
var scenarioId     = Number(player.GetVar("ScenarioID")) || 0;   // 1–12

var rapport        = Number(player.GetVar("rapportScore")) || 0;
var clarity        = Number(player.GetVar("clarityScore")) || 0;
var focus          = Number(player.GetVar("focusScore")) || 0;

var questionCount  = Number(player.GetVar("QuestionCount")) || 0;

var rawText        = player.GetVar("CoachQuestionText") || "";
var lowerText      = rawText.trim().toLowerCase();

var lastText       = player.GetVar("LastCoachQuestionText") || "";
var lastLower      = lastText.trim().toLowerCase();

/* Normalize QuestionID */
if (!qId || qId < 1 || qId > 7) qId = 1;

/* -------------------------------------
   1. Scenario metadata (12 topics)
------------------------------------- */

var scenarios = [
  { id: 1,  key: "purpose_year",      label: "Clarifying purpose and direction for the year" },
  { id: 2,  key: "visibility",        label: "Visibility and recognition" },
  { id: 3,  key: "overload",          label: "Overload and burnout" },
  { id: 4,  key: "work_life",         label: "Work–life boundaries" },
  { id: 5,  key: "career_growth",     label: "Career direction and growth" },
  { id: 6,  key: "priorities",        label: "Prioritizing competing goals" },
  { id: 7,  key: "decisions",         label: "Decision paralysis" },
  { id: 8,  key: "lack_direction",    label: "Lack of direction" },
  { id: 9,  key: "team_change",       label: "Navigating team change" },
  { id: 10, key: "time_mgmt",         label: "Time management and prioritization" },
  { id: 11, key: "breakdown_goals",   label: "Breaking large goals into actionable steps" },
  { id: 12, key: "consistency_goals", label: "Staying consistent with long-term goals" }
];

function getScenarioById(id) {
  for (var i = 0; i < scenarios.length; i++) {
    if (scenarios[i].id === id) return scenarios[i];
  }
  return null;
}

var activeScenario = getScenarioById(scenarioId);
var scenarioKey = activeScenario ? activeScenario.key : "";

/* -------------------------------------
   2. Optional hidden tag support in CoachQuestionText
   Format: [Q1] question text
   (If you’re not using tags, this does nothing.)
------------------------------------- */

var taggedMatch = rawText.match(/^\s*\[q([1-7])\]\s*(.*)$/i);
if (taggedMatch) {
  qId = Number(taggedMatch[1]);
  player.SetVar("QuestionID", qId);

  rawText = taggedMatch[2];
  lowerText = rawText.trim().toLowerCase();

  player.SetVar("CoachQuestionText", rawText);
}

/* -------------------------------------
   3. Duplicate Send protection
------------------------------------- */

if (lowerText !== "" && lowerText === lastLower) {
  player.SetVar(
    "SummaryText",
    "You’ve already asked this question. Try rephrasing it or moving to the next coaching question."
  );
  return;
}

/* -------------------------------------
   4. Greeting interception
------------------------------------- */

function isGreetingQuestion(text) {
  if (!text) return false;
  return (
    text.indexOf("how are you") !== -1 ||
    text.indexOf("how's it going") !== -1 ||
    text.indexOf("hows it going") !== -1 ||
    text.indexOf("how are things") !== -1 ||
    text.indexOf("how have you been") !== -1 ||
    text.indexOf("good morning") !== -1 ||
    text.indexOf("good afternoon") !== -1 ||
    text.indexOf("good evening") !== -1
  );
}

var greetingReplies = [
  "I’m doing okay. A little stretched, but I’m here.",
  "Honestly, a bit tired, but I’m glad we’re talking.",
  "I’ve been better, but I’m hanging in there. Thanks for asking.",
  "I’m doing pretty well overall, just juggling a lot.",
  "I’m alright. I’ve had a lot on my mind lately."
];

if (isGreetingQuestion(lowerText)) {
  var gIdx = Math.floor(Math.random() * greetingReplies.length);
  player.SetVar("CoacheeReplyText", greetingReplies[gIdx]);

  player.SetVar(
    "SummaryText",
    "You started with a relational check-in. That can help build comfort and open the door to a more meaningful coaching question."
  );

  player.SetVar(
    "ImprovedQuestionText",
    "A natural next step could be:\n\n• What’s on your mind right now?\n• What would be most useful for us to focus on today?"
  );

  player.SetVar(
    "FollowUpText",
    "Follow up with:\n\n• What feels most important to talk through?\n• Where would you like to start?"
  );

  player.SetVar("PrimarySkill", "Rapport");

  questionCount += 1;
  rapport += 1;

  player.SetVar("QuestionCount", questionCount);
  player.SetVar("rapportScore", rapport);
  player.SetVar("clarityScore", clarity);
  player.SetVar("focusScore", focus);

  player.SetVar("LastCoachQuestionText", rawText);
  return;
}

/* -------------------------------------
   5. "Why" question interception
------------------------------------- */

var isWhy = /\bwhy\b/.test(lowerText);

if (isWhy) {
  player.SetVar("CoacheeReplyText", "…");

  var contextLabel = activeScenario ? activeScenario.label : "this situation";

  player.SetVar(
    "SummaryText",
    "This question begins with \"why.\" Even when the intent is positive, \"why\" can sound like blame or interrogation. " +
    "It often puts people on the defensive instead of inviting exploration of " + contextLabel.toLowerCase() + "."
  );

  player.SetVar(
    "ImprovedQuestionText",
    "Consider reframing as a \"what\" or \"how\" question. For example:\n\n" +
    "• What feels most important about this situation for you right now?\n" +
    "• How is this affecting you day to day?"
  );

  player.SetVar(
    "FollowUpText",
    "You might follow up with:\n\n" +
    "• What part of this feels most in your control?\n" +
    "• What would you like to be different a month from now?"
  );

  player.SetVar("PrimarySkill", "Clarity & Rapport");
  player.SetVar("IsWhyHint", true);

  questionCount += 1;
  rapport += 1;
  clarity += 1;

  player.SetVar("QuestionCount", questionCount);
  player.SetVar("rapportScore", rapport);
  player.SetVar("clarityScore", clarity);
  player.SetVar("focusScore", focus);

  player.SetVar("LastCoachQuestionText", rawText);
  return;
}

player.SetVar("IsWhyHint", false);

/* -------------------------------------
   6. Light scenario flavor (Summary only)
------------------------------------- */

function flavorSummary(baseSummary, nextQuestionNumber) {
  if (!baseSummary || !activeScenario) return baseSummary;

  // Apply every other question to reduce repetition
  if (nextQuestionNumber % 2 === 0) return baseSummary;

  var labelLower = (activeScenario.label || "").toLowerCase();
  if (labelLower && baseSummary.toLowerCase().indexOf(labelLower) !== -1) return baseSummary;

  return baseSummary + "\n\nContext: " + activeScenario.label + ".";
}

/* -------------------------------------
   7. Scenario nuance (ONLY Q4/Q6)
------------------------------------- */

function applyScenarioNuance(text, scenarioKeyLocal, qIdLocal) {
  if (!text || !scenarioKeyLocal) return text;

  // Only for action/decision-style questions
  if (qIdLocal !== 4 && qIdLocal !== 6) return text;

  var nudge = "";

  switch (scenarioKeyLocal) {
    case "visibility":        nudge = " Consider what would make your work more visible to the right people."; break;
    case "time_mgmt":         nudge = " Consider what would make this easier to schedule and protect."; break;
    case "priorities":        nudge = " Consider what you will prioritize first and what you will intentionally defer."; break;
    case "breakdown_goals":   nudge = " Consider what the smallest next step is and what 'done' looks like."; break;
    case "consistency_goals": nudge = " Consider what small habit would help you stay consistent."; break;
    case "purpose_year":
    case "lack_direction":    nudge = " Consider what direction would feel most meaningful and realistic right now."; break;
    case "career_growth":     nudge = " Consider what skill, experience, or exposure would move you forward."; break;
    case "overload":          nudge = " Consider what you can reduce, delegate, or pause."; break;
    case "work_life":         nudge = " Consider what boundary would best protect your time."; break;
    case "team_change":       nudge = " Consider what information would help you adapt with more confidence."; break;
    case "decisions":         nudge = " Consider what would make this decision easier to make."; break;
    default:                  nudge = "";
  }

  if (nudge && text.indexOf(nudge.trim()) === -1) return text + nudge;
  return text;
}

/* -------------------------------------
   8. Scenario verbs (Follow-up only)
------------------------------------- */

function getScenarioVerbs(scenarioKeyLocal) {
  switch (scenarioKeyLocal) {
    case "visibility":        return ["surface", "share", "signal"];
    case "time_mgmt":         return ["protect", "schedule", "simplify"];
    case "priorities":        return ["prioritize", "defer", "sequence"];
    case "breakdown_goals":   return ["define", "sequence", "complete"];
    case "consistency_goals": return ["repeat", "track", "reinforce"];
    case "overload":          return ["reduce", "delegate", "pause"];
    case "work_life":         return ["protect", "communicate", "maintain"];
    case "career_growth":     return ["build", "stretch", "position"];
    case "decisions":         return ["decide", "test", "commit"];
    default:                  return ["clarify", "prioritize", "act"];
  }
}

function addVerbActionLine(text, scenarioKeyLocal) {
  if (!text) return text;

  var verbs = getScenarioVerbs(scenarioKeyLocal || "");
  var line = "\n\nNext move: " + verbs[0] + ", " + verbs[1] + ", " + verbs[2] + ".";

  if (text.indexOf("Next move:") !== -1) return text;
  return text + line;
}

/* -------------------------------------
   9. Scenario lens (Q4/Q6 only)
------------------------------------- */

function scenarioPhrase(scenarioKeyLocal) {
  switch (scenarioKeyLocal) {
    case "work_life":         return "your boundaries and time";
    case "overload":          return "your workload and energy";
    case "visibility":        return "your visibility and impact";
    case "time_mgmt":         return "your time and schedule";
    case "priorities":        return "your priorities";
    case "decisions":         return "your decision";
    case "career_growth":     return "your growth direction";
    case "breakdown_goals":   return "your next steps";
    case "consistency_goals": return "your consistency";
    case "purpose_year":      return "your direction this year";
    case "lack_direction":    return "your direction";
    case "team_change":       return "the changes around you";
    default:                  return "this";
  }
}

function tailorQ4Q6(text, scenarioKeyLocal, qIdLocal) {
  if (!text) return text;
  if (qIdLocal !== 4 && qIdLocal !== 6) return text;
  if (!scenarioKeyLocal) return text;

  if (text.indexOf("Scenario lens:") !== -1) return text;

  var phrase = scenarioPhrase(scenarioKeyLocal);

  if (qIdLocal === 4) {
    return text + "\n\nScenario lens: As you think about what you want, keep " + phrase + " in view.";
  }

  return text + "\n\nScenario lens: As you consider tradeoffs, keep " + phrase + " in view.";
}

/* -------------------------------------
   10. Detect coaching question ID from typed text
------------------------------------- */

function detectQuestionIdFromText(text) {
  if (!text) return 0;

  // Q2
  if (text.indexOf("what else") !== -1 || text.indexOf("anything else") !== -1) return 2;

  // Q5
  if (text.indexOf("how can i help") !== -1 || text.indexOf("support") !== -1 || text.indexOf("help you") !== -1) return 5;

  // Q7
  if (text.indexOf("most useful") !== -1 || text.indexOf("most helpful") !== -1 || text.indexOf("takeaway") !== -1 || text.indexOf("stood out") !== -1) return 7;

  // Q6
  if (text.indexOf("saying yes") !== -1 || text.indexOf("saying no") !== -1 || text.indexOf("trade") !== -1 || text.indexOf("let go") !== -1) return 6;

  // Q4
  if (text.indexOf("what do you want") !== -1 || text.indexOf("what would you like") !== -1 || text.indexOf("hoping for") !== -1 || text.indexOf("ideal outcome") !== -1) return 4;

  // Q3 (tightened)
  if (
    text.indexOf("real challenge") !== -1 ||
    text.indexOf("the real challenge") !== -1 ||
    text.indexOf("biggest challenge") !== -1 ||
    text.indexOf("most challenging") !== -1 ||
    text.indexOf("hardest part") !== -1 ||
    text.indexOf("hardest thing") !== -1 ||
    text.indexOf("what makes this hard") !== -1 ||
    text.indexOf("what makes this difficult") !== -1
  ) return 3;

  // Q1 (openers / exploratory)
  if (
    text.indexOf("on your mind") !== -1 ||
    text.indexOf("top of mind") !== -1 ||
    text.indexOf("thinking about") !== -1 ||
    text.indexOf("what's going on") !== -1 ||
    text.indexOf("whats going on") !== -1 ||
    text.indexOf("what is going on") !== -1 ||
    text.indexOf("what’s going on") !== -1 ||
    text.indexOf("what's happening") !== -1 ||
    text.indexOf("whats happening") !== -1 ||
    text.indexOf("what is happening") !== -1 ||
    text.indexOf("what’s happening") !== -1 ||
    text.indexOf("what's up") !== -1 ||
    text.indexOf("whats up") !== -1 ||
    text.indexOf("how's everything") !== -1 ||
    text.indexOf("hows everything") !== -1 ||
    text.indexOf("how is everything") !== -1 ||
    text.indexOf("how are things") !== -1 ||

    // Reflective prompts (treat as Q1)
    text.indexOf("what does that suggest") !== -1 ||
    text.indexOf("what does this suggest") !== -1 ||
    text.indexOf("what does that experience suggest") !== -1 ||
    text.indexOf("what does that tell you") !== -1 ||
    text.indexOf("what might that mean") !== -1 ||
    text.indexOf("what do you notice") !== -1 ||
    text.indexOf("what stands out") !== -1
  ) return 1;

  return 0;
}

/* -------------------------------------
   11. Override qId or show coaching nudge
------------------------------------- */

var detectedQ = detectQuestionIdFromText(lowerText);

if (detectedQ >= 1 && detectedQ <= 7) {
  qId = detectedQ;
  player.SetVar("QuestionID", qId);
} else if (lowerText !== "") {
  // Nudge (no score changes)
  player.SetVar("CoacheeReplyText", "…");

  player.SetVar(
    "SummaryText",
    "That’s a reasonable question, but this simulation is designed to respond to the 7 coaching questions. Try rephrasing using a \"what\" or \"how\" question."
  );

  player.SetVar(
    "ImprovedQuestionText",
    "Try one of these:\n\n" +
    "• What’s on your mind right now?\n" +
    "• What’s the real challenge here for you?\n" +
    "• What do you want to have happen next?"
  );

  player.SetVar(
    "FollowUpText",
    "Then follow up with:\n\n" +
    "• And what else?\n" +
    "• If you’re saying yes to that, what are you saying no to?"
  );

  player.SetVar("PrimarySkill", "Clarity");

  player.SetVar("rapportScore", rapport);
  player.SetVar("clarityScore", clarity);
  player.SetVar("focusScore", focus);
  player.SetVar("QuestionCount", questionCount);

  player.SetVar("LastCoachQuestionText", rawText);
  return;
}

/* ==========================================================
    -------------------------------------
   5. Coach Question Variant Bank
   (Used for suggested questions, optional)
------------------------------------- */

var coachQuestionBank = {

  1: {
    label: "What's on your mind?",
    variants: [
      "What's on your mind right now?",
      "What feels most present for you in this moment?",
      "What’s been taking up the most mental space for you lately?",
      "What would be most useful for us to talk about today?",
      "What's the main thing you’d like to explore in this conversation?",
      "When you think about work lately, what stands out most for you?",
      "What situation has been replaying in your mind recently?",
      "What are you carrying with you into this conversation today?",
      "What’s been sitting in the background that you haven’t had space to talk about?",
      "What feels heavy or important for you at the moment?",
      "What’s the first thing that comes to mind when you think about this week?",
      "What’s the situation that keeps popping back into your thoughts?",
      "What’s one thing you’d like to make sense of together?",
      "What’s the main challenge or opportunity on your mind right now?",
      "What’s something you’ve been thinking about but haven’t talked about yet?",
      "What have you been turning over in your mind recently?",
      "What’s the biggest question you’re wrestling with at the moment?",
      "What feels unresolved or unfinished for you right now?",
      "When you woke up today, what was already on your mind?",
      "What’s one area of your work or life that’s asking for attention?",
      "What’s the thing you keep telling yourself you’ll ‘deal with later’?",
      "What’s one thing you’d like to feel clearer about by the end of this conversation?",
      "What feels like it needs a bit of space and time to think through?",
      "What’s the conversation you’ve been having silently with yourself?",
      "What’s one situation you’d like another perspective on?",
      "What’s something that’s energizing you right now?",
      "What’s something that’s draining you right now?",
      "What’s the most important thing happening for you at work these days?",
      "What’s the most important thing happening for you outside of work these days?",
      "What’s been nudging at you that you haven’t quite named yet?",
      "What’s the thing you’re most curious about in your own situation?",
      "What’s one thing you’re excited about but also a little unsure of?",
      "What’s getting your time and energy these days?",
      "What’s one moment from the last week that sticks with you?",
      "What’s one place where you feel a bit stuck right now?",
      "What’s one place where you feel some momentum right now?",
      "What’s been harder than you expected lately?",
      "What’s been better than you expected lately?",
      "What’s the main thread that connects what’s been on your mind this week?",
      "What’s a recent situation you’d like to unpack a bit?",
      "What’s one decision you’re thinking about making?",
      "What’s one relationship at work that’s on your mind?",
      "What are you noticing about how you’re showing up lately?",
      "What’s one thing you’re proud of recently?",
      "What’s one thing you’re concerned about right now?",
      "What’s one thing you’d like to change if you could?",
      "What’s the most important conversation you need to have, but haven’t yet?",
      "What’s one thing that would make the biggest difference for you right now?",
      "What’s one area where you’d like more confidence?",
      "What’s one area where you’d like more clarity?",
      "If you had to put it in a sentence, what’s on your mind today?"
    ]
  },

  2: {
    label: "And what else?",
    variants: [
      "And what else is going on there?",
      "What else feels important to name?",
      "What else is connected to this for you?",
      "What else comes up as you think about this?",
      "What else is in the mix here for you?",
      "What else would you add to the picture?",
      "What else is sitting in the background of this situation?",
      "What else has been on your mind about this?",
      "What else feels true that you haven’t said yet?",
      "What else do you notice when you look at this more broadly?",
      "What else is contributing to how this feels for you?",
      "What else might be influencing this that we haven’t talked about?",
      "What else shows up when you sit with this a little longer?",
      "What else feels like part of the story?",
      "What else feels unfinished or unresolved here?",
      "What else, if anything, do you want to bring into the conversation?",
      "What else matters here that we haven’t touched yet?",
      "What else is pulling on your time, energy, or attention?",
      "What else is making this challenging for you?",
      "What else is making this meaningful for you?",
      "What else do you think I should know?",
      "What else would help me understand your perspective?",
      "What else have you been thinking or feeling about this?",
      "What else feels important, even if it seems small?",
      "What else might be underneath what you’ve already shared?",
      "What else comes to mind when you think about the bigger picture?",
      "What else might be adding pressure here?",
      "What else is making this feel urgent for you?",
      "What else is making this feel confusing for you?",
      "What else has been surprising about this situation?",
      "What else is giving you energy right now?",
      "What else is draining your energy right now?",
      "What else are you noticing about your own reactions?",
      "What else do you wish were different about this?",
      "What else feels like it’s working well, even if other parts are hard?",
      "What else is at stake for you here?",
      "What else do you care about in this situation?",
      "What else feels like a factor in your decision-making?",
      "What else do you want to get out of this conversation?",
      "What else might help us see this from another angle?",
      "What else do you notice when you slow this down a bit?",
      "What else is influencing your priorities around this?",
      "What else are you saying yes to by staying where you are?",
      "What else are you saying no to without realizing it?",
      "What else do you need to acknowledge out loud?",
      "What else would you like to unpack or explore?",
      "What else might be possible here that we haven’t considered?",
      "What else is making this feel big or complex?",
      "What else feels like it belongs in this conversation right now?",
      "And what else is on your mind as we talk about this?"
    ]
  },

  3: {
    label: "What's the real challenge for you?",
    variants: [
      "What's the real challenge here for you?",
      "What feels hardest about this for you right now?",
      "What’s the core challenge you’re facing?",
      "What’s the real challenge here for you?",
      "What feels like the hardest part of this for you personally?",
      "What’s the real knot you are trying to untangle here?",
      "Where do you feel most stuck in this situation?",
      "If you had to name one core challenge, what would it be?",
      "What’s the part of this that is draining you the most?",
      "What’s the piece of this that you keep coming back to?",
      "What’s the real decision you are wrestling with underneath this?",
      "What feels most uncomfortable or difficult about this?",
      "What’s the challenge behind all the other challenges you mentioned?",
      "What’s the one part of this that, if it changed, would make the biggest difference?",
      "What’s the real tension you are trying to manage here?",
      "What is the real challenge for you, not just for the project or team?",
      "What’s making this feel so complex or heavy for you?",
      "What makes this situation particularly challenging right now?",
      "What’s the part of this that keeps you up at night?",
      "What’s the real worry underneath what you’ve shared?",
      "What feels most at risk for you in this situation?",
      "What’s the challenge in how you are seeing this situation?",
      "Where do you feel pulled in two directions at once?",
      "What is the real challenge in saying yes or no here?",
      "What’s the gap between where you are and where you want to be?",
      "What’s making it hard to move forward, even though you know this matters?",
      "What feels like the biggest barrier between you and your goal?",
      "What is the challenge in how you are currently approaching this?",
      "What’s the real challenge in how you are prioritizing this?",
      "What’s difficult about deciding what to do next?",
      "What expectations—yours or others’—are adding to the challenge?",
      "What’s the real challenge in setting boundaries around this?",
      "What is the challenge in asking for what you need here?",
      "What’s the challenge in letting go of something in this situation?",
      "What is making it hard to be honest with yourself about this?",
      "What’s the challenge in being honest with others about this?",
      "What’s the real challenge in choosing one option and not the other?",
      "What makes this feel like a high-stakes situation for you?",
      "What’s the challenge in trusting yourself here?",
      "What’s the challenge in trusting others here?",
      "What feels misaligned for you in this situation?",
      "What’s the challenge in making this sustainable rather than short-term?",
      "What’s the challenge in defining success clearly here?",
      "What’s the challenge in taking the first concrete step?",
      "What’s the challenge in saying no when you need to?",
      "What’s the challenge in asking for help with this?",
      "What is the challenge in slowing down enough to think clearly?",
      "What’s the real challenge in how you are framing this story to yourself?",
      "What feels like it is in conflict with your values here?",
      "What’s the real challenge in balancing your needs with others’ needs?",
      "What is the challenge in committing fully to a path forward?",
      "What’s the challenge in accepting what you cannot control here?",
      "If you had to put it in one sentence, what’s the real challenge here for you?"
    ]
  },

  4: {
    label: "What do you want?",
    variants: [
      "What do you really want here?",
      "If you could get exactly what you want, what would that look like?",
      "What outcome are you hoping for?",
      "What do you want here?",
      "What outcome would feel most helpful for you?",
      "What would you like to be different six months from now?",
      "What would a good result look like for you?",
      "What do you most want to be true on the other side of this?",
      "What would you like this situation to lead to for you?",
      "What would make you feel that this was worth your time and energy?",
      "What do you want to walk away with from this conversation?",
      "What would you like to have more of as a result of this?",
      "What would you like to have less of as a result of this?",
      "What would success look like in this context for you personally?",
      "What do you want to be able to say you did about this a year from now?",
      "What do you want to learn from this situation?",
      "What kind of progress would you like to see next?",
      "What do you want to focus on first?",
      "What would feel like meaningful progress, even if it's small?",
      "What do you want to feel more confident about here?",
      "What do you want to feel clearer about by the end of this conversation?",
      "What do you want this goal or situation to contribute to your bigger picture?",
      "What do you want your effort here to add up to over time?",
      "What would feel like a good use of your strengths in this situation?",
      "What do you want to protect as you move forward?",
      "What do you want to avoid losing or compromising here?",
      "What do you want to make room for in your schedule or energy?",
      "What do you want to say yes to more intentionally?",
      "What do you want to say no to more confidently?",
      "What kind of impact do you want this to have for you or others?",
      "What do you want to be different about how you are working toward your goals?",
      "What kind of support do you want around this?",
      "What do you want from your role in relation to this situation?",
      "What do you want this season to be about for you?",
      "What do you want to prioritize above everything else right now?",
      "What do you want to let go of so you can move forward?",
      "What do you want to experiment with here?",
      "What do you want to start doing that you are not doing now?",
      "What do you want to stop doing that no longer serves your goals?",
      "What do you want to continue doing because it is working?",
      "What do you want to feel at the end of this project or period?",
      "What do you want to be able to point to and say, 'That mattered'?",
      "What do you want to change about your current approach?",
      "What do you want to change about how you think about this?",
      "What do you want to change about how you show up in this situation?",
      "What kind of boundaries do you want in place around this?",
      "What experience do you want to create for yourself as you work on this?",
      "What do you want to be proud of when you look back?",
      "What do you want this to open up for you later on?",
      "If this went really well, what would you want to be true at the end?",
      "If you could have exactly what you wanted here, what would that be?",
      "If you had to choose one priority in this, what would you want it to be?",
      "In one sentence, what do you actually want in this situation?"
    ]
  },

  5: {
    label: "How can I help?",
    variants: [
      "How can I help?",
      "What kind of support would be most helpful right now?",
      "How would you like me to support you in this?",
      "What kind of support would be most useful from me right now?",
      "Where would it be most helpful for me to lean in?",
      "What would you like from me in this conversation?",
      "How could I be helpful without taking this away from you?",
      "Would you like ideas, a sounding board, or something else?",
      "What role would you like me to play as you work through this?",
      "What kind of feedback would be most useful for you?",
      "How involved would you like me to be with this?",
      "What do you need from me to move forward?",
      "What would make you feel supported as you work on this?",
      "What kind of check-ins, if any, would you like from me?",
      "What would you like me to ask you about next time we talk?",
      "Is it more helpful for me to ask questions or offer suggestions right now?",
      "What do you not need from me right now?",
      "What would be most helpful for me to do less of here?",
      "What would be most helpful for me to stay curious about with you?",
      "What could I do that would make this feel a bit lighter for you?",
      "What would make this conversation most useful for you today?",
      "How can I help you clarify what you want from this situation?",
      "How can I best support you in choosing a next step?",
      "How can I help you see your options more clearly?",
      "How can I help you protect time or energy for what matters here?",
      "How can I support you in holding your boundaries around this?",
      "How can I help you stay connected to what matters most to you in this?",
      "What kind of accountability, if any, would feel supportive?",
      "How can I help you track your progress in a way that works for you?",
      "How can I help you turn this into a concrete plan?",
      "How can I help you break this into smaller, doable steps?",
      "How can I help you notice and celebrate progress along the way?",
      "How can I help you prepare for the difficult parts of this?",
      "How can I help you explore different ways of looking at this?",
      "How can I help you test a small experiment instead of a big leap?",
      "How can I help you stay aligned with your values as you move forward?",
      "How can I help you check whether this still fits your bigger goals?",
      "How can I help you stay realistic about your capacity?",
      "How can I help you remember what you’re learning here?",
      "How can I help you decide what to say yes and no to?",
      "How can I support you if things don’t go as planned?",
      "How can I support you in talking about this with others who are involved?",
      "How can I help you feel less alone in working through this?",
      "How can I help you hold onto your confidence in this process?",
      "How can I be honest and supportive at the same time for you?",
      "How can I help you notice your strengths in this situation?",
      "How can I help you keep this simple instead of overcomplicated?",
      "How can I help you slow down enough to think clearly?",
      "How can I help you move from thinking into action?",
      "How can I help you come back to this if it slips off your radar?",
      "If this conversation were really useful, how would I have helped?",
      "If you had to ask me for one specific kind of help, what would it be?"
    ]
  },

  6: {
    label: "If you're saying yes to this, what are you saying no to?",
    variants: [
      "If you’re saying yes to this, what are you saying no to?",
      "What would you have to let go of to commit to this?",
      "What trade-off are you making by choosing this?",
      "If you agree to this, what will have to give?",
      "When you say yes here, what will get less time or energy?",
      "What are the trade-offs if you move in this direction?",
      "What might you be putting at risk by saying yes to this?",
      "What might you unintentionally be saying no to if you commit to this?",
      "What will you have to deprioritize if you take this on?",
      "What will get crowded out if you say yes?",
      "What might you need to stop doing so this yes is sustainable?",
      "What are you willing to sacrifice for this yes?",
      "What are you not willing to sacrifice for this yes?",
      "If you say yes to this, what does that mean for your other goals?",
      "If you say yes to this goal, which other goals will move more slowly?",
      "If you take this on, what will no longer fit in your week?",
      "What boundaries will you need if you say yes?",
      "What boundaries might get blurred if you say yes?",
      "What future options might you be closing off with this yes?",
      "What options might you be opening up with this yes?",
      "If you say yes out of obligation, what are you saying no to in yourself?",
      "If you say yes to others here, what are you saying no to personally?",
      "What rest or recovery might you be saying no to?",
      "What relationships or priorities might get less attention because of this?",
      "What expectations will you be reinforcing if you say yes?",
      "What patterns might you be repeating by saying yes?",
      "What might you regret not doing if you choose this path?",
      "What might you regret taking on if you say yes?",
      "If you say yes now, what will you have to delay or drop?",
      "If you say yes now, what becomes non-negotiable to say no to?",
      "What are you saying yes to that no longer fits this season?",
      "What are you saying no to that you still really want?",
      "If you’re saying yes to more responsibility, what are you saying no to in terms of space or margin?",
      "If you’re saying yes to being available to everyone, what are you saying no to in your own focus?",
      "If you say yes to speed, what might you be saying no to in quality or reflection?",
      "If you say yes to this opportunity, what are you saying no to in your personal life?",
      "If you say yes to keeping things the same, what are you saying no to in terms of growth?",
      "If you say yes to changing direction, what are you saying no to continuing?",
      "What small no would make this bigger yes more realistic?",
      "What no have you been avoiding that this yes might force?",
      "If you had to name one thing you’d need to say no to, what would it be?",
      "If you say yes here, what will your calendar show differently?",
      "If you say yes here, what will your energy feel like in a few months?",
      "What’s the cost of saying yes to this?",
      "What’s the cost of saying no to this?",
      "What are you protecting by saying no?",
      "What are you putting at risk by not saying no?",
      "If you looked back a year from now, what would you hope you had said no to?",
      "If you looked back a year from now, what would you be glad you said yes to, even though it required some no’s?",
      "In one sentence: by saying yes to this, what are you most clearly saying no to?",
      "What might change if you were as intentional with your no’s as with your yes’s?"
    ]
  },

  7: {
    label: "What was most useful for you?",
    variants: [
      "What was most useful for you in this conversation?",
      "What stood out to you as most helpful?",
      "What insight are you taking away from this?",
       "What was most useful for you in this conversation?",
      "What, if anything, feels most helpful from what we’ve talked about?",
      "What are you taking away as most useful right now?",
      "What feels like the biggest insight you’re leaving with?",
      "What part of this felt most clarifying for you?",
      "What felt most grounding or reassuring for you?",
      "What felt most energizing for you?",
      "What question landed most strongly for you?",
      "What idea or phrase is sticking with you?",
      "What feels most worth remembering from this conversation?",
      "What shifted for you, even slightly, as we talked?",
      "What are you seeing differently now than when we started?",
      "What feels more clear now than it did before?",
      "What feels more possible now than it did before?",
      "What decision feels easier after this conversation?",
      "What feels more manageable after talking this through?",
      "What did you learn about yourself today?",
      "What did you learn about your situation today?",
      "What did you learn about your goals or priorities today?",
      "What was most helpful about how we talked, not just what we talked about?",
      "What kind of question was most useful to you today?",
      "What part of this conversation helped you connect the dots?",
      "What felt most supportive or encouraging for you?",
      "What helped you feel more focused?",
      "What helped you feel more honest with yourself?",
      "What helped you feel more in control of your next steps?",
      "What gave you the clearest sense of direction?",
      "What helped you name the real challenge more clearly?",
      "What helped you get closer to what you truly want?",
      "What helped you notice the trade-offs more clearly?",
      "What helped you see your strengths in this situation?",
      "What surprised you about what felt useful?",
      "What will you still be thinking about after we end this conversation?",
      "What is one thing you want to capture so you don’t forget it?",
      "What feels most actionable coming out of this?",
      "What feels like a small but important shift in your thinking?",
      "What did you appreciate most about this time?",
      "What will you try because of this conversation?",
      "What feels like the next right step for you now?",
      "If you had to put your takeaway in one sentence, what would it be?",
      "If we had only talked about one thing, what was the most useful thing to talk about?",
      "If you notice this being useful later, what do you think it will be?",
      "What was useful for your clarity today?",
      "What was useful for your sense of focus today?",
      "What was useful for how connected or supported you felt today?",
      "What did this conversation confirm for you?",
      "What did this conversation challenge in a good way?",
      "What do you want to remember from this conversation when things get busy again?",
      "What was most useful for you, and why?"
    ]
  }

};
/* -------------------------------------
   6. Coachee Response Bank
   (Used to generate coachee replies + insights)
------------------------------------- */

var coacheeResponseBank = {

  1: [
    {
      text: "What’s on my mind is feeling pulled in a few different directions, and I’m not sure which deserves my attention first.",
      summary: "The coachee named competing priorities and uncertainty about where to focus their attention in their current situation.",
      improved: "You might ask: Which of these feels most important to start with right now?",
      followup: "Follow up with: If you focused on just one of these this week, what impact would that have?",
      primarySkill: "Rapport"
    },
    {
      text: "What’s really on my mind is whether the effort I’m putting in is actually moving me toward what I want long term.",
      summary: "The coachee connected their current effort to longer-term direction and meaning.",
      improved: "You might ask: How does this connect to what you ultimately want for yourself?",
      followup: "Follow up with: What would feeling aligned look like for you?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I'm not sure I'm focusing on the right things this year.",
      summary: "Your question helped the coachee name uncertainty about their overall focus.",
      improved: "You might ask: What would you most like this year to be about for you?",
      followup: "Follow up with: What are the top one or two outcomes that would make this year feel meaningful?",
      primarySkill: "Clarity"
    },
    {
      text: "I keep thinking about how many goals I set and how few I actually follow through on.",
      summary: "You created space for the coachee to notice the gap between intention and follow-through in the situation they’re navigating right now.",
      improved: "You might ask: When you think about goals you did complete, what felt different about those?",
      followup: "Follow up with: What does that tell you about how you work best with goals?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm wondering whether the way I spend my time really lines up with what matters most to me.",
      summary: "Your question invited the coachee to connect time spent with what they value.",
      improved: "You might ask: Where do you see misalignment between your time and your priorities?",
      followup: "Follow up with: What’s one small shift you’d like to make in how you spend your time?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I'm juggling a lot of priorities and I'm not sure which truly comes first.",
      summary: "You helped the coachee name that the issue is not just volume but unclear priority.",
      improved: "You might ask: If you could only move one thing forward this week, what would it be?",
      followup: "Follow up with: What makes that the most important for you right now?",
      primarySkill: "Focus"
    },
    {
      text: "Honestly, I'm just trying to keep up and I don't feel like I have a clear direction.",
      summary: "Your question surfaced a sense of drifting rather than moving with intention.",
      improved: "You might ask: If you pressed pause for a moment, what direction would you like to be moving in?",
      followup: "Follow up with: What’s one small step toward that direction, even if nothing else changes yet?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm thinking about how often I react to whatever's urgent instead of what's important.",
      summary: "You helped the coachee distinguish between urgent tasks and important work.",
      improved: "You might ask: What feels important but keeps getting pushed aside?",
      followup: "Follow up with: What would it look like to protect a bit of time for that important work?",
      primarySkill: "Clarity"
    },
    {
      text: "I've been thinking a lot about whether my current goals still fit where I am now.",
      summary: "Your question opened space for the coachee to reconsider whether existing goals are still relevant.",
      improved: "You might ask: Which goals still feel alive, and which feel outdated?",
      followup: "Follow up with: What might you want to update or let go of?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I start a lot of things, but I rarely feel like I finish them well.",
      summary: "You surfaced a pattern of starting without finishing that may impact confidence.",
      improved: "You might ask: When you have finished something well, what was different about how you approached it?",
      followup: "Follow up with: What could you borrow from those experiences for your current goals?",
      primarySkill: "Focus"
    },
    {
      text: "I'm wondering if I'm spending too much time on tasks that don't actually move my goals forward.",
      summary: "Your question helped the coachee question the impact of their current activities.",
      improved: "You might ask: Which tasks feel busy but not impactful?",
      followup: "Follow up with: What would it look like to reduce or delegate some of those?",
      primarySkill: "Clarity"
    },
    {
      text: "I’ve been thinking about my long-term goals, but I’m not sure how my day-to-day work connects to them.",
      summary: "You helped the coachee notice a disconnect between long-term aspirations and daily actions.",
      improved: "You might ask: Where do you see even a small connection between today’s work and your long-term goals?",
      followup: "Follow up with: What’s one way to strengthen that connection this week?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I feel stretched thin and I’m not sure what to drop or pause.",
      summary: "Your question allowed the coachee to name feeling overstretched without a clear plan to adjust.",
      improved: "You might ask: If you had to pause or drop one thing, what would you consider first?",
      followup: "Follow up with: What makes that a good candidate to pause right now?",
      primarySkill: "Focus"
    },
    {
      text: "I keep thinking that my goals are more about what I 'should' do than what I actually want.",
      summary: "You created space for the coachee to distinguish between internal desire and external pressure.",
      improved: "You might ask: Which goals feel most genuinely yours?",
      followup: "Follow up with: What might change if your goals were more aligned with what you truly want?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm noticing that my energy and motivation for my goals goes up and down a lot.",
      summary: "Your question surfaced fluctuations in energy and motivation as part of the challenge.",
      improved: "You might ask: When do you feel most energized about your goals?",
      followup: "Follow up with: What patterns do you notice about those times?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I don't have a simple way to track or review my goals.",
      summary: "You helped the coachee acknowledge that their system for tracking goals may be missing.",
      improved: "You might ask: What kind of simple system would make it easier for you to review your goals?",
      followup: "Follow up with: How often would you realistically use that system?",
      primarySkill: "Focus"
    },
    {
      text: "I've been wondering if I'm setting my goals too big and then feeling discouraged.",
      summary: "Your question prompted reflection on whether goal size might be discouraging progress.",
      improved: "You might ask: What would a right-sized version of this goal look like?",
      followup: "Follow up with: What could be a smaller milestone that still feels meaningful?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm thinking about how my personal goals and my work goals fit together—or don’t.",
      summary: "You invited the coachee to consider alignment between personal and professional goals.",
      improved: "You might ask: Where do you see tension or alignment between your work and personal goals?",
      followup: "Follow up with: What would better alignment look like for you?",
      primarySkill: "Clarity"
    },
    {
      text: "What’s on my mind is that I haven’t really revisited the goals I set at the start of the year.",
      summary: "Your question drew attention to the lack of ongoing review of previously set goals.",
      improved: "You might ask: If you looked at those goals now, what would still matter and what might need to change?",
      followup: "Follow up with: What would you like your goals to look like from this point forward?",
      primarySkill: "Focus"
    },
    {
      text: "I feel like I’m reacting to other people’s priorities more than my own.",
      summary: "You supported the coachee in noticing how much their time is driven by others’ agendas.",
      improved: "You might ask: Where would you like to reclaim more ownership of your time and goals?",
      followup: "Follow up with: What’s one small change you’d like to experiment with this week?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm wondering whether the way I'm working now is sustainable for the goals I say I care about.",
      summary: "Your question opened a conversation about sustainability and goal alignment.",
      improved: "You might ask: What feels unsustainable about how you’re working now?",
      followup: "Follow up with: What’s one change that could make this feel more sustainable?",
      primarySkill: "Clarity"
    },
    {
      text: "What's on my mind is that I’m not sure what success would actually look like for me this year.",
      summary: "You surfaced that the coachee may lack a concrete picture of success.",
      improved: "You might ask: If this year went really well, what would you see, hear, or feel?",
      followup: "Follow up with: How could you turn that into one or two specific goals?",
      primarySkill: "Clarity"
    },
    {
      text: "I’ve been thinking about whether my current role still lines up with my longer-term goals.",
      summary: "Your question prompted the coachee to consider role-fit in light of long-term direction.",
      improved: "You might ask: In what ways does your current role support your long-term goals—and in what ways doesn’t it?",
      followup: "Follow up with: What might you want to explore based on that insight?",
      primarySkill: "Clarity"
    },
    {
      text: "I feel like I have a lot of ‘good ideas’ but not many clear goals.",
      summary: "You helped the coachee distinguish between ideas and defined goals.",
      improved: "You might ask: Which ideas feel most worth turning into a concrete goal?",
      followup: "Follow up with: What would it take to turn one idea into a specific goal?",
      primarySkill: "Focus"
    },
    {
      text: "I'm thinking about how often I postpone the important but non-urgent things.",
      summary: "You surfaced the tendency to delay important non-urgent work.",
      improved: "You might ask: What’s one important non-urgent thing you’d like to make progress on?",
      followup: "Follow up with: What’s a small step you could take on that this week?",
      primarySkill: "Focus"
    },
    {
      text: "What’s on my mind is that my goals feel scattered instead of connected.",
      summary: "You invited the coachee to notice a lack of coherence in their goals.",
      improved: "You might ask: Is there a theme that could connect these goals?",
      followup: "Follow up with: What might change if your goals were organized around that theme?",
      primarySkill: "Clarity"
    },
    {
      text: "I keep thinking that my goals look fine on paper, but they don’t motivate me.",
      summary: "You helped the coachee notice a gap between written goals and emotional engagement.",
      improved: "You might ask: What kind of goals feel energizing for you?",
      followup: "Follow up with: How could you adjust one current goal to feel more energizing?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm wondering whether I'm setting my goals to please others rather than myself.",
      summary: "Your question gave the coachee space to question the source of their goals.",
      improved: "You might ask: If you were setting goals only for you, what might be different?",
      followup: "Follow up with: What’s one small change you’d like to make to better reflect what you want?",
      primarySkill: "Rapport"
    },
    {
      text: "What's on my mind is that I don't know how to measure progress on some of my goals.",
      summary: "You drew attention to the importance of measurability in goal-setting.",
      improved: "You might ask: What would be a simple way to tell if you’re moving in the right direction?",
      followup: "Follow up with: What could be one or two indicators of progress?",
      primarySkill: "Clarity"
    },
    {
      text: "I keep thinking about how my goals affect my workload and my stress levels.",
      summary: "You helped the coachee link goals with workload and wellbeing.",
      improved: "You might ask: How do your current goals impact your stress or energy?",
      followup: "Follow up with: What would a healthier balance look like?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm thinking about how often I drop my goals when things get busy.",
      summary: "You surfaced the pattern of goals falling away under pressure.",
      improved: "You might ask: What tends to happen to your goals when things get busy?",
      followup: "Follow up with: What might help you protect one key goal during busy periods?",
      primarySkill: "Focus"
    },
    {
      text: "What’s on my mind is that I don’t always know where to start with my goals.",
      summary: "You highlighted that activation, not just design, is part of the challenge.",
      improved: "You might ask: What would a simple, obvious first step look like?",
      followup: "Follow up with: What could you do in the next few days to get started?",
      primarySkill: "Focus"
    },
    {
      text: "I'm wondering if I have too many goals competing for my attention.",
      summary: "You prompted the coachee to question the number of goals they are holding.",
      improved: "You might ask: If you could only keep three goals right now, which would they be?",
      followup: "Follow up with: What makes those three stand out?",
      primarySkill: "Clarity"
    },
    {
      text: "I've been thinking about whether my goals are specific enough to guide my actions.",
      summary: "You helped the coachee examine the specificity of their goals.",
      improved: "You might ask: Which goal could use more clarity or detail?",
      followup: "Follow up with: How could you make that goal more specific?",
      primarySkill: "Clarity"
    },
    {
      text: "What’s on my mind is that I feel behind on the goals I set for myself.",
      summary: "You provided space for the coachee to acknowledge feelings of being behind.",
      improved: "You might ask: Behind compared to what—or whom?",
      followup: "Follow up with: What timeline would feel more realistic for you?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm thinking about how my goals might need to shift based on what's changed recently.",
      summary: "You invited the coachee to update goals to reflect new realities.",
      improved: "You might ask: What’s changed that your goals haven’t caught up with yet?",
      followup: "Follow up with: What might you want to adjust as a result?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm noticing that some of my goals feel vague, like ‘do better’ or ‘be more organized.’",
      summary: "You helped the coachee notice that some goals may be too fuzzy to guide action.",
      improved: "You might ask: What would ‘better’ or ‘more organized’ look like in concrete terms?",
      followup: "Follow up with: How could you turn that into a clear, specific goal?",
      primarySkill: "Clarity"
    },
    {
      text: "What’s on my mind is that I rarely celebrate progress; I only see what’s left undone.",
      summary: "You surfaced a tendency to focus on gaps rather than gains.",
      improved: "You might ask: Where have you made progress that you haven’t acknowledged?",
      followup: "Follow up with: How could you build in small moments to recognize that progress?",
      primarySkill: "Rapport"
    },
    {
      text: "I keep thinking that my goals don’t fully reflect the kind of impact I want to have.",
      summary: "You opened space for the coachee to connect goals to impact.",
      improved: "You might ask: What kind of impact do you want your goals to support?",
      followup: "Follow up with: What might you want to add or change based on that?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm wondering whether I’ve been too cautious with my goals.",
      summary: "You helped the coachee consider whether their goals are stretching them enough.",
      improved: "You might ask: What would a slightly bolder version of your goal look like?",
      followup: "Follow up with: What feels exciting and still realistic about that version?",
      primarySkill: "Rapport"
    },
    {
      text: "What’s on my mind is that I don’t always know how to prioritize when everything feels important.",
      summary: "You surfaced the difficulty of prioritizing when many things feel equally important.",
      improved: "You might ask: If you had to choose based on impact, what would rise to the top?",
      followup: "Follow up with: What criteria could you use to decide what comes first?",
      primarySkill: "Focus"
    },
    {
      text: "I'm thinking about how my goals are influenced by my team and my manager's expectations.",
      summary: "You prompted the coachee to consider how others’ expectations shape their goals.",
      improved: "You might ask: Where do your goals and your manager’s expectations align or diverge?",
      followup: "Follow up with: What conversations might help clarify that alignment?",
      primarySkill: "Clarity"
    },
    {
      text: "I’ve been wondering whether my current goals are ambitious enough for where I want to be.",
      summary: "You opened a conversation about the level of stretch in the coachee’s goals.",
      improved: "You might ask: What would ‘ambitious but doable’ look like for you?",
      followup: "Follow up with: Is there one goal you’d like to stretch just a bit more?",
      primarySkill: "Rapport"
    },
    {
      text: "What’s on my mind is that I don’t feel very connected to some of my goals anymore.",
      summary: "You helped the coachee notice a loss of connection to certain goals.",
      improved: "You might ask: Which goals feel less meaningful now than when you set them?",
      followup: "Follow up with: What might you want to replace or retire?",
      primarySkill: "Clarity"
    },
    {
      text: "I'm thinking about how often I adapt my goals based on other people’s needs.",
      summary: "You surfaced a pattern of continually adjusting goals around others.",
      improved: "You might ask: Where would you like your goals to reflect your needs more clearly?",
      followup: "Follow up with: What’s one small shift you could try to protect your priorities this week?",
      primarySkill: "Rapport"
    },
    {
      text: "I keep thinking that I need a clearer picture of what I want the next year to add up to.",
      summary: "You invited the coachee to imagine the cumulative effect of their year.",
      improved: "You might ask: At the end of the year, what would you like to be able to say about it?",
      followup: "Follow up with: How might your goals shift to support that picture?",
      primarySkill: "Clarity"
    },
    {
      text: "What’s on my mind is that I don't feel very confident about my current goals.",
      summary: "You allowed the coachee to express uncertainty about their own goals.",
      improved: "You might ask: What makes you feel unsure about them?",
      followup: "Follow up with: What would help these goals feel more solid or right-sized?",
      primarySkill: "Rapport"
    },
    {
      text: "I'm thinking about how my goals might better support my growth, not just my output.",
      summary: "You drew attention to development and growth as important goal dimensions.",
      improved: "You might ask: What kind of growth would you like your goals to support?",
      followup: "Follow up with: What might you want to add or change to support that growth?",
      primarySkill: "Clarity"
    },
    {
      text: "I’ve been noticing that some of my goals feel very task-based instead of outcome-based.",
      summary: "You supported the coachee in noticing a difference between tasks and outcomes.",
      improved: "You might ask: What outcome are you really aiming for with those tasks?",
      followup: "Follow up with: How could you restate that as a clearer outcome goal?",
      primarySkill: "Clarity"
    },
    {
      text: "What’s on my mind is that I’m not sure how to balance short-term goals with long-term ones.",
      summary: "You helped the coachee see the tension between near-term and long-term goals.",
      improved: "You might ask: How could you balance progress on both short- and long-term goals?",
      followup: "Follow up with: What’s one small step for each that you could take this week?",
      primarySkill: "Focus"
    },
    {
      text: "I'm thinking about how I want my goals to reflect not just what I do, but who I want to become.",
      summary: "You opened a more identity-level view of goals.",
      improved: "You might ask: Who do you want to be becoming through these goals?",
      followup: "Follow up with: How could you adjust one goal to better reflect that?",
      primarySkill: "Rapport"
    }
  ],

  2: [
    {
      text: "There’s also some frustration underneath all of this that I haven’t really acknowledged yet.",
      summary: "The coachee surfaced an underlying emotional layer beneath their initial response.",
      improved: "You might ask: What feels most frustrating about this for you?",
      followup: "Follow up with: How have you been carrying that frustration so far?",
      primarySkill: "Rapport"
    },
    {
      text: "Another thing is that I’m worried about how this is affecting my energy and motivation.",
      summary: "The coachee added a concern about sustainability and personal energy.",
      improved: "You might ask: How is this impacting you day to day?",
      followup: "Follow up with: What would help protect your energy right now?",
      primarySkill: "Clarity"
    },
     {
      text: "Another thing is that I have more goals than I realistically have time for.",
      summary: "Your follow-up helped the coachee surface the mismatch between their goals and available time.",
      improved: "You might ask: Of all these goals, which ones truly deserve your time right now?",
      followup: "Follow up with: What would you be willing to pause or park for later?",
      primarySkill: "Clarity"
    },
    {
      text: "Something else is that I say yes to new commitments without adjusting the old ones.",
      summary: "You encouraged the coachee to notice a pattern of adding work without rebalancing.",
      improved: "You might ask: What would it look like to adjust or let go of something when you say yes to something new?",
      followup: "Follow up with: What could you say no to next time to protect your goals?",
      primarySkill: "Focus"
    },
    {
      text: "Another layer is that I’m not always clear which goals are truly mine versus others’ expectations.",
      summary: "Your question allowed the coachee to distinguish between internal and external drivers.",
      improved: "You might ask: Which of your goals feel most aligned with what you actually want?",
      followup: "Follow up with: What might you change if your goals were more fully your own?",
      primarySkill: "Rapport"
    },
    {
      text: "Something else is that I rarely revisit my goals once I’ve written them down.",
      summary: "You surfaced that goals may be set once and then forgotten.",
      improved: "You might ask: What kind of simple check-in would help you keep those goals visible?",
      followup: "Follow up with: How often would feel realistic for you to review them?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I often feel guilty when I’m not working directly on my goals.",
      summary: "Your follow-up brought out emotional weight attached to goal progress.",
      improved: "You might ask: What messages are you telling yourself when you’re not working on your goals?",
      followup: "Follow up with: What would a kinder, more realistic message sound like?",
      primarySkill: "Rapport"
    },
    {
      text: "I’m also noticing that I change my goals frequently instead of sticking with them.",
      summary: "You helped the coachee name inconsistency as a barrier to progress.",
      improved: "You might ask: What tends to make you change a goal once you’ve set it?",
      followup: "Follow up with: What would help you commit long enough to see meaningful progress?",
      primarySkill: "Focus"
    },
    {
      text: "Another piece is that I don’t always know how my goals connect to bigger priorities.",
      summary: "Your question encouraged the coachee to think about alignment with the bigger picture.",
      improved: "You might ask: How do your current goals connect to the broader direction you’d like to go?",
      followup: "Follow up with: Where might there be gaps or misalignments?",
      primarySkill: "Clarity"
    },
    {
      text: "Something else is that I tend to overcomplicate my goals, which makes them hard to act on.",
      summary: "You surfaced complexity as a subtle barrier to execution.",
      improved: "You might ask: How could you simplify one of your goals so it feels easier to start?",
      followup: "Follow up with: What’s the simplest possible version of that goal that would still matter?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I get excited about new goals and lose interest in the old ones.",
      summary: "Your follow-up helped the coachee see a novelty-seeking pattern with goals.",
      improved: "You might ask: What makes a goal stay interesting for you over time?",
      followup: "Follow up with: How could you design one of your goals to stay engaging longer?",
      primarySkill: "Rapport"
    },
    {
      text: "I’m also aware that I rarely share my goals with anyone, so there’s no real accountability.",
      summary: "You created space for the coachee to notice the absence of external support.",
      improved: "You might ask: Who, if anyone, would you like to share one of your goals with?",
      followup: "Follow up with: What kind of accountability would feel supportive rather than stressful?",
      primarySkill: "Rapport"
    },
    {
      text: "Another thing is that I often underestimate how long things will take.",
      summary: "Your question surfaced unrealistic time estimates as a friction point.",
      improved: "You might ask: How long do your tasks usually take compared to what you plan?",
      followup: "Follow up with: How could you build in more realistic buffers?",
      primarySkill: "Clarity"
    },
    {
      text: "Something else is that I’m not always sure which step should come first.",
      summary: "You helped the coachee name difficulty with sequencing actions.",
      improved: "You might ask: If you had to choose a first step, what would it be?",
      followup: "Follow up with: What would make that first step feel manageable?",
      primarySkill: "Focus"
    },
    {
      text: "Another piece is that my goals sometimes compete with each other.",
      summary: "Your follow-up made it easier for the coachee to see internal goal conflict.",
      improved: "You might ask: Which goals are pulling you in different directions?",
      followup: "Follow up with: How might you prioritize or phase them?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also realizing that I don’t always link my goals to concrete outcomes.",
      summary: "You highlighted that some goals may lack clear end states.",
      improved: "You might ask: What outcome would tell you that you’ve achieved this goal?",
      followup: "Follow up with: How could you define that outcome more clearly?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I tend to keep my goals in my head instead of writing them down.",
      summary: "Your question revealed that goals may not be externalized.",
      improved: "You might ask: What difference might it make to capture your goals somewhere visible?",
      followup: "Follow up with: Where would be an easy place to keep them?",
      primarySkill: "Focus"
    },
    {
      text: "Something else is that I’m not sure how to balance work goals with personal goals.",
      summary: "You surfaced the tension between professional and personal priorities.",
      improved: "You might ask: How would you like your work and personal goals to support each other?",
      followup: "Follow up with: What might you adjust to create more balance?",
      primarySkill: "Clarity"
    },
    {
      text: "Another layer is that I sometimes set goals based on what looks impressive, not what matters.",
      summary: "Your follow-up prompted honesty about image versus substance in goal-setting.",
      improved: "You might ask: Which goals feel more about appearance than genuine impact?",
      followup: "Follow up with: What might you want to change to make them more meaningful?",
      primarySkill: "Rapport"
    },
    {
      text: "I’m also noticing that I rarely celebrate progress; I mostly see what’s left to do.",
      summary: "You helped the coachee recognize a focus on gaps over gains.",
      improved: "You might ask: Where have you made progress that you haven’t acknowledged?",
      followup: "Follow up with: How could you build in small moments to celebrate that?",
      primarySkill: "Rapport"
    },
    {
      text: "Another thing is that my goals sometimes feel too big and abstract.",
      summary: "Your question surfaced a need to make goals more concrete.",
      improved: "You might ask: How could you break one big goal into smaller, tangible pieces?",
      followup: "Follow up with: What would be a good first piece to work on?",
      primarySkill: "Clarity"
    },
    {
      text: "Something else is that I find it hard to stick with goals when life gets busy.",
      summary: "You drew attention to how busyness disrupts goal follow-through.",
      improved: "You might ask: What typically happens to your goals when things get hectic?",
      followup: "Follow up with: What’s one way you could protect a key goal even during busy times?",
      primarySkill: "Focus"
    },
    {
      text: "Another piece is that I sometimes avoid looking at my goals when I feel behind.",
      summary: "Your follow-up surfaced avoidance as a coping strategy.",
      improved: "You might ask: What comes up for you when you feel behind on your goals?",
      followup: "Follow up with: What would a kinder next step look like when you feel that way?",
      primarySkill: "Rapport"
    },
    {
      text: "I’m also aware that I don’t always involve others who could help me with my goals.",
      summary: "You helped the coachee notice they may be carrying goals alone.",
      improved: "You might ask: Who could be a helpful ally for one of your goals?",
      followup: "Follow up with: What might asking for support look like?",
      primarySkill: "Rapport"
    },
    {
      text: "Another thing is that I often re-write my goals without changing my habits.",
      summary: "You revealed that rewriting goals may not be paired with behavior change.",
      improved: "You might ask: What habit would most support one of your goals?",
      followup: "Follow up with: What would make that habit realistic to maintain?",
      primarySkill: "Focus"
    },
    {
      text: "Something else is that I feel pressure to have ‘perfect’ goals before I start.",
      summary: "Your question surfaced perfectionism as a blocker.",
      improved: "You might ask: What would a ‘good enough’ goal look like to move forward with?",
      followup: "Follow up with: What’s one imperfect step you’d be willing to take?",
      primarySkill: "Rapport"
    },
    {
      text: "Another layer is that I don’t always know how to prioritize when everything feels important.",
      summary: "You helped the coachee see that prioritization itself is a challenge.",
      improved: "You might ask: If you had to choose based on impact, what would come first?",
      followup: "Follow up with: What criteria could help you decide next time?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also realizing that some of my goals don’t have clear timeframes.",
      summary: "Your follow-up drew attention to the need for timing and deadlines.",
      improved: "You might ask: What timeframe would make sense for this goal?",
      followup: "Follow up with: How could you check in partway through that timeframe?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I rarely reflect on why my goals matter to me.",
      summary: "You surfaced a missing connection to meaning and motivation.",
      improved: "You might ask: Why does this goal matter to you personally?",
      followup: "Follow up with: How could you keep that ‘why’ visible to yourself?",
      primarySkill: "Rapport"
    },
    {
      text: "Something else is that I get discouraged quickly if I don’t see fast progress.",
      summary: "Your question surfaced a preference for quick wins that may undermine long-term goals.",
      improved: "You might ask: What could progress look like in small, early signs?",
      followup: "Follow up with: How might you define success in the first few weeks?",
      primarySkill: "Focus"
    },
    {
      text: "Another piece is that I sometimes confuse being busy with making progress on my goals.",
      summary: "You helped the coachee distinguish activity from progress.",
      improved: "You might ask: Which activities genuinely move your goals forward?",
      followup: "Follow up with: What might you want to do less of?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also noticing that I don’t always align my goals with my energy patterns.",
      summary: "Your follow-up prompted the coachee to consider energy management.",
      improved: "You might ask: When during the day do you have the most energy for meaningful work?",
      followup: "Follow up with: How could you align one key goal with that time of day?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I struggle to say no, so my goals get crowded out.",
      summary: "You surfaced difficulty with boundaries as a goal blocker.",
      improved: "You might ask: Where would you like to practice saying no to protect your goals?",
      followup: "Follow up with: What’s a simple phrase you could use next time?",
      primarySkill: "Focus"
    },
    {
      text: "Something else is that I tend to keep my goals very private, which makes them easier to drop.",
      summary: "You highlighted how privacy may reduce accountability.",
      improved: "You might ask: Is there one goal you’d be willing to share with someone you trust?",
      followup: "Follow up with: What would you want them to know about how to support you?",
      primarySkill: "Rapport"
    },
    {
      text: "Another layer is that I don’t usually check whether my goals still fit my values.",
      summary: "Your question invited the coachee to reconnect goals with values.",
      improved: "You might ask: Which of your values do you want your goals to express?",
      followup: "Follow up with: How could you adjust one goal to better reflect that?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also realizing that some of my goals are really just vague wishes.",
      summary: "You helped the coachee notice the difference between wishes and goals.",
      improved: "You might ask: Which wish would you most like to turn into a concrete goal?",
      followup: "Follow up with: What would be the first step to make that real?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I don’t always think about how my goals affect others around me.",
      summary: "Your follow-up surfaced the relational impact of goals.",
      improved: "You might ask: How might your goals affect your team or people close to you?",
      followup: "Follow up with: What conversations might you want to have about that?",
      primarySkill: "Rapport"
    },
    {
      text: "Something else is that I set goals when I’m motivated but don’t revisit them when motivation dips.",
      summary: "You surfaced motivation swings as a factor in consistency.",
      improved: "You might ask: What could help you keep moving when motivation is low?",
      followup: "Follow up with: What structure or routine might support you then?",
      primarySkill: "Focus"
    },
    {
      text: "Another piece is that I sometimes forget why I chose a goal in the first place.",
      summary: "Your question highlighted the fading of the original ‘why.’",
      improved: "You might ask: What originally made this goal feel important to you?",
      followup: "Follow up with: What still feels important about it now, if anything?",
      primarySkill: "Rapport"
    },
    {
      text: "I’m also noticing that my goals don’t always account for my current capacity.",
      summary: "You drew attention to the link between capacity and realistic goal-setting.",
      improved: "You might ask: What does your capacity actually look like right now?",
      followup: "Follow up with: How could you shape your goals to fit that capacity?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I tend to focus on fixing weaknesses, not leveraging strengths.",
      summary: "Your follow-up invited the coachee to consider strengths-based goal design.",
      improved: "You might ask: Which strengths would you like your goals to lean on more?",
      followup: "Follow up with: How could you adjust one goal to draw more on those strengths?",
      primarySkill: "Rapport"
    },
    {
      text: "Something else is that I don’t always think about what I’ll need to stop doing to pursue a goal.",
      summary: "You helped the coachee see that subtraction is part of goal pursuit.",
      improved: "You might ask: What might you need to do less of or stop to make room for this goal?",
      followup: "Follow up with: What feels hardest about letting that go?",
      primarySkill: "Focus"
    },
    {
      text: "Another layer is that I rarely check whether my goals are still realistic given recent changes.",
      summary: "Your question surfaced the need to update goals in response to change.",
      improved: "You might ask: What’s changed that your goals haven’t yet reflected?",
      followup: "Follow up with: What adjustment would bring them back in line with reality?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also realizing that I don’t always define what ‘done’ looks like for my goals.",
      summary: "You highlighted the lack of clear completion criteria.",
      improved: "You might ask: How will you know when this goal is complete?",
      followup: "Follow up with: What milestones would you pass along the way?",
      primarySkill: "Clarity"
    },
    {
      text: "Another thing is that I don’t always check whether my goals still excite me.",
      summary: "Your follow-up prompted the coachee to consider emotional connection to goals.",
      improved: "You might ask: Which goals still feel energizing, and which feel flat?",
      followup: "Follow up with: What might you want to refresh or replace?",
      primarySkill: "Rapport"
    },
    {
      text: "Something else is that I tend to focus on what I haven’t done instead of what I have.",
      summary: "You surfaced a self-critical frame that can undermine momentum.",
      improved: "You might ask: What progress have you made that deserves more credit?",
      followup: "Follow up with: How could you use that progress as a foundation for your next step?",
      primarySkill: "Rapport"
    },
    {
      text: "Another piece is that I don’t always build in time to reflect on what’s working.",
      summary: "Your question highlighted the missing role of reflection.",
      improved: "You might ask: What’s working well for you in how you pursue your goals?",
      followup: "Follow up with: How could you do more of what’s working?",
      primarySkill: "Clarity"
    },
    {
      text: "I’m also noticing that I sometimes copy other people’s goals instead of defining my own.",
      summary: "You encouraged the coachee to notice borrowed goals.",
      improved: "You might ask: What would your goals look like if they were designed just for you?",
      followup: "Follow up with: What’s one goal you’d like to rewrite in your own words?",
      primarySkill: "Rapport"
    },
    {
      text: "Another thing is that I don’t always think about how my goals link to who I want to become.",
      summary: "Your follow-up supported a more identity-based view of goals.",
      improved: "You might ask: Who are you becoming as you work on these goals?",
      followup: "Follow up with: How might you shape one goal to better support that?",
      primarySkill: "Clarity"
    }
  ],

  3: [
    {
      text: "The real challenge for me is deciding what actually matters most, not just what feels urgent.",
      summary: "The coachee distinguished between urgency and importance.",
      improved: "You might ask: What would help you decide what truly matters most?",
      followup: "Follow up with: If urgency weren’t a factor, what would you choose?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is choosing one or two goals instead of trying to do everything at once.",
      summary: "Your question helped the coachee see that focus, not effort, is the core challenge.",
      improved: "You might ask: If you could only move one goal forward right now, which would you choose and why?",
      followup: "Follow up with: What would make it easier to let the other goals wait for now?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am afraid of choosing the wrong goal and wasting time.",
      summary: "You uncovered a fear of making the wrong choice underneath the indecision.",
      improved: "You might ask: What would make a goal feel good enough to move forward with, even if it is not perfect?",
      followup: "Follow up with: What small experiment could you run instead of a big, irreversible choice?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is turning ideas into consistent action, not just planning.",
      summary: "Your question shifted the focus from design to execution, where the friction actually sits.",
      improved: "You might ask: What tends to get in the way between intention and action for you?",
      followup: "Follow up with: What is one small action you are willing to repeat this week?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I do not have a clear picture of what success looks like.",
      summary: "You helped the coachee see that success is not clearly defined yet.",
      improved: "You might ask: If this went well, what would you see, hear, or feel that tells you it is working?",
      followup: "Follow up with: How could you turn that into a simple, specific goal statement?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I keep changing direction before I give a goal time to work.",
      summary: "Your question surfaced a pattern of switching too early that undermines progress.",
      improved: "You might ask: How long does a goal usually get before you shift away from it?",
      followup: "Follow up with: What time frame would give you a fair test this time?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am not sure which goals actually matter most to me.",
      summary: "You helped the coachee notice the lack of a clear priority filter.",
      improved: "You might ask: Which of your goals feel most connected to what you care about deeply?",
      followup: "Follow up with: What might you want to drop or downsize as a result?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that my goals feel disconnected from my day-to-day work.",
      summary: "Your question made the gap between aspiration and daily reality visible.",
      improved: "You might ask: Where, even in small ways, do your daily tasks connect to your goals?",
      followup: "Follow up with: What is one way you could strengthen that connection?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I keep saying yes to new things and never rebalancing.",
      summary: "You surfaced over-committing as the underlying issue.",
      improved: "You might ask: What would it look like to say yes only when you also adjust something else?",
      followup: "Follow up with: What is one commitment you could reduce or pause?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am not honest with myself about how much I can actually take on.",
      summary: "Your question encouraged the coachee to name capacity as a constraint.",
      improved: "You might ask: What does your real capacity look like, not the ideal version?",
      followup: "Follow up with: How could your goals better fit that capacity?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I do not review my goals often enough to stay on track.",
      summary: "You helped the coachee see that review and reflection are missing.",
      improved: "You might ask: What kind of simple review rhythm would help you stay connected to your goals?",
      followup: "Follow up with: How often would feel realistic to actually use that rhythm?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am not clear what I am willing to trade off to pursue these goals.",
      summary: "Your question brought underlying trade-offs into focus.",
      improved: "You might ask: What are you willing to give less time or energy to so these goals have room?",
      followup: "Follow up with: What feels hardest about making that trade-off?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that my goals look impressive but do not feel meaningful.",
      summary: "You uncovered a tension between image and genuine meaning.",
      improved: "You might ask: Which goals feel meaningful to you, not just impressive to others?",
      followup: "Follow up with: What change would make one current goal more meaningful?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that my goals are vague, so I am not sure when I am making progress.",
      summary: "Your question exposed a lack of specificity in the goals themselves.",
      improved: "You might ask: How could you make one of these goals more specific and observable?",
      followup: "Follow up with: What indicator would tell you that you are moving in the right direction?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is sticking with my goals when my motivation goes down.",
      summary: "You helped the coachee see motivation swings as the sticking point.",
      improved: "You might ask: What tends to happen to your actions when motivation dips?",
      followup: "Follow up with: What support or structure could help you keep going then?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I do not have a clear starting point.",
      summary: "Your question highlighted activation as the barrier, not awareness.",
      improved: "You might ask: If you had to pick a very first step, what would it be?",
      followup: "Follow up with: What could you do in the next week to take that step?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I try to change too many habits at once.",
      summary: "You surfaced over-loading habit change as the obstacle.",
      improved: "You might ask: If you only chose one habit to focus on, which would have the biggest impact?",
      followup: "Follow up with: What would practicing that habit look like this week?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that my goals do not feel connected to my strengths.",
      summary: "Your question invited the coachee to connect goals with strengths.",
      improved: "You might ask: Which strengths would you like your goals to draw on more?",
      followup: "Follow up with: How could you adjust one goal to better use those strengths?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I feel torn between short-term demands and long-term goals.",
      summary: "You helped the coachee see the tension between immediate tasks and future direction.",
      improved: "You might ask: How could you make even small progress on a long-term goal this week?",
      followup: "Follow up with: What would you be willing to protect time for?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I avoid looking at my goals when I feel behind.",
      summary: "Your question revealed avoidance as a coping strategy.",
      improved: "You might ask: What makes it hard to look at your goals when you feel behind?",
      followup: "Follow up with: What would a gentle next step look like instead of avoidance?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I do not ask for help even when I need it.",
      summary: "You helped the coachee see reluctance to seek support as part of the problem.",
      improved: "You might ask: What makes it difficult to ask for help on your goals?",
      followup: "Follow up with: Who could be a low-risk person to ask for small support?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I am not sure my goals reflect my values anymore.",
      summary: "Your question surfaced misalignment between goals and values.",
      improved: "You might ask: Which of your values do you want your goals to express more clearly?",
      followup: "Follow up with: What might you want to revise based on that?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I do not leave space to reflect before setting new goals.",
      summary: "You revealed a lack of reflection between cycles of goal-setting.",
      improved: "You might ask: What might you learn from the last round of goals before setting new ones?",
      followup: "Follow up with: How could you build that reflection into your process?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I take on other people’s priorities as if they were my own.",
      summary: "Your question helped the coachee see how others’ priorities crowd out their own.",
      improved: "You might ask: Where do you notice that happening most often?",
      followup: "Follow up with: What boundary might you like to experiment with?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I focus more on what is not working than on what is.",
      summary: "You surfaced a deficit-focused mindset that impacts momentum.",
      improved: "You might ask: Where have you made progress that you may be overlooking?",
      followup: "Follow up with: How could you build on what is already working?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I do not have a simple way to track progress.",
      summary: "Your question highlighted missing structure for tracking progress.",
      improved: "You might ask: What kind of simple tracker would actually work for you?",
      followup: "Follow up with: Where could you keep it so you will see it?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am not sure what to let go of.",
      summary: "You helped the coachee recognize that release is part of moving forward.",
      improved: "You might ask: What feels heavy or no longer useful that you might be ready to release?",
      followup: "Follow up with: What small experiment could you try in letting that go?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that my goals feel scattered across too many areas.",
      summary: "Your question surfaced a sense of fragmentation across goals.",
      improved: "You might ask: Is there a theme that could connect these goals?",
      followup: "Follow up with: How might you group or sequence them?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I expect myself to make big leaps instead of small steps.",
      summary: "You uncovered an all-or-nothing mindset around progress.",
      improved: "You might ask: What would a small, meaningful step look like instead of a big leap?",
      followup: "Follow up with: How could you make that step feel easy to start?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I struggle to decide what success means to me, not just to others.",
      summary: "Your question shifted the lens to a personal definition of success.",
      improved: "You might ask: How would you know that success feels right for you, personally?",
      followup: "Follow up with: What might you adjust to better match your own definition?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I do not build in time to rest, so I burn out on my goals.",
      summary: "You surfaced a missing role for rest and recovery in goal-pursuit.",
      improved: "You might ask: What would healthy pacing look like for you as you work on these goals?",
      followup: "Follow up with: Where could you intentionally build in rest or margin?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I move on quickly from wins without learning from them.",
      summary: "Your question revealed a missed opportunity to learn from success.",
      improved: "You might ask: What did you do that contributed to the wins you have had?",
      followup: "Follow up with: How could you repeat or scale that in your current goals?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I do not always know what I truly want from these goals.",
      summary: "You helped the coachee acknowledge uncertainty about underlying desires.",
      improved: "You might ask: If you set aside what you think you should want, what would you like instead?",
      followup: "Follow up with: What small change could you make to align more with that?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is that I feel pressure to do everything perfectly.",
      summary: "Your question surfaced perfectionism as a barrier to action.",
      improved: "You might ask: What would a good-enough version of this look like?",
      followup: "Follow up with: What would you be willing to try imperfectly?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is separating what is truly in my control from what is not.",
      summary: "You helped the coachee differentiate controllable and uncontrollable factors.",
      improved: "You might ask: Which parts of this are firmly in your control?",
      followup: "Follow up with: Where could you focus your energy based on that?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I have not decided what I am willing to stop doing.",
      summary: "Your question illuminated that subtraction decisions are missing.",
      improved: "You might ask: What are you currently doing that adds the least value?",
      followup: "Follow up with: What might it look like to reduce or remove that?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I feel alone in working on these goals.",
      summary: "You surfaced a sense of isolation around the work.",
      improved: "You might ask: Who could walk alongside you, even in a small way?",
      followup: "Follow up with: What would you want them to know about how to support you?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is deciding what to prioritize when everything feels important.",
      summary: "Your question brought prioritization difficulty to the surface.",
      improved: "You might ask: If you chose based on impact, what would come first?",
      followup: "Follow up with: What criteria could you use next time you feel this way?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I have not clearly decided what I am saying no to this season.",
      summary: "You highlighted the absence of explicit no’s as part of the challenge.",
      improved: "You might ask: What would you like to say no to for this season so your yes carries more weight?",
      followup: "Follow up with: What feels both challenging and freeing about that?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is trusting that small steps will actually add up.",
      summary: "Your question revealed doubt about the power of incremental progress.",
      improved: "You might ask: When have small steps added up for you in the past?",
      followup: "Follow up with: What small step could you commit to repeating now?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is that I am not sure my current path will get me where I want to go.",
      summary: "You surfaced doubt about the effectiveness of the current path.",
      improved: "You might ask: What feels off or misaligned about your current path?",
      followup: "Follow up with: What small course correction might you want to test?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is that I try to do all of this in my head instead of on paper.",
      summary: "Your question highlighted the lack of externalization and structure.",
      improved: "You might ask: What might change if you sketched this out visually or in writing?",
      followup: "Follow up with: What would be an easy way to capture it?",
      primarySkill: "Focus"
    },
    {
      text: "The real challenge is making space to think, not just to do.",
      summary: "You helped the coachee see that reflection time is missing.",
      improved: "You might ask: Where could you carve out a small amount of thinking time?",
      followup: "Follow up with: What would you like to use that time for first?",
      primarySkill: "Clarity"
    },
    {
      text: "The real challenge is giving myself permission to choose a direction.",
      summary: "Your question uncovered hesitation about fully choosing.",
      improved: "You might ask: What would it mean for you to give yourself permission to choose?",
      followup: "Follow up with: What small step would signal that permission to yourself?",
      primarySkill: "Rapport"
    },
    {
      text: "The real challenge is seeing myself as someone who can actually reach these goals.",
      summary: "You surfaced a self-belief barrier underneath the practical ones.",
      improved: "You might ask: When have you done something hard that you were not sure you could do?",
      followup: "Follow up with: What does that experience suggest about you now?",
      primarySkill: "Rapport"
    }
  ],

  4: [
    {
      text: "What I want is to feel more confident that I’m making choices that align with my goals.",
      summary: "The coachee named a desire for alignment and confidence in their decisions.",
      improved: "You might ask: What would feeling confident in this decision look like?",
      followup: "Follow up with: What’s one small sign you’re moving in that direction?",
      primarySkill: "Clarity"
    },
      {
      text: "What I want is to feel confident that my goals actually reflect what matters most to me.",
      summary: "Your question helped the coachee name a desire for alignment between goals and values.",
      improved: "You might ask: Which values do you most want your goals to express this year?",
      followup: "Follow up with: How could you adjust one goal so it better reflects those values?",
      primarySkill: "Clarity"
    },
    {
      text: "I want fewer goals but clearer ones, so I know what to say yes and no to.",
      summary: "You guided the coachee toward simplicity and clarity as a desired outcome.",
      improved: "You might ask: If you could only keep three goals, which would they be?",
      followup: "Follow up with: What would those three goals make easier for you?",
      primarySkill: "Focus"
    },
    {
      text: "I want a plan that feels doable, not something that looks good on paper but fails in real life.",
      summary: "Your question surfaced a desire for realistic, lived goals rather than aspirational lists.",
      improved: "You might ask: What would a doable version of this plan look like day to day?",
      followup: "Follow up with: What is one small test of that plan you could try in the next two weeks?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to be able to see how my daily work connects to my bigger goals.",
      summary: "You helped the coachee identify connection between daily tasks and long-term direction as important.",
      improved: "You might ask: Where do you already see some connection between the two?",
      followup: "Follow up with: What is one way you could strengthen that connection this week?",
      primarySkill: "Clarity"
    },
    {
      text: "What I want is to feel less scattered and more focused on what really moves the needle.",
      summary: "Your question invited the coachee to name focus as a central desire.",
      improved: "You might ask: What work most clearly moves the needle for you?",
      followup: "Follow up with: What would it look like to protect more time for that work?",
      primarySkill: "Focus"
    },
    {
      text: "I want my goals to feel like they belong to me, not just to other people’s expectations.",
      summary: "You helped the coachee distinguish between externally driven and self-owned goals.",
      improved: "You might ask: Which existing goals feel most like they are truly yours?",
      followup: "Follow up with: What change would help one of your goals feel more like it belongs to you?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to be realistic about my capacity so I’m not constantly overwhelmed.",
      summary: "Your question allowed the coachee to name a desire for sustainable capacity.",
      improved: "You might ask: What would it look like for your goals to fit your real capacity?",
      followup: "Follow up with: What might you reduce or reshuffle to support that?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to make steady progress instead of swinging between all-or-nothing effort.",
      summary: "You surfaced a desire for consistent pacing rather than extremes.",
      improved: "You might ask: What would steady, sustainable progress look like for you?",
      followup: "Follow up with: What is one small action you could repeat each week?",
      primarySkill: "Focus"
    },
    {
      text: "What I want is to feel less guilty when I’m not working on my goals every minute.",
      summary: "Your question opened space to talk about emotional load and guilt around goals.",
      improved: "You might ask: What would a healthier, more compassionate view of progress look like?",
      followup: "Follow up with: What permission might you need to give yourself?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to know that the goals I’m choosing are worth the trade-offs.",
      summary: "You helped the coachee connect goals with the reality of trade-offs.",
      improved: "You might ask: How will you know that a trade-off is worth it for you?",
      followup: "Follow up with: What trade-offs feel acceptable versus too costly?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to feel more intentional and less reactive about how I spend my time.",
      summary: "Your question surfaced intention versus reactivity as a key theme.",
      improved: "You might ask: What would a more intentional week look like for you?",
      followup: "Follow up with: What is one small shift you would like to try next week?",
      primarySkill: "Clarity"
    },
    {
      text: "I want my goals to support my long-term direction, not just short-term wins.",
      summary: "You encouraged the coachee to consider long-term alignment.",
      improved: "You might ask: How do you want your goals this year to serve your longer-term direction?",
      followup: "Follow up with: What might you adjust to better support that?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to be able to say no without feeling like I am letting everyone down.",
      summary: "Your question surfaced a desire for healthier boundaries.",
      improved: "You might ask: What would a respectful no look like for you?",
      followup: "Follow up with: Where might you want to practice that first?",
      primarySkill: "Rapport"
    },
    {
      text: "What I want is a small set of clear priorities I can remember without a spreadsheet.",
      summary: "You helped the coachee name a desire for simplicity and clarity.",
      improved: "You might ask: If you had to choose three guiding priorities, what would they be?",
      followup: "Follow up with: How could you keep those three visible to yourself?",
      primarySkill: "Focus"
    },
    {
      text: "I want more joy and less dread when I think about my goals.",
      summary: "Your question surfaced an emotional quality the coachee wants in their goals.",
      improved: "You might ask: Which kinds of goals feel joyful or energizing for you?",
      followup: "Follow up with: How could you redesign one goal to include more of that?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to feel like my work and personal goals are working together, not competing.",
      summary: "You helped the coachee name integration across domains as a desire.",
      improved: "You might ask: What would it look like for your work and personal goals to support each other?",
      followup: "Follow up with: What is one adjustment that might create more of that overlap?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to stop carrying goals that I secretly do not care about.",
      summary: "Your question uncovered a desire to release unhelpful goals.",
      improved: "You might ask: Which goals feel like they’ve outlived their usefulness?",
      followup: "Follow up with: What would it feel like to let one of those go?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to feel more ownership and less obligation around my goals.",
      summary: "You surfaced the difference between chosen and imposed goals.",
      improved: "You might ask: How would you know that a goal truly feels like yours?",
      followup: "Follow up with: What change might you make to reclaim ownership?",
      primarySkill: "Rapport"
    },
    {
      text: "I want a clearer picture of what success actually looks like to me.",
      summary: "Your question invited the coachee to define personal success.",
      improved: "You might ask: If this went well, what would you want to be true in your work and life?",
      followup: "Follow up with: How might that shape or refine your current goals?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to see real movement on one or two important goals instead of tiny movement on ten.",
      summary: "You helped the coachee name depth over breadth as a desire.",
      improved: "You might ask: Which one or two goals would make the biggest difference if they moved?",
      followup: "Follow up with: What would you be willing to pause to make room for those?",
      primarySkill: "Focus"
    },
    {
      text: "I want to feel less behind and more in step with my own pace.",
      summary: "Your question surfaced a desire to reset the internal pace-setting.",
      improved: "You might ask: Compared to what are you feeling behind?",
      followup: "Follow up with: What pace would feel sustainable and right for you?",
      primarySkill: "Rapport"
    },
    {
      text: "What I want is to feel that my goals support my well-being, not just my output.",
      summary: "You invited the coachee to connect goals with wellbeing.",
      improved: "You might ask: How would you like your goals to support your wellbeing?",
      followup: "Follow up with: What might you adjust to align with that?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to build habits that make my goals easier to sustain.",
      summary: "Your question brought habits into focus as a supportive structure.",
      improved: "You might ask: What one habit would most support one of your goals?",
      followup: "Follow up with: What would it look like to practice that this week?",
      primarySkill: "Focus"
    },
    {
      text: "I want to feel more in control of my calendar instead of squeezed by it.",
      summary: "You surfaced a desire for greater agency over time.",
      improved: "You might ask: What would being more in control of your calendar look like in practice?",
      followup: "Follow up with: What is one small calendar change you would like to try?",
      primarySkill: "Clarity"
    },
    {
      text: "I want goals that stretch me a bit without overwhelming me.",
      summary: "Your question invited the coachee to define the right zone of stretch.",
      improved: "You might ask: What would 'stretching but doable' look like for one of your goals?",
      followup: "Follow up with: What would you want that to feel like day to day?",
      primarySkill: "Rapport"
    },
    {
      text: "I want a way to know whether I’m actually moving toward what I care about.",
      summary: "You helped the coachee see the need for feedback on direction.",
      improved: "You might ask: What signals would tell you that you’re moving toward what matters?",
      followup: "Follow up with: How could you keep track of those signals?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to be more honest with myself about which goals I’m truly committed to.",
      summary: "Your question surfaced a desire for honesty around commitment.",
      improved: "You might ask: Which goals are you genuinely committed to, and which are more 'nice to have'?",
      followup: "Follow up with: What might you want to do with that distinction?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to feel that my work on these goals matters beyond just checking a box.",
      summary: "You invited the coachee to connect goals with meaning and impact.",
      improved: "You might ask: In what ways would you like your work to matter?",
      followup: "Follow up with: How could your goals better reflect that?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to simplify my goals so I can actually remember them without looking.",
      summary: "Your question surfaced a desire for memorably simple goals.",
      improved: "You might ask: How could you restate your goals in a way that is easy to remember?",
      followup: "Follow up with: What would your 'headline' for this goal be?",
      primarySkill: "Focus"
    },
    {
      text: "I want to design goals that take my current season of life into account.",
      summary: "You helped the coachee consider context and seasonality.",
      improved: "You might ask: What does this current season of life require or invite?",
      followup: "Follow up with: How could your goals adjust to match this season?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to feel more energized, not drained, when I think about where I am headed.",
      summary: "Your question surfaced energy as an important indicator.",
      improved: "You might ask: What kind of direction would feel energizing to you?",
      followup: "Follow up with: What small change to your goals might move you toward that?",
      primarySkill: "Rapport"
    },
    {
      text: "I want a better balance between delivering for others and investing in my own growth.",
      summary: "You helped the coachee see a balance issue between service and development.",
      improved: "You might ask: What balance would feel healthier for you?",
      followup: "Follow up with: What is one shift you could make to support that balance?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to stop treating my goals like a to-do list and more like a direction.",
      summary: "Your question opened a distinction between tasks and direction.",
      improved: "You might ask: What direction do you want your goals to point you in?",
      followup: "Follow up with: How could you reshape one goal to reflect that direction?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to feel like my goals support the kind of person I want to become.",
      summary: "You encouraged the coachee to link goals to identity and growth.",
      improved: "You might ask: Who do you want to be becoming through these goals?",
      followup: "Follow up with: What shift in your goals would better support that?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to be able to focus on what matters without feeling guilty about what I’m not doing.",
      summary: "Your question highlighted competing pulls on attention and guilt.",
      improved: "You might ask: What would focusing on what matters look like in practice?",
      followup: "Follow up with: What might you need to release guilt around?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to feel a sense of momentum instead of constantly starting over.",
      summary: "You surfaced a desire for continuity in progress.",
      improved: "You might ask: What would momentum look like for you on one key goal?",
      followup: "Follow up with: What is one way to protect that momentum over the next month?",
      primarySkill: "Focus"
    },
    {
      text: "I want my goals to be clear enough that I can explain them in one or two sentences.",
      summary: "Your question brought clarity and communication into focus.",
      improved: "You might ask: How would you describe this goal simply to someone else?",
      followup: "Follow up with: What would you tweak in the goal to match that simple description?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to be able to celebrate my progress instead of skipping past it.",
      summary: "You helped the coachee articulate a desire to acknowledge gains.",
      improved: "You might ask: What progress have you made that deserves to be celebrated?",
      followup: "Follow up with: How might you build in a small celebration or ritual?",
      primarySkill: "Rapport"
    },
    {
      text: "I want my goals to feel connected to something bigger than just my task list.",
      summary: "Your question connected goals to purpose and bigger meaning.",
      improved: "You might ask: What bigger purpose or theme would you like your goals to support?",
      followup: "Follow up with: What might you adjust to reflect that purpose more clearly?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to use my strengths more deliberately in how I pursue my goals.",
      summary: "You invited the coachee to see strengths as a lever in goal pursuit.",
      improved: "You might ask: Which strengths would you most like to bring into your goals?",
      followup: "Follow up with: How could you design one goal around using that strength?",
      primarySkill: "Rapport"
    },
    {
      text: "I want to be kinder to myself when progress is slower than I hoped.",
      summary: "Your question surfaced self-compassion as a desired change.",
      improved: "You might ask: What would kindness toward yourself look like when progress is slow?",
      followup: "Follow up with: How might that change the way you approach your goals?",
      primarySkill: "Rapport"
    },
    {
      text: "I want goals that fit who I am now, not just who I used to be.",
      summary: "You helped the coachee acknowledge growth and change over time.",
      improved: "You might ask: In what ways have you changed since you first set these goals?",
      followup: "Follow up with: What might you want to update based on who you are now?",
      primarySkill: "Clarity"
    },
    {
      text: "I want to feel more choice and less pressure in how I set my goals.",
      summary: "Your question surfaced a desire for autonomy in goal-setting.",
      improved: "You might ask: If you were setting goals purely by choice, what might they look like?",
      followup: "Follow up with: What is one small step toward more choice and less pressure?",
      primarySkill: "Rapport"
    },
    {
      text: "I want a clear next step that I feel genuinely ready to take.",
      summary: "You encouraged the coachee to identify a realistic next step.",
      improved: "You might ask: Of everything we’ve talked about, what feels like the next right step?",
      followup: "Follow up with: When will you take that step?",
      primarySkill: "Focus"
    }
  ],

   5: [
    {
      text: "It would help to have someone reflect back what they’re hearing so I can think more clearly.",
      summary: "The coachee asked for reflective support to aid clarity.",
      improved: "You might ask: What kind of reflection would be most helpful right now?",
      followup: "Follow up with: How will you know this support is working for you?",
      primarySkill: "Rapport"
    },
     {
      text: "It would help if you could ask me questions that keep me honest about what I’m actually committing to.",
      summary: "Your question invited the coachee to define the kind of accountability that would support them.",
      improved: "You might ask: What does a real, honest commitment look like for you on this goal?",
      followup: "Follow up with: How would you like me to check in on that commitment?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if I could talk my goals out loud and see if they still make sense.",
      summary: "You positioned yourself as a thinking partner to help the coachee hear their own thinking more clearly.",
      improved: "You might ask: Would it help to walk through each goal and talk about what it would take?",
      followup: "Follow up with: As you say them out loud, what are you noticing?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if we could break one big goal into concrete steps together.",
      summary: "Your question encouraged the coachee to move from concept to practical action.",
      improved: "You might ask: Which goal would you like to break down first?",
      followup: "Follow up with: What would a realistic first step look like in the next week?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could challenge me when my goals sound vague or fuzzy.",
      summary: "You invited permission to gently challenge and sharpen the coachee’s goals.",
      improved: "You might ask: Can I reflect back where your goal sounds a bit vague and see if we can sharpen it?",
      followup: "Follow up with: How would you restate that goal to make it more specific?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could remind me to be realistic about my capacity.",
      summary: "Your question surfaced a desire for support in right-sizing effort to capacity.",
      improved: "You might ask: Would it be useful if I asked capacity questions when you set new goals?",
      followup: "Follow up with: What does a realistic workload look like for you in this season?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could help me prioritize when everything feels important.",
      summary: "You helped the coachee name prioritization support as a key need.",
      improved: "You might ask: Would it help if we sorted your goals by impact and effort?",
      followup: "Follow up with: Which one feels most important to move first based on that?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could ask me what I’m willing to say no to.",
      summary: "Your question encouraged the coachee to invite support around boundaries and trade-offs.",
      improved: "You might ask: Would it be okay if I ask you regularly what you are saying no to as you say yes?",
      followup: "Follow up with: What feels like a meaningful no that would protect your yes?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if I had someone to check in with so I don’t quietly drop my goals.",
      summary: "You surfaced a need for gentle accountability rather than pressure.",
      improved: "You might ask: What kind of check-in rhythm would feel supportive, not stressful?",
      followup: "Follow up with: What would you want us to talk about in those check-ins?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if you could help me turn this idea into a specific goal.",
      summary: "Your question invited collaboration on converting an idea into a concrete target.",
      improved: "You might ask: Would it help to define what success would look like for this idea?",
      followup: "Follow up with: How could we phrase that as a clear, measurable goal?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could notice when I’m taking on too much and ask about it.",
      summary: "You were invited into a supportive, observational role around overload.",
      improved: "You might ask: Is it okay if I check in when it sounds like you’re adding a lot at once?",
      followup: "Follow up with: When I notice that, how would you like me to bring it up?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if you could help me see patterns in how I approach my goals.",
      summary: "Your question made space for pattern-spotting and reflection.",
      improved: "You might ask: Would it help if we looked for patterns in what tends to happen with your goals?",
      followup: "Follow up with: What patterns do you notice when you look at a few goals together?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could ask me what I’m learning, not just what I’m doing.",
      summary: "You surfaced a desire for reflection-focused, not just task-focused, support.",
      improved: "You might ask: Would it help if I asked you regularly what you’re learning as you go?",
      followup: "Follow up with: What have you learned so far from working on this?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if you could help me simplify my plan when it feels too complicated.",
      summary: "Your question invited permission to simplify and declutter plans.",
      improved: "You might ask: Would it help if we looked for the simplest version of your plan that could still work?",
      followup: "Follow up with: What could we remove or streamline without losing what matters?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could help me decide on one next action instead of staying in my head.",
      summary: "You encouraged a move from thinking to a concrete next step.",
      improved: "You might ask: Are you open to identifying just one next action by the end of this conversation?",
      followup: "Follow up with: What will you do, and by when?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could be a safe place for me to say what I really want.",
      summary: "Your question created room for psychological safety around honest desires.",
      improved: "You might ask: Would it help if we made space for you to name what you really want, without judgment?",
      followup: "Follow up with: What feels most true for you, even if it’s a bit scary to say?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if you could remind me of my strengths when I get discouraged.",
      summary: "You were invited to act as a strengths mirror when confidence dips.",
      improved: "You might ask: Is it okay if I reflect back strengths I see when things feel hard?",
      followup: "Follow up with: Which strengths have helped you in similar situations before?",
      primarySkill: "Rapport"
    },
    {
      text: "It would help if you could help me notice when my goals don’t match my values.",
      summary: "Your question surfaced a desire for values-based reflection.",
      improved: "You might ask: Would it help if I ask you sometimes how a goal connects to your values?",
      followup: "Follow up with: Looking at this goal, which values does it honor—or not?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could help me create boundaries around my time.",
      summary: "You were invited into a supportive role around boundary-setting.",
      improved: "You might ask: Would it help if we named a few specific boundaries you’d like to try?",
      followup: "Follow up with: Where would you like to start with one small boundary?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could help me plan for what I’ll do when I hit obstacles.",
      summary: "Your question opened space for proactive planning around obstacles.",
      improved: "You might ask: Would it help to name a few likely obstacles and what you’ll do if they show up?",
      followup: "Follow up with: What is one obstacle you can anticipate, and how would you like to respond?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could help me decide what to let go of this season.",
      summary: "You invited reflection on priorities and release.",
      improved: "You might ask: Would it help if we looked at what might be ready to be paused or released?",
      followup: "Follow up with: What feels like it no longer fits this season for you?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could ask me whether this still feels like the right goal.",
      summary: "Your question allowed permission to question and update goals.",
      improved: "You might ask: Would it be useful if I periodically asked whether this goal still feels right?",
      followup: "Follow up with: As you look at it now, does it still fit—and if not, what might you change?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could help me break this down into a timeline that isn’t overwhelming.",
      summary: "You surfaced a desire for help sequencing and pacing.",
      improved: "You might ask: Would it help to sketch a simple, rough timeline together?",
      followup: "Follow up with: What feels like a realistic timeframe for the first phase?",
      primarySkill: "Focus"
    },
    {
      text: "It would help if you could check whether I’m taking on things that don’t really belong to me.",
      summary: "You were invited to gently flag possible over-responsibility.",
      improved: "You might ask: Would you like me to notice when it sounds like you’re taking on too much that isn’t yours?",
      followup: "Follow up with: In this situation, what’s really yours to carry, and what might belong to others?",
      primarySkill: "Clarity"
    },
    {
      text: "It would help if you could remind me to notice what’s working, not just what’s not.",
      summary: "Your question surfaced a desire to balance gaps with gains.",
      improved: "You might ask: Would it help if I ask you what’s working each time we check in?",
      followup: "Follow up with: What’s one thing that is already going better than before?",
      primarySkill: "Rapport"
    }
  ],

  6: [
    {
      text: "If I say yes to this, I’m saying no to trying to keep all options open at once.",
      summary: "The coachee recognized the trade-offs involved in committing to a direction.",
      improved: "You might ask: What are you most hesitant to let go of?",
      followup: "Follow up with: What becomes possible if you do let go?",
      primarySkill: "Focus"
    },
      {
      text: "If I say yes to this goal, I’m saying no to spreading myself across too many projects.",
      summary: "Your question helped the coachee see that focus requires letting go of competing priorities.",
      improved: "You might ask: What would it look like in practice to give this goal more of your best time?",
      followup: "Follow up with: Which projects are you willing to give a little less time to so this can move?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to this opportunity, I’m saying no to having as much free space in my week.",
      summary: "You surfaced that the coachee recognizes the time cost of a new commitment.",
      improved: "You might ask: How much space are you willing to give up for this to be a genuine yes?",
      followup: "Follow up with: Where could you intentionally protect a bit of breathing room?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to leading this, I’m saying no to being more in the background.",
      summary: "Your question helped the coachee see the identity shift in this decision.",
      improved: "You might ask: What does stepping into a more visible role mean for you?",
      followup: "Follow up with: What support might you want as you step into that?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this, I’m saying no to finishing some of the other goals I already started.",
      summary: "You brought attention to unfinished goals that may be impacted by a new yes.",
      improved: "You might ask: Which in-progress goals matter enough to protect, and which could you pause?",
      followup: "Follow up with: How would you like to prioritize among them?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to these extra responsibilities, I’m saying no to as much recovery time.",
      summary: "Your question surfaced the wellbeing cost of additional responsibility.",
      improved: "You might ask: What’s the minimum amount of recovery you need to stay well?",
      followup: "Follow up with: How can you build that into your plan if you still say yes?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to keeping everything on my plate, I’m saying no to making meaningful progress on any one thing.",
      summary: "You helped the coachee see how saying yes to everything dilutes impact.",
      improved: "You might ask: What would it take to choose a smaller number of priorities on purpose?",
      followup: "Follow up with: Which one or two things would you most regret not moving forward?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to this timeline, I’m saying no to doing the work at the quality I’d like.",
      summary: "Your question revealed tension between speed and quality.",
      improved: "You might ask: Which matters more here: the current timeline or the level of quality you want?",
      followup: "Follow up with: How might you have an honest conversation about that trade-off?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to everyone who asks for help, I’m saying no to my own focus time.",
      summary: "You surfaced the link between constant availability and lost focus.",
      improved: "You might ask: What kind of availability would feel healthy for you?",
      followup: "Follow up with: What boundary might you want to try around your focus time?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this new project, I’m saying no to moving my long-term goals forward for a while.",
      summary: "Your question helped the coachee name impact on long-term priorities.",
      improved: "You might ask: Are you comfortable delaying your long-term goals for this, and for how long?",
      followup: "Follow up with: What could you do to keep at least a small thread of those goals alive?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to staying in this role, I’m saying no to exploring other paths right now.",
      summary: "You surfaced the trade-off between stability and exploration.",
      improved: "You might ask: What do you gain from staying, and what do you postpone or pause?",
      followup: "Follow up with: What would make staying feel like a conscious choice rather than default?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to every interesting idea, I’m saying no to depth on any single one.",
      summary: "Your question highlighted a pattern of breadth over depth.",
      improved: "You might ask: Where would depth matter more than variety right now?",
      followup: "Follow up with: Which idea do you most want to go deeper on?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to working late most nights, I’m saying no to rest and time with people I care about.",
      summary: "You helped the coachee see relational and wellbeing consequences of their yes.",
      improved: "You might ask: What balance between work and personal time would feel more right for you?",
      followup: "Follow up with: What change would you be willing to experiment with first?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this expectation without pushing back, I’m saying no to my own boundary.",
      summary: "Your question surfaced a tension between compliance and self-respect.",
      improved: "You might ask: What boundary feels important for you to hold here?",
      followup: "Follow up with: What might a respectful boundary conversation sound like?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this pace, I’m saying no to doing any real reflection.",
      summary: "You highlighted the impact of pace on reflective space.",
      improved: "You might ask: How much reflection time do you want to protect, realistically?",
      followup: "Follow up with: Where could you carve out a small amount, even in a busy week?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to this role, I’m saying no to some of the hands-on work I actually enjoy.",
      summary: "Your question helped the coachee acknowledge a loss of enjoyable work.",
      improved: "You might ask: How important is it for you to keep some of that hands-on work?",
      followup: "Follow up with: Is there a way to shape the role to retain a piece of it?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this expectation of always being available, I’m saying no to focused deep work.",
      summary: "You surfaced the tension between constant access and deep focus.",
      improved: "You might ask: What balance between availability and deep work would you like to aim for?",
      followup: "Follow up with: What is one small shift you could make toward that balance?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to keeping everything the same, I’m saying no to the possibility of something better.",
      summary: "Your question revealed that inaction is also a choice with trade-offs.",
      improved: "You might ask: What are you protecting by keeping things the same?",
      followup: "Follow up with: What might be possible if you were willing to let a little change in?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to taking this on alone, I’m saying no to asking for help.",
      summary: "You highlighted a preference for self-reliance that may limit support.",
      improved: "You might ask: Where might shared ownership or help actually serve you and the work?",
      followup: "Follow up with: Who could be a good partner or ally here?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this large goal, I’m saying no to a lot of smaller things I also care about.",
      summary: "Your question surfaced the trade-offs between one big commitment and many smaller ones.",
      improved: "You might ask: Are you comfortable with that trade-off right now?",
      followup: "Follow up with: Is there a smaller version of the big goal that still matters but leaves space?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to this short deadline, I’m saying no to space for learning as I go.",
      summary: "You helped the coachee notice that speed may reduce learning opportunities.",
      improved: "You might ask: How important is learning in this situation compared with speed?",
      followup: "Follow up with: Is there any flexibility to create a bit more space for learning?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to everyone else’s priorities, I’m saying no to my own long-term direction.",
      summary: "Your question made visible the crowding out of personal direction.",
      improved: "You might ask: Where would you like your own direction to have more say?",
      followup: "Follow up with: What is one place you could experiment with protecting your priorities?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to perfection on this, I’m saying no to finishing on time.",
      summary: "You surfaced a perfection–completion trade-off.",
      improved: "You might ask: What level of quality would be good enough for this situation?",
      followup: "Follow up with: How might that standard change what you do next?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to every meeting, I’m saying no to blocks of time to do deep work.",
      summary: "Your question connected yes’s on the calendar with loss of deep-work time.",
      improved: "You might ask: How much uninterrupted time do you want each week?",
      followup: "Follow up with: What could you decline or shorten to make that possible?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to this now, I’m saying no to a slower, more intentional decision.",
      summary: "You revealed a trade-off between speed and intentionality.",
      improved: "You might ask: How much time would you like to feel good about this decision?",
      followup: "Follow up with: Is there a way to create that space before fully committing?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to doing this the way I always have, I’m saying no to experimenting with a new approach.",
      summary: "Your question surfaced a pattern of defaulting to the familiar.",
      improved: "You might ask: What might a small experiment with a new approach look like?",
      followup: "Follow up with: What’s the lowest-risk version of that experiment you’d be willing to try?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to constantly being flexible, I’m saying no to having any stable routines.",
      summary: "You highlighted the cost of constant flexibility.",
      improved: "You might ask: Where would a bit more routine actually serve you and your goals?",
      followup: "Follow up with: What is one routine you’d like to protect or build?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to taking this on because I feel guilty, I’m saying no to what I truly want.",
      summary: "Your question surfaced guilt as a driver behind the yes.",
      improved: "You might ask: If guilt weren’t driving your decision, what would you want to do?",
      followup: "Follow up with: What would a healthier reason to say yes or no look like?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this without a plan, I’m saying no to a thoughtful approach.",
      summary: "You helped the coachee notice that impulsive yes’s can undermine quality planning.",
      improved: "You might ask: What level of planning would make this yes feel more grounded?",
      followup: "Follow up with: What’s one planning step you’d like to take before jumping in?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to being the go-to person for everything, I’m saying no to letting others grow.",
      summary: "Your question revealed that over-helping can limit others’ development.",
      improved: "You might ask: Where might stepping back create growth for others?",
      followup: "Follow up with: What would it look like to share or delegate part of this?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to this travel schedule, I’m saying no to a lot of time at home.",
      summary: "You surfaced the personal and relational impact of travel.",
      improved: "You might ask: How important is that trade-off to you right now?",
      followup: "Follow up with: What, if anything, would you want to put in place to support home life?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to this high-visibility work, I’m saying no to staying in my comfort zone.",
      summary: "Your question helped the coachee name the stretch involved in the opportunity.",
      improved: "You might ask: What feels exciting and what feels intimidating about that visibility?",
      followup: "Follow up with: What support would help you step into it with confidence?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to every urgent request, I’m saying no to the important but not urgent work.",
      summary: "You highlighted the classic urgent–important trade-off.",
      improved: "You might ask: What important, non-urgent work matters most to you right now?",
      followup: "Follow up with: What boundary or practice would help you make space for it?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to taking this all on myself, I’m saying no to building a sustainable system.",
      summary: "Your question surfaced that a solo approach may not scale.",
      improved: "You might ask: What would a more sustainable system or structure look like?",
      followup: "Follow up with: What is one small step toward that system?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to more goals, I’m saying no to giving full attention to the ones I already have.",
      summary: "You made the dilution effect of too many goals visible.",
      improved: "You might ask: Which goals deserve more of your full attention right now?",
      followup: "Follow up with: What would you be willing to pause or let go of?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to avoiding a hard conversation, I’m saying no to the chance to reset expectations.",
      summary: "Your question showed that avoidance is also a trade-off.",
      improved: "You might ask: What might become possible if you had that hard conversation?",
      followup: "Follow up with: What support would you like in preparing for it?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to doing this perfectly, I’m saying no to experimenting and learning as I go.",
      summary: "You surfaced the tension between perfection and learning.",
      improved: "You might ask: What would it look like to approach this as an experiment instead of a test?",
      followup: "Follow up with: What would make it safe enough to experiment?",
      primarySkill: "Clarity"
    },
    {
      text: "If I say yes to constantly being in motion, I’m saying no to thinking strategically.",
      summary: "Your question connected busyness with the loss of strategic thinking time.",
      improved: "You might ask: How much strategic thinking time would you like in a typical week?",
      followup: "Follow up with: What might you need to say no to so that time can exist?",
      primarySkill: "Focus"
    },
    {
      text: "If I say yes to this because I’m afraid to disappoint people, I’m saying no to my own limits.",
      summary: "You helped the coachee see fear of disappointment driving their yes.",
      improved: "You might ask: What would it look like to honor your limits while still being respectful?",
      followup: "Follow up with: What might be a kinder way to say no or negotiate here?",
      primarySkill: "Rapport"
    },
    {
      text: "If I say yes to staying in this pattern, I’m saying no to the growth I say I want.",
      summary: "Your question surfaced the gap between stated desire and actual choices.",
      improved: "You might ask: What growth do you most want, and how does this pattern affect it?",
      followup: "Follow up with: What small shift would move you closer to that growth?",
      primarySkill: "Clarity"
    }
  ],

  7: [
    {
      text: "What was most useful was realizing I don’t have to solve everything at once.",
      summary: "The coachee identified a key insight about pacing and scope.",
      improved: "You might ask: How might that realization change your next step?",
      followup: "Follow up with: What’s one thing you’ll do differently as a result?",
      primarySkill: "Clarity"
    },
      {
      text: "The most useful part was getting clear on which goals actually matter most to me right now.",
      summary: "Your question helped the coachee identify prioritization clarity as their key takeaway.",
      improved: "You might ask: Which one or two goals feel most important to focus on first?",
      followup: "Follow up with: What’s one concrete step you’ll take on one of those goals?",
      primarySkill: "Clarity"
    },
    {
      text: "What was most useful was realizing I don’t have to chase every goal at the same time.",
      summary: "You supported the coachee in seeing that sequencing can replace overloading.",
      improved: "You might ask: What feels like the right order for your goals, rather than all at once?",
      followup: "Follow up with: What will you intentionally defer so you can focus?",
      primarySkill: "Focus"
    },
    {
      text: "The most useful thing was naming the real challenge instead of dancing around it.",
      summary: "Your question helped the coachee appreciate the value of getting to the core issue.",
      improved: "You might ask: How does naming the real challenge change what you might do next?",
      followup: "Follow up with: What’s one step you’ll take now that you can see it more clearly?",
      primarySkill: "Clarity"
    },
    {
      text: "What helped me most was connecting my goals back to my values.",
      summary: "You guided the coachee to see alignment with values as a powerful insight.",
      improved: "You might ask: Which specific value feels most important to honor in your next step?",
      followup: "Follow up with: How will you keep that value visible as you move forward?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful part was breaking a big, vague goal into smaller steps I can actually do.",
      summary: "Your question supported the coachee in translating vision into actionable steps.",
      improved: "You might ask: Which small step feels like the right one to start with?",
      followup: "Follow up with: When will you take that step?",
      primarySkill: "Focus"
    },
    {
      text: "What was most useful was realizing I’ve been carrying some goals that I don’t truly care about.",
      summary: "You helped the coachee see the cost of holding onto misaligned goals.",
      improved: "You might ask: Which of those goals are you ready to release or redefine?",
      followup: "Follow up with: What will you do to consciously let one of them go?",
      primarySkill: "Rapport"
    },
    {
      text: "The most useful thing was noticing the trade-offs behind my yes’s.",
      summary: "Your question highlighted that choices have costs the coachee can now see more clearly.",
      improved: "You might ask: How will you use that awareness when you consider your next yes or no?",
      followup: "Follow up with: What new boundary or guideline will you try for yourself?",
      primarySkill: "Clarity"
    },
    {
      text: "What helped me most was realizing I’ve been expecting perfection instead of progress.",
      summary: "You supported the coachee in recognizing perfectionism as a barrier.",
      improved: "You might ask: What would focusing on progress instead of perfection look like?",
      followup: "Follow up with: What’s a ‘good enough’ next step you’re willing to take?",
      primarySkill: "Rapport"
    },
    {
      text: "The most useful part was hearing my own thinking out loud and seeing where it didn’t quite add up.",
      summary: "Your question created space for the coachee to process their thoughts externally.",
      improved: "You might ask: What did you notice when you heard yourself describing your situation?",
      followup: "Follow up with: What, if anything, do you want to adjust based on that?",
      primarySkill: "Rapport"
    },
    {
      text: "What was most useful was realizing I can define success for myself, not just meet others’ expectations.",
      summary: "You helped the coachee reclaim a sense of agency over the definition of success.",
      improved: "You might ask: How would you describe success in a way that feels true to you?",
      followup: "Follow up with: How will that definition shape the goals you focus on?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful piece was getting a clearer picture of what I actually want, not just what I think I should want.",
      summary: "Your question encouraged the coachee to distinguish genuine desire from external shoulds.",
      improved: "You might ask: What feels different when you focus on what you truly want?",
      followup: "Follow up with: What will you do differently based on that clarity?",
      primarySkill: "Rapport"
    },
    {
      text: "What helped me most was seeing that I’ve been saying yes in ways that crowd out what matters.",
      summary: "You surfaced the impact of unexamined yes’s on important priorities.",
      improved: "You might ask: How would you like your yes’s and no’s to look going forward?",
      followup: "Follow up with: What is one no you’re now willing to consider?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful thing was identifying one small, realistic next step instead of getting lost in the big picture.",
      summary: "Your question shifted the coachee from overwhelm to concrete action.",
      improved: "You might ask: What makes that next step feel realistic for you?",
      followup: "Follow up with: How will you remind yourself to actually take that step?",
      primarySkill: "Focus"
    },
    {
      text: "What was most useful was realizing I don’t have to do all of this alone.",
      summary: "You helped the coachee see support as an option rather than a weakness.",
      improved: "You might ask: Who could walk alongside you in a small but meaningful way?",
      followup: "Follow up with: What’s one request for support you’re willing to make?",
      primarySkill: "Rapport"
    },
    {
      text: "The most useful part was seeing a pattern in how I overload myself with goals.",
      summary: "Your question helped the coachee identify a recurring pattern rather than a one-off issue.",
      improved: "You might ask: What would interrupt that pattern next time it starts to show up?",
      followup: "Follow up with: What reminder or structure could help you notice it earlier?",
      primarySkill: "Clarity"
    },
    {
      text: "What helped me most was slowing down enough to think instead of just react.",
      summary: "You created space for reflective thinking instead of automatic responses.",
      improved: "You might ask: What do you notice is different when you give yourself thinking time?",
      followup: "Follow up with: How will you carve out that kind of time again?",
      primarySkill: "Focus"
    },
    {
      text: "The most useful thing was feeling like I could say what I’m actually worried about.",
      summary: "Your question supported psychological safety and emotional honesty.",
      improved: "You might ask: What felt different about being able to name that worry here?",
      followup: "Follow up with: How might acknowledging that worry influence your next step?",
      primarySkill: "Rapport"
    },
    {
      text: "What was most useful was connecting my day-to-day actions to my longer-term direction.",
      summary: "You helped the coachee link the micro (daily actions) with the macro (direction).",
      improved: "You might ask: What daily or weekly actions best support that direction?",
      followup: "Follow up with: What will you experiment with this week to strengthen that link?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful part was realizing I can choose a smaller, right-sized version of my goal.",
      summary: "Your question gave the coachee permission to right-size their goal for this season.",
      improved: "You might ask: What does a right-sized version of this goal look like now?",
      followup: "Follow up with: How will you know that size is working for you?",
      primarySkill: "Clarity"
    },
    {
      text: "What helped me most was hearing that it’s okay to adjust or retire goals that no longer fit.",
      summary: "You normalized the idea that goals can be revised or released over time.",
      improved: "You might ask: Which goals feel ready for an update or a goodbye?",
      followup: "Follow up with: What’s one small way you might mark that shift for yourself?",
      primarySkill: "Rapport"
    },
    {
      text: "The most useful thing was noticing where my energy is highest and lowest around my goals.",
      summary: "Your question invited the coachee to factor energy into their planning.",
      improved: "You might ask: How might your plan change if you designed it around your energy patterns?",
      followup: "Follow up with: What’s one change you’ll try based on what you noticed?",
      primarySkill: "Clarity"
    },
    {
      text: "What was most useful was realizing that a small, consistent habit can matter more than a big push.",
      summary: "You helped the coachee see the value of consistency over intensity.",
      improved: "You might ask: What’s one small habit that would support your goal if you repeated it?",
      followup: "Follow up with: When and where will you practice that habit?",
      primarySkill: "Focus"
    },
    {
      text: "The most useful part was acknowledging that I’ve actually made more progress than I’ve been giving myself credit for.",
      summary: "Your question invited a more balanced view that includes progress, not just gaps.",
      improved: "You might ask: How does recognizing that progress affect how you feel about your next step?",
      followup: "Follow up with: How might you build in time to regularly notice what’s working?",
      primarySkill: "Rapport"
    },
    {
      text: "What helped me most was realizing that my yes and no choices are how I shape my time.",
      summary: "You highlighted the connection between boundaries and lived experience.",
      improved: "You might ask: What kind of week would you like your yes’s and no’s to create?",
      followup: "Follow up with: What’s one decision you’ll approach differently because of that insight?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful thing was getting language for the real challenge I’ve been feeling.",
      summary: "Your question supported the coachee in naming their experience more precisely.",
      improved: "You might ask: How will having that language change the way you talk about this with others?",
      followup: "Follow up with: What conversation might you want to have next using that language?",
      primarySkill: "Clarity"
    },
    {
      text: "What was most useful was feeling heard without you trying to fix everything for me.",
      summary: "You reinforced a coaching stance that honors the coachee’s ownership.",
      improved: "You might ask: How did it help to have space to think this through yourself?",
      followup: "Follow up with: What decisions feel more like yours now?",
      primarySkill: "Rapport"
    },
    {
      text: "The most useful part was seeing that I can design my goals to fit my season of life.",
      summary: "Your question helped the coachee link goals to life context instead of an idealized version of themselves.",
      improved: "You might ask: What does this particular season ask of you, and what does it allow?",
      followup: "Follow up with: How will you shape your goals to respect that reality?",
      primarySkill: "Clarity"
    },
    {
      text: "What helped me most was deciding on one clear next step instead of staying stuck in analysis.",
      summary: "You helped the coachee move from reflection into commitment.",
      improved: "You might ask: What makes this step feel like the right one for now?",
      followup: "Follow up with: How will you hold yourself gently accountable for taking it?",
      primarySkill: "Focus"
    },
    {
      text: "The most useful thing was feeling like I could be honest about my limits without being judged.",
      summary: "Your question supported psychological safety around acknowledging limitations.",
      improved: "You might ask: How does naming your limits change the way you think about your plan?",
      followup: "Follow up with: What will you do differently now that you’re honoring those limits?",
      primarySkill: "Rapport"
    },
    {
      text: "What was most useful was recognizing the difference between what I can control and what I can’t.",
      summary: "You helped the coachee separate controllable factors from those outside their control.",
      improved: "You might ask: Where will you focus your effort now that you see that difference?",
      followup: "Follow up with: What’s one action fully in your control that you’re willing to take?",
      primarySkill: "Clarity"
    },
    {
      text: "The most useful part was realizing that small experiments can replace all-or-nothing decisions.",
      summary: "Your question encouraged an experimental mindset rather than permanent, high-pressure choices.",
      improved: "You might ask: What’s one experiment you’re willing to try based on today’s conversation?",
      followup: "Follow up with: How will you know what you learned from that experiment?",
      primarySkill: "Focus"
    }
  ]

};
/* -------------------------------------
   Select response + write outputs
------------------------------------- */

var responseArr = coacheeResponseBank[qId];

if (!responseArr || !responseArr.length) {
  player.SetVar("CoacheeReplyText", "I’m not entirely sure what to say about that yet, but it does feel important.");
  player.SetVar("SummaryText", "A response bank for this Coaching Habit question hasn’t been added yet.");
  player.SetVar("ImprovedQuestionText", "Try selecting a different Coaching Habit question (QuestionID) or add responses to this bank.");
  player.SetVar("FollowUpText", "Once you add response objects for this question, the simulation will respond normally.");
  player.SetVar("PrimarySkill", "Clarity");

  player.SetVar("LastCoachQuestionText", rawText);
  return;
}

// Random pick
var idx = Math.floor(Math.random() * responseArr.length);
var item = responseArr[idx];

// Defensive reads
var replyText    = item.text || "…";
var summaryText  = item.summary || "";
var improvedText = item.improved || "";
var followUpText = item.followup || "";
var primarySkill = item.primarySkill || "Clarity";

/* -------------------------------------
   Scenario additions (kept light & stable)
------------------------------------- */

// Nuance only on Q4/Q6
summaryText  = applyScenarioNuance(summaryText,  scenarioKey, qId);
improvedText = applyScenarioNuance(improvedText, scenarioKey, qId);
followUpText = applyScenarioNuance(followUpText, scenarioKey, qId);

// Scenario lens only on Q4/Q6
improvedText = tailorQ4Q6(improvedText, scenarioKey, qId);
followUpText = tailorQ4Q6(followUpText, scenarioKey, qId);

// Verbs only in follow-up
followUpText = addVerbActionLine(followUpText, scenarioKey);

// Light context only in summary
summaryText = flavorSummary(summaryText, questionCount + 1);

/* -------------------------------------
   Update counts and meters
------------------------------------- */

questionCount += 1;

var skillText = (primarySkill || "").toLowerCase();

// Supports multi-skill labels like "Clarity & Rapport"
if (skillText.indexOf("rapport") !== -1) rapport += 1;
if (skillText.indexOf("clarity") !== -1) clarity += 1;
if (skillText.indexOf("focus")   !== -1) focus   += 1;

// If none matched, default to clarity
if (
  skillText.indexOf("rapport") === -1 &&
  skillText.indexOf("clarity") === -1 &&
  skillText.indexOf("focus") === -1
) {
  clarity += 1;
}

/* -------------------------------------
   Push values back to Storyline
------------------------------------- */

player.SetVar("CoacheeReplyText", replyText);
player.SetVar("SummaryText", summaryText);
player.SetVar("ImprovedQuestionText", improvedText);
player.SetVar("FollowUpText", followUpText);
player.SetVar("PrimarySkill", primarySkill);

player.SetVar("LastCoachQuestionText", rawText);

player.SetVar("QuestionCount", questionCount);
player.SetVar("rapportScore", rapport);
player.SetVar("clarityScore", clarity);
player.SetVar("focusScore", focus);

}

window.Script3 = function()
{
  var player = GetPlayer();

// Pull totals
var qCount  = Number(player.GetVar("QuestionCount")) || 0;
var rapport = Number(player.GetVar("rapportScore"))  || 0;
var clarity = Number(player.GetVar("clarityScore"))  || 0;
var focus   = Number(player.GetVar("focusScore"))    || 0;

// Avoid divide-by-zero
var avgRapport = (qCount > 0) ? (rapport / qCount) : 0;
var avgClarity = (qCount > 0) ? (clarity / qCount) : 0;
var avgFocus   = (qCount > 0) ? (focus   / qCount) : 0;

// Round to 2 decimals for display
function round2(n) { return Math.round(n * 100) / 100; }
avgRapport = round2(avgRapport);
avgClarity = round2(avgClarity);
avgFocus   = round2(avgFocus);

// Determine strongest skill (based on averages)
var strongest = "Balanced";
var maxVal = Math.max(avgRapport, avgClarity, avgFocus);

if (maxVal === 0) {
  strongest = "No data yet";
} else if (maxVal === avgRapport && avgRapport > avgClarity && avgRapport > avgFocus) {
  strongest = "Rapport";
} else if (maxVal === avgClarity && avgClarity > avgRapport && avgClarity > avgFocus) {
  strongest = "Clarity";
} else if (maxVal === avgFocus && avgFocus > avgRapport && avgFocus > avgClarity) {
  strongest = "Focus";
} else {
  strongest = "Balanced";
}

// Feedback text
var feedback = "";

if (qCount === 0) {
  feedback =
    "You ended the session before asking a coaching question. Try asking one open “what” or “how” question next time " +
    "to get the conversation moving (ex: “What’s on your mind?”).";
} else {
  feedback = "You asked " + qCount + " coaching question" + (qCount === 1 ? "" : "s") + ". ";

  if (strongest === "Rapport") {
    feedback +=
      "Your strongest area was Rapport: you created a supportive tone and made it easier for the coachee to open up. " +
      "Next time, try adding one clarity-building question to sharpen the focus (ex: “What’s the real challenge here for you?”).";
  } else if (strongest === "Clarity") {
    feedback +=
      "Your strongest area was Clarity: you helped the coachee name what matters and what’s underneath the surface. " +
      "Next time, add one focus question to move toward action (ex: “What do you want to have happen next?”).";
  } else if (strongest === "Focus") {
    feedback +=
      "Your strongest area was Focus: you guided the coachee toward priorities, tradeoffs, and next steps. " +
      "Next time, add a rapport check-in early to strengthen trust (ex: “How are you doing today?”).";
  } else {
    feedback +=
      "Your skills were well balanced across Rapport, Clarity, and Focus. " +
      "For your next session, try being more intentional: choose one skill you want to practice and aim to reinforce it 2–3 times.";
  }

  // Scenario-aware reflection (no scenario-specific wording, no extra variables needed)
  feedback += "\n\nReflection: Consider how the scenario you selected shaped what you listened for and the questions you chose to ask.";

  // Meter awareness cue
  feedback += "\n\nTip: If a meter is lagging, ask one question that directly strengthens that skill before moving on.";
}

// Push values back to Storyline
player.SetVar("AverageRapport", avgRapport);
player.SetVar("AverageClarity", avgClarity);
player.SetVar("AverageFocus", avgFocus);
player.SetVar("StrongestSkill", strongest);
player.SetVar("CoachFeedbackText", feedback);

}

window.Script4 = function()
{
  var player = GetPlayer();

var rapport = player.GetVar("rapportScore");
var clarity = player.GetVar("clarityScore");
var focus = player.GetVar("focusScore");
var count = player.GetVar("QuestionCount");

// Avoid divide-by-zero
var avgR = 0;
var avgC = 0;
var avgF = 0;

if (count > 0) {
  avgR = rapport / count;
  avgC = clarity / count;
  avgF = focus / count;
}

// Round to one decimal place
avgR = Math.round(avgR * 10) / 10;
avgC = Math.round(avgC * 10) / 10;
avgF = Math.round(avgF * 10) / 10;

// Set the Storyline variables
player.SetVar("AvgRapport", avgR);
player.SetVar("AvgClarity", avgC);
player.SetVar("AvgFocus", avgF);

// Simple feedback rules (tweak these ranges to your liking)
var feedback = "";

if (count === 0) {
  feedback = "You didn’t complete any questions this round. Try running a full conversation to see your coaching insights.";
} else if (avgR >= 2 && avgC >= 2 && avgF >= 2) {
  feedback = "You balanced rapport, clarity, and focus well. Keep reinforcing this mix by staying curious, specific, and forward-looking.";
} else if (avgR >= 2 && avgC < 2) {
  feedback = "You’re building strong rapport. Consider sharpening your questions to bring more clarity to the core challenge.";
} else if (avgC >= 2 && avgR < 2) {
  feedback = "You’re doing well at clarifying the issue. Look for moments to acknowledge the coachee’s experience and deepen rapport.";
} else if (avgF >= 2 && avgR < 2) {
  feedback = "You’re moving toward action and focus. Be sure to also slow down to connect and ensure the coachee feels heard.";
} else {
  feedback = "You’ve started practicing the questions. Keep experimenting with balancing connection (rapport), understanding (clarity), and next steps (focus).";
}

player.SetVar("CoachFeedbackText", feedback);

}

window.Script5 = function()
{
  var player = GetPlayer();

var total = Number(player.GetVar("TotalQuestions") || 0);
var opening = Number(player.GetVar("OpeningCount") || 0);
var whatElse = Number(player.GetVar("WhatElseCount") || 0);
var challenge = Number(player.GetVar("ChallengeCount") || 0);
var desire = Number(player.GetVar("DesireCount") || 0);
var help = Number(player.GetVar("HelpCount") || 0);
var tradeoff = Number(player.GetVar("TradeoffCount") || 0);
var reflection = Number(player.GetVar("ReflectionCount") || 0);
var why = Number(player.GetVar("WhyCount") || 0);

function ratio(count) {
  if (!total) return "0";
  return Math.round((count / total) * 100) + "%";
}

var summary = "";

summary += "In this session you asked " + total + " question(s).\n\n";
summary += "You used:\n";
summary += "• Opening questions (What's on your mind?): " + opening + " (" + ratio(opening) + ")\n";
summary += "• 'And what else?' questions: " + whatElse + " (" + ratio(whatElse) + ")\n";
summary += "• Challenge questions: " + challenge + " (" + ratio(challenge) + ")\n";
summary += "• Desire questions (What do you want?): " + desire + " (" + ratio(desire) + ")\n";
summary += "• Help questions (How can I help?): " + help + " (" + ratio(help) + ")\n";
summary += "• Tradeoff questions (Yes/No tradeoffs): " + tradeoff + " (" + ratio(tradeoff) + ")\n";
summary += "• Reflection questions (Most useful?): " + reflection + " (" + ratio(reflection) + ")\n";
summary += "• 'Why' questions: " + why + " (" + ratio(why) + ")\n\n";

if (why > 0) {
  summary += "Tip: You used 'why' questions a few times. Try experimenting with 'what' and 'how' questions to reduce defensiveness and invite more reflection.\n\n";
}

summary += "As a next step, you might intentionally practice one question type you used less often, such as 'What else?' or 'What do you want?'.";

player.SetVar("SessionSummaryText", summary);

}

};
