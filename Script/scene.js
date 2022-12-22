'use strict'

// ******************************** 场景对象 ********************************

const Scene = new class {
  /** 当前绑定场景上下文
   *  @type {SceneContext|null}
   */ binding = null

  /** 绑定场景指针(0或1)
   *  @type {number}
   */ pointer = 0

  /** 场景上下文列表(A、B场景)
   *  @type {Array<SceneContext|null>}
   */ contexts = [null, null]

  /** 默认场景上下文(空场景)
   *  @type {SceneContext}
   */ default

  /** 当前场景的ID->场景对象映射表
   *  @type {Object}
   */ idMap

  /** 当前场景的视差图管理器
   *  @type {SceneParallaxManager}
   */ parallaxes

  /** 当前场景的角色管理器
   *  @type {SceneActorList}
   */ actors

  /** 当前场景的动画管理器
   *  @type {SceneAnimationList}
   */ animations

  /** 当前场景的触发器管理器
   *  @type {SceneTriggerList}
   */ triggers

  /** 当前场景的区域管理器
   *  @type {SceneRegionList}
   */ regions

  /** 当前场景的光源管理器
   *  @type {SceneLightManager}
   */ lights

  /** 当前场景的粒子发射器管理器
   *  @type {SceneParticleEmitterList}
   */ emitters

  /** 当前场景中可见的角色列表
   *  @type {Array<Actor|null>}
   */ visibleActors = []

  /** 当前场景中可见的动画列表
   *  @type {Array<Animation|null>}
   */ visibleAnimations = []

  /** 当前场景中可见的触发器列表
   *  @type {Array<Trigger|null>}
   */ visibleTriggers = []

  /** 当前场景中可见的粒子发射器列表
   *  @type {Array<Trigger|null>}
   */ visibleEmitters = []

  /** 场景精灵渲染器
   *  @type {SceneSpriteRenderer}
   */ spriteRenderer

  /** 场景是否暂停(累计次数)
   *  @type {number}
   */ paused = 0

  /**
   * 是否阻止场景输入事件(累计次数)
   * @type {number}
   */ preventInputEvents = 0

  /**
   * 场景粒子数量计数
   * @type {number}
   */ particleCount = 0

  /** 场景共享坐标点 */
  sharedPoint = {x: 0, y: 0}

  /** 场景事件侦听器列表 */
  listeners = {
    initialize: [],
    load: [],
    create: [],
    destroy: [],
    keydown: [],
    keyup: [],
    mousedown: [],
    mouseup: [],
    mousemove: [],
    doubleclick: [],
    wheel: [],
  }

  /** 滤镜模块列表 */
  filters = new ModuleList()

  /** 初始化场景管理器 */
  initialize() {
    // 创建精灵渲染器
    this.spriteRenderer = new SceneSpriteRenderer(
      this.visibleActors,
      this.visibleAnimations,
      this.visibleTriggers,
      this.visibleEmitters,
    )

    // 创建默认场景(空场景)
    this.default = new SceneContext('')

    // 绑定默认场景
    this.bind(null)

    // 调整光影纹理
    GL.resizeLightmap()

    // 侦听事件
    window.on('resize', () => GL.resizeLightmap())
    Input.on('keydown', () => Scene.emitInputEvent('keydown'))
    Input.on('keyup', () => Scene.emitInputEvent('keyup'))
    Input.on('mousedown', () => Scene.emitInputEvent('mousedown'))
    Input.on('mouseup', () => Scene.emitInputEvent('mouseup'))
    Input.on('mousemove', () => Scene.emitInputEvent('mousemove'))
    Input.on('doubleclick', () => Scene.emitInputEvent('doubleclick'))
    Input.on('wheel', () => Scene.emitInputEvent('wheel'))
  }

  /** 重置所有场景 */
  reset() {
    const {contexts} = this
    const {length} = contexts
    for (let i = 0; i < length; i++) {
      if (contexts[i] !== null) {
        contexts[i].destroy()
        contexts[i] = null
      }
    }
    this.pointer = 0
    this.bind(null)
    this.spriteRenderer.reset()
    this.paused = 0
    this.preventInputEvents = 0
  }

  /** 暂停场景活动 */
  pause() {
    this.paused++
    this.preventInput()
  }

  /** 继续场景活动 */
  continue() {
    this.paused = Math.max(this.paused - 1, 0)
    this.restoreInput()
  }

  /** 阻止场景输入 */
  preventInput() {
    this.preventInputEvents++
  }

  /** 恢复场景输入 */
  restoreInput() {
    this.preventInputEvents = Math.max(this.preventInputEvents - 1, 0)
  }

  /**
   * 激活场景上下文
   * @param {number} pointer 场景指针(0或1)
   */
  async activate(pointer) {
    // 推迟到栈尾执行
    await void 0
    this.pointer = pointer
    const scene = this.get()
    if (this.binding !== scene) {
      this.bind(scene)
    }
  }

  /**
   * 加载场景
   * @param {string} id 场景文件ID
   * @returns {Promise<SceneContext>}
   */
  async load(id) {
    // 推迟到栈尾执行
    await void 0

    // 销毁当前场景上下文
    const current = this.get()
    if (current !== null) {
      current.destroy()
    }

    // 创建新的场景上下文
    const scene = new SceneContext(id)
    scene.load()
    this.bind(this.set(scene))
    return scene.promise
  }

  /** 删除当前场景 */
  delete() {
    const scene = this.get()
    if (scene !== null) {
      scene.destroy()
      this.bind(this.set(null))
    }
  }

  /**
   * 更新场景
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    if (Scene.paused === 0) {
      Scene.particleCount = 0
      this.binding?.update(deltaTime)
    }
  }

  /** 渲染场景 */
  render() {
    this.binding?.render()
    this.filters.render()
  }

  /**
   * 获取当前场景上下文
   * @returns {SceneContext|null}
   */
  get() {
    return this.contexts[this.pointer]
  }

  /**
   * 设置当前场景上下文
   * @param {SceneContext|null} scene 场景上下文对象
   * @returns {SceneContext|null}
   */
  set(scene) {
    return this.contexts[this.pointer] = scene
  }

  /**
   * 绑定场景上下文
   * @param {SceneContext|null} scene 场景上下文对象
   */
  bind(scene) {
    this.binding = scene
    if (scene === null) {
      scene = this.default
    }

    // 获取场景组件和方法
    this.idMap = scene.idMap
    this.parallaxes = scene.parallaxes
    this.actors = scene.actors
    this.animations = scene.animations
    this.triggers = scene.triggers
    this.regions = scene.regions
    this.lights = scene.lights
    this.emitters = scene.emitters
    this.convert = scene.convert
    this.convert2f = scene.convert2f
    this.isInWallBlock = scene.isInWallBlock
    this.isInLineOfSight = scene.isInLineOfSight
    this.spriteRenderer.setObjectLists(
      scene.actors,
      scene.animations,
      scene.triggers,
      scene.emitters,
    )

    // 等待加载完毕后更新场景方法和参数
    scene.promise?.then(() => {
      if (this.binding === scene) {
        this.convert = scene.convert
        this.convert2f = scene.convert2f
        this.isInWallBlock = scene.isInWallBlock
        this.isInLineOfSight = scene.isInLineOfSight
        GL.setContrast(scene.contrast)
        GL.setAmbientLight(scene.ambient)
        scene.initialize()
      }
    })
  }

  /**
   * 添加场景事件侦听器
   * @param {string} type 场景事件类型
   * @param {function} listener 回调函数
   * @param {boolean} [priority = false] 是否将该事件设为最高优先级
   */
  on(type, listener, priority = false) {
    const list = this.listeners[type]
    if (!list.includes(listener)) {
      if (priority) {
        list.unshift(listener)
      } else {
        list.push(listener)
      }
    }
  }

  /**
   * 移除场景事件侦听器(未使用)
   * @param {string} type 场景事件类型
   * @param {function} listener 回调函数
   */
  off(type, listener) {
    const group = this.listeners[type]
    const index = group.indexOf(listener)
    if (index !== -1) {
      const replacer = () => {}
      group[index] = replacer
      Callback.push(() => {
        group.remove(replacer)
      })
    }
  }

  /**
   * 发送场景事件
   * @param {string} type 场景事件类型
   * @param {any} parameter 场景事件传递参数
   */
  emit(type, parameter) {
    for (const listener of this.listeners[type]) {
      listener(parameter)
    }
  }

  /**
   * 发送场景输入事件
   * @param {string} type 场景事件类型
   * @param {any} parameter 场景事件传递参数
   */
  emitInputEvent(type, parameter) {
    for (const listener of this.listeners[type]) {
      // 每次调用侦听器时判断一下，可能调用后发生变化
      if (Scene.preventInputEvents === 0) {
        listener(parameter)
      }
    }
  }

  /**
   * 测试场景对象初始化条件
   * @param {Object} node 场景对象预设数据
   * @returns {boolean}
   */
  testConditions(node) {
    // 如果场景对象未启用，则不通过
    if (node.enabled === false) return false
    for (const condition of node.conditions) {
      const type = condition.type
      const tester = Scene.objectCondTesters[condition.operation]
      const getter = Scene.objectCondVarGetters[type]
      const value = type[0] === 'g'
      ? getter(Variable.map, condition.key)
      : getter(SelfVariable.map, node.presetId)
      // 如果有一个条件不满足，则不通过
      if (tester(value, condition.value) === false) {
        return false
      }
    }
    return true
  }

  // 对象条件测试器
  objectCondTesters = {
    'equal': (a, b) => a === b,
    'unequal': (a, b) => a !== b,
    'greater-or-equal': (a, b) => a >= b,
    'less-or-equal': (a, b) => a <= b,
    'greater': (a, b) => a > b,
    'less': (a, b) => a < b,
  }

  // 对象条件变量访问器
  objectCondVarGetters = {
    'global-boolean': Attribute.BOOLEAN_GET,
    'global-number': Attribute.NUMBER_GET,
    'global-string': Attribute.STRING_GET,
    'self-boolean': Attribute.BOOLEAN_GET,
    'self-number': Attribute.NUMBER_GET,
    'self-string': Attribute.STRING_GET,
  }

  /**
   * 获取视差图锚点
   * @param {SceneParallax|SceneTilemap} parallax 视差图或瓦片地图对象
   * @returns {{x: number, y: number}}
   */
  getParallaxAnchor(parallax) {
    const point = this.sharedPoint
    const scene = this.binding
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const cx = Camera.scrollCenterX
    const cy = Camera.scrollCenterY
    const px = parallax.x * tw
    const py = parallax.y * th
    const fx = parallax.parallaxFactorX
    const fy = parallax.parallaxFactorY
    point.x = cx + fx * (px - cx)
    point.y = cy + fy * (py - cy)
    return point
  }

  /** 保存场景数据 */
  saveData() {
    const contexts = []
    const active = this.pointer
    for (const scene of this.contexts) {
      if (scene) {
        contexts.push(scene.saveData())
      }
    }
    return {active, contexts}
  }

  /**
   * 加载场景数据
   * @param {Object} data
   */
  loadData(data) {
    this.reset()
    this.contexts = [null, null]
    for (const context of data.contexts) {
      const {id, index} = context
      const scene = new SceneContext(id)
      scene.loadData(context)
      this.contexts[index] = scene
    }
    // 重新激活场景
    this.activate(data.active)
  }
}

// ******************************** 场景路径导航器 ********************************

const ScenePathFinder = new class {
  /** 顶点开关状态列表 */
  states = new Uint8Array(GL.zeros.buffer, 0, 512 * 512)

  /** 存放已打开顶点的状态索引的列表 */
  indices = new Uint32Array(GL.arrays[1].uint32.buffer, 0, 512 * 512)

  /** 存放寻路顶点数据的列表 */
  vertices = new Float64Array(GL.arrays[0].float64.buffer, 0, 512 * 512 * 6)

  /** 存放已打开顶点的数据索引的列表 */
  openset = new Uint32Array(GL.zeros.buffer, 512 * 512, 512 * 512 * 2 / 4)

  /** 根据期望值获取优先处理的顶点列表 */
  queue = new Uint32Array(GL.arrays[2].uint32.buffer, 0, 100)

  /** 相邻图块的八个方向坐标偏移值列表 */
  offsets = new Int32Array([0, -1,  1,  0,  0,  1, -1,  0, -1, -1,  1, -1,  1,  1, -1,  1])

  /** 已打开顶点的数量 */
  stateCount = 0

  /** 顶点开集索引列表中的开启数量 */
  opensetCount = 0

  /** 当前优先队列中的顶点数量 */
  queueCount = 0

  /** 寻路期望值的阈值，当达到阈值后强制结束寻路 */
  threshold = 0

  /** 当前场景地图宽度 */
  width = 0

  /** 当前场景地图高度 */
  height = 0

  /**
   * 当前场景地形数据
   * @type {Uint8Array|null}
   */
  terrains = null

  /**
   * 创建路径(Lazy Theta*寻路算法)
   * @param {number} startX 起点位置X
   * @param {number} startY 起点位置Y
   * @param {number} destX 终点位置X
   * @param {number} destY 终点位置Y
   * @returns {Float64Array} 角色移动路径
   */
   createPath(startX, startY, destX, destY, passage) {
    const scene = Scene.binding
    const sx = Math.floor(startX)
    const sy = Math.floor(startY)
    const dx = Math.floor(destX)
    const dy = Math.floor(destY)
    const width = ScenePathFinder.width = scene.width
    const height = ScenePathFinder.height = scene.height
    // 如果起点和终点在同一网格，或不受地形限制，或处于场景网格之外，返回单位路径
    if (sx === dx && sy === dy || passage === -1 ||
      sx < 0 || sx >= width || sy < 0 || sy >= height ||
      dx < 0 || dx >= width || dy < 0 || dy >= height) {
      return ScenePathFinder.createUnitPath(destX, destY)
    }
    // 设置终点权重(权重越高，寻路计算步骤越少，计算出来的可能不是最佳路线)
    const H_WEIGHT = 1.25
    const startIndex = (sx + sy * 512) * 6
    const {vertices, openset, queue, offsets} = ScenePathFinder
    // 获取场景地形到闭包作用域
    ScenePathFinder.terrains = scene.terrains
    // 设置寻路阈值，期望值达到阈值后放弃计算
    ScenePathFinder.threshold = Math.dist(sx, sy, dx, dy) + 80
    // 打开起点
    ScenePathFinder.openVertex(sx, sy, 0, 0, startIndex, false)
    // 循环更新顶点队列
    while (ScenePathFinder.updateQueue()) {
      for (let i = 0; i < ScenePathFinder.queueCount; i++) {
        // 获取队列中的顶点数据，再将其关闭
        const oi = queue[i]
        const vi = openset[oi] - 1
        const tx = vertices[vi    ]
        const ty = vertices[vi + 1]
        const c = vertices[vi + 2]
        const pi = vertices[vi + 4]
        const px = vertices[pi    ]
        const py = vertices[pi + 1]
        const pc = vertices[pi + 2]
        ScenePathFinder.closeVertex(oi)
        // 如果到达终点，擦除数据并建立路径
        if (tx === dx && ty === dy) {
          ScenePathFinder.clear()
          return this.buildPath(startX, startY, destX, destY, vi, passage)
        }
        // 遍历8个偏移方向的顶点
        for (let i = 0; i < 16; i += 2) {
          const nx = tx + offsets[i]
          const ny = ty + offsets[i + 1]
          // 如果顶点在有效网格区域内
          if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
            const passable = ScenePathFinder.isPassableBetween(tx, ty, nx, ny, passage)
            if (passable && ScenePathFinder.isInLineOfSight(px, py, nx, ny, passage)) {
              // 如果相邻网格可通行，且与父节点可见
              // 则计算到父节点的成本和到终点的期望值，打开该顶点
              const nc = pc + Math.dist(nx, ny, px, py)
              const ne = nc + Math.dist(nx, ny, dx, dy) * H_WEIGHT
              ScenePathFinder.openVertex(nx, ny, nc, ne, pi, false)
            } else {
              // 否则计算相邻成本(如果不可通行，成本乘以40倍)
              // 以及计算到终点的期望值，打开该顶点
              const ratio = passable ? 1 : 40
              const nc = c + Math.dist(nx, ny, tx, ty) * ratio
              const ne = nc + Math.dist(nx, ny, dx, dy) * H_WEIGHT
              ScenePathFinder.openVertex(nx, ny, nc, ne, vi, !passable)
            }
          }
        }
      }
    }
    ScenePathFinder.clear()
    ScenePathFinder.terrains = null
    // 没有找到路径，返回单位路径
    return ScenePathFinder.createUnitPath(destX, destY)
  }

  /**
   * 创建单位移动路径
   * @param {number} destX 终点位置X
   * @param {number} destY 终点位置Y
   * @returns {Float64Array} 角色移动路径
   */
  createUnitPath(destX, destY) {
    const path = new Float64Array(2)
    path[0] = destX
    path[1] = destY
    path.index = 0
    return path
  }

  /**
   * 使用寻路后的数据建立路径
   * @param {number} startX 起点位置X
   * @param {number} startY 起点位置Y
   * @param {number} destX 终点位置X
   * @param {number} destY 终点位置Y
   * @param {number} endIndex 终点顶点索引
   * @returns {Float64Array} 角色移动路径
   */
  buildPath(startX, startY, destX, destY, endIndex, passage) {
    const vertices = ScenePathFinder.vertices
    const radius = ActorCollider.sceneCollisionRadius
    const caches = GL.arrays[1].float64
    let blocked = false
    let vi = endIndex
    let ci = caches.length
    caches[--ci] = destY
    caches[--ci] = destX
    while (true) {
      // 丢弃不可通行的节点
      while (vertices[vi + 5]) {
        blocked = true
        vi = vertices[vi + 4]
      }

      // 获取父节点索引
      vi = vertices[vi + 4]

      // 如果到达起点，跳出
      if (vertices[vi + 2] === 0) {
        break
      }

      // 插入中转点到缓存
      const x = vertices[vi]
      const y = vertices[vi + 1]
      caches[--ci] = y + 0.5
      caches[--ci] = x + 0.5
    }
    // 插入起点到缓存
    caches[--ci] = startY
    caches[--ci] = startX

    // 调整终点坐标(要求可通行)
    if (!blocked) {
      const width = ScenePathFinder.width
      const height = ScenePathFinder.height
      const terrains = ScenePathFinder.terrains
      const i = caches.length - 2
      const x = Math.floor(caches[i])
      const y = Math.floor(caches[i + 1])
      const bi = x + y * width
      // 如果左边不可通行，限制水平位置避免撞墙
      if (x > 0 && terrains[bi - 1] !== passage) {
        caches[i] = Math.max(caches[i], x + radius)
      }
      // 如果右边不可通行，限制水平位置避免撞墙
      if (x < width - 1 && terrains[bi + 1] !== passage) {
        caches[i] = Math.min(caches[i], x + 1 - radius)
      }
      // 如果上边不可通行，限制垂直位置避免撞墙
      if (y > 0 && terrains[bi - width] !== passage) {
        caches[i + 1] = Math.max(caches[i + 1], y + radius)
      }
      // 如果下边不可通行，限制垂直位置避免撞墙
      if (y < height - 1 && terrains[bi + width] !== passage) {
        caches[i + 1] = Math.min(caches[i + 1], y + 1 - radius)
      }
    }

    // 调整最后一个拐点(如果存在)
    // 已发现问题：角色可能会卡在这个拐点(靠近墙，无法到达目的地)
    const pi = caches.length - 6
    if (!blocked && pi >= 0) {
      const px = caches[pi]
      const py = caches[pi + 1]
      const cx = caches[pi + 2]
      const cy = caches[pi + 3]
      const ex = Math.floor(caches[pi + 4])
      const ey = Math.floor(caches[pi + 5])
      const dist = Math.dist(cx, cy, px, py)
      for (let i = 1; i < dist; i++) {
        // 连接最后第2、3个点，计算插值节点
        const ratio = i / dist
        const x = cx * (1 - ratio) + px * ratio
        const y = cy * (1 - ratio) + py * ratio
        const dx = Math.floor(x)
        const dy = Math.floor(y)
        // 如果插值节点与终点可见，则设置最后第2个节点为该点
        if (ScenePathFinder.isInLineOfSight(ex, ey, dx, dy)) {
          caches[pi + 2] = x
          caches[pi + 3] = y
        } else {
          break
        }
      }
    }

    // 调整中转点坐标(碰撞半径不为0.5)
    if (radius !== 0.5) {
      const end = caches.length - 2
      for (let i = ci + 2; i < end; i += 2) {
        const x0 = caches[i]
        const y0 = caches[i + 1]
        const x1 = caches[i - 2]
        const y1 = caches[i - 1]
        const x2 = caches[i + 2]
        const y2 = caches[i + 3]
        const radian1 = Math.modRadians(Math.atan2(y1 - y0, x1 - x0))
        const radian2 = Math.modRadians(Math.atan2(y2 - y0, x2 - x0))
        // 求中转点拐角平分线的弧度
        const radian = Math.abs(radian1 - radian2) < Math.PI
        ? (radian1 + radian2) / 2
        : (radian1 + radian2) / 2 + Math.PI
        const horizontal = Math.cos(radian)
        const vertical = Math.sin(radian)
        const x = Math.floor(x0)
        const y = Math.floor(y0)
        // 假设中转点附近一定有墙的拐角，调整中转点，让它贴近墙面
        // 根据拐角平分线的水平和垂直分量来判定4个方位的拐角
        if (horizontal < -0.0001) caches[i] = x + radius
        if (horizontal > 0.0001) caches[i] = x + 1 - radius
        if (vertical < -0.0001) caches[i + 1] = y + radius
        if (vertical > 0.0001) caches[i + 1] = y + 1 - radius
      }
    }

    // 创建移动路径(不包括起点位置)
    const path = caches.slice(ci + 2)
    path.index = 0
    ScenePathFinder.terrains = null
    return path
  }

  /**
   * 判断相邻图块是否可通行(默认起点图块是可通行的)
   * @param {number} sx 起点图块X
   * @param {number} sy 起点图块Y
   * @param {number} dx 终点图块X
   * @param {number} dy 终点图块Y
   * @returns {boolean}
   */
  isPassableBetween = (sx, sy, dx, dy, passage) => {
    return sx === dx || sy === dy
    ? ScenePathFinder.terrains[dx + dy * ScenePathFinder.width] === passage
    : ScenePathFinder.terrains[dx + dy * ScenePathFinder.width] === passage &&
      ScenePathFinder.terrains[sx + dy * ScenePathFinder.width] === passage &&
      ScenePathFinder.terrains[dx + sy * ScenePathFinder.width] === passage
  }

  /**
   * 判断目标点是否在视线内
   * @param {number} sx 起始图块X
   * @param {number} sy 起始图块Y
   * @param {number} dx 终点图块X
   * @param {number} dy 终点图块Y
   * @returns {boolean}
   */
  isInLineOfSight = (sx, sy, dx, dy, passage) => {
    // 如果两点的曼哈顿距离大于80，直接返回false(不可视)
    if (Math.abs(sx - dx) + Math.abs(sy - dy) > 80) {
      return false
    }
    const width = ScenePathFinder.width
    const terrains = ScenePathFinder.terrains
    if (sx !== dx) {
      // 如果水平坐标不同
      const unitY = (dy - sy) / (dx - sx)
      const step = sx < dx ? 1 : -1
      const start = sx + step
      const end = dx + step
      const base = sy - (sx + step / 2) * unitY
      // 在水平方向上栅格化相交的网格区域
      for (let x = start; x !== end; x += step) {
        const y = base + x * unitY
        // 连接起点和终点，连线被垂直网格线切分成若干点
        // 如果其中一个交点上下偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[x + Math.floor(y) * width] !== passage ||
          terrains[x + Math.ceil(y) * width] !== passage) {
          return false
        }
      }
    }
    if (sy !== dy) {
      // 如果垂直坐标不同
      const unitX = (dx - sx) / (dy - sy)
      const step = sy < dy ? 1 : -1
      const start = sy + step
      const end = dy + step
      const base = sx - (sy + step / 2) * unitX
      // 在垂直方向上栅格化相交的网格区域
      for (let y = start; y !== end; y += step) {
        const x = base + y * unitX
        // 连接起点和终点，连线被水平网格线切分成若干点
        // 如果其中一个交点左右偏移0.5距离的网格区域不能通行，则不可视
        if (terrains[Math.floor(x) + y * width] !== passage ||
          terrains[Math.ceil(x) + y * width] !== passage) {
          return false
        }
      }
    }
    // 两点可视
    return true
  }

  /**
   * 打开路径顶点
   * @param {number} x 场景图块X
   * @param {number} y 场景图块Y
   * @param {number} cost 已知路径成本
   * @param {number} expectation 路径总成本期望值
   * @param {number} parentIndex 父级顶点的索引
   * @param {number} blocked 与上一个顶点之间是否阻塞
   */
  openVertex = (x, y, cost, expectation, parentIndex, blocked) => {
    const si = x + y * 512
    const vi = si * 6
    switch (ScenePathFinder.states[si]) {
      case 0:
        // 如果顶点是关闭状态，则将其插入开启列表
        for (let i = 0; i <= ScenePathFinder.opensetCount; i++) {
          if (ScenePathFinder.openset[i] === 0) {
            if (ScenePathFinder.opensetCount === i) {
              ScenePathFinder.opensetCount++
            }
            // 设置顶点数据
            ScenePathFinder.vertices[vi    ] = x
            ScenePathFinder.vertices[vi + 1] = y
            ScenePathFinder.vertices[vi + 2] = cost
            ScenePathFinder.vertices[vi + 3] = expectation
            ScenePathFinder.vertices[vi + 4] = parentIndex
            ScenePathFinder.vertices[vi + 5] = blocked
            ScenePathFinder.openset[i] = vi + 1
            // 设置为打开状态
            ScenePathFinder.states[si] = 1
            ScenePathFinder.indices[ScenePathFinder.stateCount++] = si
            return
          }
        }
        return
      case 1:
        // 如果顶点是打开状态，且新的数据成本更低，则替换
        if (ScenePathFinder.vertices[vi + 2] > cost) {
          ScenePathFinder.vertices[vi + 2] = cost
          ScenePathFinder.vertices[vi + 3] = expectation
          ScenePathFinder.vertices[vi + 4] = parentIndex
          ScenePathFinder.vertices[vi + 5] = blocked
        }
        return
    }
  }

  /**
   * 关闭路径顶点
   * @param {number} openedIndex 打开的顶点索引
   */
  closeVertex = openedIndex => {
    ScenePathFinder.openset[openedIndex] = 0
    // 如果顶点正好处于尾部，则减少开启列表的计数
    if (ScenePathFinder.opensetCount === openedIndex + 1) {
      ScenePathFinder.opensetCount = openedIndex
    }
  }

  /**
   * 更新顶点队列
   * @returns {boolean} 是否还有可用的顶点
   */
  updateQueue = () => {
    let count = 0
    let expectation = Infinity
    // 遍历开启列表中的顶点
    const {vertices, openset, queue, opensetCount} = ScenePathFinder
    for (let oi = 0; oi < opensetCount; oi++) {
      // openset[oi] = 0为空
      // openset[oi] > 0为有效顶点
      const vi = openset[oi] - 1
      if (vi >= 0) {
        const ve = vertices[vi + 3]
        if (ve > expectation) {
          // 如果顶点期望值超出，跳过
          continue
        }
        if (ve < expectation) {
          // 如果顶点期望值较低，重置队列
          // 且把该顶点作为队列中第一个数据
          expectation = ve
          queue[0] = oi
          count = 1
        } else if (count < 100) {
          // 如果顶点期望值持平，添加顶点到队列中
          queue[count++] = oi
        }
      }
    }
    if (expectation < ScenePathFinder.threshold) {
      // 如果最终期望值小于阈值，则设置队列长度，返回true(继续)
      ScenePathFinder.queueCount = count
      return true
    } else {
      // 否则，则重置队列长度，返回false(中断)
      ScenePathFinder.queueCount = 0
      return false
    }
  }

  /** 擦除寻路数据 */
  clear = () => {
    // 擦除顶点的状态数据
    const {states, indices, openset} = ScenePathFinder
    const {stateCount, opensetCount} = ScenePathFinder
    for (let i = 0; i < stateCount; i++) {
      states[indices[i]] = 0
    }
    ScenePathFinder.stateCount = 0

    // 擦除已打开的顶点数据(擦除首个数据即可)
    for (let i = 0; i < opensetCount; i++) {
      openset[i] = 0
    }
    ScenePathFinder.opensetCount = 0
  }
}

// ******************************** 场景上下文类 ********************************

class SceneContext {
  /** 场景文件ID
   *  @type {string}
   */ id

  /** 场景宽度(0-512)
   *  @type {number}
   */ width

  /** 场景高度(0-512)
   *  @type {number}
   */ height

  /** 场景图块宽度(16-256)
   *  @type {number}
   */ tileWidth

  /** 场景图块高度(16-256)
   *  @type {number}
   */ tileHeight

  /** 场景光照对比度(1-1.5)
   *  @type {number}
   */ contrast

  /** 场景地形数据(地面:0, 水面:1, 墙块: 2)
   *  @type {Uint8Array}
   */ terrains

  /** 场景图块动画已播放时间
   *  @type {number}
   */ elapsed

  /** 场景图块动画播放间隔
   *  @type {number}
   */ animInterval

  /** 场景图块动画帧计数
   *  @type {number}
   */ animFrame

  /** 场景事件映射表
   *  @type {Object}
   */ events

  /** 场景脚本管理器
   *  @type {Script}
   */ script

  /** 场景视差图管理器
   *  @type {SceneParallaxManager}
   */ parallaxes

  /** 场景角色管理器
   *  @type {SceneActorList}
   */ actors

  /** 场景动画管理器
   *  @type {SceneAnimationList}
   */ animations

  /** 场景触发器管理器
   *  @type {SceneTriggerList}
   */ triggers

  /** 场景区域管理器
   *  @type {SceneRegionList}
   */ regions

  /** 场景光源管理器
   *  @type {SceneLightManager}
   */ lights

  /** 场景粒子发射器管理器
   *  @type {SceneParticleEmitterList}
   */ emitters

  /** 场景更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 场景渲染器模块列表
   *  @type {ModuleList}
   */ renderers

  /** ID->场景对象映射表
   *  @type {Object}
   */ idMap

  /** 场景对象实体ID映射表
   *  @type {SceneEntityIdMap}
   */ entityIdMap

  /** 场景加载数据Promise对象
   *  @type {Promise<SceneContext>}
   */ promise

  /** 场景转换图块坐标到像素坐标方法
   *  @type {Function}
   */ convert

  /** 场景转换图块坐标到像素坐标方法(浮点参数版本)
   *  @type {Function}
   */ convert2f

  /** 判断目标点是否在墙块中
   *  @type {Function}
   */ isInWallBlock

  /** 判断起点和终点是否在视线内可见
   *  @type {Function}
   */ isInLineOfSight

  /**
   * 场景上下文对象
   * @param {string} id 场景文件ID
   */
  constructor(id) {
    this.id = id

    // 禁用部分场景方法
    this.update = Function.empty
    this.render = Function.empty
    this.emit = Function.empty

    // 创建场景组件
    this.idMap = new SceneObjectMap()
    this.entityIdMap = new SceneEntityIdMap()
    this.parallaxes = new SceneParallaxManager(this)
    this.actors = new SceneActorList(this)
    this.animations = new SceneAnimationList(this)
    this.triggers = new SceneTriggerList(this)
    this.regions = new SceneRegionList(this)
    this.lights = new SceneLightManager(this)
    this.emitters = new SceneParticleEmitterList(this)

    // 设置更新器
    this.updaters = new ModuleList(
      this.parallaxes,
      this.actors,
      this.animations,
      this.triggers,
      this.regions,
      this.lights,
      Camera,
      this.emitters,
    )

    // 设置渲染器
    this.renderers = new ModuleList(
      this.lights,
      this.parallaxes.backgrounds,
      Scene.spriteRenderer,
      this.parallaxes.foregrounds,
    )

    // 发送场景创建事件
    Scene.emit('create', this)
  }

  /**
   * 更新场景模块
   * @param {number} deltaTime 时间增量(毫秒)
   */
  update(deltaTime) {
    this.elapsed += deltaTime
    if (this.elapsed > this.animInterval) {
      this.elapsed -= this.animInterval
      // 更新图块动画帧
      this.animFrame += 1
    }
    this.updaters.update(deltaTime)
  }

  /** 渲染场景画面 */
  render() {
    this.renderers.render()
  }

  /** 加载场景数据 */
  async load() {
    let resolve
    this.promise = new Promise(r => {resolve = r})
    const scene = await Data.loadScene(this.id)
    this.data = scene
    this.width = scene.width
    this.height = scene.height
    this.tileWidth = scene.tileWidth
    this.tileHeight = scene.tileHeight
    this.contrast = scene.contrast
    this.ambient = scene.ambient
    this.terrains = scene.terrains
    this.animInterval = Data.config.scene.animationInterval
    this.elapsed = 0
    this.animFrame = 0
    this.actors.cells.resize(this)
    // 恢复被禁用的场景方法
    delete this.update
    delete this.render
    delete this.emit
    SceneContext.createClosureMethods(this)
    resolve(this)
    return this
  }

  /**
   * 设置场景环境光
   * @param {number} red 红[0-255]
   * @param {number} green 绿[0-255]
   * @param {number} blue 蓝[0-255]
   * @param {number} [easingId] 过渡曲线ID
   * @param {number} [duration] 持续时间(毫秒)
   */
  setAmbientLight(red, green, blue, easingId, duration) {
    const updaters = this.updaters
    const ambient = this.ambient
    if (duration > 0) {
      let elapsed = 0
      const sRed = ambient.red
      const sGreen = ambient.green
      const sBlue = ambient.blue
      const easing = Easing.get(easingId)
      // 创建ambient更新器
      updaters.set('ambient', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          ambient.red = Math.clamp(sRed * (1 - time) + red * time, 0, 255)
          ambient.green = Math.clamp(sGreen * (1 - time) + green * time, 0, 255)
          ambient.blue = Math.clamp(sBlue * (1 - time) + blue * time, 0, 255)
          GL.setAmbientLight(ambient)
          // 过渡结束，延迟删除更新器
          if (elapsed >= duration) {
            updaters.deleteDelay('ambient')
          }
        }
      })
    } else {
      updaters.deleteDelay('ambient')
      ambient.red = red
      ambient.green = green
      ambient.blue = blue
      GL.setAmbientLight(ambient)
    }
  }

  /** 加载初始场景对象 */
  loadObjects() {
    const isNew = !this.savedData
    const compile = Data.compileEvents
    const test = Scene.testConditions
    const actors = this.actors
    const animations = this.animations
    const regions = this.regions
    const lights = this.lights
    const parallaxes = this.parallaxes
    const emitters = this.emitters
    const loaders = {
      folder: node => load(node.children),
      actor: node => {
        const actorId = node.actorId
        let data = Data.actors[actorId]
        if (data !== undefined) {
          const {events, scripts} = node
          if (events.length + scripts.length !== 0) {
            // 修改角色数据，添加场景预设的事件和脚本
            data = Object.create(data)
            data.events = {
              ...data.events,
              ...node.events,
            }
            data.scripts = [
              ...data.scripts,
              ...node.scripts,
            ]
          }
          node.data = data
        }
        if (isNew && test(node)) {
          const actor = new Actor(data)
          actor.name = node.name
          actor.presetId = node.presetId
          actor.selfVarId = node.presetId
          actor.setTeam(node.teamId)
          actor.setPosition(node.x, node.y)
          actor.updateAngle(Math.radians(node.angle))
          if (node.scale !== 1) {
            actor.setScale(node.scale * data.scale)
          }
          actors.append(actor)
        }
        actors.presets[node.presetId] = node
      },
      animation: node => {
        node.motion = Enum.getValue(node.motion)
        if (isNew && test(node)) {
          const data = Data.animations[node.animationId]
          if (data !== undefined) {
            const animation = new SceneAnimation(node, data)
            animation.selfVarId = node.presetId
            animation.setMotion(node.motion)
            animation.setAngle(Math.radians(node.angle))
            animations.append(animation)
          }
        }
        animations.presets[node.presetId] = node
      },
      particle: node => {
        if (isNew && test(node)) {
          const data = Data.particles[node.particleId]
          if (data !== undefined) {
            const emitter = new SceneParticleEmitter(node, data)
            emitter.selfVarId = node.presetId
            emitters.append(emitter)
          }
        }
        emitters.presets[node.presetId] = node
      },
      region: node => {
        if (isNew && test(node)) {
          const region = new SceneRegion(node)
          region.selfVarId = node.presetId
          regions.append(region)
        }
        regions.presets[node.presetId] = node
      },
      light: node => {
        if (isNew && test(node)) {
          const light = new SceneLight(node)
          light.selfVarId = node.presetId
          lights.append(light)
        }
        lights.presets[node.presetId] = node
      },
      parallax: node => {
        if (isNew && test(node)) {
          const parallax = new SceneParallax(node)
          parallax.selfVarId = node.presetId
          parallaxes.append(parallax)
        }
        parallaxes.presets[node.presetId] = node
      },
      tilemap: node => {
        if (isNew && test(node)) {
          const tilemap = new SceneTilemap(this, node)
          tilemap.selfVarId = node.presetId
          parallaxes.append(tilemap)
        }
        parallaxes.presets[node.presetId] = node
      },
    }
    const load = nodes => {
      const length = nodes.length
      for (let i = 0; i < length; i++) {
        const node = nodes[i]
        if (node.events) {
          compile(node)
        }
        loaders[node.class](node)
      }
    }

    // 加载场景对象
    load(this.data.objects)
  }

  /**
   * 调用场景事件
   * @param {string} type 场景事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      return EventHandler.call(new EventHandler(commands))
    }
  }

  /**
   * 调用场景事件和脚本
   * @param {string} type 场景事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁场景上下文 */
  destroy() {
    this.parallaxes.destroy()
    this.actors.destroy()
    this.animations.destroy()
    this.triggers.destroy()
    this.regions.destroy()
    this.lights.destroy()
    this.emitters.destroy()
    this.emit('destroy')

    // 发送场景销毁事件
    Scene.emit('destroy', this)

    // 删除不再引用的图像纹理
    const manager = GL.textureManager
    manager.updated = false
    Callback.push(() => {
      if (!manager.updated) {
        manager.updated = true
        manager.update()
      }
    })
  }

  /** 保存场景数据 */
  saveData() {
    return {
      id: this.id,
      index: Scene.contexts.indexOf(this),
      actors: this.actors.saveData(),
      animations: this.animations.saveData(),
      emitters: this.emitters.saveData(),
      regions: this.regions.saveData(),
      lights: this.lights.saveData(),
      parallaxes: this.parallaxes.saveData(),
    }
  }

  /**
   * 加载场景数据
   * @param {Object} scene 
   */
  loadData(scene) {
    this.savedData = scene
    this.load()
  }

  // 默认方法
  initialize() {}
  convert() {return Scene.sharedPoint}
  convert2f() {return Scene.sharedPoint}
  isInWallBlock() {}
  isInLineOfSight() {}

  /**
   * 创建闭包方法
   * @param {SceneContext} scene 场景上下文对象
   */
  static createClosureMethods = scene => {
    /** 场景初始化 */
    scene.initialize = function () {
      if (Scene.binding === this) {
        Script.deferredLoading = true
        this.events = Data.compileEvents(this.data)
        this.script = Script.create(this, this.data.scripts)
        // 加载场景对象
        this.loadObjects(this.data)
        // 加载存档数据
        const data = this.savedData
        if (data) {
          this.actors.loadData(data.actors)
          this.animations.loadData(data.animations)
          this.emitters.loadData(data.emitters)
          this.regions.loadData(data.regions)
          this.lights.loadData(data.lights)
          this.parallaxes.loadData(data.parallaxes)
        } else {
          this.emit('create')
        }
        Script.loadDeferredParameters()
        // 发送自动执行事件
        this.parallaxes.emit('autorun')
        this.actors.emit('autorun')
        this.animations.emit('autorun')
        this.regions.emit('autorun')
        this.lights.emit('autorun')
        this.emitters.emit('autorun')
        this.emit('autorun')
        // 删除临时数据和初始化方法
        delete this.data
        delete this.savedData
        delete this.initialize
        // 发送场景初始化事件
        if (!data) {
          Scene.emit('initialize', this)
        }
        // 发送场景加载事件
        Scene.emit('load', this)
      }
    }

    const {floor} = Math
    const point = Scene.sharedPoint
    const {tileWidth, tileHeight} = scene
    const {terrains, width, height} = scene

    /**
     * 转换场景坐标到像素坐标
     * @param {{x: number, y: number}} tile 拥有场景坐标的对象
     * @returns {{x: number, y: number}}
     */
    scene.convert = tile => {
      point.x = tile.x * tileWidth
      point.y = tile.y * tileHeight
      return point
    }

    /**
     * 转换场景坐标到像素坐标(2个浮点参数版本)
     * @param {number} x 场景坐标X
     * @param {number} y 场景坐标Y
     * @returns {{x: number, y: number}}
     */
    scene.convert2f = (x, y) => {
      point.x = x * tileWidth
      point.y = y * tileHeight
      return point
    }

    /**
     * 判断目标点是否在墙块中
     * @param {number} x 场景坐标X
     * @param {number} y 场景坐标Y
     * @returns {boolean}
     */
    scene.isInWallBlock = (x, y) => {
      return x >= 0 && x < width && y >= 0 && y < height &&
      terrains[floor(x) + floor(y) * width] === 0b10
    }

    /**
     * 判断起点和终点是否在视线内可见
     * @param {number} sx 起点场景X
     * @param {number} sy 起点场景Y
     * @param {number} dx 终点场景X
     * @param {number} dy 终点场景Y
     * @returns {boolean}
     */
    scene.isInLineOfSight = (sx, sy, dx, dy) => {
      // 如果坐标点在场景网格外，返回false(不可视)
      if (sx < 0 || sx >= width ||
        sy < 0 || sy >= height ||
        dx < 0 || dx >= width ||
        dy < 0 || dy >= height) {
        return false
      }
      const tsx = floor(sx)
      const tsy = floor(sy)
      const tdx = floor(dx)
      const tdy = floor(dy)
      if (tsx !== tdx) {
        // 如果水平网格坐标不同
        const unitY = (dy - sy) / (dx - sx)
        const step = sx < dx ? 1 : -1
        const start = tsx + step
        const end = tdx
        // 在水平方向上栅格化相交的地形
        for (let x = start; x !== end; x += step) {
          const y = sy + (x - sx) * unitY
          // 连接起点和终点，连线被垂直网格线切分成若干点
          // 如果其中一个交点的网格区域是墙块，则不可视
          if (terrains[x + floor(y) * width] === 0b10) {
            return false
          }
        }
      }
      if (tsy !== tdy) {
        // 如果垂直网格坐标不同
        const unitX = (dx - sx) / (dy - sy)
        const step = sy < dy ? 1 : -1
        const start = tsy + step
        const end = tdy
        // 在垂直方向上栅格化相交的地形
        for (let y = start; y !== end; y += step) {
          const x = sx + (y - sy) * unitX
          // 连接起点和终点，连线被水平网格线切分成若干点
          // 如果其中一个交点的网格区域是墙块，则不可视
          if (terrains[floor(x) + y * width] === 0b10) {
            return false
          }
        }
      }
      // 如果起点和终点的网格区域都不是墙块，则可视
      return terrains[tsx + tsy * width] !== 0b10 &&
             terrains[tdx + tdy * width] !== 0b10
    }
  }
}

// ******************************** 场景对象映射表类 ********************************

class SceneObjectMap {
  /**
   * 设置对象到映射表
   * @param {string} key 键
   * @param {Object} object 场景对象
   */
  set(key, object) {
    if (key) {
      this[key] = object
    }
  }

  /**
   * 从映射表中删除对象
   * @param {string} key 键
   * @param {Object} object 场景对象
   */
  delete(key, object) {
    if (key && this[key] === object) {
      delete this[key]
    }
  }
}

// ******************************** 场景实体ID映射表类 ********************************

class SceneEntityIdMap {
  /**
   * 添加对象到映射表中
   * @param {Object} object 场景对象
   */
  add(object) {
    let {entityId} = object
    if (entityId === '') {
      // 如果对象不存在GUID，创建一个
      do {entityId = GUID.generate64bit()}
      while (entityId in this)
      object.entityId = entityId
    }
    this[entityId] = object
  }

  /**
   * 从映射表中移除对象
   * @param {Object} object 场景对象
   */
  remove(object) {
    delete this[object.entityId]
  }
}

// ******************************** 场景视差图管理器类 ********************************

class SceneParallaxManager {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 视差图和瓦片地图的预设数据表
   *  @type {Object}
   */ presets

  /** 背景层视差图群组
   *  @type {SceneParallaxGroup}
   */ backgrounds

  /** 前景层视差图群组
   *  @type {SceneParallaxGroup}
   */ foregrounds

  /** 对象层视差图群组
   *  @type {SceneParallaxGroup}
   */ doodads

  /** 视差图群组列表
   *  @type {Array<SceneParallaxGroup>}
   */ groups

  /**
   * 场景视差图管理器
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    this.scene = scene
    this.presets = {}
    // 包含背景层、前景层、对象层对象列表
    // 每个列表可加入视差图或瓦片地图对象(混合)
    this.backgrounds = new SceneParallaxGroup()
    this.foregrounds = new SceneParallaxGroup()
    this.doodads = new SceneParallaxGroup()
    this.groups = [
      this.backgrounds,
      this.foregrounds,
      this.doodads,
    ]
  }

  /**
   * 添加视差图到管理器中
   * @param {SceneParallax|SceneTilemap} parallax 视差图或瓦片地图对象
   */
  append(parallax) {
    if (parallax.parent === null) {
      parallax.parent = this
      // 根据图层添加到对应的子列表中
      switch (parallax.layer) {
        case 'background':
          this.backgrounds.push(parallax)
          break
        case 'foreground':
          this.foregrounds.push(parallax)
          break
        case 'object':
          this.doodads.push(parallax)
          break
      }
      this.scene.idMap.set(parallax.presetId, parallax)

      // 排序视差图层
      if (!this.sorting) {
        this.sorting = true
        Callback.push(() => {
          delete this.sorting
          this.sort()
        })
      }
    }
  }

  /**
   * 从管理器中移除视差图
   * @param {SceneParallax|SceneTilemap} parallax 视差图或瓦片地图对象
   */
  remove(parallax) {
    if (parallax.parent === this) {
      parallax.parent = null
      for (const group of this.groups) {
        if (group.remove(parallax)) {
          break
        }
      }
      this.scene.idMap.delete(parallax.presetId, parallax)
    }
  }

  /**
   * 更新管理器分组中的场景视差图
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    for (const group of this.groups) {
      for (const parallax of group) {
        parallax.update(deltaTime)
      }
    }
  }

  /** 排序视差图和瓦片地图图层 */
  sort() {
    for (const group of this.groups) {
      group.sort()
    }
  }

  /** 发送视差图事件 */
  emit(eventType) {
    for (const group of this.groups) {
      for (const parallax of group) {
        parallax.emit(eventType)
      }
    }
  }

  /** 销毁管理器中的视差图和瓦片地图 */
  destroy() {
    for (const group of this.groups) {
      for (const parallax of group) {
        parallax.destroy()
      }
    }
  }

  /** 保存视差图数据 */
  saveData() {
    const data = []
    for (const group of this.groups) {
      for (const entity of group) {
        if ('saveData' in entity) {
          data.push(entity.saveData())
        }
      }
    }
    return data
  }

  /**
   * 加载视差图数据
   * @param {Object[]} parallaxes
   */
  loadData(parallaxes) {
    const presets = this.presets
    const scene = Scene.binding
    for (const savedData of parallaxes) {
      const preset = presets[savedData.presetId]
      if (preset) {
        Object.setPrototypeOf(savedData, preset)
        switch (preset.class) {
          case 'parallax':
            // 重新创建视差图实例
            this.append(new SceneParallax(savedData))
            continue
          case 'tilemap':
            // 重新创建瓦片地图实例
            this.append(new SceneTilemap(scene, savedData))
            continue
        }
      }
    }
    this.sort()
  }
}

// ******************************** 场景视差图群组类 ********************************

class SceneParallaxGroup extends Array {
  /** 渲染视差图或瓦片地图 */
  render() {
    for (const parallax of this) {
      if (parallax.visible) {
        parallax.draw()
      }
    }
  }

  /** 排序图层 */
  sort() {
    super.sort(SceneParallaxGroup.sorter)
  }

  /** 视差图层排序器函数 */
  static sorter = (a, b) => a.order - b.order
}

// ******************************** 场景视差图类 ********************************

class SceneParallax {
  /** 视差图可见性
   *  @type {boolean}
   */ visible

  /** 视差图预设数据ID
   *  @type {string}
   */ presetId

  /** 视差图独立变量ID
   *  @type {string}
   */ selfVarId

  /** 视差图名称
   *  @type {string}
   */ name

  /** 视差图图层
   *  @type {string}
   */ layer

  /** 视差图排序优先级
   *  @type {number}
   */ order

  /** 视差图光照采样模式
   *  @type {string}
   */ light

  /** 视差图混合模式
   *  @type {string}
   */ blend

  /** 视差图不透明度
   *  @type {number}
   */ opacity

  /** 视差图水平位置
   *  @type {number}
   */ x

  /** 视差图垂直位置
   *  @type {number}
   */ y

  /** 视差图水平缩放系数
   *  @type {number}
   */ scaleX

  /** 视差图垂直缩放系数
   *  @type {number}
   */ scaleY

  /** 视差图水平重复次数
   *  @type {number}
   */ repeatX

  /** 视差图垂直重复次数
   *  @type {number}
   */ repeatY

  /** 视差图水平锚点
   *  @type {number}
   */ anchorX

  /** 视差图垂直锚点
   *  @type {number}
   */ anchorY

  /** 视差图水平偏移位置
   *  @type {number}
   */ offsetX

  /** 视差图垂直偏移位置
   *  @type {number}
   */ offsetY

  /** 水平视差系数
   *  @type {number}
   */ parallaxFactorX

  /** 垂直视差系数
   *  @type {number}
   */ parallaxFactorY

  /** 视差图水平移动速度
   *  @type {number}
   */ shiftSpeedX

  /** 视差图垂直移动速度
   *  @type {number}
   */ shiftSpeedY

  /** 视差图图像色调
   *  @type {Array<number>}
   */ tint

  /** 视差图图像纹理
   *  @type {ImageTexture}
   */ texture

  /** 视差图纹理水平偏移
   *  @type {number}
   */ shiftX

  /** 视差图纹理垂直偏移
   *  @type {number}
   */ shiftY

  /** 视差图更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 视差图事件映射表
   *  @type {Object}
   */ events

  /** 视差图脚本管理器
   *  @type {Script}
   */ script

  /** 视差图的父级对象
   *  @type {SceneParallaxManager|null}
   */ parent

  /**
   * 场景视差图对象
   * @param {Object} parallax 场景中预设的视差图数据
   */
  constructor(parallax) {
    this.visible = parallax.visible ?? true
    this.presetId = parallax.presetId
    this.selfVarId = parallax.selfVarId ?? ''
    this.name = parallax.name
    this.layer = parallax.layer
    this.order = parallax.order
    this.light = parallax.light
    this.blend = parallax.blend
    this.opacity = parallax.opacity
    this.x = parallax.x
    this.y = parallax.y
    this.scaleX = parallax.scaleX
    this.scaleY = parallax.scaleY
    this.repeatX = parallax.repeatX
    this.repeatY = parallax.repeatY
    this.anchorX = parallax.anchorX
    this.anchorY = parallax.anchorY
    this.offsetX = parallax.offsetX
    this.offsetY = parallax.offsetY
    this.parallaxFactorX = parallax.parallaxFactorX
    this.parallaxFactorY = parallax.parallaxFactorY
    this.shiftSpeedX = parallax.shiftSpeedX
    this.shiftSpeedY = parallax.shiftSpeedY
    this.tint = {...parallax.tint}
    this.texture = new ImageTexture(parallax.image, {sync: true})
    this.shiftX = 0
    this.shiftY = 0
    this.updaters = new ModuleList()
    this.events = parallax.events
    this.script = Script.create(this, parallax.scripts)
    this.parent = null
  }

  /**
   * 更新场景视差图
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    this.updaters.update(deltaTime)

    // 如果视差图的移动速度不为0，计算纹理滚动的位置
    if (this.shiftSpeedX !== 0 || this.shiftSpeedY !== 0) {
      const texture = this.texture
      if (texture.complete) {
        this.shiftX = (
          this.shiftX
        + this.shiftSpeedX
        * deltaTime / 1000
        / texture.width
        ) % 1
        this.shiftY = (
          this.shiftY
        + this.shiftSpeedY
        * deltaTime / 1000
        / texture.height
        ) % 1
      }
    }
  }

  /** 绘制场景视差图 */
  draw() {
    const texture = this.texture
    if (!texture.complete) {
      return
    }
    const gl = GL
    const parallax = this
    const vertices = gl.arrays[0].float32
    const pw = texture.width
             * parallax.scaleX
             * parallax.repeatX
    const ph = texture.height
             * parallax.scaleY
             * parallax.repeatY
    const ox = parallax.offsetX
    const oy = parallax.offsetY
    const ax = parallax.anchorX * pw
    const ay = parallax.anchorY * ph
    // 获取视差图锚点在场景中的像素位置，并计算出实际位置
    const anchor = Scene.getParallaxAnchor(parallax)
    const dl = anchor.x - ax + ox
    const dt = anchor.y - ay + oy
    const dr = dl + pw
    const db = dt + ph
    const cl = Camera.scrollLeft
    const ct = Camera.scrollTop
    const cr = Camera.scrollRight
    const cb = Camera.scrollBottom
    // 如果视差图在屏幕中可见，则绘制它
    if (dl < cr && dr > cl && dt < cb && db > ct) {
      const sl = this.shiftX
      const st = this.shiftY
      const sr = sl + parallax.repeatX
      const sb = st + parallax.repeatY
      vertices[0] = dl
      vertices[1] = dt
      vertices[2] = sl
      vertices[3] = st
      vertices[4] = dl
      vertices[5] = db
      vertices[6] = sl
      vertices[7] = sb
      vertices[8] = dr
      vertices[9] = db
      vertices[10] = sr
      vertices[11] = sb
      vertices[12] = dr
      vertices[13] = dt
      vertices[14] = sr
      vertices[15] = st
      gl.blend = parallax.blend
      gl.alpha = parallax.opacity
      const program = gl.imageProgram.use()
      const tint = parallax.tint
      const red = tint[0] / 255
      const green = tint[1] / 255
      const blue = tint[2] / 255
      const gray = tint[3] / 255
      const modeMap = SceneParallax.lightSamplingModes
      const lightMode = parallax.light
      const lightModeIndex = modeMap[lightMode]
      const matrix = gl.matrix.project(
        gl.flip,
        cr - cl,
        cb - ct,
      ).translate(-cl, -ct)
      gl.bindVertexArray(program.vao.a110)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, lightModeIndex)
      if (lightMode === 'anchor') {
        // 如果是光线采样模式为锚点采样，上传锚点位置
        gl.uniform2f(program.u_LightCoord, anchor.x, anchor.y)
      }
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, red, green, blue, gray)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
      gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    }
  }

  /**
   * 调用视差图事件
   * @param {string} type 视差图事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用视差图事件和脚本
   * @param {string} type 视差图事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁视差图 */
  destroy() {
    if (this.texture) {
      this.texture.destroy()
      this.texture = null
    }
    this.emit('destroy')
  }

  /** 保存视差图数据 */
  saveData() {
    return {
      visible: this.visible,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      name: this.name,
      x: this.x,
      y: this.y,
    }
  }

  /** 光线采样模式映射表(字符串 -> 着色器中的采样模式代码) */
  static lightSamplingModes = {raw: 0, global: 1, anchor: 2, ambient: 3}
}

// ******************************** 场景瓦片地图类 ********************************

class SceneTilemap {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 瓦片地图可见性
   *  @type {boolean}
   */ visible

  /** 瓦片地图预设数据ID
   *  @type {string}
   */ presetId

  /** 瓦片地图独立变量ID
   *  @type {string}
   */ selfVarId

  /** 瓦片地图名称
   *  @type {string}
   */ name

  /** 瓦片地图图层
   *  @type {string}
   */ layer

  /** 瓦片地图排序优先级
   *  @type {number}
   */ order

  /** 瓦片地图光照采样模式
   *  @type {string}
   */ light

  /** 瓦片地图混合模式
   *  @type {string}
   */ blend

  /** 瓦片地图水平位置
   *  @type {number}
   */ x

  /** 瓦片地图垂直位置
   *  @type {number}
   */ y

  /** 瓦片地图的宽度
   *  @type {number}
   */ width

  /** 瓦片地图的高度
   *  @type {number}
   */ height

  /** 瓦片地图水平锚点
   *  @type {number}
   */ anchorX

  /** 瓦片地图垂直锚点
   *  @type {number}
   */ anchorY

  /** 瓦片地图水平偏移位置
   *  @type {number}
   */ offsetX

  /** 瓦片地图垂直偏移位置
   *  @type {number}
   */ offsetY

  /** 瓦片地图水平视差系数
   *  @type {number}
   */ parallaxFactorX

  /** 瓦片地图垂直视差系数
   *  @type {number}
   */ parallaxFactorY

  /** 瓦片地图不透明度
   *  @type {number}
   */ opacity

  /** 瓦片地图的图块列表
   *  @type {Uint32Array}
   */ tiles

  /** 瓦片地图的具体图块数据映射表
   *  @type {Object}
   */ tiledata

  /** 瓦片地图的图块组映射表
   *  @type {Object}
   */ tilesetMap

  /** 瓦片地图的纹理映射表
   *  @type {Object}
   */ textures

  /** 瓦片地图的更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 瓦片地图的事件映射表
   *  @type {Object}
   */ events

  /** 瓦片地图的脚本管理器
   *  @type {Script}
   */ script

  /** 瓦片地图的父级对象
   *  @type {SceneParallaxManager|null}
   */ parent

  /**
   * 场景瓦片地图对象
   * @param {SceneContext} scene 场景上下文对象
   * @param {Object} tilemap 场景中预设的瓦片地图数据
   */
  constructor(scene, tilemap) {
    this.scene = scene
    this.visible = tilemap.visible ?? true
    this.presetId = tilemap.presetId
    this.selfVarId = tilemap.selfVarId ?? ''
    this.name = tilemap.name
    this.layer = tilemap.layer
    this.order = tilemap.order
    this.light = tilemap.light
    this.blend = tilemap.blend
    this.x = tilemap.x
    this.y = tilemap.y
    this.width = tilemap.width
    this.height = tilemap.height
    this.anchorX = tilemap.anchorX
    this.anchorY = tilemap.anchorY
    this.offsetX = tilemap.offsetX
    this.offsetY = tilemap.offsetY
    this.parallaxFactorX = tilemap.parallaxFactorX
    this.parallaxFactorY = tilemap.parallaxFactorY
    this.opacity = tilemap.opacity
    this.tiles = Codec.decodeTiles(tilemap.code, tilemap.width, tilemap.height)
    this.tiledata = null
    this.tilesetMap = tilemap.tilesetMap
    this.textures = null
    this.updaters = new ModuleList()
    this.events = tilemap.events
    this.script = Script.create(this, tilemap.scripts)
    this.parent = null

    // 加载纹理并创建图块数据
    this.draw = Function.empty
    this.loadTextures().then(() => {
      this.createTileData()
      delete this.draw
    })
  }

  /** 加载图块纹理 */
  loadTextures() {
    return new Promise(resolve => {
      const gl = GL
      const scene = this.scene
      const tiles = this.tiles
      const length = tiles.length
      const textures = {'': null}
      const tilesetMap = this.tilesetMap
      const tilesets = Data.tilesets
      const templates = Data.autotiles
      for (let i = 0; i < length; i++) {
        const tile = tiles[i]
        if (tile !== 0) {
          // 如果是非空图块，同步加载图块组纹理
          const guid = tilesetMap[tile >> 24]
          const tileset = tilesets[guid]
          if (tileset !== undefined) {
            switch (tileset.type) {
              case 'normal':
                if (textures[tileset.image] === undefined) {
                  const guid = tileset.image
                  textures[guid] = gl.createImageTexture(guid, {sync: true})
                }
                break
              case 'auto': {
                const tx = tile >> 8 & 0xff
                const ty = tile >> 16 & 0xff
                const id = tx + ty * tileset.width
                const autoTile = tileset.tiles[id]
                if (autoTile &&
                  textures[autoTile.image] === undefined &&
                  templates[autoTile.template] !== undefined) {
                  const guid = autoTile.image
                  textures[guid] = gl.createImageTexture(guid, {sync: true})
                }
                break
              }
            }
          }
        }
      }
      delete textures['']
      let loaded = 0
      const list = Object.values(textures)
      const total = list.length
      const callback = () => {
        if (++loaded === total) {
          // 全部纹理加载后完成Promise
          if (this.textures === list) {
            return resolve(scene)
          }
        }
      }
      list.map = textures
      this.textures = list
      for (const texture of list) {
        // 侦听纹理加载完毕事件
        texture.on('load', callback)
      }
    })
  }

  /** 创建图块数据 */
  createTileData() {
    const data = {}
    const scene = this.scene
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const tiles = this.tiles
    const length = tiles.length
    const textures = this.textures.map
    const tilesetMap = this.tilesetMap
    const tilesets = Data.tilesets
    const templates = Data.autotiles
    for (let i = 0; i < length; i++) {
      const tile = tiles[i]
      // 如果当前图块数据未创建
      if (data[tile] === undefined) {
        const guid = tilesetMap[tile >> 24]
        const tileset = tilesets[guid]
        // 如果存在图块组数据
        if (tileset !== undefined) {
          switch (tileset.type) {
            case 'normal': {
              const texture = textures[tileset.image]
              // 如果存在纹理
              if (texture !== undefined) {
                const tx = tile >> 8 & 0xff
                const ty = tile >> 16 & 0xff
                const id = tx + ty * tileset.width
                const tp = tileset.priorities[id] + tileset.globalPriority
                const sw = tileset.tileWidth
                const sh = tileset.tileHeight
                const sx = sw * tx
                const sy = sh * ty
                const dl = (tw - sw) / 2 + tileset.globalOffsetX
                const dt = (th - sh)     + tileset.globalOffsetY
                const dr = dl + sw
                const db = dt + sh
                // 对图块纹理的采样坐标进行微调(避免一些渲染间隙)
                let sl = (sx + 0.002) / texture.width
                let sr = (sx + sw - 0.002) / texture.width
                if (tile & 0b1) {
                  // 普通图块水平翻转
                  const temporary = sl
                  sl = sr
                  sr = temporary
                }
                const st = (sy + 0.002) / texture.height
                const sb = (sy + sh - 0.002) / texture.height
                const array = new Float32Array(11)
                array[0] = texture.index
                array[1] = tp
                array[2] = 1
                array[3] = dl
                array[4] = dt
                array[5] = dr
                array[6] = db
                array[7] = sl
                array[8] = st
                array[9] = sr
                array[10] = sb
                data[tile] = array
                continue
              }
              break
            }
            case 'auto': {
              const tx = tile >> 8 & 0xff
              const ty = tile >> 16 & 0xff
              const id = tx + ty * tileset.width
              const autoTile = tileset.tiles[id]
              if (autoTile) {
                const template = templates[autoTile.template]
                const texture = textures[autoTile.image]
                // 如果存在自动图块模板和纹理
                if (template !== undefined && texture !== undefined) {
                  const nodeId = tile & 0b111111
                  const node = template.nodes[nodeId]
                  // 如果存在图块节点
                  if (node !== undefined) {
                    const frames = node.frames
                    const length = frames.length
                    const tp = tileset.priorities[id] + tileset.globalPriority
                    const sw = tileset.tileWidth
                    const sh = tileset.tileHeight
                    const dl = (tw - sw) / 2 + tileset.globalOffsetX
                    const dt = (th - sh)     + tileset.globalOffsetY
                    const dr = dl + sw
                    const db = dt + sh
                    // 基础数据长度7，每一个动画帧加长度4
                    const array = new Float32Array(length * 4 + 7)
                    // 0：纹理索引，1：图块优先级，2：动画帧数量
                    array[0] = texture.index
                    array[1] = tp
                    array[2] = length
                    // 图块绘制的相对坐标
                    array[3] = dl
                    array[4] = dt
                    array[5] = dr
                    array[6] = db
                    const ox = autoTile.x
                    const oy = autoTile.y
                    const width = texture.width
                    const height = texture.height
                    // 遍历设置动画帧数据
                    for (let i = 0; i < length; i++) {
                      const index = i * 4 + 7
                      const frame = frames[i]
                      const sx = (ox + (frame & 0xff)) * sw
                      const sy = (oy + (frame >> 8)) * sh
                      const sl = (sx + 0.002) / width
                      const st = (sy + 0.002) / height
                      const sr = (sx + sw - 0.002) / width
                      const sb = (sy + sh - 0.002) / height
                      // 设置4个纹理采样坐标
                      array[index    ] = sl
                      array[index + 1] = st
                      array[index + 2] = sr
                      array[index + 3] = sb
                    }
                    data[tile] = array
                    continue
                  }
                }
              }
              break
            }
          }
        }
        // 没能创建图块数据，使用null占位，避免再次进行创建
        data[tile] = null
      }
    }
    // 记录图块数据
    this.tiledata = data
  }

  /**
   * 更新场景瓦片地图
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    this.updaters.update(deltaTime)
  }

  /** 绘制场景瓦片地图 */
  draw() {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const scene = this.scene
    const data = this.tiledata
    const tiles = this.tiles
    const width = this.width
    const height = this.height
    const frame = scene.animFrame
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const anchor = Scene.getParallaxAnchor(this)
    const pw = width * tw
    const ph = height * th
    const ax = this.anchorX * pw
    const ay = this.anchorY * ph
    const ox = anchor.x - ax + this.offsetX
    const oy = anchor.y - ay + this.offsetY
    const sl = Camera.tileLeft - ox
    const st = Camera.tileTop - oy
    const sr = Camera.tileRight - ox
    const sb = Camera.tileBottom - oy
    const bx = Math.max(Math.floor(sl / tw), 0)
    const by = Math.max(Math.floor(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width)
    const ey = Math.min(Math.ceil(sb / th), height)
    // 使用队列渲染器进行批量渲染
    gl.batchRenderer.setAttrSize(0)
    gl.batchRenderer.setBlendMode(this.blend)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * width
        const tile = tiles[i]
        const array = data[tile]
        if (array === null) {
          continue
        }
        // 向渲染器添加纹理索引
        push(array[0])
        const fi = frame % array[2] * 4 + 7
        const ox = x * tw
        const oy = y * th
        const dl = array[3] + ox
        const dt = array[4] + oy
        const dr = array[5] + ox
        const db = array[6] + oy
        const sl = array[fi]
        const st = array[fi + 1]
        const sr = array[fi + 2]
        const sb = array[fi + 3]
        // 从渲染器中获取顶点索引和采样器索引
        const vi = response[0] * 5
        const si = response[1]
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = sl
        vertices[vi + 3] = st
        vertices[vi + 4] = si
        vertices[vi + 5] = dl
        vertices[vi + 6] = db
        vertices[vi + 7] = sl
        vertices[vi + 8] = sb
        vertices[vi + 9] = si
        vertices[vi + 10] = dr
        vertices[vi + 11] = db
        vertices[vi + 12] = sr
        vertices[vi + 13] = sb
        vertices[vi + 14] = si
        vertices[vi + 15] = dr
        vertices[vi + 16] = dt
        vertices[vi + 17] = sr
        vertices[vi + 18] = st
        vertices[vi + 19] = si
      }
    }
    // 如果顶点的尾部索引不为0(存在可绘制的图块)
    const endIndex = gl.batchRenderer.getEndIndex()
    if (endIndex !== 0) {
      gl.alpha = this.opacity
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const program = gl.tileProgram.use()
      const modeMap = SceneTilemap.lightSamplingModes
      const lightMode = this.light
      const lightModeIndex = modeMap[lightMode]
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, lightModeIndex)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5)
      gl.batchRenderer.draw()
    }
  }

  /**
   * 调用瓦片地图事件
   * @param {string} type 瓦片地图事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用瓦片地图事件和脚本
   * @param {string} type 瓦片地图事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁瓦片地图 */
  destroy() {
    if (this.textures) {
      // 销毁所有图块组纹理
      for (const texture of this.textures) {
        texture.refCount--
      }
      this.textures = null
    }
    this.emit('destroy')
  }

  /** 保存瓦片地图数据 */
  saveData() {
    return {
      visible: this.visible,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      name: this.name,
      x: this.x,
      y: this.y,
    }
  }

  /** 静态 - 光线采样模式映射表(字符串 -> 着色器中的采样模式代码) */
  static lightSamplingModes = {raw: 0, global: 1, ambient: 2}
}

// ******************************** 场景网格分区列表类 ********************************

class SceneGridCellList extends Array {
  /** 场景网格分区水平数量
   *  @type {number}
   */ width

  /** 场景网格分区垂直数量
   *  @type {number}
   */ height

  /** 场景网格分区导出列表
   *  @type {Array}
   */ exports

  /** 场景网格分区列表 */
  constructor() {
    super()
    this.width = 0
    this.height = 0
    this.exports = []
  }

  /**
   * 调整场景网格分区的数量
   * @param {SceneContext} scene 场景上下文对象
   */
  resize(scene) {
    // 根据场景大小来调整分区数量
    const width = Math.ceil(scene.width / 4)
    const height = Math.ceil(scene.height / 4)
    const length = width * height
    this.width = width
    this.height = height
    this.length = length
    for (let i = 0; i < length; i++) {
      this[i] = []
    }
  }

  /**
   * 获取指定范围的分区列表
   * @param {number} sx 起始X
   * @param {number} sy 起始Y
   * @param {number} ex 结束X
   * @param {number} ey 结束Y
   * @returns {Array[]}
   */
  get(sx, sy, ex, ey) {
    const left = Math.max(sx >> 2, 0)
    const top = Math.max(sy >> 2, 0)
    const right = Math.min(ex / 4, this.width)
    const bottom = Math.min(ey / 4, this.height)
    const exports = this.exports
    const rowOffset = this.width
    let count = 0
    // 获取小块分区中的数据，避免全局遍历
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        exports[count++] = this[x + y * rowOffset]
      }
    }
    exports.count = count
    return exports
  }

  /**
   * 更新场景对象的分区(根据对象的位置来分配)
   * @param {Object} object 拥有场景坐标的对象
   */
  update(object) {
    // 根据对象的场景位置来分配区间
    const cellX = object.x >> 2
    const cellY = object.y >> 2
    const cellId = cellX + cellY * this.width
    if (object.cellId !== cellId) {
      // 从旧的分区中删除对象
      const oldCell = this[object.cellId]
      if (oldCell !== undefined) {
        oldCell.remove(object)
      }
      // 添加对象到新的分区
      const newCell = this[cellId]
      if (newCell !== undefined) {
        newCell.push(object)
      }
      object.cellId = cellId
    }
  }

  /**
   * 添加场景对象到管理器中
   * @param {Object} object 拥有场景坐标的对象
   */
  append(object) {
    const cellX = object.x >> 2
    const cellY = object.y >> 2
    const cellId = cellX + cellY * this.width
    const cell = this[cellId]
    if (cell !== undefined) {
      cell.push(object)
    }
    object.cellId = cellId
  }

  /**
   * 从管理器中移除场景对象
   * @param {Object} object 拥有场景坐标的对象
   */
  remove(object) {
    const cell = this[object.cellId]
    if (cell !== undefined) {
      cell.remove(object)
    }
  }
}

// ******************************** 场景角色列表类 ********************************

class SceneActorList extends Array {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 场景角色分区列表
   *  @type {SceneGridCellList}
   */ cells

  /** 场景角色预设数据表
   *  @type {Object}
   */ presets

  /**
   * 场景角色列表
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    super()
    this.scene = scene
    this.cells = new SceneGridCellList()
    this.presets = {}
  }

  /**
   * 添加角色到管理器中
   * @param {Actor} actor 场景角色实例
   */
  append(actor) {
    if (actor.parent === null) {
      actor.parent = this
      this.push(actor)
      this.cells.append(actor)
      this.scene.idMap.set(actor.presetId, actor)
      this.scene.entityIdMap.add(actor)
    }
  }

  /**
   * 从管理器中移除角色
   * @param {Actor} actor 场景角色实例
   */
  remove(actor) {
    if (actor.parent === this) {
      actor.parent = null
      super.remove(actor)
      this.cells.remove(actor)
      this.scene.idMap.delete(actor.presetId, actor)
      this.scene.entityIdMap.remove(actor)
    }
  }

  /**
   * 更新场景角色
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const {length} = this
    for (let i = 0; i < length; i++) {
      this[i].update(deltaTime)
    }
    // 处理角色和场景碰撞
    ActorCollider.handleActorCollisions()
    ActorCollider.handleSceneCollisions()
    this.updateGridPosAndCells()
  }

  /** 更新场景角色网格位置和分区 */
  updateGridPosAndCells() {
    const {cells, length} = this
    for (let i = 0; i < length; i++) {
      const actor = this[i]
      // 只有角色发生移动时，才更新区间
      if (actor.collider.moved) {
        actor.collider.moved = false
        // 更新角色的网格位置
        actor.updateGridPosition()
        // 更新角色的场景分区
        cells.update(actor)
      }
    }
  }

  /** 发送角色事件 */
  emit(eventType) {
    for (const actor of this) {
      actor.emit(eventType)
    }
  }

  /** 销毁管理器中的场景角色 */
  destroy() {
    for (const actor of this) {
      actor.destroy()
    }
  }

  /** 保存场景角色列表数据 */
  saveData() {
    const data = []
    const length = this.length
    for (let i = 0; i < length; i++) {
      const actor = this[i]
      if (!actor.active) continue
      // 保存全局角色或普通角色
      data.push(
        actor instanceof GlobalActor
      ? {globalId: actor.data.id}
      : actor.saveData()
      )
    }
    return data
  }

  /**
   * 加载场景角色列表数据
   * @param {Object[]} actors
   */
  loadData(actors) {
    const presets = this.presets
    for (const savedData of actors) {
      const {presetId, fileId} = savedData
      if (presetId) {
        // 加载预设角色
        const data = presets[presetId]?.data
        if (data) {
          this.append(new Actor(data, savedData))
        }
      } else if (fileId) {
        // 加载外部角色
        const data = Data.actors[fileId]
        if (data) {
          this.append(new Actor(data, savedData))
        }
      } else {
        // 加载全局角色
        const actor = ActorManager.get(savedData.globalId)
        if (actor) {
          this.append(actor)
        }
      }
    }
    // 恢复包裹引用
    Inventory.reference()
  }
}

// ******************************** 场景动画列表类 ********************************

class SceneAnimationList extends Array {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 场景动画预设数据表
   *  @type {Object}
   */ presets

  /**
   * 场景动画列表
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    super()
    this.scene = scene
    this.presets = {}
  }

  /**
   * 添加动画到管理器中
   * @param {Animation} animation 动画对象实例
   */
  append(animation) {
    if (animation.parent === null) {
      animation.parent = this
      this.push(animation)
      this.scene.idMap.set(animation.presetId, animation)
    }
  }

  /**
   * 从管理器中移除动画
   * @param {Animation} animation 动画对象实例
   */
  remove(animation) {
    if (animation.parent === this) {
      animation.parent = null
      super.remove(animation)
      this.scene.idMap.delete(animation.presetId, animation)
    }
  }

  /**
   * 更新动画实例
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const {length} = this
    for (let i = 0; i < length; i++) {
      this[i].update(deltaTime)
    }
  }

  /** 发送动画事件 */
  emit(eventType) {
    for (const animation of this) {
      animation.emit(eventType)
    }
  }

  /** 销毁管理器中的动画 */
  destroy() {
    for (const animation of this) {
      animation.destroy()
    }
  }

  /** 保存动画列表数据 */
  saveData() {
    const length = this.length
    const data = []
    for (let i = 0; i < length; i++) {
      const animation = this[i]
      if ('saveData' in animation) {
        data.push(animation.saveData())
      }
    }
    return data
  }

  /**
   * 加载动画列表数据
   * @param {Object[]} animations 
   */
  loadData(animations) {
    const presets = this.presets
    for (const savedData of animations) {
      const preset = presets[savedData.presetId]
      if (preset) {
        const data = Data.animations[preset.animationId]
        if (data) {
          // 重新创建动画实例
          savedData.events = preset.events
          savedData.scripts = preset.scripts
          const animation = new SceneAnimation(savedData, data)
          animation.setMotion(savedData.motion)
          animation.setAngle(savedData.angle)
          this.append(animation)
        }
      }
    }
  }
}

// ******************************** 场景动画类 ********************************

class SceneAnimation extends Animation {
  /** 场景动画预设数据ID
   *  @type {string}
   */ presetId

  /** 场景动画独立变量ID
   *  @type {string}
   */ selfVarId

  /** 场景动画名称
   *  @type {string}
   */ name

  /** 场景动画水平位置
   *  @type {number}
   */ x

  /** 场景动画垂直位置
   *  @type {number}
   */ y

  /** 场景动画的更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 场景动画事件映射表
   *  @type {Object}
   */ events

  /** 场景动画脚本管理器
   *  @type {Script}
   */ script

  /**
   * 场景动画对象
   * @param {Object} node 场景中预设的动画数据
   * @param {AnimFile} data 动画文件数据
   */
  constructor(node, data) {
    super(data)
    this.visible = node.visible ?? true
    this.presetId = node.presetId
    this.selfVarId = node.selfVarId ?? ''
    this.rotatable = node.rotatable
    this.name = node.name
    this.x = node.x
    this.y = node.y
    this.scale = node.scale
    this.speed = node.speed
    this.opacity = node.opacity
    this.priority = node.priority
    this.updaters = new ModuleList()
    this.events = node.events
    this.script = Script.create(this, node.scripts)
    this.setPosition(this)
  }

  /**
   * 更新场景动画
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    super.update(deltaTime)
    this.updaters.update(deltaTime)
  }

  /**
   * 调用场景动画事件
   * @param {string} type 场景动画事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景动画事件和脚本
   * @param {string} type 场景动画事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁场景动画 */
  destroy() {
    super.destroy()
    this.emit('destroy')
  }

  /** 保存场景动画数据 */
  saveData() {
    return {
      visible: this.visible,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      name: this.name,
      motion: this.motionName,
      rotatable: this.rotatable,
      x: this.x,
      y: this.y,
      angle: this.angle,
      scale: this.scale,
      speed: this.speed,
      opacity: this.opacity,
      priority: this.priority,
    }
  }
}

// ******************************** 场景触发器列表类 ********************************

class SceneTriggerList extends Array {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /**
   * 场景触发器列表
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    super()
    this.scene = scene
  }

  /**
   * 添加触发器到管理器中
   * @param {Trigger} trigger 触发器实例
   */
  append(trigger) {
    if (trigger.parent === null) {
      trigger.parent = this
      trigger.emit('autorun', trigger)
      this.push(trigger)
    }
  }

  /**
   * 从管理器中移除触发器
   * @param {Trigger} trigger 触发器实例
   */
  remove(trigger) {
    if (trigger.parent === this) {
      trigger.parent = null
      super.remove(trigger)
    }
  }

  /**
   * 更新触发器
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const {length} = this
    for (let i = 0; i < length; i++) {
      this[i].update(deltaTime)
    }
  }

  /** 销毁管理器中的触发器 */
  destroy() {
    for (const trigger of this) {
      trigger.destroy()
    }
  }
}

// ******************************** 场景区域列表类 ********************************

class SceneRegionList extends Array {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 场景区域预设数据ID
   *  @type {Object}
   */ presets

  /**
   * 场景区域列表
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    super()
    this.scene = scene
    this.presets = {}
  }

  /**
   * 添加区域到管理器中
   * @param {SceneRegion} region 场景区域对象
   */
  append(region) {
    if (region.parent === null) {
      region.parent = this
      this.push(region)
      this.scene.idMap.set(region.presetId, region)
    }
  }

  /**
   * 从管理器中移除区域
   * @param {SceneRegion} region 场景区域对象
   */
  remove(region) {
    if (region.parent === this) {
      region.parent = null
      super.remove(region)
      this.scene.idMap.delete(region.presetId, region)
    }
  }

  /**
   * 更新区域实例
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const {length} = this
    for (let i = 0; i < length; i++) {
      this[i].update(deltaTime)
    }
  }

  /** 发送区域事件 */
  emit(eventType) {
    for (const region of this) {
      region.emit(eventType)
    }
  }

  /** 销毁管理器中的场景区域 */
  destroy() {
    for (const region of this) {
      region.destroy()
    }
  }

  /** 保存场景区域列表数据 */
  saveData() {
    const length = this.length
    const data = new Array(length)
    for (let i = 0; i < length; i++) {
      data[i] = this[i].saveData()
    }
    return data
  }

  /**
   * 加载场景区域列表数据
   * @param {Object[]} regions
   */
  loadData(regions) {
    const presets = this.presets
    for (const savedData of regions) {
      const data = presets[savedData.presetId]
      if (data) {
        // 重新创建区域实例
        savedData.events = data.events
        savedData.scripts = data.scripts
        this.append(new SceneRegion(savedData))
      }
    }
  }
}

// ******************************** 场景区域类 ********************************

class SceneRegion {
  /** 场景区域预设数据ID
   *  @type {string}
   */ presetId

  /** 场景区域独立变量ID
   *  @type {string}
   */ selfVarId

  /** 场景区域名称
   *  @type {string}
   */ name

  /** 场景区域水平位置
   *  @type {number}
   */ x

  /** 场景区域垂直位置
   *  @type {number}
   */ y

  /** 场景区域左边位置
   *  @type {number}
   */ left

  /** 场景区域顶部位置
   *  @type {number}
   */ top

  /** 场景区域右边位置
   *  @type {number}
   */ right

  /** 场景区域底部位置
   *  @type {number}
   */ bottom

  /** 场景区域中已进入角色列表
   *  @type {Array<Actor>}
   */ actors

  /** 场景区域覆盖的角色分区列表
   *  @type {Array<Array<Actor>>}
   */ cells

  /** 场景区域更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 场景区域事件映射表
   *  @type {Object}
   */ events

  /** 场景区域脚本管理器
   *  @type {Script}
   */ script

  /** 场景区域的父级对象
   *  @type {SceneRegionList|null}
   */ parent

  /**
   * 场景区域对象
   * @param {Object} data 场景中预设的区域数据
   */
  constructor(data) {
    this.presetId = data.presetId
    this.selfVarId = data.selfVarId ?? ''
    this.name = data.name
    this.x = data.x
    this.y = data.y
    this.width = data.width
    this.height = data.height
    this.actors = []
    this.cells = []
    this.updaters = new ModuleList()
    this.events = data.events
    this.script = Script.create(this, data.scripts)
    this.parent = null
    this.createEventUpdaters()
    this.updateBoundingRect()
    this.updateGridCells()
  }

  /**
   * 更新场景区域
   * @param {number} deltaTime 增量时间(毫秒)
   */
   update(deltaTime) {
    this.updaters.update(deltaTime)
  }

  /** 创建区域事件更新器 */
  createEventUpdaters() {
    // 如果存在相关事件，才会创建更新器
    const {playerenter, playerleave, actorenter, actorleave} = this.events
    if (playerenter || playerleave || actorenter || actorleave) {
      const {cells, updaters} = this
      const selections = this.actors
      updaters.push({
        update: () => {
          // 检测进入区域的角色
          const {left, top, right, bottom} = this
          const length = cells.length
          for (let i = 0; i < length; i++) {
            const actors = cells[i]
            const length = actors.length
            for (let i = 0; i < length; i++) {
              const actor = actors[i]
              const {x, y} = actor
              if (x >= left && x < right && y >= top && y < bottom && selections.append(actor)) {
                // 触发角色进入区域事件
                if (actor.active) {
                  if (playerenter && actor === Party.player) {
                    this.emit('playerenter', actor)
                  }
                  if (actorenter) {
                    this.emit('actorenter', actor)
                  }
                }
              }
            }
          }
          // 检测离开区域的角色
          let i = selections.length
          while (--i >= 0) {
            const actor = selections[i]
            const {x, y} = actor
            if (x < left || x >= right || y < top || y >= bottom) {
              selections.splice(i, 1)
              // 触发角色离开区域事件
              if (actor.active) {
                if (playerleave && actor === Party.player) {
                  this.emit('playerleave', actor)
                }
                if (actorleave) {
                  this.emit('actorleave', actor)
                }
              }
            }
          }
        }
      })
    }
  }

  /** 更新区域边界矩形框 */
  updateBoundingRect() {
    const x = this.x
    const y = this.y
    const wh = this.width / 2
    const hh = this.height / 2
    this.left = x - wh
    this.top = y - hh
    this.right = x + wh
    this.bottom = y + hh
  }

  /** 更新区域所在的角色分区列表 */
  updateGridCells() {
    const imports = Scene.actors.cells.get(this.left, this.top, this.right, this.bottom)
    const count = imports.count
    const cells = this.cells
    if (cells.length !== count) {
      cells.length = count
    }
    // 只要区域没有发生移动，网格分区列表就是固定的
    for (let i = 0; i < count; i++) {
      cells[i] = imports[i]
    }
  }

  /**
   * 调用区域事件
   * @param {string} type 区域事件类型
   * @param {Actor} [triggerActor] 事件触发角色
   * @returns {EventHandler|undefined}
   */
  callEvent(type, triggerActor) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      if (triggerActor) {
        event.triggerActor = triggerActor
      }
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用区域事件和脚本
   * @param {string} type 区域事件类型
   * @param {Actor} [triggerActor] 事件触发角色
   */
  emit(type, triggerActor) {
    this.callEvent(type, triggerActor)
    this.script.emit(type, this)
  }

  /** 销毁场景区域 */
  destroy() {
    this.emit('destroy')
  }

  /** 保存区域数据 */
  saveData() {
    return {
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      name: this.name,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    }
  }
}

// ******************************** 场景光源管理器类 ********************************

class SceneLightManager {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 场景光源预设数据表
   *  @type {Object}
   */ presets //:object

  /** 场景光源群组列表
   *  @type {Array<Array<SceneLight>>}
   */ groups  //:array

  /**
   * 场景光源管理器
   * @param {SceneContext} scene 场景上下文对象
   */
  constructor(scene) {
    this.scene = scene
    this.presets = {}

    // 根据混合模式创建子列表
    const max = []
    const screen = []
    const additive = []
    const subtract = []
    const groups = [max, screen, additive, subtract]
    groups.max = max
    groups.screen = screen
    groups.additive = additive
    groups.subtract = subtract
    this.groups = groups
  }

  /**
   * 添加场景光源到管理器中
   * @param {SceneLight} light 场景光源实例
   */
  append(light) {
    if (light.parent === null) {
      light.parent = this
      this.groups[light.blend].push(light)
      this.scene.idMap.set(light.presetId, light)
    }
  }

  /**
   * 从管理器中移除场景光源
   * @param {SceneLight} light 场景光源实例
   */
  remove(light) {
    if (light.parent === this) {
      light.parent = null
      this.groups[light.blend].remove(light)
      this.scene.idMap.delete(light.presetId, light)
    }
  }

  /**
   * 更新场景光源
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    for (const group of this.groups) {
      const length = group.length
      for (let i = 0; i < length; i++) {
        group[i].update(deltaTime)
      }
    }
  }

  /** 渲染环境光和场景光源到纹理中 */
  render() {
    // 绘制环境光
    const gl = GL
    const scene = this.scene
    const ambient = scene.ambient
    const ambientRed = ambient.red / 255
    const ambientGreen = ambient.green / 255
    const ambientBlue = ambient.blue / 255
    // 获取光照纹理裁剪区域
    const cx = gl.lightmap.clipX
    const cy = gl.lightmap.clipY
    const cw = gl.lightmap.clipWidth
    const ch = gl.lightmap.clipHeight
    // 绑定光照纹理FBO
    gl.bindFBO(gl.lightmap.fbo)
    gl.setViewport(cx, cy, cw, ch)
    gl.clearColor(ambientRed, ambientGreen, ambientBlue, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    // 获取可见光源
    const queue = gl.arrays[1].uint16
    const tw = scene.tileWidth
    const th = scene.tileHeight
    // 获取场景光源可见范围，并转换成图块坐标
    const sl = Camera.lightLeft
    const st = Camera.lightTop
    const sr = Camera.lightRight
    const sb = Camera.lightBottom
    const ll = sl / tw
    const lt = st / th
    const lr = sr / tw
    const lb = sb / th
    const vs = tw / th
    const groups = this.groups
    const length = groups.length
    let qi = 0
    for (let gi = 0; gi < length; gi++) {
      const group = groups[gi]
      const length = group.length
      for (let i = 0; i < length; i++) {
        const light = group[i]
        if (light.visible) {
          const {x, y} = light
          switch (light.type) {
            case 'point': {
              const rr = light.range / 2
              const px = x < ll ? ll : x > lr ? lr : x
              const py = y < lt ? lt : y > lb ? lb : y
              // 如果点光源可见，添加群组和光源索引到绘制队列
              if ((px - x) ** 2 + ((py - y) * vs) ** 2 < rr ** 2) {
                queue[qi++] = gi
                queue[qi++] = i
              }
              continue
            }
            case 'area': {
              const ml = x + light.measureOffsetX
              const mt = y + light.measureOffsetY
              const mr = ml + light.measureWidth
              const mb = mt + light.measureHeight
              // 如果区域光源可见，添加群组和光源索引到绘制队列
              if (ml < lr && mt < lb && mr > ll && mb > lt) {
                queue[qi++] = gi
                queue[qi++] = i
              }
              continue
            }
          }
        }
      }
    }

    // 绘制光源
    if (qi !== 0) {
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      // 按队列顺序绘制所有可见光源
      for (let i = 0; i < qi; i += 2) {
        groups[queue[i]][queue[i + 1]].draw(projMatrix)
      }
    }
    // 重置视口并解除FBO绑定
    gl.resetViewport()
    gl.unbindFBO()
  }

  /** 发送光源事件 */
  emit(eventType) {
    for (const group of this.groups) {
      for (const light of group) {
        light.emit(eventType)
      }
    }
  }

  /** 销毁管理器中的场景光源 */
  destroy() {
    for (const group of this.groups) {
      for (const light of group) {
        light.destroy()
      }
    }
  }

  /** 保存场景光源列表数据 */
  saveData() {
    let count = 0
    let length = 0
    for (const group of this.groups) {
      length += group.length
    }
    const data = new Array(length)
    for (const group of this.groups) {
      const length = group.length
      for (let i = 0; i < length; i++) {
        data[count++] = group[i].saveData()
      }
    }
    return data
  }

  /**
   * 加载场景光源列表数据
   * @param {Object[]} lights
   */
  loadData(lights) {
    const presets = this.presets
    for (const savedData of lights) {
      const data = presets[savedData.presetId]
      if (data) {
        // 重新创建光源实例
        savedData.events = data.events
        savedData.scripts = data.scripts
        this.append(new SceneLight(savedData))
      }
    }
  }
}

// ******************************** 场景光源类 ********************************

class SceneLight {
  /** 场景光源可见性
   *  @type {boolean}
   */ visible

  /** 场景光源预设数据ID
   *  @type {string}
   */ presetId

  /** 场景光源独立变量ID
   *  @type {string}
   */ selfVarId

  /** 场景光源名称
   *  @type {string}
   */ name

  /** 场景光源类型
   *  @type {string}
   */ type

  /** 场景光源混合模式
   *  @type {string}
   */ blend

  /** 场景光源水平位置
   *  @type {number}
   */ x

  /** 场景光源垂直位置
   *  @type {number}
   */ y

  /** 点光源照亮范围(直径)
   *  @type {number}
   */ range

  /** 点光源强度(0-1)
   *  @type {number}
   */ intensity

  /** 光线颜色-红(0-255)
   *  @type {number}
   */ red

  /** 光线颜色-绿(0-255)
   *  @type {number}
   */ green

  /** 光线颜色-蓝(0-255)
   *  @type {number}
   */ blue

  /** 区域光源锚点水平偏移
   *  @type {number}
   */ anchorOffsetX

  /** 区域光源锚点垂直偏移
   *  @type {number}
   */ anchorOffsetY

  /** 区域光源测量外接矩形水平偏移
   *  @type {number}
   */ measureOffsetX

  /** 区域光源测量外接矩形垂直偏移
   *  @type {number}
   */ measureOffsetY

  /** 区域光源测量外接矩形宽度
   *  @type {number}
   */ measureWidth

  /** 区域光源测量外接矩形高度
   *  @type {number}
   */ measureHeight

  /** 区域光源图像纹理
   *  @type {ImageTexture|null}
   */ texture

  /** 场景光源更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 场景光源事件映射表
   *  @type {Object}
   */ events

  /** 场景光源脚本管理器
   *  @type {Script}
   */ script

  /** 场景光源是否已经移动
   *  @type {boolean}
   */ moved

  /** 场景光源的父级对象
   *  @type {SceneLightManager|null}
   */ parent

  _mask //:string
  _anchorX //:number
  _anchorY //:number
  _width //:number
  _height //:number
  _angle //:number

  /**
   * 场景光源对象
   * @param {Object} light 场景中预设的光源数据
   */
  constructor(light = SceneLight.data) {
    this.visible = light.visible ?? true
    this.presetId = light.presetId
    this.selfVarId = light.selfVarId ?? ''
    this.name = light.name
    this.type = light.type
    this.blend = light.blend
    this.x = light.x
    this.y = light.y
    switch (this.type) {
      case 'point':
        // 加载点光源属性
        this.range = light.range
        this.intensity = light.intensity
        break
      case 'area':
        // 加载区域光源属性
        this.texture = null
        this.mask = light.mask
        this.anchorX = light.anchorX
        this.anchorY = light.anchorY
        this.width = light.width
        this.height = light.height
        this.angle = light.angle
        break
    }
    this.red = light.red
    this.green = light.green
    this.blue = light.blue
    this.updaters = new ModuleList()
    this.events = light.events
    this.script = Script.create(this, light.scripts)
    this.parent = null
    SceneLight.latest = this
  }

  /**
   * 蒙版图像文件ID
   * @type {string}
   */
  get mask() {
    return this._mask
  }

  set mask(value) {
    if (this._mask !== value) {
      this._mask = value
      // 销毁上一次的纹理
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
      }
    }
  }

  /**
   * 区域光源锚点X
   * @type {number}
   */
  get anchorX() {
    return this._anchorX
  }

  set anchorX(value) {
    this._anchorX = value
    this.moved = true
  }

  /**
   * 区域光源锚点Y
   * @type {number}
   */
  get anchorY() {
    return this._anchorY
  }

  set anchorY(value) {
    this._anchorY = value
    this.moved = true
  }

  /**
   * 区域光源宽度
   * @type {number}
   */
  get width() {
    return this._width
  }

  set width(value) {
    this._width = value
    this.moved = true
  }

  /**
   * 区域光源高度
   * @type {number}
   */
  get height() {
    return this._height
  }

  set height(value) {
    this._height = value
    this.moved = true
  }

  /**
   * 区域光源角度(degrees)
   * @type {number}
   */
  get angle() {
    return Math.degrees(this._angle)
  }

  set angle(degrees) {
    // 转换为弧度(将会频繁使用)
    this._angle = Math.radians(degrees)
    this.moved = true
  }

  /**
   * 更新场景光源
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    // 更新模块
    this.updaters.update(deltaTime)

    // 如果区域光发生移动，重新测量位置
    if (this.moved) {
      this.moved = false
      this.measure()
    }
  }

  /**
   * 绘制场景光源
   * @param {Matrix} projMatrix 投影矩阵
   */
  draw(projMatrix) {
    switch (this.type) {
      case 'point':
        return this.drawPointLight(projMatrix)
      case 'area':
        return this.drawAreaLight(projMatrix)
    }
  }

  /**
   * 绘制点光源
   * @param {Matrix} projMatrix 投影矩阵
   */
  drawPointLight(projMatrix) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const r = this.range / 2
    const ox = this.x
    const oy = this.y
    const dl = ox - r
    const dt = oy - r
    const dr = ox + r
    const db = oy + r
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = this.blend
    const program = gl.lightProgram.use()
    const red = this.red / 255
    const green = this.green / 255
    const blue = this.blue / 255
    const intensity = this.intensity
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.uniform4f(program.u_LightColor, red, green, blue, intensity)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  /**
   * 绘制区域光源
   * @param {Matrix} projMatrix 投影矩阵
   */
  drawAreaLight(projMatrix) {
    const texture = this.texture
    if (texture?.complete === false) {
      return
    }
    const gl = GL
    const vertices = gl.arrays[0].float32
    const ox = this.x
    const oy = this.y
    const dl = ox - this.anchorOffsetX
    const dt = oy - this.anchorOffsetY
    const dr = dl + this.width
    const db = dt + this.height
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = this.blend
    const program = gl.lightProgram.use()
    const mode = texture !== null ? 1 : 2
    const red = this.red / 255
    const green = this.green / 255
    const blue = this.blue / 255
    const matrix = gl.matrix
    .set(projMatrix)
    .rotateAt(ox, oy, this.angle)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, mode)
    gl.uniform4f(program.u_LightColor, red, green, blue, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.bindTexture(gl.TEXTURE_2D, texture?.base.glTexture)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  /** 测量区域光源的外接矩形(用于做绘制条件判断) */
  measure() {
    // 如果类型不是区域光源，返回
    if (this.type !== 'area') return
    const width = this.width
    const height = this.height
    const anchorOffsetX = width * this.anchorX
    const anchorOffsetY = height * this.anchorY
    const a = -anchorOffsetX
    const b = -anchorOffsetY
    const c = a + width
    const d = b + height
    const angle = this._angle
    const angle1 = Math.atan2(b, a) + angle
    const angle2 = Math.atan2(b, c) + angle
    const angle3 = Math.atan2(d, c) + angle
    const angle4 = Math.atan2(d, a) + angle
    const distance1 = Math.sqrt(a * a + b * b)
    const distance2 = Math.sqrt(c * c + b * b)
    const distance3 = Math.sqrt(c * c + d * d)
    const distance4 = Math.sqrt(a * a + d * d)
    const x1 = Math.cos(angle1) * distance1
    const x2 = Math.cos(angle2) * distance2
    const x3 = Math.cos(angle3) * distance3
    const x4 = Math.cos(angle4) * distance4
    const y1 = Math.sin(angle1) * distance1
    const y2 = Math.sin(angle2) * distance2
    const y3 = Math.sin(angle3) * distance3
    const y4 = Math.sin(angle4) * distance4
    this.anchorOffsetX = anchorOffsetX
    this.anchorOffsetY = anchorOffsetY
    this.measureOffsetX = Math.min(x1, x2, x3, x4)
    this.measureOffsetY = Math.min(y1, y2, y3, y4)
    this.measureWidth = Math.max(Math.abs(x1 - x3), Math.abs(x2 - x4))
    this.measureHeight = Math.max(Math.abs(y1 - y3), Math.abs(y2 - y4))
  }

  /**
   * 移动场景光源
   * @param {Array<string, number>} properties 光源属性词条
   * @param {string} easingId 过渡曲线ID
   * @param {number} duration 持续时间(毫秒)
   */
  move(properties, easingId, duration) {
    // 转换属性词条的数据结构
    const propEntries = Object.entries(properties)
    // 允许多个过渡同时存在且不冲突
    const {updaters} = this
    let transitions = updaters.get('move')
    // 如果上一次的移动光源过渡未结束，获取过渡更新器列表
    if (transitions) {
      let ti = transitions.length
      while (--ti >= 0) {
        // 获取单个过渡更新器，检查属性词条
        const updater = transitions[ti]
        const entries = updater.entries
        let ei = entries.length
        while (--ei >= 0) {
          const key = entries[ei][0]
          for (const property of propEntries) {
            // 从上一次过渡的属性中删除与当前过渡重复的属性
            if (property[0] === key) {
              entries.splice(ei, 1)
              if (entries.length === 0) {
                transitions.splice(ti, 1)
              }
              break
            }
          }
        }
      }
    }

    // 如果存在过渡
    if (duration > 0) {
      if (!transitions) {
        // 如果不存在过渡更新器列表，新建一个
        transitions = this.transitions = new ModuleList()
        updaters.set('move', transitions)
      }
      const entries = []
      const map = SceneLight.filters[this.type]
      for (const [key, end] of propEntries) {
        // 过滤掉与当前光源类型不匹配的属性
        if (!map[key]) continue
        const start = this[key]
        entries.push([key, start, end])
      }
      let elapsed = 0
      const easing = Easing.get(easingId)
      // 创建更新器并添加到过渡更新器列表中
      const updater = transitions.add({
        entries: entries,
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          for (const [key, start, end] of entries) {
            this[key] = start * (1 - time) + end * time
          }
          // 如果过渡结束，延迟移除更新器
          if (elapsed >= duration) {
            Callback.push(() => {
              transitions.remove(updater)
              // 如果过渡更新器列表为空，删除它
              if (transitions.length === 0) {
                updaters.delete('move')
              }
            })
          }
        }
      })
    } else {
      // 直接设置光源属性
      const map = SceneLight.filters[this.type]
      for (const [key, value] of propEntries) {
        // 过滤掉与当前光源类型不匹配的属性
        if (!map[key]) continue
        this[key] = value
      }
      // 如果存在过渡更新器列表并为空，删除它
      if (transitions?.length === 0) {
        updaters.deleteDelay('move')
      }
    }
  }

  /**
   * 调用场景光源事件
   * @param {string} type 场景光源事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.triggerLight = this
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景光源事件和脚本
   * @param {string} type 场景光源事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁场景光源 */
  destroy() {
    if (this.texture) {
      this.texture.destroy()
      this.texture = null
    }
    this.emit('destroy')
  }

  /** 保存场景光源数据 */
  saveData() {
    switch (this.type) {
      case 'point':
        return {
          visible: this.visible,
          presetId: this.presetId,
          selfVarId: this.selfVarId,
          name: this.name,
          type: this.type,
          blend: this.blend,
          x: this.x,
          y: this.y,
          range: this.range,
          intensity: this.intensity,
          red: this.red,
          green: this.green,
          blue: this.blue,
        }
      case 'area':
        return {
          visible: this.visible,
          presetId: this.presetId,
          selfVarId: this.selfVarId,
          name: this.name,
          type: this.type,
          blend: this.blend,
          x: this.x,
          y: this.y,
          mask: this.mask,
          anchorX: this.anchorX,
          anchorY: this.anchorY,
          width: this.width,
          height: this.height,
          angle: this.angle,
          red: this.red,
          green: this.green,
          blue: this.blue,
        }
    }
  }

  /**
   * 最新创建光源
   * @type {SceneLight|undefined}
   */
  static latest

  // 默认光源预设数据
  static data = {
    presetId: '',
    name: '',
    type: 'point',
    blend: 'screen',
    x: 0,
    y: 0,
    range: 4,
    intensity: 0,
    red: 255,
    green: 255,
    blue: 255,
    events: {},
    scripts: [],
  }

  // 属性过滤器[点光源，区域光源]
  static filters = function IIFE() {
    const T = true
    const common = {x: T, y: T, red: T, green: T, blue: T}
    const point = {...common, range: T, intensity: T}
    const area = {...common, anchorX: T, anchorY: T, width: T, height: T, angle: T}
    return {point, area}
  }()
}

// ******************************** 场景粒子发射器列表类 ********************************

class SceneParticleEmitterList extends Array {
  /** 场景上下文对象
   *  @type {SceneContext}
   */ scene

  /** 粒子发射器预设数据表
   *  @type {Object}
   */ presets

  /**
   * 场景粒子发射器列表
   * @param {SceneContext} scene 
   */
  constructor(scene) {
    super()
    this.scene = scene
    this.presets = {}
  }

  /**
   * 添加场景粒子发射器到管理器中
   * @param {SceneParticleEmitter} emitter 场景粒子发射器
   */
  append(emitter) {
    if (emitter.parent === null) {
      emitter.parent = this
      this.push(emitter)
      this.scene.idMap.set(emitter.presetId, emitter)
    }
  }

  /**
   * 从管理器中移除场景粒子发射器
   * @param {SceneParticleEmitter} emitter 场景粒子发射器
   */
  remove(emitter) {
    if (emitter.parent === this) {
      emitter.parent = null
      super.remove(emitter)
      this.scene.idMap.delete(emitter.presetId, emitter)
    }
  }

  /**
   * 更新场景粒子发射器
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const length = this.length
    for (let i = 0; i < length; i++) {
      this[i].update(deltaTime)
    }
  }

  /** 发送粒子发射器事件 */
  emit(eventType) {
    for (const emitter of this) {
      emitter.emit(eventType)
    }
  }

  /** 销毁管理器中的场景粒子发射器 */
  destroy() {
    const length = this.length
    for (let i = 0; i < length; i++) {
      this[i].destroy()
    }
  }

  /** 保存场景粒子发射器列表数据 */
  saveData() {
    const length = this.length
    const data = []
    for (let i = 0; i < length; i++) {
      const emitter = this[i]
      if ('saveData' in emitter) {
        data.push(emitter.saveData())
      }
    }
    return data
  }

  /**
   * 加载场景粒子发射器列表数据
   * @param {Object[]} emitters
   */
  loadData(emitters) {
    const presets = this.presets
    for (const savedData of emitters) {
      const preset = presets[savedData.presetId]
      if (preset) {
        const data = Data.particles[preset.particleId]
        if (data) {
          // 重新创建粒子实例
          savedData.events = preset.events
          savedData.scripts = preset.scripts
          this.append(new SceneParticleEmitter(savedData, data))
        }
      }
    }
  }
}

// ******************************** 场景粒子发射器类 ********************************

class SceneParticleEmitter extends ParticleEmitter {
  /** 粒子发射器预设数据ID
   *  @type {string}
   */ presetId

  /** 粒子发射器独立变量ID
   *  @type {string}
   */ selfVarId

  /** 粒子发射器名称
   *  @type {string}
   */ name

  /** 粒子发射器更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 粒子发射器事件映射表
   *  @type {Object}
   */ events

  /** 粒子发射器脚本管理器
   *  @type {Script}
   */ script

  _x //:number
  _y //:number

  /**
   * 场景粒子发射器
   * @param {Object} node 场景中预设的粒子发射器数据
   * @param {ParticleFile} data 粒子文件数据
   */
  constructor(node, data) {
    super(data)
    this.visible = node.visible ?? true
    this.presetId = node.presetId
    this.selfVarId = node.selfVarId ?? ''
    this.name = node.name
    this.x = node.x
    this.y = node.y
    this.angle = node.angle
    this.scale = node.scale
    this.speed = node.speed
    this.opacity = node.opacity
    this.priority = node.priority
    this.updaters = new ModuleList()
    this.events = node.events
    this.script = Script.create(this, node.scripts)
  }

  /**
   * 粒子发射器水平位置
   * @type {number}
   */
  get x() {
    return this._x
  }

  set x(value) {
    this._x = value
    this.startX = value * Scene.binding.tileWidth
  }

  /**
   * 粒子发射器垂直位置
   * @type {number}
   */
  get y() {
    return this._y
  }

  set y(value) {
    this._y = value
    this.startY = value * Scene.binding.tileHeight
  }

  /**
   * 更新场景粒子发射器
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    const al = Camera.animationLeftT
    const at = Camera.animationTopT
    const ar = Camera.animationRightT
    const ab = Camera.animationBottomT
    const x = this._x
    const y = this._y
    // 如果粒子发射器可见，则发射新的粒子
    if (x >= al && x < ar && y >= at && y < ab || this.alwaysEmit) {
      this.emitParticles(deltaTime)
    }
    this.updateParticles(deltaTime)
    this.updaters.update(deltaTime)
  }

  /**
   * 调用场景粒子发射器事件
   * @param {string} type 场景粒子发射器事件类型
   * @returns {EventHandler|undefined}
   */
  callEvent(type) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.selfVarId = this.selfVarId
      return EventHandler.call(event, this.updaters)
    }
  }

  /**
   * 调用场景粒子发射器事件和脚本
   * @param {string} type 场景粒子发射器事件类型
   */
  emit(type) {
    this.callEvent(type)
    this.script.emit(type, this)
  }

  /** 销毁场景粒子发射器 */
  destroy() {
    super.destroy()
    this.emit('destroy')
  }

  /** 保存场景粒子发射器数据 */
  saveData() {
    return {
      visible: this.visible,
      presetId: this.presetId,
      selfVarId: this.selfVarId,
      name: this.name,
      x: this.x,
      y: this.y,
      angle: this.angle,
      scale: this.scale,
      speed: this.speed,
      opacity: this.opacity,
      priority: this.priority,
    }
  }
}

// ******************************** 场景精灵渲染器类 ********************************

class SceneSpriteRenderer {
  /** 场景对象列表组
   *  @type {Array<Array<Object>>}
   */ objectLists

  /** 动画对象列表组
   *  @type {Array<Array<Object>>}
   */ animationLists

  /** 缓存对象列表组
   *  @type {Array<Array<Object>>}
   */ cacheLists

  /** 对象索引列表
   *  @type {Uint32Array}
   */ indices

  /**
   * 场景精灵渲染器
   * @param  {...Array} animationLists 可见动画列表组
   */
  constructor(...animationLists) {
    for (const list of animationLists) {
      list.count = 0
    }
    this.animationLists = animationLists
    this.cacheLists = animationLists.map(() => [])
    this.indices = new Uint32Array(animationLists.length)
  }

  /**
   * 重置所有数据
   */
  reset() {
    for (const animList of this.animationLists) {
      for (let i = 0; i < animList.count; i++) {
        animList[i] = null
      }
      animList.count = 0
    }
  }

  /**
   * 设置场景对象列表组
   * @param  {...Array} objectLists
   */
  setObjectLists(...objectLists) {
    this.objectLists = objectLists
  }

  /** 渲染场景中的可见对象 */
  render() {
    const {max, min, floor, ceil, round} = Math
    const gl = GL
    const lightmap = gl.lightmap
    const scene = Scene.binding
    const tw = scene.tileWidth
    const th = scene.tileHeight
    const tl = Camera.tileLeft
    const tt = Camera.tileTop
    const tr = Camera.tileRight
    const tb = Camera.tileBottom
    const ll = Camera.scrollLeft - lightmap.maxExpansionLeft
    const lt = Camera.scrollTop - lightmap.maxExpansionTop
    const lr = Camera.scrollRight + lightmap.maxExpansionRight
    const lb = Camera.scrollBottom + lightmap.maxExpansionBottom
    const lw = lr - ll
    const lh = lb - lt
    const ly = th / 2 / lh
    const layers = gl.layers
    const starts = gl.zeros
    const ends = gl.arrays[1].uint32
    const set = gl.arrays[2].uint32
    const data = gl.arrays[3].float32
    const datau = gl.arrays[3].uint32
    let li = 0
    let si = 2
    let di = 0

    // 获取对象层瓦片地图中可见图块的数据
    const {doodads} = Scene.parallaxes
    const dLength = doodads.length
    for (let i = 0; i < dLength; i++) {
      const tilemap = doodads[i]
      if (!tilemap.visible) continue
      const tiledata = tilemap.tiledata
      if (tiledata === null) continue
      const tiles = tilemap.tiles
      const width = tilemap.width
      const height = tilemap.height
      const anchor = Scene.getParallaxAnchor(tilemap)
      const ax = tilemap.anchorX * width * tw
      const ay = tilemap.anchorY * height * th
      const ox = anchor.x - ax + tilemap.offsetX
      const oy = anchor.y - ay + tilemap.offsetY
      const bx = max(floor((tl - ox) / tw), 0)
      const by = max(floor((tt - oy) / th), 0)
      const ex = min(ceil((tr - ox) / tw), width)
      const ey = min(ceil((tb - oy) / th), height)
      const opacity = Math.round(tilemap.opacity * 255) << 8
      for (let y = by; y < ey; y++) {
        for (let x = bx; x < ex; x++) {
          const ti = x + y * width
          const tile = tiles[ti]
          const array = tiledata[tile]
          if (array === null) {
            continue
          }
          const tp = array[1]
          // 把网格底部作为图块锚点
          const ax = (x + 0.5) * tw + ox
          const ay = (y + 1) * th + oy
          // 计算锚点在光照贴图中的位置
          const px = (ax - ll) / lw
          const py = (ay - lt + tp * th) / lh
          // 根据锚点的Y坐标来计算优先级，并作为键
          const key = max(0, min(0x3ffff, round(
            py * 0x20000 + 0x10000
          )))
          // 光线采样锚点的Y坐标向上偏移了0.5格(网格中心)
          const anchor = (
            round(max(min(px, 1), 0) * 0xffff)
          | round(max(min(py - ly, 1), 0) * 0xffff) << 16
          )
          datau[di    ] = i
          datau[di + 1] = tile
          data[di + 2] = ax - tw / 2
          data[di + 3] = ay - th
          datau[di + 4] = anchor
          datau[di + 5] = opacity
          if (starts[key] === 0) {
            starts[key] = si
            layers[li++] = key
          } else {
            set[ends[key] + 1] = si
          }
          ends[key] = si
          set[si++] = di
          set[si++] = 0
          di += 6
        }
      }
    }

    // 获取可见动画(角色、动画、触发器)
    const convert2f = Scene.convert2f
    const al = Camera.animationLeftT
    const at = Camera.animationTopT
    const ar = Camera.animationRightT
    const ab = Camera.animationBottomT
    const pFactor = th / lh
    const animLists = this.animationLists
    const cacheLists = this.cacheLists
    const objectLists = this.objectLists
    const aLength = animLists.length
    for (let a = 0; a < aLength; a++) {
      let count = 0
      const animList = animLists[a]
      const cacheList = cacheLists[a]
      const objectList = objectLists[a]
      const length = objectList.length
      if (a === 0) {
        // 遍历角色对象
        for (let i = 0; i < length; i++) {
          const actor = objectList[i]
          const {x, y} = actor
          // 如果动画在屏幕中可见或动画存在已激活粒子的情况
          if (x >= al && x < ar && y >= at && y < ab && actor.visible) {
            // 计算动画的锚点
            const {x: ax, y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const px = (ax - ll) / lw
            const py = (ay - lt) / lh
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              py * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            actor.animationManager.activate(ax, ay, px, py)
            cacheList[count++] = actor
          }
        }
      } else if (a <= 2) {
        // 遍历动画相关对象
        for (let i = 0; i < length; i++) {
          const object = objectList[i]
          const {animation} = object
          if (animation === null) continue
          const {x, y} = animation.position
          // 如果动画在屏幕中可见或动画存在已激活粒子的情况
          if (x >= al && x < ar && y >= at && y < ab && animation.visible) {
            // 计算动画的锚点
            const {x: ax, y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const px = (ax - ll) / lw
            const py = (ay - lt) / lh
            const p = animation.priority * pFactor
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            animation.activate(ax, ay, px, py)
            cacheList[count++] = object
          }
        }
      } else {
        // 遍历粒子发射器
        for (let i = 0; i < length; i++) {
          const emitter = objectList[i]
          const {x, y} = emitter
          // 如果粒子在屏幕中可见或总是绘制的情况
          if ((x >= al && x < ar && y >= at && y < ab || emitter.alwaysDraw) && emitter.visible) {
            // 计算粒子的锚点
            const {y: ay} = convert2f(x, y)
            // 计算锚点在光照贴图中的位置
            const py = (ay - lt) / lh
            const p = emitter.priority * pFactor
            // 根据锚点的Y坐标来计算优先级，并作为键
            const key = max(0, min(0x3ffff, round(
              (py + p) * 0x20000 + 0x10000
            )))
            datau[di    ] = 0x10000 | a
            datau[di + 1] = count
            if (starts[key] === 0) {
              starts[key] = si
              layers[li++] = key
            } else {
              set[ends[key] + 1] = si
            }
            ends[key] = si
            set[si++] = di
            set[si++] = 0
            di += 2
            cacheList[count++] = emitter
          }
        }
      }
      // 擦除过期的动画对象引用
      const end = animList.count
      for (let i = count; i < end; i++) {
        animList[i] = cacheList[i] = null
      }
      animList.count = count
    }

    // 绘制图像
    if (li !== 0) {
      const sl = Camera.scrollLeft
      const st = Camera.scrollTop
      const indices = this.indices.fill(0)
      const vertices = gl.arrays[0].float32
      const attributes = gl.arrays[0].uint32
      const blend = gl.batchRenderer.setBlendMode
      const push = gl.batchRenderer.push
      const response = gl.batchRenderer.response
      // 动画和对象层图块共用GL精灵程序进行绘制
      const program = gl.spriteProgram.use()
      const matrix = gl.matrix.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st)
      // 绑定渲染器程序为当前程序
      // 切换成粒子程序后自动恢复
      gl.batchRenderer.bindProgram()
      // 使用队列渲染器进行批量渲染
      gl.batchRenderer.setAttrSize(8)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      const modeMap = Animation.lightSamplingModes
      const frame = scene.animFrame
      // 借助类型化数组对键(优先级)进行排序
      const queue = new Uint32Array(layers.buffer, 0, li).sort()
      for (let i = 0; i < li; i++) {
        // 通过排序后的键来获取图块或动画
        const key = queue[i]
        let si = starts[key]
        starts[key] = 0
        do {
          const di = set[si]
          const code1 = datau[di]
          const code2 = datau[di + 1]
          if (code1 < 0x10000) {
            // 如果第一个数据小于0x10000，则是图块索引
            const tilemap = doodads[code1]
            const light = modeMap[tilemap.light] << 16
            const array = tilemap.tiledata[code2]
            blend(tilemap.blend)
            push(array[0])
            const fi = frame % array[2] * 4 + 7
            const dx = data[di + 2]
            const dy = data[di + 3]
            const anchor = datau[di + 4]
            const opacity = datau[di + 5]
            const dl = array[3] + dx
            const dt = array[4] + dy
            const dr = array[5] + dx
            const db = array[6] + dy
            const sl = array[fi    ]
            const st = array[fi + 1]
            const sr = array[fi + 2]
            const sb = array[fi + 3]
            const vi = response[0] * 8
            // 参数压缩：纹理采样器ID，不透明度，光线采样模式
            const param = response[1] | opacity | light
            vertices  [vi    ] = dl
            vertices  [vi + 1] = dt
            vertices  [vi + 2] = sl
            vertices  [vi + 3] = st
            attributes[vi + 4] = param
            // 两个0x00ff00ff等于色调(0,0,0,0)
            attributes[vi + 5] = 0x00ff00ff
            attributes[vi + 6] = 0x00ff00ff
            attributes[vi + 7] = anchor
            vertices  [vi + 8] = dl
            vertices  [vi + 9] = db
            vertices  [vi + 10] = sl
            vertices  [vi + 11] = sb
            attributes[vi + 12] = param
            attributes[vi + 13] = 0x00ff00ff
            attributes[vi + 14] = 0x00ff00ff
            attributes[vi + 15] = anchor
            vertices  [vi + 16] = dr
            vertices  [vi + 17] = db
            vertices  [vi + 18] = sr
            vertices  [vi + 19] = sb
            attributes[vi + 20] = param
            attributes[vi + 21] = 0x00ff00ff
            attributes[vi + 22] = 0x00ff00ff
            attributes[vi + 23] = anchor
            vertices  [vi + 24] = dr
            vertices  [vi + 25] = dt
            vertices  [vi + 26] = sr
            vertices  [vi + 27] = st
            attributes[vi + 28] = param
            attributes[vi + 29] = 0x00ff00ff
            attributes[vi + 30] = 0x00ff00ff
            attributes[vi + 31] = anchor
          } else {
            // 否则，是动画所在列表的索引
            const li = code1 & 0xffff
            const object = cacheLists[li][code2]
            animLists[li][indices[li]++] = object
            if (li === 0) {
              object.animationManager.draw()
            } else if (li <= 2) {
              object.animation.draw()
            } else {
              gl.batchRenderer.draw()
              object.draw()
            }
          }
        } while ((si = set[si + 1]) !== 0)
      }
      gl.batchRenderer.draw()
      gl.batchRenderer.unbindProgram()
    }
  }
}