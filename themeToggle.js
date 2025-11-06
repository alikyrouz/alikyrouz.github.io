function toggleTheme() {
  var body = document.body
  const currentTheme = body.getAttribute('data-theme');
  body.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
}