'use strict'

// ******************************** 摄像机对象 ********************************

const Camera = new class {
  /**
   * 摄像机跟随的目标角色
   * @type {Actor|null}
   */
  target = null

  /**
   * 摄像机更新器模块列表
   * @type {ModuleList}
   */
  updaters = new ModuleList()

  /** 摄像机水平位置 */
  x = 0

  /** 摄像机垂直位置 */
  y = 0

  /** 摄像机缩放率 */
  zoom = 1

  /** 摄像机矩形区域宽度 */
  width = 0

  /** 摄像机矩形区域高度 */
  height = 0

  /** 场景边距 */
  padding = 0

  // 其他属性
  tileArea = 0
  animationArea = 0
  lightArea = 0
  scrollLeft = 0
  scrollTop = 0
  scrollRight = 0
  scrollBottom = 0
  scrollCenterX = 0
  scrollCenterY = 0
  tileLeft = 0
  tileTop = 0
  tileRight = 0
  tileBottom = 0
  animationLeft = 0
  animationTop = 0
  animationRight = 0
  animationBottom = 0
  animationLeftT = 0
  animationTopT = 0
  animationRightT = 0
  animationBottomT = 0
  lightLeft = 0
  lightTop = 0
  lightRight = 0
  lightBottom = 0

  /** 初始化摄像机 */
  initialize() {
    this.padding = Data.config.scene.padding
    this.tileArea = Data.config.tileArea
    this.animationArea = Data.config.animationArea
    this.lightArea = Data.config.lightArea
  }

  /** 重置摄像机 */
  reset() {
    this.target = null
    this.x = 0
    this.y = 0
    this.zoom = 1
    this.updaters.delete('move')
    this.updaters.delete('zoom')
  }

  /**
   * 移动摄像机到指定位置
   * @param {number} x 场景X
   * @param {number} y 场景Y
   * @param {string} [easingId] 过渡曲线ID
   * @param {number} [duration] 持续时间(毫秒)
   */
  moveTo(x, y, easingId, duration) {
    this.unfollow()
    const {updaters} = this
    if (duration > 0) {
      let elapsed = 0
      const sx = this.x
      const sy = this.y
      const easing = Easing.get(easingId)
      // 创建更新器
      updaters.set('move', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          this.x = sx * (1 - time) + x * time
          this.y = sy * (1 - time) + y * time
          if (elapsed >= duration) {
            updaters.deleteDelay('move')
          }
        }
      })
    } else {
      // 立即移动摄像机
      updaters.deleteDelay('move')
      this.x = x
      this.y = y
    }
  }

  /**
   * 摄像机跟随目标角色
   * @param {Actor} target 目标角色
   * @param {string} [easingId] 过渡曲线ID
   * @param {number} [duration] 持续时间(毫秒)
   */
  follow(target, easingId, duration) {
    this.target = target
    const {updaters} = this
    if (duration > 0) {
      let elapsed = 0
      const sx = this.x
      const sy = this.y
      const easing = Easing.get(easingId)
      // 创建更新器
      updaters.set('move', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          this.x = sx * (1 - time) + target.x * time
          this.y = sy * (1 - time) + target.y * time
          if (elapsed >= duration) {
            updaters.set('move', this.createFollower())
          }
        }
      })
    } else {
      // 立即移动摄像机
      updaters.set('move', this.createFollower())
      this.x = target.x
      this.y = target.y
    }
  }

  /** 解除摄像机跟随目标 */
  unfollow() {
    this.target = null
  }

  /**
   * 设置摄像机缩放系数
   * @param {number} zoom 缩放系数[1-8]
   * @param {string} easingId 过渡曲线ID
   * @param {number} duration 持续时间(毫秒)
   */
  setZoomFactor(zoom, easingId, duration) {
    const {updaters} = this
    if (duration > 0) {
      let elapsed = 0
      const start = this.zoom
      const easing = Easing.get(easingId)
      // 创建zoom更新器
      updaters.set('zoom', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          this.zoom = start * (1 - time) + zoom * time
          if (elapsed >= duration) {
            updaters.deleteDelay('zoom')
          }
        }
      })
    } else {
      // 立即设置摄像机缩放系数
      updaters.deleteDelay('zoom')
      this.zoom = zoom
    }
  }

  /**
   * 更新摄像机的位置以及相关参数
   * @param {number} deltaTime 增量时间(毫秒)
   */
  update(deltaTime) {
    // 更新模块
    this.updaters.update(deltaTime)

    // 计算摄像机位置
    const scene = Scene.binding
    const padding = this.padding
    const zoom = this.zoom
    const tileWidth = scene.tileWidth
    const tileHeight = scene.tileHeight
    const innerWidth = tileWidth * scene.width
    const innerHeight = tileHeight * scene.height
    const cameraWidth = GL.width / zoom
    const cameraHeight = GL.height / zoom
    const center = Scene.convert(this)
    const scrollLeft = innerWidth + padding * 2 <= cameraWidth
    ? (innerWidth - cameraWidth) / 2
    : Math.clamp(
      center.x - cameraWidth / 2,
      -padding,
      innerWidth - cameraWidth + padding,
    )
    const scrollTop = innerHeight + padding * 2 <= cameraHeight
    ? (innerHeight - cameraHeight) / 2
    : Math.clamp(
      center.y - cameraHeight / 2,
      -padding,
      innerHeight - cameraHeight + padding,
    )
    const tile = this.tileArea
    const animation = this.animationArea
    const light = this.lightArea
    const scrollRight = scrollLeft + cameraWidth
    const scrollBottom = scrollTop + cameraHeight
    this.width = cameraWidth
    this.height = cameraHeight
    this.scrollLeft = scrollLeft
    this.scrollTop = scrollTop
    this.scrollRight = scrollRight
    this.scrollBottom = scrollBottom
    this.scrollCenterX = (scrollLeft + scrollRight) / 2
    this.scrollCenterY = (scrollTop + scrollBottom) / 2
    this.tileLeft = scrollLeft - tile.expansionLeft
    this.tileTop = scrollTop - tile.expansionTop
    this.tileRight = scrollRight + tile.expansionRight
    this.tileBottom = scrollBottom + tile.expansionBottom
    this.animationLeft = scrollLeft - animation.expansionLeft
    this.animationTop = scrollTop - animation.expansionTop
    this.animationRight = scrollRight + animation.expansionRight
    this.animationBottom = scrollBottom + animation.expansionBottom
    this.animationLeftT = this.animationLeft / tileWidth
    this.animationTopT = this.animationTop / tileHeight
    this.animationRightT = this.animationRight / tileWidth
    this.animationBottomT = this.animationBottom / tileHeight

    // 计算当前缩放率的光影纹理参数
    const texture = GL.lightmap
    if (texture.scale !== zoom) {
      texture.scale = zoom
      const {ceil, min} = Math
      const pl = texture.paddingLeft
      const pt = texture.paddingTop
      const pr = texture.paddingRight
      const pb = texture.paddingBottom
      const el = ceil(min(light.expansionLeft * zoom, pl))
      const et = ceil(min(light.expansionTop * zoom, pt))
      const er = ceil(min(light.expansionRight * zoom, pr))
      const eb = ceil(min(light.expansionBottom * zoom, pb))
      texture.expansionLeft = el / zoom
      texture.expansionTop = et / zoom
      texture.expansionRight = er / zoom
      texture.expansionBottom = eb / zoom
      texture.maxExpansionLeft = pl / zoom
      texture.maxExpansionTop = pt / zoom
      texture.maxExpansionRight = pr / zoom
      texture.maxExpansionBottom = pb / zoom
      texture.clipX = pl - el
      texture.clipY = pt - et
      texture.clipWidth = GL.width + el + er
      texture.clipHeight = GL.height + et + eb
    }

    // 设置光源渲染范围
    this.lightLeft = scrollLeft - texture.expansionLeft
    this.lightTop = scrollTop - texture.expansionTop
    this.lightRight = scrollRight + texture.expansionRight
    this.lightBottom = scrollBottom + texture.expansionBottom
  }

  /** 保存摄像机数据 */
  saveData() {
    return {
      target: this.target?.entityId ?? '',
      x: this.x,
      y: this.y,
      zoom: this.zoom,
    }
  }

  /**
   * 加载摄像机数据
   * @param {Object} camera
   */
  async loadData(camera) {
    // 等待场景加载完毕
    await void 0
    await Scene.binding?.promise
    this.x = camera.x
    this.y = camera.y
    this.zoom = camera.zoom
    // 获取摄像机跟随的全局角色或场景角色(如果有)
    const entityId = camera.target
    const target = ActorManager.entityIdMap[entityId] ?? Scene.binding?.entityIdMap[entityId]
    if (target) {
      this.follow(target)
    }
  }

  /**
   * 创建目标角色跟随器(返回更新器)
   * @returns {{update: function}}
   */
  createFollower() {
    return {
      update: () => {
        if (!this.target.destroyed) {
          // 如果角色未销毁则跟随
          this.x = this.target.x
          this.y = this.target.y
        } else {
          // 否则解除摄像机跟随
          this.target = null
          this.updaters.deleteDelay('move')
        }
      }
    }
  }

  /**
   * 将场景坐标转换为屏幕坐标
   * @param {{x: number, y: number}} scenePos 拥有场景坐标的对象
   * @returns {{x: number, y: number}}
   */
  convertToScreenCoords(scenePos) {
    const point = Scene.sharedPoint
    const x = scenePos.x * Scene.binding.tileWidth
    const y = scenePos.y * Scene.binding.tileHeight
    point.x = (x - this.scrollLeft) / this.width * GL.width
    point.y = (y - this.scrollTop) / this.height * GL.height
    return point
  }
}