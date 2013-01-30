
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"app": function(exports, require, module) {(function() {
  var App, LOVE, Particle, perf;

  window.requestAnimationFrame || (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(function() {
      return callback;
    }, 1000 / 60);
  });

  window.cancelAnimationFrame || (window.cancelAnimationFrame = window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || function(id) {
    return clearTimeout(id);
  });

  window.performance || (window.performance = {});

  perf = window.performance;

  perf.now || (perf.now = perf.webkitNow || perf.mozNow || perf.msNow || perf.oNow || function() {
    return +(new Date());
  });

  Particle = require('particle');

  LOVE = {
    love: 50,
    hate: 25,
    loveRadius: 400,
    hateRadius: 50
  };

  App = (function() {

    function App() {}

    App.init = function() {
      this.canvas = document.getElementById('scene');
      this.context = this.canvas.getContext('2d');
      this.man = new Particle({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height
      }, 30, 144, 255, LOVE);
      this.girl = new Particle({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height
      }, 255, 20, 147, LOVE);
      this.particles = [];
      this.particles.push(this.man);
      this.particles.push(this.girl);
      return this.iterations = 0;
    };

    App.update = function() {
      var d, p, p1, p2, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = this.particles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p1 = _ref[_i];
        _ref1 = this.particles;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          p2 = _ref1[_j];
          if (p1 === p2) {
            continue;
          }
          v = {
            x: p2.pos.x - p1.pos.x,
            y: p2.pos.y - p1.pos.y
          };
          d = Math.sqrt(v.x * v.x + v.y * v.y);
          if (d < p1.loveRadius) {
            v.x /= d;
            v.y /= d;
            p1.addForce(v.x * 1 / d * p1.love, v.y * 1 / d * p1.love);
            if (d < p1.hateRadius) {
              p1.addForce(-v.x * 1 / d * p1.hate, -v.y * 1 / d * p1.hate);
            }
          }
        }
      }
      _ref2 = this.particles;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        p = _ref2[_k];
        p.update(this.canvas);
      }
      return this.iterations++;
    };

    App.draw = function() {
      var p, _i, _len, _ref, _results;
      this.context.fillStyle = 'rgba(0, 0, 0, 0.04)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.lineWidth = Particle.SIZE;
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
      _ref = this.particles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        _results.push(p.draw(this.context));
      }
      return _results;
    };

    App.loop = function(time) {
      if (time == null) {
        time = perf.now();
      }
      App.update();
      App.draw();
      return window.requestAnimationFrame(App.loop);
    };

    App.config = function(gender, options) {
      return this[gender].config(options);
    };

    return App;

  }).call(this);

  module.exports = App;

}).call(this);
}, "particle": function(exports, require, module) {(function() {
  var Particle, VEL_LIMIT, VEL_SOFT_LIMIT;

  VEL_LIMIT = 20;

  VEL_SOFT_LIMIT = 10;

  Particle = (function() {

    function Particle(pos, r, g, b, options) {
      this.pos = pos;
      this.r = r;
      this.g = g;
      this.b = b;
      this.oldPos = {
        x: this.pos.x,
        y: this.pos.y
      };
      this.vel = {
        x: 1,
        y: 1
      };
      this.accel = {
        x: 0,
        y: 0
      };
      this.config(options);
    }

    Particle.prototype.update = function(canvas) {
      var force, _i, _len, _ref;
      this.oldPos.x = this.pos.x;
      this.oldPos.y = this.pos.y;
      this.accel.x = this.accel.y = 0;
      if (this.forces != null) {
        _ref = this.forces;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          force = _ref[_i];
          this.accel.x += force.x;
          this.accel.y += force.y;
        }
        this.forces.length = 0;
      }
      this.vel.x += this.accel.x;
      this.vel.y += this.accel.y;
      if (this.vel.x > VEL_LIMIT) {
        this.vel.x = VEL_LIMIT;
      } else if (this.vel.x < -VEL_LIMIT) {
        this.vel.x = -VEL_LIMIT;
      }
      if (this.vel.y > VEL_LIMIT) {
        this.vel.y = VEL_LIMIT;
      } else if (this.vel.y < -VEL_LIMIT) {
        this.vel.y = -VEL_LIMIT;
      }
      if (this.vel.x > VEL_SOFT_LIMIT || this.vel.x < -VEL_SOFT_LIMIT) {
        this.vel.x *= 0.9;
      }
      if (this.vel.y > VEL_SOFT_LIMIT || this.vel.y < -VEL_SOFT_LIMIT) {
        this.vel.y *= 0.9;
      }
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      if (this.pos.x < Particle.SIZE_2 || this.pos.x > canvas.width - Particle.SIZE_2) {
        this.vel.x = -this.vel.x;
      }
      if (this.pos.y < Particle.SIZE_2 || this.pos.y > canvas.height - Particle.SIZE_2) {
        this.vel.y = -this.vel.y;
      }
      if (this.pos.x < Particle.SIZE_2) {
        this.pos.x = Particle.SIZE_2;
      }
      if (this.pos.y < Particle.SIZE_2) {
        this.pos.y = Particle.SIZE_2;
      }
      if (this.pos.x > canvas.width - Particle.SIZE_2) {
        this.pos.x = canvas.width - Particle.SIZE_2;
      }
      if (this.pos.y > canvas.height - Particle.SIZE_2) {
        return this.pos.y = canvas.height - Particle.SIZE_2;
      }
    };

    Particle.prototype.draw = function(ctx) {
      ctx.strokeStyle = 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', 1)';
      ctx.beginPath();
      ctx.moveTo(this.oldPos.x, this.oldPos.y);
      ctx.lineTo(this.pos.x, this.pos.y);
      return ctx.stroke();
    };

    Particle.prototype.addForce = function(fx, fy) {
      this.forces = this.forces || [];
      this.forces.push({
        x: fx,
        y: fy
      });
    };

    Particle.prototype.config = function(options) {
      this.love = options.love;
      this.hate = options.hate;
      this.loveRadius = options.loveRadius;
      return this.hateRadius = options.hateRadius;
    };

    Particle.SIZE = 8;

    Particle.SIZE_2 = Particle.SIZE / 2;

    return Particle;

  })();

  module.exports = Particle;

}).call(this);
}});
