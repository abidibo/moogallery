(function() {

  var ajsut = window.ajsut = {};
  var queue = [], paused = false, results;

  var get_results = function() {
    return results
      ? results
      : (results = document.getElementById('results'))
        ? results
        : results = (function() { var ul = document.createElement('ul'); ul.setAttribute('id', 'results'); document.body.appendChild(ul); return ul;})();
  };

  var run_test = function() {
    if(!paused && queue.length) {
      queue.shift()();
      if(!paused) {
        ajsut.resume();
      }
    }
  };

  var performance = function(fn, max_cnt) {
    var start = new Date().getTime();
    for(var n = 0; n < max_cnt; n++) {
      fn();
    }
    return new Date().getTime() - start;
  };

  var average = function(a) {
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
  };

  ajsut.pause = function() {
    paused = true;
  };

  ajsut.resume = function() {
    paused = false;
    results = undefined;
    setTimeout(run_test, 1);
  };

  ajsut.assert = function(value, desc) {
    var li = document.createElement('li');
    li.className = value ? 'passed' : 'failed';
    li.appendChild(document.createTextNode(desc));
    get_results().appendChild(li);
    if(!value) {
      li.parentNode.parentNode.className = 'failed';
    }
    return li;
  };

  ajsut.test = function(name, fn) {
    queue.push(function() {
      results = !results ? get_results() : document.getElementById('results');
      results = ajsut.assert(true, name).appendChild(document.createElement('ul'));
      fn();
    })
    run_test();
  };

  ajsut.performance = function(name, fn, max_cnt) {
    max_cnt = max_cnt || 10000;
    var elapsed = performance(fn, max_cnt);
    ajsut.test(name, function() {
      ajsut.assert(true, 'performance measured time: ' + elapsed);
    });
  };

  ajsut.meanPerformance = function(name, fn, max_cnt, set_num) {
    max_cnt = max_cnt || 10000;
    set_num = set_num || 100;
    var set = [];
    for(var i = 0; i < set_num; i++) {
      set.push(performance(fn, max_cnt));
    }

    var x = average(set);

    ajsut.test(name, function() {
      ajsut.assert(true, 'performance measured time: ' + x.mean + ' ' + String.fromCharCode(177) + ' ' + x.deviation);
    });

  };

})()
