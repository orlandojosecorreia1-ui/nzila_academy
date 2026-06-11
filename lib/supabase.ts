import { createClient } from "@supabase/supabase-js";

// Live binding export for stateful client import
export let supabase: any = null;

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Synchronous browser fallback to load previous credentials on instant page loads
if (typeof window !== "undefined") {
  const savedUrl = localStorage.getItem("__SUPABASE_URL");
  const savedKey = localStorage.getItem("__SUPABASE_ANON_KEY");
  if (savedUrl && savedUrl.startsWith("http")) {
    supabaseUrl = savedUrl;
  }
  if (savedKey && savedKey.length > 20) {
    supabaseAnonKey = savedKey;
  }
}

// Initialize instantly if keys are ready in scope (from env or LocalStorage)
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("Initial Supabase client creation failed:", err);
  }
}

// Helper converters between camelCase (TypeScript code style) and snake_case (Postgres DB style)
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function mapToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => mapToSnakeCase(item));
  }
  if (obj !== null && typeof obj === "object") {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = camelToSnake(key);
      const val = obj[key];
      if (
        key === "materials" ||
        key === "enrolledCourses" ||
        key === "lessons" ||
        key === "lessonsList" ||
        key === "comments" ||
        key === "tags"
      ) {
        res[snakeKey] = val; // Store nested structures as jsonb literally
      } else {
        res[snakeKey] = mapToSnakeCase(val);
      }
    }
    return res;
  }
  return obj;
}

export function mapToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => mapToCamelCase(item));
  }
  if (obj !== null && typeof obj === "object") {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      const val = obj[key];
      if (
        camelKey === "materials" ||
        camelKey === "enrolledCourses" ||
        camelKey === "lessons" ||
        camelKey === "lessonsList" ||
        camelKey === "comments" ||
        camelKey === "tags"
      ) {
        res[camelKey] = val;
      } else {
        res[camelKey] = mapToCamelCase(val);
      }
    }
    return res;
  }
  return obj;
}

// Function to dynamically update/retrieve client credentials from the Next server
export async function initializeSupabaseDynamic(): Promise<boolean> {
  try {
    const res = await fetch("/api/supabase-config");
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        // Only trigger update if it shifted
        if (
          data.supabaseUrl !== localStorage.getItem("__SUPABASE_URL") ||
          data.supabaseAnonKey !== localStorage.getItem("__SUPABASE_ANON_KEY") ||
          !supabase
        ) {
          if (typeof window !== "undefined") {
            localStorage.setItem("__SUPABASE_URL", data.supabaseUrl);
            localStorage.setItem("__SUPABASE_ANON_KEY", data.supabaseAnonKey);
          }

          supabaseUrl = data.supabaseUrl;
          supabaseAnonKey = data.supabaseAnonKey;

          supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          console.log("⚡ Dynamic Supabase client re-initialized successfully!");
        }
        return true;
      }
    }
  } catch (err) {
    console.warn("Failed to dynamically retrieve Supabase config at runtime:", err);
  }
  return supabase !== null;
}

// Global Database Controller Service
export const dbService = {
  async testConnection(): Promise<boolean> {
    // Proactively fetch live server configurations first
    await initializeSupabaseDynamic();

    if (!supabase) {
      console.warn("⚠️ Supabase connection check: client is null");
      return false;
    }
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id")
        .limit(1);

      if (error) {
        console.warn("⚠️ Supabase connection test returned error:", error.message, "code:", error.code);
        
        // Error code "42P01" is Postgres for "relation ... does not exist".
        // Error code "42501" is "permission denied".
        // If we get these errors, it PROVES we connected to Supabase and authenticated correctly!
        if (error.code === "42P01" || error.code === "42501" || error.message?.includes("relation") || error.message?.includes("does not exist") || error.message?.includes("permission denied")) {
          console.log("⚡ Supabase connection is SUCCESSFUL but tables are missing or permission is denied.");
          return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("⚠️ Supabase connection exception:", err);
      return false;
    }
  },

  async fetchTable(tableName: string): Promise<any[] | null> {
    const activeClient = supabase;
    if (!activeClient) return null;
    try {
      const { data, error } = await activeClient.from(tableName).select("*");

      if (error) {
        console.error(`Error fetching table "${tableName}":`, error.message);
        return null;
      }
      return data ? mapToCamelCase(data) : [];
    } catch (err) {
      console.error(`Exception fetching table "${tableName}":`, err);
      return null;
    }
  },

  async upsertRows(tableName: string, rows: any[]): Promise<boolean> {
    const activeClient = supabase;
    if (!activeClient || rows.length === 0) return false;
    try {
      const jsonCompatRows = rows.map((row) => {
        const output: any = {};
        for (const k of Object.keys(row)) {
          const val = row[k];
          if (val === undefined) {
            output[k] = null;
          } else {
            output[k] = val;
          }
        }
        return output;
      });

      const dbRows = mapToSnakeCase(jsonCompatRows);
      const primaryKey = tableName === 'access_codes' ? 'code' : 'id';
      const { error } = await activeClient
        .from(tableName)
        .upsert(dbRows, { onConflict: primaryKey });

      if (error) {
        console.error(`Error upserting to "${tableName}":`, error.message, error.details);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`Exception upserting to "${tableName}":`, err);
      return false;
    }
  },
};
