const ALLOWED_CHARS = /^[0-9+\-*/().%\s]+$/;

function calculateExpression(expression) {
  if (!expression || typeof expression !== 'string') {
    return 'Invalid expression';
  }

  if (!ALLOWED_CHARS.test(expression)) {
    return 'Expression contains invalid characters';
  }

  try {
    const result = eval(expression);
    return result.toString();
  } catch (err) {
    console.error('Failed to evaluate expression:', err.message);
    return 'Sorry, I could not evaluate that expression.';
  }
}

module.exports = { calculateExpression };
