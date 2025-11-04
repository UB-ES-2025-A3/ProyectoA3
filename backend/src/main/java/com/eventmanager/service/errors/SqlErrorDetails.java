package com.eventmanager.service.errors;

import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SqlErrorDetails {
  private static final Pattern COL_NOT_EXISTS =
      Pattern.compile("column\\s+\"?([^\"]+)\"?\\s+does not exist", Pattern.CASE_INSENSITIVE);
  private static final Pattern REL_NOT_EXISTS =
      Pattern.compile("relation\\s+\"?([^\"]+)\"?\\s+does not exist", Pattern.CASE_INSENSITIVE);
  private static final Pattern SYNTAX_NEAR =
      Pattern.compile("syntax error at or near\\s+\"?([^\"]+)\"?", Pattern.CASE_INSENSITIVE);

  private SqlErrorDetails() {}

  public static record Parsed(String kind, String name, String message, String sqlState) {}

  public static Parsed from(Throwable ex) {
    Throwable root = getRootCause(ex);
    String msg = root.getMessage() != null ? root.getMessage() : String.valueOf(ex.getMessage());
    String sqlState = extractSqlState(root);

    Matcher m1 = COL_NOT_EXISTS.matcher(msg);
    if (m1.find()) return new Parsed("COLUMN_NOT_FOUND", m1.group(1), sanitize(msg), sqlState);

    Matcher m2 = REL_NOT_EXISTS.matcher(msg);
    if (m2.find()) return new Parsed("TABLE_NOT_FOUND", m2.group(1), sanitize(msg), sqlState);

    Matcher m3 = SYNTAX_NEAR.matcher(msg);
    if (m3.find()) return new Parsed("SQL_SYNTAX_ERROR", m3.group(1), sanitize(msg), sqlState);

    return new Parsed("SCHEMA_MISMATCH", null, sanitize(msg), sqlState);
  }

  private static String extractSqlState(Throwable t) {
    if (t instanceof SQLException se) return se.getSQLState();
    return null;
  }

  private static Throwable getRootCause(Throwable t) {
    Throwable cur = t;
    while (cur.getCause() != null && cur.getCause() != cur) cur = cur.getCause();
    return cur;
  }

  private static String sanitize(String s) {
    if (s == null) return null;
    s = s.replace("\n", " ").replace("\r", " ").trim();
    return s.length() > 500 ? s.substring(0, 500) + "…" : s;
    }
}
