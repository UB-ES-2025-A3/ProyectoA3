package com.eventmanager;

import com.eventmanager.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.*;

public class PasswordPolicyTest {
  Pattern p = Pattern.compile(SecurityConfig.PASSWORD_REGEX);

  @Test void acepta_valida() { assertTrue(p.matcher("Abc!123").matches()); }
  @Test void rechaza_sin_mayus() { assertFalse(p.matcher("abc!123").matches()); }
  @Test void rechaza_sin_minus() { assertFalse(p.matcher("ABC!123").matches()); }
  @Test void rechaza_sin_num()   { assertFalse(p.matcher("Abc!Abc").matches()); }
  @Test void rechaza_sin_esp()   { assertFalse(p.matcher("Abc1234").matches()); }
  @Test void rechaza_corta()     { assertFalse(p.matcher("Aa!1").matches()); }
}
