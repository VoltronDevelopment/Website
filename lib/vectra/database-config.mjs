import ca from "./supabase-ca.json" with { type: "json" };

export function databaseConfig(connectionString) {
  if (!connectionString) throw new Error("Vera database connection missing");
  const url = new URL(connectionString);
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(parameter);
  return {
    connectionString: url.toString(),
    ssl: local ? false : { ca, rejectUnauthorized: true },
    connectionTimeoutMillis: 6000,
    statement_timeout: 6000,
  };
}
