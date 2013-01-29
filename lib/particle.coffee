VEL_LIMIT = 20;
VEL_SOFT_LIMIT = 10;

class Particle
  constructor: (@pos, @r, @g, @b, options) ->
    @oldPos = x: @pos.x, y: @pos.y
    @vel = x: 1, y: 1
    @accel = x: 0, y: 0
    @config options

  update: (canvas) ->
    @oldPos.x = @pos.x
    @oldPos.y = @pos.y

    @accel.x = @accel.y = 0

    # forces
    if @forces?
      for force in @forces
        @accel.x += force.x
        @accel.y += force.y
      @forces.length = 0

    # velocity integration
    @vel.x += @accel.x
    @vel.y += @accel.y

    # velocity clamping
    if @vel.x > VEL_LIMIT then @vel.x = VEL_LIMIT
    else if @vel.x < -VEL_LIMIT then @vel.x = -VEL_LIMIT
    if @vel.y > VEL_LIMIT then @vel.y = VEL_LIMIT
    else if @vel.y < -VEL_LIMIT then @vel.y = -VEL_LIMIT

    # velocity friction
    @vel.x *= 0.9 if @vel.x > VEL_SOFT_LIMIT or @vel.x < -VEL_SOFT_LIMIT
    @vel.y *= 0.9 if @vel.y > VEL_SOFT_LIMIT or @vel.y < -VEL_SOFT_LIMIT

    # position integration
    @pos.x += @vel.x
    @pos.y += @vel.y

    # bounce on borders
    @vel.x = -@vel.x if @pos.x < Particle.SIZE_2 or @pos.x > canvas.width - Particle.SIZE_2
    @vel.y = -@vel.y if @pos.y < Particle.SIZE_2 or @pos.y > canvas.height - Particle.SIZE_2

    # ensure particle is not outside
    @pos.x = Particle.SIZE_2 if @pos.x < Particle.SIZE_2
    @pos.y = Particle.SIZE_2 if @pos.y < Particle.SIZE_2
    @pos.x = canvas.width - Particle.SIZE_2 if @pos.x > canvas.width - Particle.SIZE_2
    @pos.y = canvas.height - Particle.SIZE_2 if @pos.y > canvas.height - Particle.SIZE_2

  draw: (ctx) ->
    ctx.strokeStyle = 'rgba(' + @r + ', ' + @g + ', ' + @b + ', 1)';

    ctx.beginPath()
    ctx.moveTo @oldPos.x, @oldPos.y
    ctx.lineTo @pos.x, @pos.y
    ctx.stroke()

  addForce: (fx, fy) ->
    @forces = @forces || []
    @forces.push x: fx, y: fy
    return

  config: (options) ->
    console.log options
    @love = options.love
    @hate = options.hate
    @loveRadius = options.loveRadius
    @hateRadius = options.hateRadius

  @SIZE: 8
  @SIZE_2: @SIZE / 2

module.exports = Particle
