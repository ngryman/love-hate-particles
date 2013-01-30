window.requestAnimationFrame ||=
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  (callback) ->
    window.setTimeout( ->
      callback()
    , 1000 / 60)

window.cancelAnimationFrame ||=
  window.webkitCancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame    ||
  window.oCancelRequestAnimationFrame      ||
  window.msCancelRequestAnimationFrame     ||
  (id) ->
    clearTimeout(id)

window.performance ||= {}
perf = window.performance
perf.now ||=
  perf.webkitNow ||
  perf.mozNow    ||
  perf.msNow     ||
  perf.oNow      ||
  ->
    +(new Date())

Particle = require 'particle'

LOVE =
  love: 50
  hate: 25
  loveRadius: 400
  hateRadius: 50

class App
  @init: ->
    @canvas = document.getElementById 'scene'
    @context = @canvas.getContext '2d'

    @man = new Particle
      x: Math.random() * @canvas.width
      y: Math.random() * @canvas.height
      30, 144, 255, LOVE
    @girl = new Particle
      x: Math.random() * @canvas.width
      y: Math.random() * @canvas.height
      255, 20, 147, LOVE

    @particles = []
    @particles.push @man
    @particles.push @girl

    @iterations = 0

  @update: ->
    # test if particule is influenced by other ones
    for p1 in @particles
      for p2 in @particles
        continue if (p1 is p2)

        # distance between p1 and p2
        v =
          x: p2.pos.x - p1.pos.x
          y: p2.pos.y - p1.pos.y
        d = Math.sqrt v.x * v.x + v.y * v.y

        # there is an attraction here!
        if d < p1.loveRadius
          v.x /= d
          v.y /= d

          p1.addForce v.x * 1 / d * p1.love, v.y * 1 / d * p1.love
          if d < p1.hateRadius
            p1.addForce -v.x * 1 / d * p1.hate, -v.y * 1 / d * p1.hate

    # update
    p.update @canvas for p in @particles

    @iterations++

  @draw: ->
    @context.fillStyle = 'rgba(0, 0, 0, 0.04)'
    @context.fillRect 0, 0, @canvas.width, @canvas.height

    @context.lineWidth = Particle.SIZE
    @context.lineCap = 'round'
    @context.lineJoin = 'round'

    p.draw @context for p in @particles

  @loop: (time = perf.now()) =>
    @update()
    @draw()
    window.requestAnimationFrame @loop

  @config: (gender, options) ->
    @[gender].config options

module.exports = App
