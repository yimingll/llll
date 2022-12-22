'use strict'

// ******************************** 事件冒泡堆栈管理器 ********************************

const EventBubbleStack = new class {
  // 栈索引
  index = 0

  // 事件冒泡状态栈
  stack = [false]

  /**
   * 获取事件冒泡状态
   * @returns {boolean} false=停止传递事件
   */
  get() {
    return this.stack[this.index]
  }

  /** 停止事件冒泡 */
  stop() {
    this.stack[this.index] = false
  }

  /**
   * 推入事件冒泡状态
   * @param {boolean} bubble 冒泡状态
   */
  push(bubble) {
    this.stack[++this.index] = bubble
  }

  /** 弹出事件冒泡状态 */
  pop() {
    this.index--
  }
}

// ******************************** 输入控制器 ********************************

const Input = new class {
  // 键盘按键状态
  keys = {}

  // 鼠标按键状态
  buttons = new Uint8Array(5)

  // 鼠标对象
  mouse

  // JS原生事件
  event = null

  // 事件冒泡栈
  bubbles = EventBubbleStack

  // 输入事件侦听器
  listeners = {
    keydown: [],
    keyup: [],
    mousedown: [],
    mousedownLB: [],
    mousedownRB: [],
    mouseup: [],
    mouseupLB: [],
    mouseupRB: [],
    mousemove: [],
    mouseleave: [],
    doubleclick: [],
    wheel: [],
  }

  // 按键黑名单
  keydownBlackList = [
    'F1',     'F2',     'F3',     'F4',
    'F5',     'F6',     'F7',     'F8',
    'F9',     'F10',    'TAB',
  ]

  // 按键白名单(控制键按下时)
  keydownWhiteListOnCtrl = [
    'KeyA',     'KeyC',     'KeyV',     'KeyX',
    'KeyY',     'KeyZ',     'Digit1',   'Digit2',
    'Digit3',   'Digit4',   'Digit5',   'Digit6',
    'Digit7',   'Digit8',   'Digit9',   'Numpad1',
    'Numpad2',  'Numpad3',  'Numpad4',  'Numpad5',
    'Numpad6',  'Numpad7',  'Numpad8',  'Numpad9',
  ]

  /** 初始化输入控制器 */
  initialize() {
    // 创建鼠标对象
    this.mouse = Mouse

    // 创建事件冒泡栈
    this.bubbles = EventBubbleStack

    // 侦听事件
    window.on('keydown', this.keydown)
    window.on('keyup', this.keyup)
  }

  /** 更新输入状态 */
  update() {
    Input.mouse.update()
  }

  /**
   * 添加输入事件侦听器
   * @param {string} type 输入事件类型
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
   * 移除输入事件侦听器(未使用)
   * @param {string} type 输入事件类型
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
   * 发送输入事件
   * @param {string} type 输入事件类型
   */
  emit(type) {
    const {bubbles} = this
    bubbles.push(true)
    for (const listener of this.listeners[type]) {
      if (bubbles.get()) {
        listener()
        continue
      }
      break
    }
    bubbles.pop()
  }

  /**
   * 按键过滤器
   * @param {KeyboardEvent} event 键盘事件
   */
  keydownFilter(event) {
    // 如果是本地运行，返回
    if (Stats.isOnClient) {
      return
    }
    // 阻止默认按键行为(Web模式)
    const {code} = event
    if (event.cmdOrCtrlKey) {
      if (!this.keydownWhiteListOnCtrl.includes(code)) {
        event.preventDefault()
      }
    } else if (event.altKey) {
      event.preventDefault()
    } else if (this.keydownBlackList.includes(code)) {
      event.preventDefault()
    }
  }

  /**
   * 键盘按下事件
   * @param {KeyboardEvent} event 键盘事件
   */
  keydown(event) {
    Input.keydownFilter(event)

    // 触发游戏事件
    const {keys} = Input
    const {code} = event
    if (keys[code] !== 1) {
      keys[code] = 1
      Input.event = event
      Input.emit('keydown')
      Input.event = null
    }

    // 功能快捷键
    switch (event.code) {
      case 'F5':
        if (Stats.debug) {
          location.reload()
        }
        break
      case 'F10':
        Game.switchGameInfoDisplay()
        break
      // case 'Pause':
      //   GL.WEBGL_lose_context.loseContext()
      //   break
    }
  }

  /**
   * 键盘弹起事件
   * @param {KeyboardEvent} event 键盘事件
   */
  keyup(event) {
    // 触发游戏事件
    const {keys} = Input
    const {code} = event
    if (keys[code] === 1) {
      keys[code] = 0
      Input.event = event
      Input.emit('keyup')
      Input.event = null
    }
  }
}

// ******************************** 鼠标管理器类 ********************************

const Mouse = new class {
  rotated = false
  entered = true
  left = 0
  top = 0
  right = 0
  ratioX = 0
  ratioY = 0
  screenX = -1
  screenY = -1
  sceneX = -1
  sceneY = -1
  eventCache = null
  pointerdownEvent = null

  /** 初始化鼠标管理器 */
  initialize() {
    // 调整位置
    this.resize()

    // 侦听事件
    window.on('resize', this.resize)
    window.on('pointerup', this.pointerup)
    window.on('pointermove', this.pointermove)
    window.on('pointerenter', this.pointerenter)
    window.on('pointerleave', this.pointerleave)
    GL.canvas.on('pointerdown', this.pointerdown)
    GL.canvas.on('pointerdown', this.doubleclick)
    GL.canvas.on('wheel', this.wheel)
  }

  /** 更新鼠标的场景坐标 */
  update() {
    Mouse.calculateSceneCoords()
  }

  /**
   * 指针按下事件
   * @param {PointerEvent} event 指针事件
   */
  pointerdown(event) {
    Mouse.calculateCoords(event)
    Input.event = event
    Input.buttons[event.button] = 1
    switch (event.button) {
      case 0: Input.emit('mousedownLB'); break
      case 1: Input.emit('mousedownRB'); break
    }
    Input.emit('mousedown')
    Input.event = null
  }

  /**
   * 指针弹起事件
   * @param {PointerEvent} event 指针事件
   */
  pointerup(event) {
    Input.event = event
    Input.buttons[event.button] = 0
    switch (event.button) {
      case 0: Input.emit('mouseupLB'); break
      case 1: Input.emit('mouseupRB'); break
      // 阻止Chrome浏览器：
      // 前进/后退键弹起页面导航行为
      case 3:
      case 4: event.preventDefault(); break
    }
    Input.emit('mouseup')
    Input.event = null
  }

  /**
   * 指针移动事件
   * @param {PointerEvent} event 指针事件
   */
  pointermove(event) {
    Mouse.calculateCoords(event)
    Input.emit('mousemove')
  }

  /**
   * 指针进入事件
   * @param {PointerEvent} event 指针事件
   */
  pointerenter(event) {
    Mouse.entered = true
  }

  /**
   * 指针离开事件
   * @param {PointerEvent} event 指针事件
   */
  pointerleave(event) {
    Mouse.entered = false
    Input.emit('mouseleave')
  }

  /**
   * 鼠标双击事件
   * @param {PointerEvent} event 指针事件
   */
  doubleclick(event) {
    if (!event.cmdOrCtrlKey &&
      !event.altKey &&
      !event.shiftKey) {
      switch (event.button) {
        case 0: {
          // 用指针按下事件来模拟鼠标双击事件
          // 原生的鼠标双击事件在第二次弹起时触发
          // 而模拟的在第二次按下时触发，手感更好
          // 要求：按键间隔<500ms，抖动偏移<4px
          if (Mouse.pointerdownEvent !== null &&
            event.timeStamp - Mouse.pointerdownEvent.timeStamp < 500 &&
            Math.abs(event.clientX - Mouse.pointerdownEvent.clientX) < 4 &&
            Math.abs(event.clientY - Mouse.pointerdownEvent.clientY) < 4) {
            Input.emit('doubleclick')
            Mouse.pointerdownEvent = null
          } else {
            Mouse.pointerdownEvent = event
          }
          break
        }
        default:
          Mouse.pointerdownEvent = null
          break
      }
    }
  }

  /**
   * 鼠标滚轮事件
   * @param {WheelEvent} event 滚轮事件
   */
  wheel(event) {
    event.preventDefault()
    Input.event = event
    Input.emit('wheel')
    Input.event = null
  }

  /** 重新调整位置 */
  resize() {
    const container = GL.container
    const canvas = GL.canvas
    const rect = container.getBoundingClientRect()
    Mouse.rotated = container.style.transform === 'rotate(90deg)'
    Mouse.left = rect.left
    Mouse.top = rect.top
    Mouse.right = rect.right
    switch (Mouse.rotated) {
      case false:
        // 屏幕未旋转的情况
        Mouse.ratioX = canvas.width / rect.width
        Mouse.ratioY = canvas.height / rect.height
        break
      case true:
        // 屏幕旋转90度的情况
        Mouse.ratioX = canvas.width / rect.height
        Mouse.ratioY = canvas.height / rect.width
        break
    }
    // 重新计算坐标
    if (Mouse.eventCache !== null) {
      Mouse.calculateCoords(Mouse.eventCache)
    }
  }

  /**
   * 计算坐标
   * @param {PointerEvent} event 
   */
  calculateCoords(event) {
    this.eventCache = event
    switch (this.rotated) {
      case false:
        // 屏幕未旋转的情况
        this.screenX = Math.round((event.clientX - this.left) * this.ratioX - 0.0001)
        this.screenY = Math.round((event.clientY - this.top) * this.ratioY - 0.0001)
        break
      case true:
        // 屏幕旋转90度的情况
        this.screenX = Math.round((event.clientY - this.top) * this.ratioX - 0.0001)
        this.screenY = Math.round((this.right - event.clientX) * this.ratioY - 0.0001)
        break
    }
    this.calculateSceneCoords()
  }

  /** 计算场景坐标 */
  calculateSceneCoords() {
    const scene = Scene.binding
    if (scene === null) return
    const x = Math.round(Camera.scrollLeft) + this.screenX / Camera.zoom
    const y = Math.round(Camera.scrollTop) + this.screenY / Camera.zoom
    this.sceneX = x / scene.tileWidth
    this.sceneY = y / scene.tileHeight
  }
}