function throttle(type, name, obj) {
  var running = false;
  
  obj = obj || window;

  var func = function() {
    if (running) return;

    running = true;

    requestAnimationFrame(function() {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };

   obj.addEventListener(type, func);
}