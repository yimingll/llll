/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc
Methods:
PluginManager.DialogueSystem.enable()
PluginManager.DialogueSystem.disable()
PluginManager.DialogueSystem.talk(x, y)

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}

@enum-value dialogueEvent
@alias #dialogueEvent
@filter actor-event

@attribute-key switchToPreventDialog
@alias #switchToPreventDialog
@filter actor

@number triggerDistance
@alias #triggerDistance
@clamp 0.1 4

@keycode triggerKey
@alias #triggerKey
@default 'Enter'

@number selectionTop
@alias #selectionTop
@clamp 0 4

@number selectionLeft
@alias #selectionLeft
@clamp 0 4

@number selectionRight
@alias #selectionRight
@clamp 0 4

@number selectionBottom
@alias #selectionBottom
@clamp 0 4

@color outlineColor
@alias #outlineColor
@default ffff00ff

@lang en
#plugin Actor Dialogue System
#state State
#state-enabled Enabled
#state-disabled Disabled
#dialogueEvent Dialogue Event
#switchToPreventDialog Switch to Prevent Dialog
#triggerDistance Trigger Distance
#triggerKey Trigger Key
#selectionTop Selection Top
#selectionLeft Selection Left
#selectionRight Selection Right
#selectionBottom Selection Bottom
#outlineColor Outline Color

@lang zh
#plugin 角色对话系统
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#dialogueEvent 角色对话事件
#switchToPreventDialog 阻止对话事件的开关
#triggerDistance 事件触发距离
#triggerKey 事件触发按键
#selectionTop 选择区域上边距
#selectionLeft 选择区域左边距
#selectionRight 选择区域右边距
#selectionBottom 选择区域下边距
#outlineColor 选中角色描边颜色
*/

export default class DialogueSystem {
  enabled = true
  actor = null
  dialogTarget = null
  suspendedEvent = null
  transparentColor = new Float64Array(4)
  offsets = [
    {ox:  0, oy:  0},
    {ox: -1, oy:  0},
    {ox:  1, oy:  0},
    {ox:  0, oy: -1},
    {ox:  0, oy:  1},
  ]

  onStart() {
    // 设置初始状态
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    this.outlineColor = Color.parseFloatArray(this.outlineColor)
    // 如果描边颜色是不透明的，设为255
    // 因为着色器可能绘制出半透明轮廓线
    // 这么设置让图像轮廓变得完全不透明
    if (this.outlineColor[3] === 1) {
      this.outlineColor[3] = 255
    }
    Scene.on('create', scene => scene.renderers.push(this))
    Scene.on('destroy', () => this.handleSuspendedEvent())
    Scene.on('keydown', () => this.onKeyDown())
    Scene.on('mousemove', () => this.onMouseMove())
  }

  // 处理挂起的事件
  handleSuspendedEvent() {
    if (this.suspendedEvent) {
      this.suspendedEvent = null
      Scene.restoreInput()
    }
  }

  // 启用
  enable() {
    if (!this.enabled) {
      this.enabled = true
      delete this.render
      delete this.onKeyDown
      delete this.onMouseMove
    }
  }

  // 禁用
  disable() {
    if (this.enabled) {
      this.enabled = false
      this.actor = null
      this.render = Function.empty
      this.onKeyDown = Function.empty
      this.onMouseMove = Function.empty
    }
  }

  // 渲染轮廓
  render() {
    const actor = this.actor
    if (actor === null) return
    if (actor.active === false ||
      actor.animation === null) {
      this.actor = null
      return
    }
    const ox = Input.mouse.sceneX
    const oy = Input.mouse.sceneY
    const st = actor.y - this.selectionTop
    const sl = actor.x - this.selectionLeft
    const sr = actor.x + this.selectionRight
    const sb = actor.y + this.selectionBottom
    if (ox < sl || ox >= sr || oy < st || oy >= sb) {
      this.actor = null
      return
    }
    const gl = GL
    const vertices = gl.arrays[0].float32
    gl.enable(gl.DEPTH_TEST)
    const {animation} = actor
    const {contexts} = animation
    const {count} = contexts
    for (const {ox, oy} of this.offsets) {
      let color
      if (ox === 0 && oy === 0) {
        gl.depthFunc(gl.ALWAYS)
        color = this.transparentColor
      } else {
        gl.depthFunc(gl.NOTEQUAL)
        color = this.outlineColor
      }
      const projMatrix = gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(
        ox - Camera.scrollLeft,
        oy - Camera.scrollTop,
      )
      for (let i = 0; i < count; i++) {
        const context = contexts[i]
        const {layer} = context
        if (layer.class === 'sprite' &&
          context.frame !== null) {
          const key = layer.sprite
          const texture = animation.getTexture(key)
          if (texture !== null) {
            const matrix = context.matrix
            const frame = context.frame
            const base = texture.base
            const tw = base.width
            const th = base.height
            const sw = texture.width
            const sh = texture.height
            const sx = frame.spriteX * sw
            const sy = frame.spriteY * sh
            const L = texture.offsetX
            const T = texture.offsetY
            const R = L + sw
            const B = T + sh
            const a = matrix[0]
            const b = matrix[1]
            const c = matrix[3]
            const d = matrix[4]
            const e = matrix[6]
            const f = matrix[7]
            const x1 = a * L + c * T + e
            const y1 = b * L + d * T + f
            const x2 = a * L + c * B + e
            const y2 = b * L + d * B + f
            const x3 = a * R + c * B + e
            const y3 = b * R + d * B + f
            const x4 = a * R + c * T + e
            const y4 = b * R + d * T + f
            const sl = sx / tw
            const st = sy / th
            const sr = (sx + sw) / tw
            const sb = (sy + sh) / th
            vertices[0] = x1
            vertices[1] = y1
            vertices[2] = sl
            vertices[3] = st
            vertices[4] = x2
            vertices[5] = y2
            vertices[6] = sl
            vertices[7] = sb
            vertices[8] = x3
            vertices[9] = y3
            vertices[10] = sr
            vertices[11] = sb
            vertices[12] = x4
            vertices[13] = y4
            vertices[14] = sr
            vertices[15] = st
            const program = gl.imageProgram.use()
            gl.bindVertexArray(program.vao.a110)
            gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
            gl.uniform1i(program.u_LightMode, 0)
            gl.uniform1i(program.u_ColorMode, 1)
            gl.uniform4fv(program.u_Color, color)
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
            gl.bindTexture(gl.TEXTURE_2D, base.glTexture)
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
          }
        }
      }
    }
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.DEPTH_TEST)
  }

  // 通过鼠标获取角色
  getActorByPosition(px, py) {
    let target = null
    let weight = Infinity
    const st = py - this.selectionBottom
    const sl = px - this.selectionRight
    const sr = px + this.selectionLeft
    const sb = py + this.selectionTop
    const cells = Scene.actors.cells.get(sl, st, sr, sb)
    const length = cells.count
    for (let i = 0; i < length; i++) {
      for (const actor of cells[i]) {
        if (actor.events[this.dialogueEvent] &&
          !actor.attributes[this.switchToPreventDialog] &&
          actor !== Party.player && actor.active && actor.animation) {
          const {x, y} = actor
          if (x >= sl && x < sr && y >= st && y < sb) {
            const dist = Math.dist(px, py, x, y)
            if (target === null || dist < weight) {
              target = actor
              weight = dist
            }
          }
        }
      }
    }
    return target
  }

  // 通过键盘获取角色
  getActorByKeyboard() {
    let target = null
    let weight = Infinity
    if (Party.player?.active) {
      const px = Party.player.x
      const py = Party.player.y
      const r = this.triggerDistance
      const cells = Scene.actors.cells.get(px - r, py - r, px + r, py + r)
      const length = cells.count
      for (let i = 0; i < length; i++) {
        for (const actor of cells[i]) {
          if (actor.events[this.dialogueEvent] &&
            !actor.attributes[this.switchToPreventDialog] &&
            actor.active && actor.animation) {
            const dist = Math.dist(px, py, actor.x, actor.y)
            if (dist <= r && (target === null || dist < weight)) {
              target = actor
              weight = dist
            }
          }
        }
      }
    }
    return target
  }

  // 设置角色角度
  setActorAngle(actor) {
    const distY = Party.player.y - actor.y
    const distX = Party.player.x - actor.x
    actor.setAngle(Math.atan2(distY, distX), '', 0)
  }

  // 选择角色并进行对话
  talk(x, y) {
    if (!this.enabled) return null
    const actor = this.getActorByPosition(x, y)
    if (actor && this.dialogTarget !== actor && !actor.attributes[this.switchToPreventDialog] && Party.player?.active) {
      this.dialogTarget = actor
      Party.player.navigator.followCircle(actor, 0, this.triggerDistance, 0, true, true)
      Party.player.navigator.onFinish(() => {
        if (this.dialogTarget !== actor) return
        this.dialogTarget = null
        if (actor.active && Math.dist(Party.player.x, Party.player.y, actor.x, actor.y) <= this.triggerDistance) {
          this.setActorAngle(actor)
          const event = actor.callEvent(this.dialogueEvent)
          if (event?.complete === false) {
            this.suspendedEvent = event
            Scene.preventInput()
            event.onFinish(() => {
              this.handleSuspendedEvent()
            })
          }
        }
      })
    }
    return actor
  }

  // 键盘按下事件
  onKeyDown() {
    if (Input.event.code === this.triggerKey) {
      const actor = this.getActorByKeyboard()
      if (actor && !actor.attributes[this.switchToPreventDialog]) {
        this.setActorAngle(actor)
        actor.callEvent(this.dialogueEvent)
      }
    }
  }

  // 鼠标移动事件
  onMouseMove() {
    const x = Input.mouse.sceneX
    const y = Input.mouse.sceneY
    const actor = this.getActorByPosition(x, y)
    if (this.actor !== actor) {
      this.actor = actor
    }
  }
}