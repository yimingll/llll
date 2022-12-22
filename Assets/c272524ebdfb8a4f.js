/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}
@desc #state-desc

@color movementPathColor
@alias #movementPathColor
@desc #movementPathColor-desc
@default 00ff00c0

@color followingPathColor
@alias #followingPathColor
@desc #followingPathColor-desc
@default ffff00c0

@lang en
#plugin Movement Path
#desc
Debugging tool for drawing movement paths

Script methods:
PluginManager.MovementPath.enable()
PluginManager.MovementPath.disable()
PluginManager.MovementPath.switch()
#state Initial State
#state-enabled Enabled
#state-disabled Disabled
#state-desc This plugin can be switched later by script
#movementPathColor Movement Path Color
#movementPathColor-desc The color of the movement path arrows
#followingPathColor Following Path Color
#followingPathColor-desc The color of the following path arrows

@lang zh
#plugin 移动路径
#desc
用于绘制角色移动路径的调试工具

脚本方法:
PluginManager.MovementPath.enable()
PluginManager.MovementPath.disable()
PluginManager.MovementPath.switch()
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#state-desc 可以通过脚本方法开关插件
#movementPathColor 移动路径颜色
#movementPathColor-desc 绘制移动路径箭头的颜色
#followingPathColor 跟随路径颜色
#followingPathColor-desc 绘制跟随路径箭头的颜色
*/

export default class MovementPath {
  enabled //:boolean
  texture //:object

  onStart() {
    // 设置初始状态
    this.enabled = true
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    // 侦听事件
    Scene.on('create', scene => {
      scene.renderers.push(this)
    })

    // 生成CSS颜色
    const [mr, mg, mb, ma] = Color.parseIntArray(this.movementPathColor)
    const [fr, fg, fb, fa] = Color.parseIntArray(this.followingPathColor)
    const styles = [
      `rgba(${mr}, ${mg}, ${mb}, ${ma / 255})`,
      `rgba(${fr}, ${fg}, ${fb}, ${fa / 255})`,
    ]

    // 创建路径箭头纹理
    const canvas = document.createElement('canvas')
    canvas.width = 40
    canvas.height = 64
    const context = canvas.getContext('2d')
    for (let i = 0; i < 2; i++) {
      const y = i * 32
      context.beginPath()
      context.moveTo(6, y + 4)
      context.lineTo(34, y + 16)
      context.lineTo(6, y + 28)
      context.closePath()
      context.fillStyle = styles[i]
      context.fill()
    }
    this.texture = new Texture({
      magFilter: this.LINEAR,
      minFilter: this.LINEAR,
    })
    this.texture.fromImage(canvas)
  }

  // 启用
  enable() {
    if (!this.enabled) {
      this.enabled = true
      delete this.render
    }
  }

  // 禁用
  disable() {
    if (this.enabled) {
      this.enabled = false
      this.render = Function.empty
    }
  }

  // 开关
  switch() {
    switch (this.enabled) {
      case false: return this.enable()
      case true: return this.disable()
    }
  }

  // 渲染
  render() {
    const WIDTH = 10
    const OFFSET = 4
    const gl = GL
    const vertices = gl.arrays[0].float32
    const coords = gl.arrays[1].float64
    const arrowOffset = -Time.timestamp % 1000 / 2000 * WIDTH
    const {dist} = Math
    let vi = 0

    // 计算可见角色的移动路线
    const convert = Scene.convert
    const convert2f = Scene.convert2f
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const actor = actors[i]
      const {navigator} = actor
      if (navigator.movementPath) {
        // 计算线段顶点坐标
        const path = navigator.movementPath
        let distance = 0
        let ci = 0
        const {x, y} = convert(actor)
        coords[ci    ] = x
        coords[ci + 1] = y
        coords[ci + 2] = 0
        coords[ci + 3] = 0
        ci += 4
        const start = path.index
        const length = path.length
        for (let i = start; i < length; i += 2) {
          const {x, y} = convert2f(path[i], path[i + 1])
          const scale = dist(coords[ci - 4], coords[ci - 3], x, y)
          distance += scale
          coords[ci    ] = x
          coords[ci + 1] = y
          coords[ci + 2] = scale
          coords[ci + 3] = distance
          ci += 4
        }
        // 设置三角带中继点
        for (let i = 4; i < ci; i += 4) {
          const x1 = coords[i - 4]
          const y1 = coords[i - 3]
          const x2 = coords[i    ]
          const y2 = coords[i + 1]
          const scale = coords[i + 2]
          const ox = (y1 - y2) / scale * OFFSET
          const oy = (x2 - x1) / scale * OFFSET
          const uvx1 = (coords[i - 1] - distance) / WIDTH + arrowOffset
          const uvx2 = (coords[i + 3] - distance) / WIDTH + arrowOffset
          vertices[vi    ] = x1 - ox
          vertices[vi + 1] = y1 - oy
          vertices[vi + 2] = uvx1
          vertices[vi + 3] = 0
          vertices[vi + 4] = x1 + ox
          vertices[vi + 5] = y1 + oy
          vertices[vi + 6] = uvx1
          vertices[vi + 7] = 0.5
          vertices[vi + 8] = x2 + ox
          vertices[vi + 9] = y2 + oy
          vertices[vi + 10] = uvx2
          vertices[vi + 11] = 0.5
          vertices[vi + 12] = x2 - ox
          vertices[vi + 13] = y2 - oy
          vertices[vi + 14] = uvx2
          vertices[vi + 15] = 0
          vi += 16
        }
        continue
      }
      if (navigator.target) {
        const {target} = navigator
        const {x: x1, y: y1} = convert(actor)
        const {x: x2, y: y2} = convert(target)
        const distance = dist(x1, y1, x2, y2)
        const scale = distance
        const ox = (y1 - y2) / scale * OFFSET
        const oy = (x2 - x1) / scale * OFFSET
        const uvx1 = arrowOffset - distance / WIDTH
        const uvx2 = arrowOffset
        vertices[vi    ] = x1 - ox
        vertices[vi + 1] = y1 - oy
        vertices[vi + 2] = uvx1
        vertices[vi + 3] = 0.5
        vertices[vi + 4] = x1 + ox
        vertices[vi + 5] = y1 + oy
        vertices[vi + 6] = uvx1
        vertices[vi + 7] = 1
        vertices[vi + 8] = x2 + ox
        vertices[vi + 9] = y2 + oy
        vertices[vi + 10] = uvx2
        vertices[vi + 11] = 1
        vertices[vi + 12] = x2 - ox
        vertices[vi + 13] = y2 - oy
        vertices[vi + 14] = uvx2
        vertices[vi + 15] = 0.5
        vi += 16
        continue
      }
    }

    // 绘制图像
    if (vi !== 0) {
      gl.blend = 'additive'
      const program = gl.imageProgram.use()
      gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-Camera.scrollLeft, -Camera.scrollTop)
      gl.bindVertexArray(program.vao.a110)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, this.texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
    }
  }
}