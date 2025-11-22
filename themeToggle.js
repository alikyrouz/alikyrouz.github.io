function toggleTheme() {

  var body = document.body;

  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  body.setAttribute('data-theme', newTheme);
  localStorage.setItem("theme", newTheme);
}

function setTheme() {

  //if localStorage.getItem("theme") exists, currentTheme = that
  // else, currentTheme = 'dark'

var currentTheme = localStorage.getItem('theme');

if (!currentTheme){
 currentTheme = 'dark'
}

  document.body.setAttribute('data-theme', currentTheme)
}