chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'bounds': {
      'width': 700,
      'height': 700,
      'left': 0,
      'top': 0
    }
  });
});