'use strict'

// ******************************** 界面对象 ********************************

const UI = new class {
  /** 根元素
   *  @type {RootElement}
   */ root

  /** 最新创建的元素
   *  @type {UIElement|undefined}
   */ latest

  /** 目标元素
   *  @type {UIElement|null}
   */ target = null

  /** 鼠标悬浮中的元素
   *  @type {UIElement|null}
   */ hover = null

  /** 元素管理器
   *  @type {UIElementManager}
   */ manager

  /** ID->预设元素数据映射表
   *  @type {Object}
   */ presets = {}

  /** ID->元素映射表
   *  @type {Object}
   */ idMap = {}

  // 元素类映射表
  elementClassMap

  /** 初始化界面管理器 */
  initialize() {
    // 创建根元素
    this.root = new RootElement()
    this.root.resize()

    // 创建管理器
    this.manager = UIElementManager

    // 加载预设元素
    this.loadPresets()

    // 元素类映射表(数据类名->类)
    this.elementClassMap = {
      image: ImageElement,
      text: TextElement,
      textbox: TextBoxElement,
      dialogbox: DialogBoxElement,
      progressbar: ProgressBarElement,
      video: VideoElement,
      window: WindowElement,
      container: ContainerElement,
    }

    // 侦听事件
    window.on('resize', this.resize)
    Input.on('mousedown', this.mousedown)
    Input.on('mousedownLB', this.mousedownLB)
    Input.on('mousedownRB', this.mousedownRB)
    Input.on('mouseup', this.mouseup)
    Input.on('mouseupLB', this.mouseupLB)
    Input.on('mouseupRB', this.mouseupRB)
    Input.on('mousemove', this.mousemove)
    Input.on('mouseleave', this.mouseleave)
    Input.on('doubleclick', this.doubleclick)
    Input.on('wheel', this.wheel)
  }

  /** 加载预设元素 */
  loadPresets() {
    const presets = this.presets
    const setMap = nodes => {
      for (const node of nodes) {
        presets[node.presetId] = node
        if (node.children.length !== 0) {
          setMap(node.children)
        }
      }
    }
    for (const ui of Object.values(Data.ui)) {
      setMap(ui.nodes)
    }
  }

  /**
   * 加载界面中的所有元素
   * @param {string} uiId 界面文件ID
   * @returns {UIElement[]}
   */
  loadUI(uiId) {
    const elements = []
    const ui = Data.ui[uiId]
    if (!ui) return elements
    Script.deferredLoading = true
    // 创建所有的元素
    for (const node of ui.nodes) {
      if (node.enabled) {
        elements.push(this._createElement(node))
      }
    }
    Script.loadDeferredParameters()
    return elements
  }

  /**
   * 创建预设元素的实例
   * @param {string} presetId 预设元素ID
   * @returns {UIElement}
   */
  createElement(presetId) {
    const preset = UI.presets[presetId]
    if (preset) {
      Script.deferredLoading = true
      const element = this._createElement(preset)
      Script.loadDeferredParameters()
      return element
    }
    throw new Error(`Invalid Element ID: ${presetId}`)
  }

  /**
   * 创建预设元素的实例(私有)
   * @param {Object} node 预设元素数据
   * @returns {UIElement}
   */
  _createElement(node) {
    // 编译元素事件
    if (Array.isArray(node.events)) {
      Data.compileEvents(node)
    }
    const element = new UI.elementClassMap[node.class](node)
    for (const childNode of node.children) {
      // 创建子元素时忽略禁用的元素
      if (childNode.enabled) {
        element.appendChild(this._createElement(childNode))
      }
    }
    return element
  }

  /**
   * 创建预设元素的实例，并添加到跟元素
   * @param {string} presetId 预设元素ID
   * @returns {UIElement}
   */
  add(presetId) {
    const element = UI.createElement(presetId)
    UI.root.appendChild(element)
    return element
  }

  /** 更新元素 */
  update() {
    UI.manager.update()
  }

  /** 渲染元素 */
  render() {
    UI.root.draw()
  }

  /** 重置界面，销毁所有元素 */
  reset() {
    const {children} = UI.root
    let i = children.length
    // 逆序删除根元素下的内容
    while (--i >= 0) {
      // 可能在销毁回调中销毁了其他元素
      // 因此做个有效性判断
      children[i]?.destroy()
    }
  }

  /**
   * 获取已经创建的元素实例(通过ID)
   * @param {string} presetId 预设元素ID
   * @returns {UIElement|undefined}
   */
  get(presetId) {
    return this.idMap[presetId]
  }

  /**
   * 查找目标元素(通过屏幕坐标)
   * @param {UIElement[]} elements 元素列表
   * @param {number} x 屏幕X
   * @param {number} y 屏幕Y
   * @returns {UIElement|undefined}
   */
  find(elements, x, y) {
    // 越是后面的元素优先级越高，因此逆序查找
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      if (element.visible) {
        switch (element.pointerEvents) {
          case 'enabled':
            // 如果启用了指针事件，且指针位于元素区域中，则作为备选，继续查找子元素
            if (element.isPointIn(x, y)) {
              return this.find(element.children, x, y) ?? element
            }
            continue
          case 'skipped':
            // 如果跳过指针事件，则当作该元素不存在
            if (element.isPointIn(x, y)) {
              const target = this.find(element.children, x, y)
              if (target) return target
            }
            continue
          case 'disabled':
            continue
        }
      }
    }
    return undefined
  }

  /**
   * 获取鼠标位置的元素
   * @returns {UIElement}
   */
  getElementAtMouse() {
    return UI.find(
      UI.root.children,
      Input.mouse.screenX,
      Input.mouse.screenY,
    ) ?? UI.root
  }

  /**
   * 更新事件冒泡状态(私有)
   * 如果选中了UI元素
   * 阻止事件传递到场景中
   * @param {UIElement} target
   */
  _updateBubbleState(target) {
    if (target !== UI.root &&
      target instanceof UIElement) {
      Input.bubbles.stop()
    }
  }

  /** 检查是否移除了hover元素 */
  checkIfRemovedHover(element) {
    let hover = this.hover
    // 如果删除的元素包含了hover元素
    // 删除前触发相关元素的鼠标离开事件
    if (element.contains(hover)) {
      this.hover = null
      const {parent} = element
      do {
        hover.emit('mouseleave', false)
        hover = hover.parent
      } while (hover !== parent)
    }
  }

  /**
   * 添加界面事件侦听器
   * @param {string} type 界面事件类型
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
   * 移除界面事件侦听器(未使用)
   * @param {string} type 界面事件类型
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

  /** 重新调整大小事件 */
  resize() {
    UI.root.resize()
  }

  /** 鼠标按下事件 */
  mousedown() {
    const target = UI.getElementAtMouse()
    target.emit('mousedown', true)
    UI._updateBubbleState(target)
  }

  /** 鼠标左键按下事件 */
  mousedownLB() {
    UI.target = UI.getElementAtMouse()
    UI.target.emit('mousedownLB', true)
    UI._updateBubbleState(UI.target)
  }

  /** 鼠标右键按下事件 */
  mousedownRB() {
    const target = UI.getElementAtMouse()
    target.emit('mousedownRB', true)
    UI._updateBubbleState(target)
  }

  /** 鼠标弹起事件 */
  mouseup() {
    const target = UI.getElementAtMouse()
    target.emit('mouseup', true)
    UI._updateBubbleState(target)
  }

  /** 鼠标左键弹起事件 */
  mouseupLB() {
    const target = UI.getElementAtMouse()
    target.emit('mouseupLB', true)
    if (UI.target?.contains(target)) {
      Input.bubbles.push(true)
      target.emit('click', true)
      Input.bubbles.pop()
    }
    UI.target = null
    UI._updateBubbleState(target)
  }

  /** 鼠标右键弹起事件 */
  mouseupRB() {
    const target = UI.getElementAtMouse()
    target.emit('mouseupRB', true)
    UI._updateBubbleState(target)
  }

  /** 鼠标移动事件 */
  mousemove() {
    const last = UI.hover
    const hover = UI.getElementAtMouse()
    if (last !== hover) {
      if (last !== null && !last.contains(hover)) {
        let element = last
        do {
          element.emit('mouseleave', false)
          element = element.parent
        } while (element !== null && element !== hover)
      }
      if (hover !== null && !hover.contains(last)) {
        let element = hover
        do {
          element.emit('mouseenter', false)
          element = element.parent
        } while (element !== null && element !== last)
      }
      UI.hover = hover
    }
    hover.emit('mousemove', true)
    UI._updateBubbleState(hover)
  }

  /** 鼠标离开事件 */
  mouseleave() {
    if (UI.hover !== null) {
      UI.hover.emit('mouseleave', true)
      UI.hover = null
    }
  }

  /** 鼠标双击事件 */
  doubleclick() {
    if (UI.target !== null) {
      UI.target.emit('doubleclick', true)
      UI._updateBubbleState(UI.target)
    }
  }

  /** 鼠标滚轮事件 */
  wheel() {
    if (UI.hover !== null) {
      UI.hover.emit('wheel', true)
      UI._updateBubbleState(UI.hover)
    }
  }
}

// ******************************** 元素基类 ********************************

class UIElement {
  /** 预设元素数据ID
   *  @type {string}
   */ presetId

  /** 元素名称
   *  @type {string}
   */ name

  /** 元素水平位置(自动计算值)
   *  @type {number}
   */ x

  /** 元素垂直位置(自动计算值)
   *  @type {number}
   */ y

  /** 元素宽度(自动计算值)
   *  @type {number}
   */ width

  /** 元素高度(自动计算值)
   *  @type {number}
   */ height

  /** 元素变换矩阵
   *  @type {Matrix}
   */ matrix

  /** 元素不透明度(自动计算值)
   *  @type {number}
   */ opacity

  /** 元素变换数据
   *  @type {Object}
   */ transform

  /** 父级元素对象
   *  @type {UIElement|null}
   */ parent

  /** 子元素列表
   *  @type {Array<UIElement>}
   */ children

  /** 元素可见性
   *  @type {boolean}
   */ visible

  /** 元素是否已经连接
   *  @type {boolean}
   */ connected

  /** 元素是否已激活指针事件
   *  @type {boolean}
   */ pointerEvents

  /** 元素属性映射表
   *  @type {Object}
   */ attributes

  /** 元素更新器模块列表
   *  @type {ModuleList}
   */ updaters

  /** 元素事件映射表
   *  @type {Object}
   */ events

  /** 元素脚本管理器
   *  @type {Script}
   */ script

  // 默认元素数据
  static defaultData = {
    presetId: '',
    name: '',
    events: [],
    scripts: [],
    transform: {
      anchorX: 0,
      anchorY: 0,
      x: 0,
      x2: 0,
      y: 0,
      y2: 0,
      width: 0,
      width2: 0,
      height: 0,
      height2: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      opacity: 1,
    },
  }

  /**
   * @param {Object} data 预设元素数据
   */
  constructor(data) {
    this.presetId = data.presetId
    this.name = data.name
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.matrix = new Matrix()
    this.opacity = 1
    this.transform = {...data.transform}
    this.parent = null
    this.children = []
    this.visible = true
    this.connected = false
    this.pointerEvents = 'enabled'
    this.attributes = {}
    this.updaters = new ModuleList()
    this.events = data.events
    this.script = Script.create(this, data.scripts)
    UI.latest = this

    // 添加到ID->元素映射表
    if (this.presetId) {
      UI.idMap[this.presetId] = this
    }
  }

  /** 连接元素 */
  connect() {
    // 添加元素到管理器中
    UI.manager.append(this)
    this.connected = true
    this.connectChildren()
  }

  /** 断开元素 */
  disconnect() {
    // 从管理器中移除元素
    UI.manager.remove(this)
    this.connected = false
    this.disconnectChildren()
  }

  /** 连接所有子元素 */
  connectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].connect()
    }
  }

  /** 断开所有子元素 */
  disconnectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].disconnect()
    }
  }

  /** 绘制所有子元素 */
  drawChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].draw()
    }
  }

  /** 调整所有子元素 */
  resizeChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].resize()
    }
  }

  /** 销毁所有子元素 */
  destroyChildren() {
    const children = this.children
    let i = children.length
    while (--i >= 0) {
      children[i]?.destroy()
    }
  }

  /**
   * 添加多个子元素
   * @param {UIElement[]} elements 元素列表
   */
  appendChildren(elements) {
    for (const element of elements) {
      this.appendChild(element)
    }
  }

  /**
   * 添加子元素
   * @param {UIElement} element 元素
   */
  appendChild(element) {
    // 如果子元素列表添加了目标元素(过滤重复)
    if (element && this.children.append(element)) {
      // 解除子元素之前的父子关系
      element.parent?.children.remove(element)
      element.parent = this
      // 如果本元素已连接
      if (this.connected) {
        // 连接子元素并调整大小
        !element.connected &&
        element.connect()
        element.resize()
      } else {
        // 断开子元素连接
        element.connected &&
        element.disconnect()
      }
    }
  }

  /**
   * 插入子元素到目标元素前面
   * @param {UIElement} element 新插入的元素
   * @param {UIElement} destination 目标位置的元素
   */
  insertBefore(element, destination) {
    if (!element) return
    const pos = this.children.indexOf(destination)
    if (pos !== -1 && !this.children.includes(element)) {
      this.children.splice(pos, 0, element)
      // 解除子元素之前的父子关系
      element.parent?.children.remove(element)
      element.parent = this
      // 如果本元素已连接
      if (this.connected) {
        // 连接子元素并调整大小
        !element.connected &&
        element.connect()
        element.resize()
      } else {
        // 断开子元素连接
        element.connected &&
        element.disconnect()
      }
    }
  }

  /**
   * 将元素移动到父级列表中指定的索引位置
   * @param {number} pos 目标索引位置
   */
  moveToIndex(pos) {
    const {parent} = this
    if (parent) {
      const elements = parent.children
      const length = elements.length
      // 如果索引是负数，加上列表长度
      if (pos < 0) pos += length
      if (elements[pos] !== this &&
        elements[pos] !== undefined) {
        const index = elements.indexOf(this)
        const step = index < pos ? 1 : -1
        // 移动本元素到指定的索引位置
        for (let i = index; i !== pos; i += step) {
          elements[i] = elements[i + step]
        }
        elements[pos] = this
        // 如果父元素是窗口，请求重新调整大小
        if (parent instanceof WindowElement) {
          parent.requestResizing()
        }
      }
    }
  }

  /** 从父级元素中移除 */
  remove() {
    if (this.parent?.children.remove(this)) {
      UI.checkIfRemovedHover(this)
      if (this.parent instanceof WindowElement) {
        this.parent.requestResizing()
      }
      this.parent = null
      if (this.connected) {
        this.disconnect()
      }
    }
  }

  /**
   * 清除所有子元素
   * @returns {UIElement}
   */
  clear() {
    const {children} = this
    let i = children.length
    while (--i >= 0) {
      children[i]?.destroy()
    }
    return this
  }

  /**
   * 隐藏元素
   * @returns {UIElement}
   */
  hide() {
    if (this.visible) {
      this.visible = false
    }
    return this
  }

  /**
   * 显示元素
   * @returns {UIElement}
   */
  show() {
    if (!this.visible) {
      this.visible = true
      this.resize()
    }
    return this
  }

  /** 使用变换参数来计算元素的实际位置 */
  calculatePosition() {
    // 如果元素已断开连接，返回
    if (this.connected === false) {
      return
    }

    const parent = this.parent
    const matrix = this.matrix.set(parent.matrix)
    const transform = this.transform
    const parentWidth = parent.width
    const parentHeight = parent.height
    const x = parent.x + transform.x + transform.x2 * parentWidth
    const y = parent.y + transform.y + transform.y2 * parentHeight
    const width = Math.max(transform.width + transform.width2 * parentWidth, 0)
    const height = Math.max(transform.height + transform.height2 * parentHeight, 0)
    const anchorX = transform.anchorX * width
    const anchorY = transform.anchorY * height
    const rotation = transform.rotation
    const scaleX = transform.scaleX
    const scaleY = transform.scaleY
    const skewX = transform.skewX
    const skewY = transform.skewY
    const opacity = transform.opacity * parent.opacity

    // 写入计算值
    this.x = x - anchorX
    this.y = y - anchorY
    this.width = width
    this.height = height
    this.opacity = opacity

    // 矩阵变换：旋转
    if (rotation !== 0) {
      matrix.rotateAt(x, y, Math.radians(rotation))
    }
    // 矩阵变换：缩放
    if (scaleX !== 1 || scaleY !== 1) {
      matrix.scaleAt(x, y, scaleX, scaleY)
    }
    // 矩阵变换：倾斜
    if (skewX !== 0 || skewY !== 0) {
      matrix.skewAt(x, y, skewX, skewY)
    }
  }

  /**
   * 判断是否包含指定元素
   * @param {UIElement} element 目标元素
   * @returns {boolean}
   */
  contains(element) {
    while (element) {
      if (element === this) {
        return true
      }
      element = element.parent
    }
    return false
  }

  /**
   * 判断是否可见
   * @returns {boolean}
   */
  isVisible() {
    let element = this
    // 如果自己或祖先元素有一个不可见
    // 则本元素不可见，返回false
    while (element) {
      if (!element.visible) {
        return false
      }
      element = element.parent
    }
    return true
  }

  /**
   * 判断屏幕坐标点是否在元素区域内
   * @param {number} x 屏幕X
   * @param {number} y 屏幕Y
   * @returns {boolean}
   */
  isPointIn(x, y) {
    const W = this.width
    const H = this.height
    // 如果区域面积为0，返回false
    if (W * H === 0) {
      return false
    }

    const matrix = this.matrix
    const L = this.x
    const T = this.y
    const R = L + W
    const B = T + H
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + c * T + e - x
    const y1 = b * L + d * T + f - y
    const x2 = a * L + c * B + e - x
    const y2 = b * L + d * B + f - y
    const x3 = a * R + c * B + e - x
    const y3 = b * R + d * B + f - y
    const x4 = a * R + c * T + e - x
    const y4 = b * R + d * T + f - y
    const cross1 = x1 * y2 - y1 * x2
    const cross2 = x2 * y3 - y2 * x3
    const cross3 = x3 * y4 - y3 * x4
    const cross4 = x4 * y1 - y4 * x1
    return (
      cross1 * cross2 >= 0 &&
      cross2 * cross3 >= 0 &&
      cross3 * cross4 >= 0 &&
      cross4 * cross1 >= 0
    )
  }

  /**
   * 设置元素位置
   * @param {Object} transformProps 元素变换属性选项
   */
  set(transformProps) {
    for (const key of Object.keys(transformProps)) {
      this.transform[key] = transformProps[key]
    }
    this.resize()
  }

  /**
   * 移动元素
   * @param {Object} transformProps 元素变换属性选项
   * @param {string} [easingId] 过渡曲线ID
   * @param {number} [duration] 持续时间(毫秒)
   */
  move(transformProps, easingId, duration) {
    // 转换属性词条的数据结构
    const propEntries = Object.entries(transformProps)
    // 允许多个过渡同时存在且不冲突
    const {updaters} = this
    let transitions = updaters.get('move')
    // 如果上一次的移动元素过渡未结束，获取过渡更新器列表
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
      const transform = this.transform
      const length = propEntries.length
      const entries = new Array(length)
      for (let i = 0; i < length; i++) {
        const [key, end] = propEntries[i]
        const start = transform[key]
        entries[i] = [key, start, end]
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
            transform[key] = start * (1 - time) + end * time
          }
          // 限制不透明度的最大值，不让它溢出
          if (transform.opacity > 1) {
            transform.opacity = 1
          }
          // 如果当前更新器是最后一个，调整元素大小
          const last = transitions.length - 1
          if (updater === transitions[last]) {
            this.resize()
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
      // 直接设置元素属性
      const transform = this.transform
      for (const [key, value] of propEntries) {
        transform[key] = value
      }
      this.resize()
      // 如果存在过渡更新器列表并为空，删除它
      if (transitions?.length === 0) {
        updaters.deleteDelay('move')
      }
    }
  }

  /**
   * 查询属性匹配的后代元素
   * @param {string} key 属性键
   * @param {any} value 属性值
   * @returns {UIElement|undefined}
   */
  query(key, value) {
    // 优先在自己的子元素列表中查找
    for (const element of this.children) {
      if (element[key] === value) return element
    }
    // 如果没有发现，继续深入查找
    for (const element of this.children) {
      const target = element.query(key, value)
      if (target !== undefined) return target
    }
    return undefined
  }

  /**
   * 调用元素事件
   * @param {string} type 元素事件类型
   * @param {boolean} [bubble] 是否传递事件
   * @returns {EventHandler|undefined}
   */
  callEvent(type, bubble = false) {
    const commands = this.events[type]
    if (commands) {
      const event = new EventHandler(commands)
      event.bubble = bubble
      event.triggerElement = this
      EventHandler.call(event, this.updaters)
      return event
    }
  }

  /**
   * 调用元素事件和脚本
   * @param {string} type 元素事件类型
   * @param {boolean} [bubble] 是否传递事件
   */
  emit(type, bubble) {
    this.callEvent(type, bubble)
    this.script.emit(type, this)
    // 如果启用了事件传递，且未被阻止
    if (bubble && Input.bubbles.get()) {
      this.parent?.emit(type, bubble)
    }
  }

  /** 销毁元素 */
  destroy() {
    if (this.connected) {
      this.remove()
    }
    this.emit('destroy', false)
    // 取消注册元素(通过ID和名称)
    const {idMap} = UI
    const {presetId} = this
    if (idMap[presetId] === this) {
      delete idMap[presetId]
    }
    this.destroyChildren()
  }
}

// ******************************** 根元素 ********************************

class RootElement extends UIElement {
  constructor() {
    super({
      presetId: '',
      name: '',
      events: {},
      scripts: [],
    })
    this.connected = true
  }

  /** 绘制图像 */
  draw() {
    this.drawChildren()
  }

  /** 重新调整根元素 */
  resize() {
    this.x = 0
    this.y = 0
    this.width = GL.width
    this.height = GL.height
    this.resizeChildren()
  }

  /** 发送事件(空函数) */
  emit() {}
}

// ******************************** 图像元素 ********************************

class ImageElement extends UIElement {
  /** 元素图像纹理
   *  @type {ImageTexture|null}
   */ texture

  /** 图像翻转模式
   *  @type {string}
   */ flip

  /** 图像纹理水平偏移
   *  @type {number}
   */ shiftX

  /** 图像纹理垂直偏移
   *  @type {number}
   */ shiftY

  /** 图像切片边框宽度
   *  @type {number}
   */ border

  /** 图像矩形裁剪区域
   *  @type {Array<number>}
   */ clip

  /** 图像色调
   *  @type {Array<number>}
   */ tint

  /** 混合模式
   *  @type {string}
   */ blend

  _image    //:string
  _display  //:string

  // 公共属性
  static sharedFloat64Array = new Float64Array(4)

  // 默认图像元素数据
  static defaultData = {
    image: '',
    display: 'stretch',
    flip: 'none',
    blend: 'normal',
    shiftX: 0,
    shiftY: 0,
    clip: [0, 0, 32, 32],
    border: 1,
    tint: [0, 0, 0, 0],
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 图像元素数据
   */
  constructor(data = ImageElement.defaultData) {
    super(data)
    this.texture = null
    this.image = data.image
    this.display = data.display
    this.flip = data.flip
    this.shiftX = data.shiftX
    this.shiftY = data.shiftY
    this.border = data.border
    this.clip = [...data.clip]
    this.tint = [...data.tint]
    this.blend = data.blend
  }

  /**
   * 图像文件ID或HTML图像元素
   * @type {string|HTMLImageElement}
   */
  get image() {
    return this._image
  }

  set image(value) {
    if (this._image !== value) {
      this._image = value
      // 如果存在纹理，销毁
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
   * 图像显示模式
   * @type {string}
   */
  get display() {
    return this._display
  }

  set display(value) {
    this._display = value
  }

  /**
   * 加载Base64图像
   * @param {string} base64
   */
  loadBase64(base64) {
    if (GL.textureManager.images[base64]) {
      this.image = base64
    } else {
      const image = new Image()
      image.onload = () => {
        image.guid = base64
        this.image = image
      }
      image.src = base64
    }
  }

  /**
   * 设置图像剪辑
   * @param {string|HTMLImageElement} image 图像文件ID或HTML图像元素
   * @param {Array<number>} clip 图像裁剪区域
   */
  setImageClip(image, clip) {
    this.image = image
    this.display = 'clip'
    this.clip[0] = clip[0]
    this.clip[1] = clip[1]
    this.clip[2] = clip[2]
    this.clip[3] = clip[3]
  }

  /**
   * 设置图像色调
   * @param {Object} tint 图像色调属性选项{red?: -255~255, green?: -255~255, blue?: -255~255, gray?: 0~255}
   * @param {string} [easingId] 过渡曲线ID
   * @param {number} [duration] 持续时间(毫秒)
   */
  setTint(tint, easingId, duration) {
    const {red, green, blue, gray} = tint
    const {updaters} = this
    if (duration > 0) {
      let elapsed = 0
      const start = Array.from(this.tint)
      const easing = Easing.get(easingId)
      updaters.set('tint', {
        update: deltaTime => {
          elapsed += deltaTime
          const time = easing.map(elapsed / duration)
          const tint = this.tint
          if (Number.isFinite(red)) {
            tint[0] = Math.clamp(start[0] * (1 - time) + red * time, -255, 255)
          }
          if (Number.isFinite(green)) {
            tint[1] = Math.clamp(start[1] * (1 - time) + green * time, -255, 255)
          }
          if (Number.isFinite(blue)) {
            tint[2] = Math.clamp(start[2] * (1 - time) + blue * time, -255, 255)
          }
          if (Number.isFinite(gray)) {
            tint[3] = Math.clamp(start[3] * (1 - time) + gray * time, 0, 255)
          }
          // 如果过渡结束，延迟移除更新器
          if (elapsed >= duration) {
            updaters.deleteDelay('tint')
          }
        }
      })
    } else {
      if (Number.isFinite(red)) this.tint[0] = red
      if (Number.isFinite(green)) this.tint[1] = green
      if (Number.isFinite(blue)) this.tint[2] = blue
      if (Number.isFinite(gray)) this.tint[3] = gray
      // 如果存在色调更新器，延迟移除
      if (updaters.get('tint')) {
        updaters.deleteDelay('tint')
      }
    }
  }

  /** 绘制图像元素 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 绘制图片
    const {texture} = this
    if (texture?.complete) draw: {
      let dx = this.x
      let dy = this.y
      let dw = this.width
      let dh = this.height
      if (this.blend === 'mask') {
        if (GL.maskTexture.binding) {
          break draw
        }
        if (GL.depthTest) {
          GL.disable(GL.DEPTH_TEST)
        }
        GL.maskTexture.binding = this
        GL.bindFBO(GL.maskTexture.fbo)
        GL.alpha = 1
        GL.blend = 'normal'
      } else {
        GL.alpha = this.opacity
        GL.blend = this.blend
      }
      GL.matrix.set(this.matrix)
      // 图像显示模式
      switch (this.display) {
        case 'stretch':
          texture.clip(this.shiftX, this.shiftY, texture.base.width, texture.base.height)
          break
        case 'tile':
          texture.clip(this.shiftX, this.shiftY, this.width, this.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
        case 'slice':
          GL.drawSliceImage(texture, dx, dy, dw, dh, this.clip, this.border, this.tint)
          break draw
      }
      // 图像翻转模式
      switch (this.flip) {
        case 'none':
          break
        case 'horizontal':
          dx += dw
          dw *= -1
          break
        case 'vertical':
          dy += dh
          dh *= -1
          break
        case 'both':
          dx += dw
          dy += dh
          dw *= -1
          dh *= -1
          break
      }
      GL.drawImage(texture, dx, dy, dw, dh, this.tint)
    }

    // 绘制子元素
    if (GL.maskTexture.binding === this) {
      GL.unbindFBO()
      if (GL.depthTest) {
        GL.enable(GL.DEPTH_TEST)
      }
      GL.masking = true
      this.drawChildren()
      GL.masking = false
      GL.maskTexture.binding = null
      // 擦除遮罩纹理缓冲区
      const [x1, y1, x2, y2] = this.computeBoundingRectangle()
      const sl = Math.max(Math.floor(x1 - 1), 0)
      const st = Math.max(Math.floor(y1 - 1), 0)
      const sr = Math.min(Math.ceil(x2 + 1), GL.maskTexture.width)
      const sb = Math.min(Math.ceil(y2 + 1), GL.maskTexture.height)
      const sw = sr - sl
      const sh = sb - st
      if (sw > 0 && sh > 0) {
        GL.bindFBO(GL.maskTexture.fbo)
        GL.enable(GL.SCISSOR_TEST)
        GL.scissor(sl, st, sw, sh)
        GL.clearColor(0, 0, 0, 0)
        GL.clear(GL.COLOR_BUFFER_BIT)
        GL.disable(GL.SCISSOR_TEST)
        GL.unbindFBO()
      }
    } else {
      this.drawChildren()
    }
  }

  /** 重新调整图像元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.resizeChildren()
    }
  }

  /** 销毁图像元素 */
  destroy() {
    this.texture?.destroy()
    return super.destroy()
  }

  // 计算外接矩形
  computeBoundingRectangle() {
    const matrix = this.matrix
    const L = this.x
    const T = this.y
    const R = L + this.width
    const B = T + this.height
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
    const vertices = ImageElement.sharedFloat64Array
    vertices[0] = Math.min(x1, x2, x3, x4)
    vertices[1] = Math.min(y1, y2, y3, y4)
    vertices[2] = Math.max(x1, x2, x3, x4)
    vertices[3] = Math.max(y1, y2, y3, y4)
    return vertices
  }
}

// ******************************** 文本元素 ********************************

class TextElement extends UIElement {
  /** 文字打印机纹理
   *  @type {Texture|null}
   */ texture

  /** 文字打印机
   *  @type {Printer|null}
   */ printer

  /** 是否自动换行
   *  @type {boolean}
   */ wordWrap

  /** 文字溢出时是否截断
   *  @type {boolean}
   */ truncate

  /** 文本宽度
   *  @type {number}
   */ textWidth

  /** 文本高度
   *  @type {number}
   */ textHeight

  /** 混合模式
   *  @type {string}
   */ blend

  // 私有属性
  _direction        //:string
  _horizontalAlign  //:string
  _verticalAlign    //:string
  _content          //:string
  _size             //:number
  _style            //:string
  _weight           //:string
  _lineSpacing      //:number
  _letterSpacing    //:number
  _color            //:string
  _font             //:string
  _typeface         //:string
  _effect           //:object
  _overflow         //:string
  _textOuterX       //:number
  _textOuterY       //:number
  _textOuterWidth   //:number
  _textOuterHeight  //:number

  // 默认文本元素数据
  static defaultData = {
    direction: 'horizontal-tb',
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    content: 'New Text',
    size: 16,
    lineSpacing: 0,
    letterSpacing: 0,
    color: 'ffffffff',
    font: '',
    typeface: 'regular',
    effect: {type: 'none'},
    overflow: 'visible',
    blend: 'normal',
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 文本元素数据
   */
  constructor(data = TextElement.defaultData) {
    super(data)
    this.texture = null
    this.printer = null
    this.direction = data.direction
    this.horizontalAlign = data.horizontalAlign
    this.verticalAlign = data.verticalAlign
    this.content = data.content
    this.size = data.size
    this.lineSpacing = data.lineSpacing
    this.letterSpacing = data.letterSpacing
    this.color = data.color
    this.font = data.font
    this.typeface = data.typeface
    this.effect = {...data.effect}
    this.wordWrap = false
    this.truncate = false
    this.overflow = data.overflow
    this.textWidth = 0
    this.textHeight = 0
    this._textOuterX = 0
    this._textOuterY = 0
    this._textOuterWidth = 0
    this._textOuterHeight = 0
    this.blend = data.blend
  }

  /**
   * 文本方向
   * @type {string}
   */
  get direction() {
    return this._direction
  }

  set direction(value) {
    if (this._direction !== value) {
      this._direction = value
      if (this.printer) {
        this.printer.reset()
        this.printer.direction = value
      }
    }
  }

  /**
   * 水平对齐
   * @type {string}
   */
  get horizontalAlign() {
    return this._horizontalAlign
  }

  set horizontalAlign(value) {
    if (this._horizontalAlign !== value) {
      switch (value) {
        case 'left':
        case 'center':
        case 'right':
          break
        default:
          return
      }
      this._horizontalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.horizontalAlign = value
      }
    }
  }

  /**
   * 垂直对齐
   * @type {string}
   */
  get verticalAlign() {
    return this._verticalAlign
  }

  // 写入垂直对齐
  set verticalAlign(value) {
    if (this._verticalAlign !== value) {
      switch (value) {
        case 'top':
        case 'middle':
        case 'bottom':
          break
        default:
          return
      }
      this._verticalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.verticalAlign = value
      }
    }
  }

  /**
   * 文本内容
   * @type {string}
   */
  get content() {
    return this._content
  }

  set content(value) {
    if (typeof value !== 'string') {
      value = value.toString()
    }
    if (this._content !== value) {
      this._content = value
    }
  }

  /**
   * 字体大小
   * @type {number}
   */
  get size() {
    return this._size
  }

  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.printer.reset()
        this.printer.sizes[0] = value
      }
    }
  }

  /**
   * 行间距
   * @type {number}
   */
  get lineSpacing() {
    return this._lineSpacing
  }

  set lineSpacing(value) {
    if (this._lineSpacing !== value) {
      this._lineSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.lineSpacing = value
      }
    }
  }

  /**
   * 字间距
   * @type {number}
   */
  get letterSpacing() {
    return this._letterSpacing
  }

  set letterSpacing(value) {
    if (this._letterSpacing !== value) {
      this._letterSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.letterSpacing = value
      }
    }
  }

  /**
   * 文字颜色
   * @type {string}
   */
  get color() {
    return this._color
  }

  set color(value) {
    if (this._color !== value) {
      this._color = value
      if (this.printer) {
        this.printer.reset()
        this.printer.colors[0] = Color.parseInt(value)
      }
    }
  }

  /**
   * 字体家族
   * @type {string}
   */
  get font() {
    return this._font
  }

  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.printer.reset()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  /**
   * 字型
   * @type {string}
   */
  get typeface() {
    return this._typeface
  }

  set typeface(value) {
    if (this._typeface !== value) {
      switch (value) {
        case 'regular':
          this._style = 'normal'
          this._weight = 'normal'
          break
        case 'bold':
          this._style = 'normal'
          this._weight = 'bold'
          break
        case 'italic':
          this._style = 'italic'
          this._weight = 'normal'
          break
        case 'bold-italic':
          this._style = 'italic'
          this._weight = 'bold'
          break
        default:
          return
      }
      this._typeface = value
      if (this.printer) {
        this.printer.reset()
        this.printer.styles[0] = this._style
        this.printer.weights[0] = this._weight
      }
    }
  }

  /**
   * 文字效果
   * @type {Object}
   */
  get effect() {
    return this._effect
  }

  set effect(value) {
    this._effect = value
    if (this.printer) {
      this.printer.reset()
      this.printer.effects[0] = Printer.parseEffect(value)
    }
  }

  /**
   * 文字溢出模式
   * @type {string}
   */
  get overflow() {
    return this._overflow
  }

  set overflow(value) {
    if (this._overflow !== value) {
      this._overflow = value
      switch (value) {
        case 'visible':
          this.wordWrap = false
          this.truncate = false
          break
        case 'wrap':
          this.wordWrap = true
          this.truncate = false
          break
        case 'truncate':
          this.wordWrap = false
          this.truncate = true
          break
        case 'wrap-truncate':
          this.wordWrap = true
          this.truncate = true
          break
      }
      if (this.printer) {
        this.printer.reset()
        this.printer.wordWrap = this.wordWrap
        this.printer.truncate = this.truncate
      }
    }
  }

  /** 更新文本到打印机中 */
  update() {
    let printer = this.printer
    if (printer === null) {
      // 如果首次调用，创建打印机和纹理
      const texture = new Texture()
      printer = new Printer(texture)
      printer.direction = this.direction
      printer.horizontalAlign = this.horizontalAlign
      printer.verticalAlign = this.verticalAlign
      printer.sizes[0] = this.size
      printer.lineSpacing = this.lineSpacing
      printer.letterSpacing = this.letterSpacing
      printer.colors[0] = Color.parseInt(this.color)
      printer.fonts[0] = this.font || Printer.font
      printer.styles[0] = this._style
      printer.weights[0] = this._weight
      printer.effects[0] = Printer.parseEffect(this.effect)
      printer.wordWrap = this.wordWrap
      printer.truncate = this.truncate
      this.texture = texture
      this.printer = printer
    }
    // 如果文本内容发生变化
    // 或者换行模式文本区域发生变化
    // 或者截断模式文本区域发生变化
    if (printer.content !== this._content ||
      printer.wordWrap && (printer.horizontal
      ? printer.printWidth !== this.width
      : printer.printHeight !== this.height) ||
      printer.truncate && (printer.horizontal
      ? printer.printHeight !== this.height
      : printer.printWidth !== this.width)) {
      // 重置打印机
      if (printer.content) {
        printer.reset()
      }
      // 设置打印区域并打印文本
      printer.printWidth = this.width
      printer.printHeight = this.height
      printer.draw(this._content)
      this.calculateTextPosition()
    }
  }

  /** 绘制文本元素 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 更新文本
    this.update()

    // 绘制文本
    if (this._content) {
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.set(this.matrix)
      GL.drawImage(this.texture, this._textOuterX, this._textOuterY, this._textOuterWidth, this._textOuterHeight)
    }

    // 绘制子元素
    this.drawChildren()
  }

  /** 重新调整文本元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.calculateTextPosition()
      this.resizeChildren()
    }
  }

  /** 计算文本位置 */
  calculateTextPosition() {
    const printer = this.printer
    if (printer !== null) {
      const pl = printer.paddingLeft
      const pt = printer.paddingTop
      const pr = printer.paddingRight
      const pb = printer.paddingBottom
      const outerX = this.x - pl
      const outerY = this.y - pt
      const outerWidth = this.texture.width
      const outerHeight = this.texture.height
      const innerWidth = outerWidth - pl - pr
      const innerHeight = outerHeight - pt - pb
      const marginWidth = this.width - innerWidth
      const marginHeight = this.height - innerHeight
      const factorX = printer.alignmentFactorX
      const factorY = printer.alignmentFactorY
      const offsetX = marginWidth * factorX
      const offsetY = marginHeight * factorY
      this.textWidth = innerWidth
      this.textHeight = innerHeight
      this._textOuterX = outerX + offsetX
      this._textOuterY = outerY + offsetY
      this._textOuterWidth = outerWidth
      this._textOuterHeight = outerHeight
    }
  }

  /** 销毁文本元素 */
  destroy() {
    this.texture?.destroy()
    return super.destroy()
  }
}

// ******************************** 文本框元素 ********************************

class TextBoxElement extends UIElement {
  /** HTML输入框元素(影子元素)
   *  @type {HTMLInputElement}
   */ input

  /** 元素是否正在聚焦状态
   *  @type {boolean}
   */ focusing

  /** 文字打印机纹理
   *  @type {Texture}
   */ texture

  /** 文字打印机
   *  @type {Printer}
   */ printer

  /** 数字输入框模式最小值
   *  @type {number}
   */ min

  /** 数字输入框模式最大值
   *  @type {number}
   */ max

  /** 数字输入框模式保留小数位
   *  @type {number}
   */ decimals

  /** 输入框的水平滚动距离
   *  @type {number}
   */ scrollLeft

  /** 输入框选中内容开始位置
   *  @type {number}
   */ selectionStart

  /** 输入框选中内容结束位置
   *  @type {number}
   */ selectionEnd

  // 私有属性
  _type                 //:string
  _align                //:string
  _padding              //:number
  _size                 //:number
  _font                 //:string
  _color                //:string
  _colorInt             //:number
  _textX                //:number
  _textY                //:number
  _textShiftY           //:number
  _innerWidth           //:number
  _innerHeight          //:number
  _selectionLeft        //:number
  _selectionRight       //:number
  _selectionY           //:number
  _selectionHeight      //:number
  _selectionColor       //:string
  _selectionColorInt    //:number
  _selectionBgColor     //:string
  _selectionBgColorInt  //:number
  _cursorVisible        //:boolean
  _cursorElapsed        //:number

  // 静态 - 数值字符过滤器
  static numberFilter = /^(?:[-.\d]|-?(?:\d+)?\.?\d+)$/

  // 默认文本框元素数据
  static defaultData = {
    type: 'text',
    align: 'left',
    text: 'Content',
    maxLength: 16,
    number: 0,
    min: 0,
    max: 0,
    decimals: 0,
    padding: 4,
    size: 16,
    font: '',
    color: 'ffffffff',
    selectionColor: 'ffffffff',
    selectionBgColor: '0090ccff',
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 文本框元素数据
   */
  constructor(data = TextBoxElement.defaultData) {
    super(data)
    this.input = null
    this.focusing = false
    this.texture = new Texture()
    this.type = data.type
    this.align = data.align
    this.min = data.min
    this.max = data.max
    this.decimals = data.decimals
    this.padding = data.padding
    this.size = data.size
    this.font = data.font
    this.color = data.color
    this.scrollLeft = 0
    this.selectionStart = -1
    this.selectionEnd = -1
    this.selectionColor = data.selectionColor
    this.selectionBgColor = data.selectionBgColor
    this._cursorVisible = false
    this._cursorElapsed = null
    this.printer = new Printer(this.texture)
    this.printer.matchTag = Function.empty
    this.printer.sizes[0] = this.size
    this.printer.fonts[0] = this.font || Printer.font
    this.printer.colors[0] = 0xffffffff
    this.printer.effects[0] = {type: 'none'}
    this.createHTMLInputElement(data)
  }

  /**
   * 文本框类型(文本|数值)
   * @type {string}
   */
  get type() {
    return this._type
  }

  set type(value) {
    if (this._type !== value) {
      this._type = value
      // 如果存在输入框且类型为数值，更新输入框的值
      if (this.input && value === 'number') {
        this.input.value = this.readInputNumber()
      }
    }
  }

  /** 文本内容 */
  get text() {
    if (this.type === 'text') {
      return this.input.value
    }
  }

  set text(value) {
    if (this.type === 'text') {
      this.input.value = value
    }
  }

  /** 数值内容 */
  get number() {
    if (this.type === 'number') {
      return this.readInputNumber()
    }
  }

  set number(value) {
    if (this.type === 'number') {
      this.input.value = value
      this.input.value = this.readInputNumber()
    }
  }

  /**
   * 对齐方式
   * @type {string}
   */
  get align() {
    return this._align
  }

  set align(value) {
    if (this._align !== value) {
      this._align = value
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  /**
   * 内边距
   * @type {number}
   */
  get padding() {
    return this._padding
  }

  set padding(value) {
    if (this._padding !== value) {
      this._padding = value
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  /**
   * 字体大小
   * @type {number}
   */
  get size() {
    return this._size
  }

  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.printer.reset()
        this.printer.sizes[0] = value
      }
    }
  }

  /**
   * 字体家族
   * @type {string}
   */
  get font() {
    return this._font
  }

  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.printer.reset()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  /**
   * 文字颜色
   * @type {string}
   */
  get color() {
    return this._color
  }

  set color(value) {
    if (this._color !== value) {
      this._color = value
      this._colorInt = Color.parseInt(value)
    }
  }

  /**
   * 选中文字颜色
   * @type {string}
   */
  get selectionColor() {
    return this._selectionColor
  }

  set selectionColor(value) {
    if (this._selectionColor !== value) {
      this._selectionColor = value
      this._selectionColorInt = Color.parseInt(value)
    }
  }

  /**
   * 选中背景颜色
   * @type {string}
   */
  get selectionBgColor() {
    return this._selectionBgColor
  }

  set selectionBgColor(value) {
    if (this._selectionBgColor !== value) {
      this._selectionBgColor = value
      this._selectionBgColorInt = Color.parseInt(value)
    }
  }

  /**
   * 创建HTML输入框元素
   * @param {Object} data 文本框元素数据
   */
  createHTMLInputElement(data) {
    const input = document.createElement('input')
    input.classList.add('text-box-shadow-input')
    // 创建影子输入框事件列表
    input.events = [
      ['keydown', this.keydownEvent.bind(this)],
      ['wheel', this.wheelEvent.bind(this)],
      ['beforeinput', this.beforeinputEvent.bind(this)],
      ['input', this.inputEvent.bind(this)],
      ['change', this.changeEvent.bind(this)],
      ['focus', this.focusEvent.bind(this)],
      ['blur', this.blurEvent.bind(this)],
    ]
    // 根据类型获取对应的初始值
    switch (data.type) {
      case 'text':
        input.value = data.text
        break
      case 'number':
        input.value = data.number.toString()
        break
    }
    input.maxLength = data.maxLength
    input.style.boxSizing = 'border-box'
    input.style.position = 'fixed'
    input.style.fontFamily = this.printer.fonts[0]
    input.style.fontSize = `${this.printer.sizes[0]}px`
    input.style.padding = `${data.padding}px`
    input.style.textAlign = this.align
    // 将影子输入框设为透明，只是用来输入
    // 文字渲染用GL来实现，可以像素化渲染
    input.style.color = 'transparent'
    input.style.backgroundColor = 'transparent'
    input.style.border = 'none'
    input.style.outline = 'none'
    document.body.appendChild(this.input = input)
    // 创建影子输入框样式
    if (!TextBoxElement.style) {
      const style = document.createElement('style')
      style.textContent = `
      .text-box-shadow-input::selection {
        color: transparent;
        background-color: transparent;
      }`
      document.head.appendChild(style)
      TextBoxElement.style = style
    }
  }

  /**
   * 输入框键盘按下事件
   * @param {KeyboardEvent} event 键盘事件
   */
  keydownEvent(event) {
    Input.keydownFilter(event)
    // 数值输入框：上下键进行数值微调
    if (this.type === 'number') {
      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault()
          this.fineTuneNumber(+1)
          break
        case 'ArrowDown':
          event.preventDefault()
          this.fineTuneNumber(-1)
          break
      }
    }
  }

  /**
   * 输入框鼠标滚轮事件
   * @param {WheelEvent} event 滚轮事件
   */
  wheelEvent(event) {
    // 如果是数值输入框且获得焦点，滚轮滚动可微调数值
    if (this.type === 'number' && this.focusing) {
      this.fineTuneNumber(event.deltaY < 0 ? +1 : -1)
    }
  }

  /**
   * 输入框输入前事件
   * @param {InputEvent} event 输入事件
   */
  beforeinputEvent(event) {
    if (this.type === 'number' &&
      typeof event.data === 'string' &&
      !TextBoxElement.numberFilter.test(event.data)) {
      // 阻止在数值输入框中输入非法字符
      event.preventDefault()
    }
  }

  /** 输入框输入事件 */
  inputEvent() {
    const {printer, input} = this
    // 如果输入框内容发生变化，重置选中位置
    if (printer.content !== input.value) {
      this.selectionStart = null
      this.selectionEnd = null
      // 发送输入事件
      this.emit('input', false)
    }
  }

  /** 输入框改变事件 */
  changeEvent() {
    if (this.type === 'number') {
      // 如果是数值输入框，检查并重构数值
      const string = this.readInputNumber().toString()
      if (this.input.value !== string) {
        this.input.value = string
      }
    }
  }

  /** 输入框获得焦点事件 */
  focusEvent() {
    if (!this.focusing) {
      this.focusing = true
      this._cursorVisible = true
      this._cursorElapsed = 0
      // 发送获得焦点事件
      this.emit('focus', false)
    }
  }

  /** 输入框失去焦点事件 */
  blurEvent() {
    if (this.focusing) {
      this.focusing = false
      // 发送失去焦点事件
      this.emit('blur', false)
    }
  }

  /**
   * 微调输入框数值
   * @param {number} offset 数值偏差
   */
  fineTuneNumber(offset) {
    this.input.value = this.readInputNumber(offset).toString()
    this.inputEvent()
  }

  /**
   * 读取输入框数值
   * @param {number} offset 数值偏差
   * @returns {number}
   */
  readInputNumber(offset = 0) {
    const {input, min, max, decimals} = this
    const value = parseFloat(input.value) + offset || 0
    return Math.roundTo(Math.clamp(value, min, max), decimals)
  }

  /** 连接文本框元素 */
  connect() {
    super.connect()
    this.addEventListeners()
  }

  /** 断开文本框元素 */
  disconnect() {
    super.disconnect()
    this.removeEventListeners()
  }

  /** 添加事件侦听器 */
  addEventListeners() {
    const {input} = this
    if (!input) return
    for (const [type, listener] of input.events) {
      input.on(type, listener)
    }
  }

  /** 移除事件侦听器 */
  removeEventListeners() {
    const {input} = this
    if (!input) return
    for (const [type, listener] of input.events) {
      input.off(type, listener)
    }
  }

  /** 更新文本框 */
  update() {
    const {printer, input} = this
    // 获取输入框滚动距离
    if (this.scrollLeft !== input.scrollLeft) {
      this.scrollLeft = input.scrollLeft
    }
    // 输入框的起始选中位置发生变化
    if (this.selectionStart !== input.selectionStart) {
      this.selectionStart = input.selectionStart
      if (this.selectionStart === this.selectionEnd) {
        // 如果选中长度为0：重置光标的状态
        this._selectionLeft = this._selectionRight
        this._cursorVisible = true
        this._cursorElapsed = 0
      } else if (this.selectionStart === 0) {
        // 如果起始选中位置在头部：左侧选中位置为0
        this._selectionLeft = 0
      } else {
        // 如果起始选中位置不在头部：测量选中位置前面文本的宽度作为左侧选中位置
        GL.context2d.font = `${this.printer.sizes[0]}px ${this.printer.fonts[0]}`
        this._selectionLeft = GL.context2d.measureText(input.value.slice(0, this.selectionStart)).width
      }
    }
    // 输入框的结束选中位置发生变化
    if (this.selectionEnd !== input.selectionEnd) {
      this.selectionEnd = input.selectionEnd
      if (this.selectionEnd === this.selectionStart) {
        // 如果选中长度为0：重置光标的状态
        this._selectionRight = this._selectionLeft
        this._cursorVisible = true
        this._cursorElapsed = 0
      } else {
        // 如果选中长度不为0：测量选中位置前面文本的宽度作为右侧选中位置
        GL.context2d.font = `${this.printer.sizes[0]}px ${this.printer.fonts[0]}`
        this._selectionRight = GL.context2d.measureText(input.value.slice(0, this.selectionEnd)).width
      }
    }
    // 如果输入框获得焦点，且选中长度为0，则显示闪烁的光标
    if (this.focusing && this.selectionStart === this.selectionEnd) {
      if ((this._cursorElapsed += Time.deltaTime) >= 500) {
        this._cursorVisible = !this._cursorVisible
        this._cursorElapsed -= 500
      }
    }

    // 如果输入框内容发生了变化，重新绘制文本
    if (printer.content !== input.value) {
      if (printer.content) {
        printer.reset()
      }
      printer.draw(input.value)
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  /** 绘制文本框 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 更新数据
    this.update()

    // 设置上下文属性
    GL.alpha = this.opacity
    GL.blend = 'normal'
    GL.matrix.set(this.matrix)

    // 绘制文字纹理
    const {texture} = this
    const {base} = texture
    switch (this.focusing) {
      case false:
        // 文本框失去焦点的情况
        if (this.input.value) {
          // 绘制可见文本
          const sx = this.scrollLeft
          const sy = this._textShiftY
          const sw = Math.min(base.width - sx, this._innerWidth)
          const sh = this._innerHeight
          GL.drawText(texture.clip(sx, sy, sw, sh), this._textX, this._textY, texture.width, texture.height, this._colorInt)
        }
        break
      case true: {
        // 文本框获得焦点的情况
        const SL = Math.floor(this._selectionLeft)
        const SR = Math.ceil(this._selectionRight)
        // 计算选中位置被裁剪后的左右边界位置
        const sl = Math.clamp(SL - this.scrollLeft, 0, this._innerWidth)
        const sr = Math.clamp(SR - this.scrollLeft, 0, this._innerWidth)
        if (this.selectionStart !== this.selectionEnd) {
          // 如果选中长度不为0
          // 先绘制选中区域的背景
          const dx = this._textX + sl
          const dy = this._selectionY
          const dw = sr - sl
          const dh = this._selectionHeight
          GL.fillRect(dx, dy, dw, dh, this._selectionBgColorInt)

          // 再分成三步绘制文本
          const sy = this._textShiftY
          const sh = this._innerHeight
          // 计算可见文本最右边的位置
          const tr = Math.min(base.width - this.scrollLeft, this._innerWidth)
          if (0 < sl) {
            // 绘制选中位置左侧的可见文本
            const sx = this.scrollLeft
            const sw = sl
            GL.drawText(texture.clip(sx, sy, sw, sh), this._textX, this._textY, sw, sh, this._colorInt)
          }
          if (sl < sr) {
            // 绘制选中的可见文本(选中颜色)
            const sx = SL + Math.max(this.scrollLeft - SL, 0)
            const sw = sr - sl
            GL.drawText(texture.clip(sx, sy, sw, sh), this._textX + sl, this._textY, sw, sh, this._selectionColorInt)
          }
          if (sr < tr) {
            // 绘制选中位置右侧的可见文本
            const sx = SR
            const sw = tr - sr
            GL.drawText(texture.clip(sx, sy, sw, sh), this._textX + sr, this._textY, sw, sh, this._colorInt)
          }
        } else {
          // 如果选中长度为0
          if (this.input.value) {
            // 绘制可见文本
            const sx = this.scrollLeft
            const sy = this._textShiftY
            const sw = Math.min(base.width - sx, this._innerWidth)
            const sh = this._innerHeight
            GL.drawText(texture.clip(sx, sy, sw, sh), this._textX, this._textY, texture.width, texture.height, this._colorInt)
          }

          // 绘制光标
          if (this._cursorVisible) {
            const dx = this._textX + sl
            const dy = this._selectionY
            const dw = 1
            const dh = this._selectionHeight
            GL.fillRect(dx, dy, dw, dh, this._colorInt)
          }
        }
      }
    }

    // 绘制子元素
    this.drawChildren()
  }

  /** 重新调整文本框元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.calculateTextPosition()
      this.calculateHTMLInputPosition()
      this.resizeChildren()
    }
  }

  /** 计算文本位置 */
  calculateTextPosition() {
    const printer = this.printer
    const size = printer.sizes[0]
    const vpadding = (this.height - size) / 2
    const paddingTop = printer.paddingTop
    const base = this.texture.base
    // 文本绘制位置
    this._textX = this.x + this.padding
    this._textY = this.y + Math.max(vpadding - paddingTop, 0)
    // 文本纹理偏移Y
    this._textShiftY = Math.max(paddingTop - vpadding, 0)
    // 输入框内部宽高
    this._innerWidth = Math.max(this.width - this.padding * 2, 0)
    this._innerHeight = Math.min(this.height + this.y - this._textY, base.height)
    // 选中区域Y和高度
    this._selectionY = this.y + Math.max(vpadding, 0)
    this._selectionHeight = Math.min(this.height, size)
    // 如果纹理宽度小于输入框宽度，则根据对齐模式进行偏移
    switch (this.align) {
      case 'center':
        if (base.width < this._innerWidth) {
          this._textX += (this._innerWidth - base.width) / 2
        }
        break
      case 'right':
        if (base.width < this._innerWidth) {
          this._textX += this._innerWidth - base.width + 1
        }
        break
    }
    // 绘制文本时像素对齐
    const scaleX = Math.max(this.transform.scaleX, 1)
    const scaleY = Math.max(this.transform.scaleY, 1)
    this._textX = Math.round(this._textX * scaleX) / scaleX
    this._textY = Math.round(this._textY * scaleY) / scaleY
  }

  /** 计算HTML输入框位置 */
  calculateHTMLInputPosition() {
    if (this.input !== null) {
      const offsetX = this.x + this.width / 2
      const offsetY = this.y + this.height / 2
      const matrix = Matrix.instance.reset()
      const mouse = Input.mouse
      // 根据屏幕是否旋转来计算矩阵
      switch (mouse.rotated) {
        case false:
          matrix
          .translate(mouse.left - offsetX, mouse.top - offsetY)
          .scale(1 / mouse.ratioX, 1 / mouse.ratioY)
          .multiply(this.matrix)
          .translate(offsetX, offsetY)
          break
        case true:
          matrix
          .translate(mouse.right - offsetX, mouse.top - offsetY)
          .rotate(Math.PI / 2)
          .scale(1 / mouse.ratioX, 1 / mouse.ratioY)
          .multiply(this.matrix)
          .translate(offsetX, offsetY)
          break
      }
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      // 更新影子输入框的样式，让它与元素重合
      this.input.style.left = `${this.x}px`
      this.input.style.top = `${this.y}px`
      this.input.style.width = `${this.width}px`
      this.input.style.height = `${this.height}px`
      this.input.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
    }
  }

  /** 销毁文本框元素 */
  destroy() {
    this.texture?.destroy()
    if (this.input) {
      document.body.removeChild(this.input)
      if (this.connected) {
        this.removeEventListeners()
      }
      // 解除元素和DOM的绑定，让元素被垃圾回收
      // INPUT可能会在历史操作中保留一段时间
      this.input.events = null
      this.input = null
    }
    return super.destroy()
  }
}

// ******************************** 对话框元素 ********************************

class DialogBoxElement extends UIElement {
  /** 对话框当前状态
   *  @type {string}
   */ state

  /** 文字打印机纹理
   *  @type {Texture|null}
   */ texture

  /** 文字打印机
   *  @type {Printer|null}
   */ printer

  /** 对话框已经播放的时间(毫秒)
   *  @type {number}
   */ elapsed

  /** 对话框打印文字的间隔时间(毫秒)
   *  @type {number}
   */ interval

  /** 对话框文字的水平结束位置
   *  @type {number}
   */ printEndX

  /** 对话框文字的垂直结束位置
   *  @type {number}
   */ printEndY

  /** 混合模式
   *  @type {string}
   */ blend

  // 私有属性
  _changed        //:boolean
  _content        //:string
  _size           //:string
  _lineSpacing    //:string
  _letterSpacing  //:string
  _color          //:string
  _font           //:string
  _style          //:string
  _weight         //:string
  _typeface       //:string
  _effect         //:object
  _textOuterX      //:number
  _textOuterY      //:number
  _textOuterWidth  //:number
  _textOuterHeight //:number

  // 默认对话框元素数据
  static defaultData = {
    content: 'Content',
    interval: 16.6666,
    size: 16,
    lineSpacing: 0,
    letterSpacing: 0,
    color: 'ffffffff',
    font: '',
    typeface: 'regular',
    effect: {type: 'none'},
    blend: 'normal',
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 对话框元素数据
   */
  constructor(data = DialogBoxElement.defaultData) {
    super(data)
    this.state = 'complete'
    this.texture = null
    this.printer = null
    this.elapsed = 0
    this.interval = data.interval
    this.content = data.content
    this.size = data.size
    this.lineSpacing = data.lineSpacing
    this.letterSpacing = data.letterSpacing
    this.color = data.color
    this.font = data.font
    this.typeface = data.typeface
    this.effect = {...data.effect}
    this._textOuterX = 0
    this._textOuterY = 0
    this._textOuterWidth = 0
    this._textOuterHeight = 0
    this.printEndX = 0
    this.printEndY = 0
    this.blend = data.blend
  }

  /**
   * 文本内容
   * @type {string}
   */
  get content() {
    return this._content
  }

  set content(value) {
    this._content = value
    this._changed = true
    this.state = 'updating'
  }

  /**
   * 字体大小
   * @type {number}
   */
  get size() {
    return this._size
  }

  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.reload()
        this.printer.sizes[0] = value
      }
    }
  }

  /**
   * 行间距
   * @type {number}
   */
  get lineSpacing() {
    return this._lineSpacing
  }

  set lineSpacing(value) {
    if (this._lineSpacing !== value) {
      this._lineSpacing = value
      if (this.printer) {
        this.reload()
        this.printer.lineSpacing = value
      }
    }
  }

  /**
   * 字间距
   * @type {number}
   */
  get letterSpacing() {
    return this._letterSpacing
  }

  set letterSpacing(value) {
    if (this._letterSpacing !== value) {
      this._letterSpacing = value
      if (this.printer) {
        this.reload()
        this.printer.letterSpacing = value
      }
    }
  }

  /**
   * 文字颜色
   * @type {string}
   */
  get color() {
    return this._color
  }

  set color(value) {
    if (this._color !== value) {
      this._color = value
      if (this.printer) {
        this.reload()
        this.printer.colors[0] = Color.parseInt(value)
      }
    }
  }

  /**
   * 字体家族
   * @type {string}
   */
  get font() {
    return this._font
  }

  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.reload()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  /**
   * 字型
   * @type {string}
   */
  get typeface() {
    return this._typeface
  }

  set typeface(value) {
    if (this._typeface !== value) {
      switch (value) {
        case 'regular':
          this._style = 'normal'
          this._weight = 'normal'
          break
        case 'bold':
          this._style = 'normal'
          this._weight = 'bold'
          break
        case 'italic':
          this._style = 'italic'
          this._weight = 'normal'
          break
        case 'bold-italic':
          this._style = 'italic'
          this._weight = 'bold'
          break
        default:
          return
      }
      this._typeface = value
      if (this.printer) {
        this.reload()
        this.printer.styles[0] = this._style
        this.printer.weights[0] = this._weight
      }
    }
  }

  /**
   * 文字效果
   * @type {Object}
   */
  get effect() {
    return this._effect
  }

  set effect(value) {
    this._effect = value
    if (this.printer) {
      this.reload()
      this.printer.effects[0] = Printer.parseEffect(value)
    }
  }

  /** 更新对话框 */
  update() {
    let printer = this.printer
    if (printer === null) {
      // 如果首次调用，创建打印机和纹理
      const texture = new Texture()
      printer = new Printer(texture)
      printer.sizes[0] = this.size
      // 为各种文字效果预留内边距
      printer.paddingLeft = 10
      printer.paddingTop = 50
      printer.paddingRight = 110
      printer.paddingBottom = 50
      printer.calculatePadding = Function.empty
      printer.lineSpacing = this.lineSpacing
      printer.letterSpacing = this.letterSpacing
      printer.colors[0] = Color.parseInt(this.color)
      printer.fonts[0] = this.font || Printer.font
      printer.styles[0] = this._style
      printer.weights[0] = this._weight
      printer.effects[0] = Printer.parseEffect(this.effect)
      printer.wordWrap = true
      printer.truncate = true
      this.texture = texture
      this.printer = printer
      // 删除打印机恢复纹理回调函数
      // 改用默认的恢复普通纹理方法(不完美)
      delete texture.base.onRestore
    }

    // 如果文本区域发生变化
    if (printer.printWidth !== this.width ||
      printer.printHeight !== this.height) {
      // 重置打印机并调整纹理大小
      if (printer.content) printer.reset()
      const width = Math.ceil(this.width + printer.paddingLeft + printer.paddingRight)
      const height = Math.ceil(this.height + printer.paddingTop + printer.paddingBottom)
      printer.texture.resize(Math.min(width, 16384), Math.min(height, 16384))
      printer.printWidth = this.width
      printer.printHeight = this.height
      this._changed = true
      this.calculateTextPosition()
    }

    // 如果文本发生改变，且未被暂停，重新加载打印机内容
    if (this._changed && this.state !== 'paused') {
      this._changed = false
      this.reload()
    }

    // 如果处于更新中状态，打印文字
    if (this.state === 'updating') {
      this.print()
    }
  }

  /** 重新加载文本内容 */
  reload() {
    const {printer} = this
    // 重置打印机并清除纹理
    if (printer.content) {
      printer.reset()
      printer.texture.clear()
    }
    // 设置打印机内容，切换到更新中状态
    printer.content = this.content
    this.state = 'updating'
  }

  /** 暂停打印文字 */
  pause() {
    if (this.state === 'updating') {
      this.state = 'paused'
    }
  }

  /** 继续打印文字 */
  continue() {
    if (this.state === 'paused') {
      this.state = 'updating'
    }
  }

  /** 立即打印文字 */
  printImmediately() {
    if (this.state === 'updating') {
      // 暂时取消打印间隔
      const {interval} = this
      this.interval = 0
      this.update()
      this.interval = interval
    }
  }

  /** 打印下一页文字 */
  printNextPage() {
    if (this.state !== 'complete') {
      this.state = 'updating'
      this.printer.x = 0
      this.printer.y = 0
      this.texture.clear()
    }
  }

  /** 绘制缓冲字符串 */
  drawBuffer() {
    const {printer} = this
    // 当缓冲字符串不为空时绘制并记录结束位置
    if (printer.buffer !== '') {
      printer.drawBuffer()
      this.printEndX = this.printer.x
      this.printEndY = this.printer.y
    }
  }

  /** 打印文字 */
  print() {
    let count = Infinity
    if (this.interval !== 0) {
      this.elapsed += Time.rawDeltaTime
      // 如果存在打印间隔，计算当前帧可打印字符数量
      if (count = Math.floor(this.elapsed / this.interval)) {
        this.elapsed -= this.interval * count
      } else {
        return
      }
    }
    const printer = this.printer
    const content = printer.content
    const printWidth = printer.printWidth
    const printHeight = printer.printHeight
    const letterSpacing = printer.letterSpacing
    const charWidths = Printer.charWidths
    const length = content.length
    let charIndex = 0
    let charWidth = 0

    // 创建指令列表
    printer.commands = []

    // 更新字体
    printer.updateFont()

    // 按顺序检查字符
    while (printer.index < length) {
      // 匹配标签(在数量检查之前解析掉尾部标签)
      const char = content[printer.index]
      if (char === '<' && printer.matchTag()) {
        continue
      }

      // 检查待打印文字数量
      if (count === 0) {
        break
      }

      // 换行符
      if (char === '\n') {
        this.drawBuffer()
        printer.newLine()
        printer.index += 1
        continue
      }

      // 跳出循环
      if (printer.y + Math.max(printer.lineHeight, printer.measureHeight(char)) > printHeight) {
        this.drawBuffer()
        this.state = 'waiting'
        break
      }

      // 强制换行
      if (printer.x + Printer.lineWidth + (charWidth = printer.measureWidth(char)) > printWidth) {
        this.drawBuffer()
        printer.newLine(true)
        continue
      }

      // 计算字间距相关数据
      if (letterSpacing !== 0) {
        charWidths[charIndex++] = charWidth
        Printer.lineWidth += letterSpacing
      }
      Printer.lineWidth += charWidth

      // 放入缓冲区
      printer.buffer += char
      printer.index += 1
      count--
    }

    // 设置完成状态
    if (printer.index === length) {
      this.state = 'complete'
    }

    // 绘制缓冲字符串
    this.drawBuffer()

    // 执行打印机指令进行绘制
    printer.executeCommands()
  }

  /** 绘制对话框 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 更新文本
    this.update()

    // 绘制文本
    if (this.content) {
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.set(this.matrix)
      GL.drawImage(this.texture, this._textOuterX, this._textOuterY, this._textOuterWidth, this._textOuterHeight)
    }

    // 绘制子元素
    this.drawChildren()
  }

  /** 重新调整对话框元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.calculateTextPosition()
      this.resizeChildren()
    }
  }

  /** 计算文本位置 */
  calculateTextPosition() {
    const printer = this.printer
    if (printer !== null) {
      this._textOuterX = this.x - printer.paddingLeft
      this._textOuterY = this.y - printer.paddingTop
      this._textOuterWidth = this.texture.width
      this._textOuterHeight = this.texture.height
    }
  }

  /** 销毁对话框元素 */
  destroy() {
    this.texture?.destroy()
    return super.destroy()
  }
}

// ******************************** 进度条元素 ********************************

class ProgressBarElement extends UIElement {
  /** 进度条元素图像纹理
   *  @type {ImageElement|null}
   */ texture

  /** 进度条图像显示模式(拉伸|裁剪)
   *  @type {string}
   */ display

  /** 进度条图像矩形裁剪区域
   *  @type {Array<number>}
   */ clip

  /** 进度条类型(水平|垂直|圆形)
   *  @type {string}
   */ type

  /** 进度条步长
   *  @type {number}
   */ step

  /** 圆形模式中心水平位置
   *  @type {number}
   */ centerX

  /** 圆形模式中心垂直位置
   *  @type {number}
   */ centerY

  /** 圆形模式开始角度(弧度)
   *  @type {number}
   */ startAngle

  /** 圆形模式结束角度(弧度)
   *  @type {number}
   */ centralAngle

  /** 进度值(0-1)
   *  @type {number}
   */ progress

  /** 颜色模式(纹理采样|固定)
   *  @type {string}
   */ colorMode

  /** 固定颜色数组
   *  @type {Array<number>}
   */ color

  /** 混合模式
   *  @type {string}
   */ blend

  // 私有属性
  _image //:string

  // 默认进度条元素数据
  static defaultData = {
    image: '',
    display: 'stretch',
    clip: [0, 0, 32, 32],
    type: 'horizontal',
    centerX: 0.5,
    centerY: 0.5,
    startAngle: -90,
    centralAngle: 360,
    step: 0,
    progress: 1,
    blend: 'normal',
    colorMode: 'texture',
    color: [0, 0, 0, 0],
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 进度条元素数据
   */
  constructor(data = ProgressBarElement.defaultData) {
    super(data)
    this.texture = null
    this.image = data.image
    this.display = data.display
    this.clip = [...data.clip]
    this.type = data.type
    this.step = data.step
    this.centerX = data.centerX
    this.centerY = data.centerY
    this.startAngle = data.startAngle
    this.centralAngle = data.centralAngle
    this.progress = data.progress
    this.colorMode = data.colorMode
    this.color = new Uint8ClampedArray(data.color)
    this.blend = data.blend
  }

  /**
   * 图像文件ID或HTML图像元素
   * @type {string|HTMLImageElement}
   */
  get image() {
    return this._image
  }

  set image(value) {
    if (this._image !== value) {
      this._image = value
      // 如果存在纹理，销毁
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
      }
    }
  }

  /** 绘制进度条元素 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 绘制进度条
    const {texture} = this
    if (this.progress > 0 && texture?.complete) {
      const {base} = texture
      // 进度条显示模式
      switch (this.display) {
        case 'stretch':
          texture.clip(0, 0, base.width, base.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
      }
      const scaleX = this.width / texture.width
      const scaleY = this.height / texture.height
      // 计算原始比例下的进度条绘制顶点数据
      const {vertices, vertexLength, drawingLength} =
      this.calculateProgressVertices()

      // 绘制图像
      GL.blend = this.blend
      GL.alpha = this.opacity
      const matrix = Matrix.instance.project(
        GL.flip,
        GL.width,
        GL.height,
      )
      .multiply(this.matrix)
      .translate(this.x, this.y)
      .scale(scaleX, scaleY)
      const program = GL.imageProgram.use()
      GL.bindVertexArray(program.vao.a110)
      GL.uniformMatrix3fv(program.u_Matrix, false, matrix)
      GL.uniform1i(program.u_LightMode, 0)
      // 进度条颜色模式
      switch (this.colorMode) {
        case 'texture':
          GL.uniform1i(program.u_ColorMode, 0)
          GL.uniform4f(program.u_Tint, 0, 0, 0, 0)
          break
        case 'fixed': {
          const color = this.color
          const red = color[0] / 255
          const green = color[1] / 255
          const blue = color[2] / 255
          const alpha = color[3] / 255
          GL.uniform1i(program.u_ColorMode, 1)
          GL.uniform4f(program.u_Color, red, green, blue, alpha)
          break
        }
      }
      GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STREAM_DRAW, 0, vertexLength)
      GL.bindTexture(GL.TEXTURE_2D, base.glTexture)
      GL.drawArrays(GL.TRIANGLE_FAN, 0, drawingLength)
    }

    // 绘制子元素
    this.drawChildren()
  }

  /** 计算进度条绘制用的顶点数据 */
  calculateProgressVertices() {
    const type = this.type
    const progress = Math.clamp(this.progress, 0, 1)
    const texture = this.texture
    const x = texture.x
    const y = texture.y
    const w = texture.width
    const h = texture.height
    const tw = texture.base.width
    const th = texture.base.height
    const response = ProgressBarElement.response
    const vertices = response.vertices
    const step = this.step
    switch (type) {
      case 'horizontal': {
        // 水平模式：从左到右
        let sw = w * progress
        let sh = h
        if (step !== 0) {
          // 如果存在步长，调整进度条宽度
          sw = Math.round(sw / step) * step
          sw = Math.clamp(sw, 0, w)
        }
        const dl = 0
        const dt = 0
        const dr = sw
        const db = sh
        const sl = x / tw
        const st = y / th
        const sr = (x + sw) / tw
        const sb = (y + sh) / th
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
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'vertical': {
        // 垂直模式：从下到上
        let sw = w
        let sh = h * progress
        if (step !== 0) {
          // 如果存在步长，调整进度条高度
          sh = Math.round(sh / step) * step
          sh = Math.clamp(sh, 0, h)
        }
        const dl = 0
        const dt = h - sh
        const dr = sw
        const db = h
        const sl = x / tw
        const st = (y + dt) / th
        const sr = (x + sw) / tw
        const sb = (y + h) / th
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
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'round': {
        // 圆形模式：
        // 圆心角是正数 = 顺时针方向
        // 圆心角是负数 = 逆时针方向
        const angles = response.angles
        const array = response.array
        let startAngle = this.startAngle
        let centralAngle = this.centralAngle
        let currentAngle = centralAngle * progress
        if (step !== 0) {
          // 如果存在步长，调整进度条角度
          currentAngle = Math.round(currentAngle / step) * step
          currentAngle = centralAngle >= 0
          ? Math.min(currentAngle, centralAngle)
          : Math.max(currentAngle, centralAngle)
        }
        if (currentAngle < 0) {
          // 如果当前角度是负数，取相反数
          // 并且把结束角度作为起始角度
          currentAngle = -currentAngle
          startAngle -= currentAngle
        }
        startAngle = Math.radians(startAngle)
        currentAngle = Math.radians(currentAngle)
        // 准备生成三角扇顶点数据
        const dl = 0
        const dt = 0
        const dr = w
        const db = h
        const dox = w * this.centerX
        const doy = h * this.centerY
        const tox = dox + x
        const toy = doy + y
        const sox = tox / tw
        const soy = toy / th
        const sl = x / tw
        const st = y / th
        const sr = (x + w) / tw
        const sb = (y + h) / th
        // 计算起始角到四个矩形角顶点的顺时针角度
        angles[0] = Math.modRadians(Math.atan2(dt - doy, dr - dox) - startAngle)
        angles[1] = Math.modRadians(Math.atan2(db - doy, dr - dox) - startAngle)
        angles[2] = Math.modRadians(Math.atan2(db - doy, dl - dox) - startAngle)
        angles[3] = Math.modRadians(Math.atan2(dt - doy, dl - dox) - startAngle)
        // 第一个顶点设置为起点
        vertices[0] = dox
        vertices[1] = doy
        vertices[2] = sox
        vertices[3] = soy
        // 查找起始角度顺时针方向第一个矩形角
        let minimum = angles[0]
        let startIndex = 0
        for (let i = 1; i < 4; i++) {
          if (angles[i] < minimum) {
            minimum = angles[i]
            startIndex = i
          }
        }
        // 从第三个顶点开始
        let vi = 8
        let endIndex = startIndex
        for (let i = 0; i < 4; i++) {
          // 从起始角到当前角顺时针连接三角扇顶点
          const index = (startIndex + i) % 4
          if (angles[index] < currentAngle) {
            switch (index) {
              case 0: // 右上
                vertices[vi    ] = dr
                vertices[vi + 1] = dt
                vertices[vi + 2] = sr
                vertices[vi + 3] = st
                break
              case 1: // 右下
                vertices[vi    ] = dr
                vertices[vi + 1] = db
                vertices[vi + 2] = sr
                vertices[vi + 3] = sb
                break
              case 2: // 左下
                vertices[vi    ] = dl
                vertices[vi + 1] = db
                vertices[vi + 2] = sl
                vertices[vi + 3] = sb
                break
              case 3: // 左上
                vertices[vi    ] = dl
                vertices[vi + 1] = dt
                vertices[vi + 2] = sl
                vertices[vi + 3] = st
                break
            }
            vi += 4
          } else {
            // 记录结束点索引
            endIndex = index
            break
          }
        }
        // 设置起始角度和边、顶点索引
        array[0] = startAngle
        array[1] = startIndex
        array[2] = 4
        // 设置结束角度和边、顶点索引
        array[3] = startAngle + currentAngle
        array[4] = endIndex
        array[5] = vi
        // 补充第二个和最后一个顶点数据
        for (let i = 0; i < 6; i += 3) {
          const angle = array[i]
          const side = array[i + 1]
          const vi = array[i + 2]
          switch (side) {
            case 0: { // 顶点位于上边
              const x = Math.tan(angle + Math.PI * 0.5) * doy
              const dx = (dox + x)
              const sx = (tox + x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = dt
              vertices[vi + 2] = sx
              vertices[vi + 3] = st
              break
            }
            case 1: { // 顶点位于右边
              const y = Math.tan(angle) * (w - dox)
              const dy = (doy + y)
              const sy = (toy + y) / th
              vertices[vi    ] = dr
              vertices[vi + 1] = dy
              vertices[vi + 2] = sr
              vertices[vi + 3] = sy
              break
            }
            case 2: { // 顶点位于下边
              const x = Math.tan(angle - Math.PI * 0.5) * (h - doy)
              const dx = (dox - x)
              const sx = (tox - x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = db
              vertices[vi + 2] = sx
              vertices[vi + 3] = sb
              break
            }
            case 3: { // 顶点位于左边
              const y = Math.tan(angle - Math.PI) * dox
              const dy = (doy - y)
              const sy = (toy - y) / th
              vertices[vi    ] = dl
              vertices[vi + 1] = dy
              vertices[vi + 2] = sl
              vertices[vi + 3] = sy
              break
            }
          }
        }
        const drawingLength = vi / 4 + 1
        response.vertexLength = drawingLength * 4
        response.drawingLength = drawingLength
        return response
      }
    }
  }

  /** 重新调整进度条元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.resizeChildren()
    }
  }

  /** 销毁进度条元素 */
  destroy() {
    this.texture?.destroy()
    return super.destroy()
  }

  // 静态 - 绘图用返回数据
  static response = {
    vertices: new Float32Array(28),
    angles: new Float64Array(4),
    array: new Float64Array(6),
    vertexLength: null,
    drawingLength: null,
  }
}

// ******************************** 视频元素 ********************************

class VideoElement extends UIElement {
  /** HTML视频元素(影子元素)
   *  @type {HTMLVideoElement}
   */ player

  /** 视频元素当前播放状态
   *  @type {string}
   */ state

  /** 视频元素翻转模式
   *  @type {string}
   */ flip

  /** 混合模式
   *  @type {string}
   */ blend

  /** 视频元素纹理
   *  @type {Texture}
   */ texture

  // 私有属性
  _onSwitch //:function

  // 默认视频元素数据
  static defaultData = {
    video: '',
    loop: false,
    flip: 'none',
    blend: 'normal',
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 视频元素数据
   */
  constructor(data = VideoElement.defaultData) {
    super(data)
    // 创建影子视频元素
    this.player = document.createElement('video')
    this.state = 'paused'
    this.video = data.video
    this.loop = data.loop
    this.flip = data.flip
    this.blend = data.blend
    this.texture = new Texture()
    // 开始播放时调整纹理大小
    this.player.on('playing', () => {
      this.texture.resize(this.player.videoWidth, this.player.videoHeight)
    })
    // 视频播放状态侦听器
    this.player.on('play', () => {this.state = 'playing'})
    this.player.on('pause', () => {this.state = 'paused'})
    this.player.on('ended', () => {this.state = 'ended'})
    // 视频播放错误时暂停
    this.player.on('error', () => {this.player.pause()})
    // 页面不可见时暂停播放
    this._onSwitch = () => {
      if (document.hidden) {
        if (this.state === 'playing') {
          this.player.pause()
        }
      } else {
        if (this.state === 'paused') {
          this.player.play().catch(error => {})
        }
      }
    }
    // 创建视频帧更新器
    this.createVideoFrameUpdater()
  }

  /**
   * 视频文件ID
   * @type {string}
   */
  get video() {
    return this.player.guid
  }

  set video(value) {
    const {player} = this
    if (player.guid !== value) {
      player.guid = value
      player.src = File.getPathByGUID(value)
      player.play().catch(error => {})
    }
  }

  /** 视频循环播放开关 */
  get loop() {
    return this.player.loop
  }

  set loop(value) {
    this.player.loop = value
  }

  /** 创建视频帧更新器 */
  createVideoFrameUpdater() {
    const {player, texture: {base}} = this
    if ('requestVideoFrameCallback' in player) {
      // 优先使用请求视频帧回调的方法
      const update = () => {
        GL.bindTexture(GL.TEXTURE_2D, base.glTexture)
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, player)
        player.requestVideoFrameCallback(update)
      }
      player.requestVideoFrameCallback(update)
    } else {
      // 兼容模式：添加更新器
      const fps = 60
      const interval = 1000 / fps
      let elapsed = 0
      this.updaters.add({
        update: () => {
          elapsed += Time.rawDeltaTime
          if (elapsed >= interval) {
            elapsed %= interval
            // 当视频已加载时，上传视频画面到纹理
            if (player.readyState === 4) {
              GL.bindTexture(GL.TEXTURE_2D, base.glTexture)
              GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, player)
            }
          }
        }
      })
    }
  }

  /** 暂停播放视频 */
  pause() {
    if (this.state === 'playing') {
      this.player.pause()
    }
  }

  /** 继续播放视频 */
  continue() {
    if (this.state === 'paused') {
      this.player.play().catch(error => {})
    }
  }

  /** 连接视频元素 */
  connect() {
    super.connect()
    this.player.play().catch(error => {})
    document.on('visibilitychange', this._onSwitch)
  }

  /** 断开视频元素 */
  disconnect() {
    super.disconnect()
    this.player.pause()
    document.off('visibilitychange', this._onSwitch)
  }

  /** 绘制视频元素 */
  draw() {
    if (this.visible === false) {
      return
    }
    GL.alpha = this.opacity
    GL.blend = this.blend
    GL.matrix.set(this.matrix)
    GL.drawImage(this.texture, this.x, this.y, this.width, this.height)
    this.drawChildren()
  }

  /** 重新调整视频元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.resizeChildren()
    }
  }

  /** 设置视频播放结束回调 */
  onEnded(callback) {
    if (this.state === 'ended') return callback()
    this.player.on('ended', callback, {once: true})
  }

  /** 销毁视频元素 */
  destroy() {
    this.player.pause()
    this.texture?.destroy()
    // 如果当前状态不是已结束，发送模拟事件
    if (this.state !== 'ended') {
      this.player.dispatchEvent(
        new window.Event('ended')
      )
    }
    return super.destroy()
  }
}

// ******************************** 窗口元素 ********************************

class WindowElement extends UIElement {
  /** 窗口滚动区域宽度
   *  @type {number}
   */ scrollWidth

  /** 窗口滚动区域高度
   *  @type {number}
   */ scrollHeight

  /** 窗口网格宽度
   *  @type {number}
   */ gridWidth

  /** 窗口网格高度
   *  @type {number}
   */ gridHeight

  /** 窗口网格水平间距
   *  @type {number}
   */ gridGapX

  /** 窗口网格垂直间距
   *  @type {number}
   */ gridGapY

  /** 窗口水平内边距
   *  @type {number}
   */ paddingX

  /** 窗口垂直内边距
   *  @type {number}
   */ paddingY

  /** 窗口内容溢出处理模式(可见|隐藏)
   *  @type {string}
   */ overflow

  /** 窗口网格列数
   *  @type {number}
   */ columns

  /** 窗口网格行数
   *  @type {number}
   */ rows

  // 私有属性
  _layout       //:string
  _scrollX      //:number
  _scrollY      //:number

  // 默认窗口元素数据
  static defaultData = {
    layout: 'normal',
    scrollX: 0,
    scrollY: 0,
    gridWidth: 0,
    gridHeight: 0,
    gridGapX: 0,
    gridGapY: 0,
    paddingX: 0,
    paddingY: 0,
    overflow: 'visible',
    ...UIElement.defaultData,
  }

  /**
   * @param {Object} data 窗口元素数据
   */
  constructor(data = WindowElement.defaultData) {
    super(data)
    this.layout = data.layout
    this.scrollWidth = 0
    this.scrollHeight = 0
    this.scrollX = data.scrollX
    this.scrollY = data.scrollY
    this.gridWidth = data.gridWidth
    this.gridHeight = data.gridHeight
    this.gridGapX = data.gridGapX
    this.gridGapY = data.gridGapY
    this.paddingX = data.paddingX
    this.paddingY = data.paddingY
    this.overflow = data.overflow
    this.columns = 0
    this.rows = 0
  }

  /**
   * 窗口布局
   * @type {string}
   */
  get layout() {
    return this._layout
  }

  set layout(value) {
    if (this._layout !== value) {
      this._layout = value
      // 针对不同的布局模式，设置特定的方法
      switch (value) {
        case 'normal':
          delete this.resize
          break
        case 'horizontal-grid':
          this.resize = WindowElement.horizontalGridResize
          break
        case 'vertical-grid':
          this.resize = WindowElement.verticalGridResize
          break
      }
      if (this.connected) {
        this.resize()
      }
    }
  }

  /**
   * 窗口滚动X
   * @type {number}
   */
  get scrollX() {
    return this._scrollX
  }

  set scrollX(value) {
    const max = this.scrollWidth - this.width
    const scrollX = Math.clamp(value, 0, max)
    if (this._scrollX !== scrollX && Number.isFinite(value)) {
      this._scrollX = scrollX
      if (this.connected) {
        this.resize()
      }
    }
  }

  /**
   * 窗口滚动Y
   * @type {number}
   */
  get scrollY() {
    return this._scrollY
  }

  set scrollY(value) {
    const max = this.scrollHeight - this.height
    const scrollY = Math.clamp(value, 0, max)
    if (this._scrollY !== scrollY && Number.isFinite(value)) {
      this._scrollY = scrollY
      if (this.connected) {
        this.resize()
      }
    }
  }

  /**
   * 窗口内部可见的列数
   * @type {number}
   */
  get innerColumns() {
    const innerWidth = this.width + this.gridGapX - this.paddingX * 2
    const unitWidth = this.gridWidth + this.gridGapX
    return unitWidth > 0 ? Math.floor(innerWidth / unitWidth) : Infinity
  }

  /**
   * 窗口内部可见的行数
   * @type {number}
   */
  get innerRows() {
    const innerHeight = this.height + this.gridGapY - this.paddingY * 2
    const unitHeight = this.gridHeight + this.gridGapY
    return unitHeight > 0 ? Math.floor(innerHeight / unitHeight) : Infinity
  }

  /** 绘制窗口元素 */
  draw() {
    if (this.visible === false) {
      return
    }

    // 绘制子元素
    switch (this.overflow) {
      case 'visible':
        this.drawChildren()
        break
      case 'hidden':
        if (!GL.depthTest) {
          GL.alpha = 1
          GL.blend = 'normal'
          GL.depthTest = true
          GL.enable(GL.DEPTH_TEST)
          GL.depthFunc(GL.ALWAYS)
          GL.matrix.set(this.matrix)
          GL.fillRect(this.x, this.y, this.width, this.height, 0x00000000)
          GL.depthFunc(GL.EQUAL)
          this.drawChildren()
          GL.clear(GL.DEPTH_BUFFER_BIT)
          GL.disable(GL.DEPTH_TEST)
          GL.depthTest = false
        }
        break
    }
  }

  /** 绘制所有子元素 */
  drawChildren() {
    if (this.overflow === 'visible') {
      return super.drawChildren()
    }
    switch (this.layout) {
      case 'normal':
        return super.drawChildren()
      case 'horizontal-grid': {
        const unitWidth = this.gridWidth + this.gridGapX
        const unitHeight = this.gridHeight + this.gridGapY
        if (unitWidth * unitHeight === 0) {
          return super.drawChildren()
        }
        const children = this.children
        const scrollTop = this.scrollY - this.paddingY
        const scrollBottom = scrollTop + this.height
        const startRow = Math.floor(scrollTop / unitHeight)
        const endRow = Math.ceil(scrollBottom / unitHeight)
        const start = Math.max(startRow * this.columns, 0)
        const end = Math.min(endRow * this.columns, children.length)
        for (let i = start; i < end; i++) {
          children[i].draw()
        }
        break
      }
      case 'vertical-grid': {
        const unitWidth = this.gridWidth + this.gridGapX
        const unitHeight = this.gridHeight + this.gridGapY
        if (unitWidth * unitHeight === 0) {
          return super.drawChildren()
        }
        const children = this.children
        const scrollLeft = this.scrollX - this.paddingX
        const scrollRight = scrollLeft + this.width
        const startCol = Math.floor(scrollLeft / unitWidth)
        const endCol = Math.ceil(scrollRight / unitWidth)
        const start = Math.max(startCol * this.rows, 0)
        const end = Math.min(endCol * this.rows, children.length)
        for (let i = start; i < end; i++) {
          children[i].draw()
        }
        break
      }
    }
  }

  /** 重新调整窗口元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      const {children} = this
      const {length} = children
      const {proxy} = WindowElement
      // 通过代理元素模拟出滚动区域的位置
      proxy.x = this.x - this.scrollX
      proxy.y = this.y - this.scrollY
      proxy.width = this.width
      proxy.height = this.height
      proxy.matrix = this.matrix
      proxy.opacity = this.opacity
      for (let i = 0; i < length; i++) {
        // 暂时设置子元素的父元素为代理元素，然后计算位置
        const element = children[i]
        element.parent = proxy
        element.resize()
        element.parent = this
      }
      // 正常布局下，需要计算滚动区域
      this._calculateScrollArea()
    }
  }

  /** 请求调整窗口元素(过滤重复请求) */
  requestResizing() {
    // 忽略同一帧内的重复请求
    if (!this.requesting) {
      this.requesting = true
      Callback.push(() => {
        delete this.requesting
        this.resize()
      })
    }
  }

  /** 计算窗口滚动区域 */
  _calculateScrollArea() {
    const {max} = Math
    const {children} = this
    const {length} = children
    const parentWidth = this.width
    const parentHeight = this.height
    // 设置滚动区域的最小值
    let scrollWidth = this.width
    let scrollHeight = this.height
    for (let i = 0; i < length; i++) {
      // 根据子元素的变换参数估算滚动区域大小
      const {transform} = children[i]
      const sx = transform.scaleX
      const sy = transform.scaleY
      // 计算绝对位置
      const x = transform.x + transform.x2 * parentWidth
      const y = transform.y + transform.y2 * parentHeight
      // 计算绝对宽高
      const w = max(transform.width + transform.width2 * parentWidth, 0)
      const h = max(transform.height + transform.height2 * parentHeight, 0)
      scrollWidth = max(scrollWidth, x + (1 - transform.anchorX) * w * sx)
      scrollHeight = max(scrollHeight, y + (1 - transform.anchorY) * h * sy)
    }
    this.scrollWidth = scrollWidth
    this.scrollHeight = scrollHeight
    // 如果滚动区域发生变化，调整滚动位置
    this.scrollX = this.scrollX
    this.scrollY = this.scrollY
  }

  // 代理元素
  static proxy = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    matrix: null,
    opacity: 0,
  }

  /** 水平网格 - 重新调整窗口元素 */
  static horizontalGridResize() {
    if (!this.visible) return
    this.calculatePosition()
    const {children} = this
    const {length} = children
    // 如果不存在子元素，返回
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = WindowElement
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    // 如果单元宽度是0，全部子元素放在同一行，否则计算行数和列数
    const columns = unitWidth === 0 ? length
    : max(floor((this.width + gridGapX - paddingX * 2) / unitWidth), 1)
    const rows = ceil(length / columns)
    // 计算滚动区域大小
    const scrollHeight = rows * unitHeight - gridGapY + paddingY * 2
    this.scrollWidth = max(this.width, gridWidth)
    this.scrollHeight = max(this.height, scrollHeight)
    this.columns = columns
    this.rows = rows
    // 如果滚动区域发生变化，调整滚动位置
    this.scrollY = this.scrollY
    // 设置网格代理元素的大小和矩阵
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    // 设置网格代理元素开始位置
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      // 计算网格代理元素的具体位置
      proxy.x = sx + i % columns * unitWidth
      proxy.y = sy + floor(i / columns) * unitHeight
      // 暂时设置子元素的父元素为代理元素，然后计算位置
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }

  /** 垂直网格 - 重新调整窗口元素 */
  static verticalGridResize() {
    if (!this.visible) return
    this.calculatePosition()
    const {children} = this
    const {length} = children
    // 如果不存在子元素，返回
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = WindowElement
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    // 如果单元高度是0，全部子元素放在同一列，否则计算行数和列数
    const rows = unitHeight === 0 ? length
    : max(floor((this.height + gridGapY - paddingY * 2) / unitHeight), 1)
    const columns = ceil(length / rows)
    // 计算滚动区域大小
    const scrollWidth = columns * unitWidth - gridGapX + paddingX * 2
    this.scrollWidth = max(this.width, scrollWidth)
    this.scrollHeight = max(this.height, gridHeight)
    this.columns = columns
    this.rows = rows
    // 如果滚动区域发生变化，调整滚动位置
    this.scrollX = this.scrollX
    // 设置网格代理元素的大小和矩阵
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    // 设置网格代理元素开始位置
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      // 计算网格代理元素的具体位置
      proxy.x = sx + floor(i / rows) * unitWidth
      proxy.y = sy + i % rows * unitHeight
      // 暂时设置子元素的父元素为代理元素，然后计算位置
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }
}

// ******************************** 容器元素 ********************************

class ContainerElement extends UIElement {
  constructor(data = UIElement.defaultData) {
    super(data)
  }

  /** 绘制容器元素 */
  draw() {
    if (this.visible) {
      this.drawChildren()
    }
  }

  /** 重新调整容器元素 */
  resize() {
    if (this.visible) {
      if (this.parent instanceof WindowElement) {
        return this.parent.requestResizing()
      }
      this.calculatePosition()
      this.resizeChildren()
    }
  }
}

// ******************************** 元素管理器类 ********************************

const UIElementManager = new class {
  // 给元素注入的分区键
  CELL = Symbol('CELL')
  cells = [[], [], [], []]
  counts = new Uint32Array(4)
  index = 0

  // 激活的元素列表
  activeElements = []
  activeCount = 0

  // 读取元素数量
  get count() {
    let count = 0
    for (const cell of this.cells) {
      count += cell.length
    }
    return count
  }

  /**
   * 添加元素到管理器中
   * @param {UIElement} element 元素实例
   */
  append(element) {
    const cells = this.cells
    const index = this.index++ % cells.length
    const cell = cells[index]
    if (!element[this.CELL]) {
      element[this.CELL] = cell
      this.activate(element)
    }
    cell.push(element)
  }

  /**
   * 从管理器中移除元素
   * @param {UIElement} element 元素实例
   */
  remove(element) {
    // 延迟从分区中移除
    const cell = element[this.CELL]
    delete element[this.CELL]
    Callback.push(() => {
      cell.remove(element)
    })
  }

  /**
   * 准备激活第一次添加到管理器中的元素
   * @param {UIElement} element 元素实例
   */
  activate(element) {
    this.activeElements[this.activeCount++] = element
  }

  /** 更新已连接的元素 */
  update() {
    // 发送激活元素的自动执行事件
    for (let i = 0; i < this.activeCount; i++) {
      this.activeElements[i].emit('autorun', false)
      this.activeElements[i] = null
    }
    this.activeCount = 0
    const cells = this.cells
    const counts = this.counts
    const length = cells.length
    // 先确定所有分区的长度
    // 因为在更新时可能加入新元素导致变长
    // 新加入的元素就留到下一帧进行更新
    for (let i = 0; i < length; i++) {
      counts[i] = cells[i].length
    }
    // 遍历所有分区中的元素
    const deltaTime = Time.rawDeltaTime
    for (let i = 0; i < length; i++) {
      const cell = cells[i]
      const count = counts[i]
      for (let i = 0; i < count; i++) {
        const element = cell[i]
        // 如果元素已连接，更新它的模块
        if (element.connected) {
          element.updaters.update(deltaTime)
        }
      }
    }
  }
}