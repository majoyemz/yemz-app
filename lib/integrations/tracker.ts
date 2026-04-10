import type { BugReport, TestCase } from "@/lib/agents/types";
import { postBugAlert } from "./slack";

/**
 * Get a configured Supabase client.
 */
async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Log a structured bug report to Supabase and optionally alert via Slack.
 */
export async function logBug(bug: BugReport): Promise<string> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("bugs")
    .insert({
      title: bug.title,
      severity: bug.severity,
      area: bug.area,
      steps_to_reproduce: bug.stepsToReproduce,
      expected: bug.expected,
      actual: bug.actual,
      device_env: bug.deviceEnv,
      notes: bug.notes,
      status: "open",
      reported_by: bug.reportedBy || "dev_agent",
      assigned_to: bug.assignedTo,
      linked_feature: bug.linkedFeature,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to log bug: ${error.message}`);

  // Alert on P0 and P1 bugs
  if (bug.severity === "P0" || bug.severity === "P1") {
    await postBugAlert(bug.title, bug.severity, bug.area);
  }

  return data.id;
}

/**
 * Update the status of a bug.
 */
export async function updateBugStatus(
  bugId: string,
  status: BugReport["status"]
): Promise<void> {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("bugs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bugId);

  if (error) throw new Error(`Failed to update bug: ${error.message}`);
}

/**
 * Get all open bugs, optionally filtered by severity or area.
 */
export async function getOpenBugs(filters?: {
  severity?: string;
  area?: string;
}): Promise<BugReport[]> {
  const supabase = await getSupabase();

  let query = supabase
    .from("bugs")
    .select("*")
    .in("status", ["open", "in_progress"])
    .order("severity", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.severity) query = query.eq("severity", filters.severity);
  if (filters?.area) query = query.eq("area", filters.area);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch bugs: ${error.message}`);

  return data || [];
}

/**
 * Create a test case entry for a feature.
 */
export async function createTestCase(testCase: TestCase): Promise<string> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("test_cases")
    .insert({
      feature_area: testCase.featureArea,
      description: testCase.description,
      steps: testCase.steps,
      expected_result: testCase.expectedResult,
      status: "pending",
      run_by: testCase.runBy,
      notes: testCase.notes,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create test case: ${error.message}`);
  return data.id;
}

/**
 * Log agent output to the tracker if dev-related.
 * Called automatically by the orchestrator for dev_agent responses.
 */
export async function logToTracker(
  message: string,
  response: { content: Array<{ text?: string }> }
): Promise<void> {
  const responseText = response.content
    .map((c) => c.text || "")
    .join("\n");

  // Check if the response contains a structured bug report
  if (responseText.includes("BUG-") && responseText.includes("Severity:")) {
    // Bug auto-logging is handled by the dev agent calling logBug directly
    // This is a fallback check for logging purposes
    console.log("[tracker] Dev agent response contains bug report");
  }
}
