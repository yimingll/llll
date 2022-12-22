/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}

@color triggerShapeColor
@alias #triggerShapeColor
@default 00ff00c0

@color actorAnchorColor
@alias #actorAnchorColor
@default 00ff00c0

@number actorAnchorSize
@alias #actorAnchorSize
@clamp 0.5 4
@default 1

@lang en
#plugin Trigger Shape Renderer
#desc
Debugging tool for drawing trigger shapes

Script methods:
PluginManager.TriggerShapeRenderer.enable()
PluginManager.TriggerShapeRenderer.disable()
PluginManager.TriggerShapeRenderer.switch()
#state Initial State
#state-enabled Enabled
#state-disabled Disabled
#triggerShapeColor Trigger Shape Color
#actorAnchorColor Actor Anchor Color
#actorAnchorSize Actor Anchor Size

@lang zh
#plugin 触发器形状渲染器
#desc
用于绘制触发器形状的调试工具

脚本方法:
PluginManager.TriggerShapeRenderer.enable()
PluginManager.TriggerShapeRenderer.disable()
PluginManager.TriggerShapeRenderer.switch()
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#triggerShapeColor 触发器形状颜色
#actorAnchorColor 角色锚点颜色
#actorAnchorSize 角色锚点大小
*/

export default class TriggerShapeRenderer {
  enabled //:boolean

  onStart() {
    // 设置初始状态
    this.enabled = true
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    // 解析颜色
    this.triggerShapeColor = Color.parseFloatArray(this.triggerShapeColor)
    this.actorAnchorColor = Color.parseFloatArray(this.actorAnchorColor)

    // 侦听事件
    Scene.on('create', scene => {
      const {renderers} = scene
      const i = renderers.indexOf(Scene.spriteRenderer)
      if (i !== -1) renderers.splice(i, 0, {
        render: () => this.renderTriggerShapes(),
      })
      renderers.push({
        render: () => this.renderActorAnchors(),
      })
    })
  }

  // 启用
  enable() {
    if (!this.enabled) {
      this.enabled = true
      delete this.renderTriggerShapes
      delete this.renderActorAnchors
    }
  }

  // 禁用
  disable() {
    if (this.enabled) {
      this.enabled = false
      this.renderTriggerShapes = Function.empty
      this.renderActorAnchors = Function.empty
    }
  }

  // 开关
  switch() {
    switch (this.enabled) {
      case false: return this.enable()
      case true: return this.disable()
    }
  }

  // 渲染触发器形状
  renderTriggerShapes() {
    const gl = GL
    const matrix = gl.matrix
    const vertices = gl.arrays[0].float32
    const {cos, sin} = Math
    let vi = -4

    // 计算可见触发器的形状位置
    const scene = Scene.binding
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const al = Camera.animationLeft / tw
    const at = Camera.animationTop / th
    const ar = Camera.animationRight / tw
    const ab = Camera.animationBottom / th
    const triggers = Scene.triggers
    const length = triggers.length
    for (let i = 0; i < length; i++) {
      const trigger = triggers[i]
      const {x, y} = trigger
      if (x >= al && x < ar && y >= at && y < ab) {
        const {shape, scale} = trigger
        const si = vi
        vi += 4
        switch (shape.type) {
          case 'rectangle': {
            matrix
            .reset()
            .rotateAt(x, y, trigger.angle)
            const width = shape.width * scale
            const height = shape.height * scale
            const anchor = shape.anchor
            const dl = x - width * anchor
            const dt = y - height / 2
            const dr = x + width * (1 - anchor)
            const db = y + height / 2
            const a = matrix[0]
            const b = matrix[1]
            const c = matrix[3]
            const d = matrix[4]
            const e = matrix[6]
            const f = matrix[7]
            vertices[vi    ] = a * dl + c * dt + e
            vertices[vi + 1] = b * dl + d * dt + f
            vertices[vi + 2] = a * dl + c * db + e
            vertices[vi + 3] = b * dl + d * db + f
            vertices[vi + 4] = a * dr + c * dt + e
            vertices[vi + 5] = b * dr + d * dt + f
            vertices[vi + 6] = a * dr + c * db + e
            vertices[vi + 7] = b * dr + d * db + f
            vi += 8
            break
          }
          case 'circle': {
            const radius = shape.radius * scale
            const segments = Math.clamp(radius * 10, 40, 100)
            const step = Math.PI * 2 / segments
            for (let i = 0; i <= segments; i++) {
              const angle = i * step
              vertices[vi    ] = x + radius * cos(angle)
              vertices[vi + 1] = y + radius * sin(angle)
              vertices[vi + 2] = x
              vertices[vi + 3] = y
              vi += 4
            }
            break
          }
          case 'sector': {
            const radius = shape.radius * scale
            const centralAngle = shape.centralAngle
            const cRatio = centralAngle / 360
            const cAngle = Math.radians(centralAngle)
            const sAngle = trigger.angle - cAngle / 2
            const segments = Math.clamp(cRatio * radius * 10, 40, 100)
            const step = cAngle / segments
            for (let i = 0; i <= segments; i++) {
              const angle = sAngle + i * step
              vertices[vi    ] = x + radius * cos(angle)
              vertices[vi + 1] = y + radius * sin(angle)
              vertices[vi + 2] = x
              vertices[vi + 3] = y
              vi += 4
            }
            break
          }
        }
        vertices[si    ] = vertices[si - 2]
        vertices[si + 1] = vertices[si - 1]
        vertices[si + 2] = vertices[si + 4]
        vertices[si + 3] = vertices[si + 5]
      }
    }

    // 绘制图像
    if (vi > 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const program = gl.graphicProgram.use()
      matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st).scale(tw, th)
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.vertexAttrib4f(program.a_Color, ...this.triggerShapeColor)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vi / 2)
    }
  }

  // 渲染角色锚点
  renderActorAnchors() {
    const gl = GL
    const vertices = gl.arrays[0].float32
    let vi = 0

    // 计算可见角色的锚点位置
    const scene = Scene.binding
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const size = this.actorAnchorSize
    const ox1 = size / tw
    const oy1 = size / th
    const ox3 = ox1 * 3
    const oy3 = oy1 * 3
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const {x, y} = actors[i]
      const x1 = x - ox3
      const y1 = y - oy1
      const x2 = x + ox3
      const y2 = y + oy1
      const x3 = x - ox1
      const y3 = y - oy3
      const x4 = x + ox1
      const y4 = y + oy3
      vertices[vi    ] = x1
      vertices[vi + 1] = y1
      vertices[vi + 2] = x1
      vertices[vi + 3] = y2
      vertices[vi + 4] = x2
      vertices[vi + 5] = y2
      vertices[vi + 6] = x2
      vertices[vi + 7] = y1
      vertices[vi + 8] = x3
      vertices[vi + 9] = y3
      vertices[vi + 10] = x3
      vertices[vi + 11] = y4
      vertices[vi + 12] = x4
      vertices[vi + 13] = y4
      vertices[vi + 14] = x4
      vertices[vi + 15] = y3
      vi += 16
    }

    // 绘制图像
    if (vi !== 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const program = gl.graphicProgram.use()
      gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st).scale(tw, th)
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.vertexAttrib4f(program.a_Color, ...this.actorAnchorColor)
      gl.drawElements(gl.TRIANGLES, vi / 8 * 6, gl.UNSIGNED_INT, 0)
    }
  }
}