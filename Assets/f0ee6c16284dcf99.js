/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}
@desc #state-desc

@attribute health
@alias #health
@desc #health-desc
@filter actor
@default 'health'

@attribute maxHealth
@alias #maxHealth
@desc #maxHealth-desc
@filter actor
@default 'maxHealth'

@team playerTeamId
@alias #playerTeamId
@desc #playerTeamId-desc

@option specialBarEnabled {true, false}
@alias #specialBarEnabled {#specialBarEnabled-true, #specialBarEnabled-false}
@desc #specialBarEnabled-desc

@attribute specialAttr
@alias #specialAttr
@desc #specialAttr-desc
@filter actor
@cond specialBarEnabled {true}

@enum specialAttrValue
@alias #specialAttrValue
@desc #specialAttrValue-desc
@cond specialBarEnabled {true}

@file backgroundIdFriendly
@alias #backgroundIdFriendly
@filter image
@desc #backgroundIdFriendly-desc

@file foregroundIdFriendly
@alias #foregroundIdFriendly
@filter image
@desc #foregroundIdFriendly-desc

@file backgroundIdEnemy
@alias #backgroundIdEnemy
@filter image
@desc #backgroundIdEnemy-desc

@file foregroundIdEnemy
@alias #foregroundIdEnemy
@filter image
@desc #foregroundIdEnemy-desc

@file backgroundIdSpecial
@alias #backgroundIdSpecial
@filter image
@desc #backgroundIdSpecial-desc

@file foregroundIdSpecial
@alias #foregroundIdSpecial
@filter image
@desc #foregroundIdSpecial-desc

@number offsetY
@alias #offsetY
@desc #offsetY-desc
@default -48

@number scale
@alias #scale
@desc #scale-desc
@clamp 0.1 4
@default 1

@number opacity
@alias #opacity
@desc #opacity-desc
@clamp 0 1
@default 1

@lang en
#plugin Health Bar
#desc
Script methods:
PluginManager.HealthBar.enable()
PluginManager.HealthBar.disable()
PluginManager.HealthBar.switch()
#state Initial State
#state-enabled Enabled
#state-disabled Disabled
#state-desc This plugin can be switched later by script
#health Health Key
#health-desc The attribute name of the actor's health
#maxHealth Max Health Key
#maxHealth-desc The attribute name of the actor's max health
#playerTeamId Player Team
#playerTeamId-desc Affects the style of the health bar
#specialBarEnabled Special Health Bar
#specialBarEnabled-true Enabled
#specialBarEnabled-false Disabled
#specialBarEnabled-desc Toggle special health bar
#specialAttr Special Attr
#specialAttr-desc The attribute name of the special actor
#specialAttrValue Special Attr Value
#specialAttrValue-desc Show a special health bar if the value of special attribute is in this list
#backgroundIdFriendly BG Image (friendly)
#backgroundIdFriendly-desc Background image for the friendly actor's health bar
#foregroundIdFriendly FG Image (friendly)
#foregroundIdFriendly-desc Foreground image for the friendly actor's health bar
#backgroundIdEnemy BG Image (enemy)
#backgroundIdEnemy-desc Background image for the enemy actor's health bar
#foregroundIdEnemy FG Image (enemy)
#foregroundIdEnemy-desc Foreground image for the enemy actor's health bar
#backgroundIdSpecial BG Image (special)
#backgroundIdSpecial-desc Background image for the special actor's health bar
#foregroundIdSpecial FG Image (special)
#foregroundIdSpecial-desc Foreground image for the special actor's health bar
#offsetY Offset Y
#offsetY-desc The vertical offset distance of the health bar
#scale Scale
#scale-desc The scale Factor of the health bar
#opacity Opacity
#opacity-desc The opacity of the health bar

@lang zh
#plugin 生命值条
#desc
脚本方法:
PluginManager.HealthBar.enable()
PluginManager.HealthBar.disable()
PluginManager.HealthBar.switch()
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#state-desc 可以通过脚本方法开关插件
#health 生命值属性
#health-desc 角色的生命值属性名称
#maxHealth 最大生命值属性
#maxHealth-desc 角色的最大生命值属性名称
#playerTeamId 玩家所在的队伍
#playerTeamId-desc 影响显示的生命值条样式
#specialBarEnabled 特殊生命值条
#specialBarEnabled-true 开启
#specialBarEnabled-false 关闭
#specialBarEnabled-desc 开关特殊生命值条
#specialAttr 特殊属性
#specialAttr-desc 特殊角色拥有的属性名称
#specialAttrValue 特殊属性值
#specialAttrValue-desc 如果角色特殊属性的值是其中一个，则显示特殊生命值条
#backgroundIdFriendly 背景图像(友好)
#backgroundIdFriendly-desc 友方角色的生命值条背景图像
#foregroundIdFriendly 前景图像(友好)
#foregroundIdFriendly-desc 友方角色的生命值条前景图像
#backgroundIdEnemy 背景图像(敌对)
#backgroundIdEnemy-desc 敌方角色的生命值条背景图像
#foregroundIdEnemy 前景图像(敌对)
#foregroundIdEnemy-desc 敌方角色的生命值条前景图像
#backgroundIdSpecial 背景图像(特殊)
#backgroundIdSpecial-desc 特殊角色的生命值条背景图像
#foregroundIdSpecial 前景图像(特殊)
#foregroundIdSpecial-desc 特殊角色的生命值条前景图像
#offsetY 偏移 Y
#offsetY-desc 生命值条的垂直偏移距离
#scale 缩放
#scale-desc 生命值条的缩放系数
#opacity 不透明度
#opacity-desc 生命值条的不透明度
*/

// 没有实现GL崩溃时纹理恢复功能
export default class HealthBar {
  enabled       //:boolean
  texture       //:object
  sprites       //:array
  switcher      //:function
  healthKey     //:string
  maxHealthKey  //:string

  async onStart() {
    // 设置初始状态
    this.enabled = true
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    // 设置属性键
    this.healthKey = this.health?.key ?? ''
    this.maxHealthKey = this.maxHealth?.key ?? ''

    // 获取玩家队伍
    const id = this.playerTeamId
    const playerRelations = Team.relationMaps[id]
    if (!playerRelations) return

    // 侦听事件
    Scene.on('create', scene => {
      scene.renderers.push(this)
    })

    // 创建精灵列表和纹理
    const sprites = new Array(6)
    const texture = new Texture()
    this.sprites = sprites.fill(null)
    this.texture = texture

    // 创建图像列表
    const images = [
      this.backgroundIdFriendly,
      this.foregroundIdFriendly,
      this.backgroundIdEnemy,
      this.foregroundIdEnemy,
      this.backgroundIdSpecial,
      this.foregroundIdSpecial,
    ]

    // 创建精灵索引切换器
    const {specialBarEnabled, specialAttr, specialAttrValue} = this
    if (specialBarEnabled && specialAttr && specialAttrValue) {
      const specialKey = specialAttr.key
      const specialValue = specialAttrValue.value
      // 创建完整版的切换器
      this.switcher = actor => {
        if (actor.attributes[specialKey] === specialValue) return 4
        return (playerRelations[actor.teamId] ^ 1) << 1
      }
    } else {
      delete images[4]
      delete images[5]
      // 创建简化版的切换器
      this.switcher = actor => {
        return (playerRelations[actor.teamId] ^ 1) << 1
      }
    }

    // 加载图像
    const {length} = images
    for (let i = 0; i < length; i++) {
      if (!images[i]) continue
      images[i] = File.get({
        guid: images[i],
        type: 'image',
      })
    }

    // 等待图像加载完毕
    for (let i = 0; i < length; i++) {
      images[i] = await images[i]
    }

    // 创建精灵对象并计算纹理大小
    let fullWidth = 0
    let fullHeight = 0
    for (let i = 0; i < length; i++) {
      const image = images[i]
      if (!image) continue
      const width = image.naturalWidth
      const height = image.naturalHeight
      const sprite = {
        width: width,
        height: height,
        offsetX: -width >> 1,
        offsetY: -height >> 1,
        right: 0,
        top: 0,
        bottom: 0,
      }
      sprites[i] = sprite
      fullWidth = Math.max(fullWidth, width)
      fullHeight += height
    }

    // 上传图像数据到纹理
    texture.resize(fullWidth, fullHeight)
    texture.base.uploadImageData = () => {
      for (let i = 0, y = 0; i < length; i++) {
        const sprite = sprites[i]
        if (!sprite) continue
        const {width, height} = sprite
        const image = images[i]
        const data = GL instanceof WebGLRenderingContext ? GL.getImageData(image) : image
        GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, y, width, height, GL.RGBA, GL.UNSIGNED_BYTE, data)
        sprite.right = width / fullWidth
        sprite.top = y / fullHeight
        sprite.bottom = (y += height) / fullHeight
      }
    }
    texture.base.uploadImageData()

    // 设置恢复纹理回调函数
    texture.base.onRestore = base => {
      base.restoreNormalTexture()
      base.uploadImageData()
    }

    // 缩放参数
    const scale = this.scale
    for (const sprite of sprites) {
      if (sprite) {
        sprite.width *= scale
        sprite.height *= scale
        sprite.offsetX *= scale
        sprite.offsetY *= scale
      }
    }
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
    const gl = GL
    const vertices = gl.arrays[0].float32
    const {healthKey, maxHealthKey, sprites, offsetY, switcher} = this
    const {clamp} = Math
    let vi = 0

    // 计算可见角色的生命值条数据
    const convert = Scene.convert
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const actor = actors[i]
      if (!actor.active) continue
      const attributes = actor.attributes
      const health = attributes[healthKey]
      const maxHealth = attributes[maxHealthKey]
      if (typeof health !== 'number' ||
        typeof maxHealth !== 'number') {
        continue
      }
      const si = switcher(actor)
      const back = sprites[si]
      const fore = sprites[si + 1]
      const point = convert(actor)
      const x = point.x
      const y = point.y + offsetY
      if (back !== null) {
        const dl = x + back.offsetX
        const dt = y + back.offsetY
        const dr = dl + back.width
        const db = dt + back.height
        const sr = back.right
        const st = back.top
        const sb = back.bottom
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = st
        vertices[vi + 4] = dl
        vertices[vi + 5] = db
        vertices[vi + 6] = 0
        vertices[vi + 7] = sb
        vertices[vi + 8] = dr
        vertices[vi + 9] = db
        vertices[vi + 10] = sr
        vertices[vi + 11] = sb
        vertices[vi + 12] = dr
        vertices[vi + 13] = dt
        vertices[vi + 14] = sr
        vertices[vi + 15] = st
        vi += 16
      }
      if (fore !== null) {
        // 避免零除以零返回NaN
        const progress = health === 0 ? 0
        : clamp(health / maxHealth, 0, 1)
        const dl = x + fore.offsetX
        const dt = y + fore.offsetY
        const dr = dl + fore.width * progress
        const db = dt + fore.height
        const sr = fore.right * progress
        const st = fore.top
        const sb = fore.bottom
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = st
        vertices[vi + 4] = dl
        vertices[vi + 5] = db
        vertices[vi + 6] = 0
        vertices[vi + 7] = sb
        vertices[vi + 8] = dr
        vertices[vi + 9] = db
        vertices[vi + 10] = sr
        vertices[vi + 11] = sb
        vertices[vi + 12] = dr
        vertices[vi + 13] = dt
        vertices[vi + 14] = sr
        vertices[vi + 15] = st
        vi += 16
      }
    }

    // 绘制图像
    if (vi !== 0) {
      gl.alpha = this.opacity
      const program = gl.imageProgram.use()
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-Camera.scrollLeft, -Camera.scrollTop)
      gl.bindVertexArray(program.vao.a110)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, this.texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
    }
  }
}