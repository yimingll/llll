/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@attribute-key itemName
@alias #itemName
@filter item

@attribute-key itemQuality
@alias #itemQuality
@filter item

@attribute-key itemCdKey
@alias #itemCdKey
@filter item

@attribute-key itemCd
@alias #itemCd
@filter item

@attribute-key itemDesc
@alias #itemDesc
@filter item

@attribute-key itemPrice
@alias #itemPrice
@filter item

@attribute-key equipName
@alias #equipName
@filter equipment

@attribute-key equipQuality
@alias #equipQuality
@filter equipment

@attribute equipSlot
@alias #equipSlot
@filter equipment

@attribute-key equipType
@alias #equipType
@filter equipment

@attribute-key equipDesc
@alias #equipDesc
@filter equipment

@attribute-key equipPrice
@alias #equipPrice
@filter equipment

@attribute-key skillName
@alias #skillName
@filter skill

@attribute-key skillCD
@alias #skillCD
@filter skill

@attribute-key skillDesc
@alias #skillDesc
@filter skill

@attribute-key stateName
@alias #stateName
@filter state

@attribute-key stateDesc
@alias #stateDesc
@filter state

@attribute-key actorEquipTypes
@alias #actorEquipTypes
@filter actor

@string equipTypeFormat
@alias #equipTypeFormat
@default '<type>'

@attribute-group equipIntAttrGroupId
@alias #equipIntAttrGroupId

@attribute-group equipPercentAttrGroupId
@alias #equipPercentAttrGroupId

@attribute-group stateIntAttrGroupId
@alias #stateIntAttrGroupId

@attribute-group statePercentAttrGroupId
@alias #statePercentAttrGroupId

@attribute-group skillIntAttrGroupId
@alias #skillIntAttrGroupId

@attribute-group skillPercentAttrGroupId
@alias #skillPercentAttrGroupId

@string[] qualityFormats
@alias #qualityFormats
@default [
  'common = <color:0>{name}',
  'rare = <color:1>{name}',
  'artifact = <color:2>{name}',
  'legendary = <color:3>{name}',
]

@string[] qualityBackgrounds
@alias #qualityBackgrounds
@default [
  'common = BackgroundElementId',
  'rare = BackgroundElementId',
  'artifact = BackgroundElementId',
  'legendary = BackgroundElementId',
]

@string equipAttrFormat
@alias #equipAttrFormat
@default '{attr-name} {attr-value}'

@color attrIncreaseColor
@alias #attrIncreaseColor
@default 00ff00ff

@color attrDecreaseColor
@alias #attrDecreaseColor
@default ff0000ff

@string passiveSkill
@alias #passiveSkill
@default 'Passive'

@enum-group hiddenShortcutGroupId
@alias #hiddenShortcutGroupId

@enum-group shortcutGroupId
@alias #shortcutGroupId

@string cdTimeFormat
@alias #cdTimeFormat
@default 'CD <color:ffffff>{cd}</color> S'

@string stateTimeFormatLabel
@alias #stateTimeFormatLabel

@string stateTimeFormatHour
@alias #stateTimeFormatHour

@string stateTimeFormatMinute
@alias #stateTimeFormatMinute

@string stateTimeFormatSecond
@alias #stateTimeFormatSecond

@number leastEmptyGrids
@alias #leastEmptyGrids
@clamp 0 100
@default 8

@file seCursor
@alias #seCursor
@filter audio

@file seConfirm
@alias #seConfirm
@filter audio

@file seCancel
@alias #seCancel
@filter audio

@file seError
@alias #seError
@filter audio

@file seEquip
@alias #seEquip
@filter audio

@lang en
#plugin Menu
#itemName Item Name
#itemQuality Item Quality
#itemCdKey Item CD Key
#itemCd Item CD
#itemDesc Item Desc
#itemPrice Item Price
#equipName Equip Name
#equipQuality Equip Quality
#equipSlot Equip Slot
#equipType Equip Type
#equipDesc Equip Desc
#equipPrice Equip Price
#skillName Skill Name
#skillCD Skill CD
#skillDesc Skill Desc
#stateName State Name
#stateDesc State Desc
#actorEquipTypes Actor Equip Types
#equipTypeFormat Equip Type Format
#equipIntAttrGroupId Equip Attrs (Int)
#equipPercentAttrGroupId Equip Attrs (Percentage)
#stateIntAttrGroupId State Attrs (Int)
#statePercentAttrGroupId State Attrs (Percentage)
#skillIntAttrGroupId Skill Attrs (Int)
#skillPercentAttrGroupId Skill Attrs (Percentage)
#qualityFormats Quality->Name Map
#qualityBackgrounds Quality->Back Map
#equipAttrFormat Equip Attr Format
#attrIncreaseColor Attr Increase Color
#attrDecreaseColor Attr Decrease Color
#passiveSkill Passive Skill Text
#hiddenShortcutGroupId Hidden Skill Keys
#shortcutGroupId Keys for Shortcut Bar
#cdTimeFormat CD Time Format
#stateTimeFormatLabel State Time Format (Label)
#stateTimeFormatHour State Time Format (Hour)
#stateTimeFormatMinute State Time Format (Minute)
#stateTimeFormatSecond State Time Format (Second)
#leastEmptyGrids Least Empty Grids
#seCursor SE Cursor
#seConfirm SE Confirm
#seCancel SE Cancel
#seError SE Error
#seEquip SE Equip

@lang zh
#plugin 主菜单
#itemName 物品名称
#itemQuality 物品品质
#itemCdKey 物品冷却键
#itemCd 物品冷却时间
#itemDesc 物品描述
#itemPrice 物品价格
#equipName 装备名称
#equipQuality 装备品质
#equipSlot 装备槽
#equipType 装备类型
#equipDesc 装备描述
#equipPrice 装备价格
#skillName 技能名称
#skillCD 技能冷却时间
#skillDesc 技能描述
#stateName 状态名称
#stateDesc 状态描述
#actorEquipTypes 角色装备类型
#equipTypeFormat 装备类型格式
#equipIntAttrGroupId 装备角色属性(整数)
#equipPercentAttrGroupId 装备角色属性(百分比)
#stateIntAttrGroupId 状态角色属性(整数)
#statePercentAttrGroupId 状态角色属性(百分比)
#skillIntAttrGroupId 技能角色属性(整数)
#skillPercentAttrGroupId 技能角色属性(百分比)
#qualityFormats 品质->名称格式映射表
#qualityBackgrounds 品质->背景元素映射表
#equipAttrFormat 装备属性词条格式
#attrIncreaseColor 属性增加颜色
#attrDecreaseColor 属性减少颜色
#passiveSkill 被动技能文本
#hiddenShortcutGroupId 隐藏技能的键列表
#shortcutGroupId 快捷栏的键列表
#cdTimeFormat 冷却时间格式
#stateTimeFormatLabel 状态时间格式(标签)
#stateTimeFormatHour 状态时间格式(小时)
#stateTimeFormatMinute 状态时间格式(分)
#stateTimeFormatSecond 状态时间格式(秒)
#leastEmptyGrids 最少空栏位数量
#seCursor 光标音效
#seConfirm 确定音效
#seCancel 取消音效
#seError 错误音效
#seEquip 装备音效

*/

// 主要脚本实例
class Manager {}

// 品质名称格式映射表
const QualityFormats = {}
let DefQualityFormatKey = ''
let DefQualityFormat = '{name}'

// 品质背景元素ID映射表
const QualityBackgrounds = {}

// 各种元素
let SortAll
let SortItem
let SortEquip
let SortSkill
let SortButton
let SaveButton
let LoadButton
let SaveWindow
let ExitButton
let ExitWindow
let MainWindow
let ActorListElement
let StatusWindow
let InventoryWindow
let InventorySortButton
let GridWindow
let SelectBox
let InfoWindow
let DragItem

// 信息管理器
const Info = {
  target: null,
}

// 设置显示信息的对象
Info.setTarget = function (target) {
  if (this.target === target) return
  this.target = target
  if (target === null) {
    InfoWindow.hide()
  }
  if (target instanceof Item) {
    InfoWindow.show()
    this.updateItemInfo(target)
  }
  if (target instanceof Equipment) {
    InfoWindow.show()
    this.updateEquipInfo(target)
  }
  if (target instanceof Skill) {
    InfoWindow.show()
    this.updateSkillInfo(target)
  }
  if (target instanceof State) {
    InfoWindow.show()
    this.updateStateInfo(target)
  }
}

// 解析整数属性
Info.parseIntAttr = function (name, value) {
  const sign = value > 0 ? '+' : ''
  const change = sign + value
  const color = `<color:${value > 0 ? Manager.attrIncreaseColor : Manager.attrDecreaseColor}>`
  return color + Manager.equipAttrFormat.replace('{attr-name}', name).replace('{attr-value}', change) + '</color>\n'
}

// 解析百分比属性
Info.parsePercentAttr = function (name, value) {
  const sign = value > 0 ? '+' : ''
  const change = sign + Math.round(value * 100) + '%'
  const color = `<color:${value > 0 ? Manager.attrIncreaseColor : Manager.attrDecreaseColor}>`
  return color + Manager.equipAttrFormat.replace('{attr-name}', name).replace('{attr-value}', change) + '</color>\n'
}

// 更新物品信息
Info.updateItemInfo = function (item) {
  // 物品名称
  const name = item.attributes[Manager.itemName]
  if (typeof name === 'string') {
    const quality = item.attributes[Manager.itemQuality]
    const format = QualityFormats[quality] ?? DefQualityFormat
    const content = format.replace('{name}', name)
    InfoWindow.elName.content = content
  } else {
    InfoWindow.elName.content = ''
  }
  // 物品冷却时间
  const cdTime = item.attributes[Manager.itemCd]
  if (typeof cdTime === 'number') {
    InfoWindow.elType.content = Manager.cdTimeFormat.replace('{cd}', cdTime / 1000)
  } else {
    InfoWindow.elType.content = ''
  }
  // 物品描述
  const desc = item.attributes[Manager.itemDesc]
  if (typeof desc === 'string') {
    InfoWindow.elDesc.content = desc
  } else {
    InfoWindow.elDesc.content = ''
  }
  // 物品价格
  const price = item.attributes[Manager.itemPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = InfoWindow.elPrice.format.replace('{price}', price)
  } else {
    InfoWindow.elPrice.content = ''
  }
}

// 更新装备信息
Info.updateEquipInfo = function (equip) {
  // 装备名称
  const name = equip.attributes[Manager.equipName]
  if (typeof name === 'string') {
    const quality = equip.attributes[Manager.equipQuality]
    const format = QualityFormats[quality] ?? DefQualityFormat
    const content = format.replace('{name}', name)
    InfoWindow.elName.content = content
  } else {
    InfoWindow.elName.content = ''
  }
  // 装备部位
  const slot = equip.attributes[Manager.equipSlot?.key]
  if (typeof slot === 'string') {
    const enumGroup = Enum.getGroup(Manager.equipSlot.enum)
    InfoWindow.elType.content = enumGroup[slot]
  } else {
    InfoWindow.elType.content = ''
  }
  // 生成角色属性信息
  let totalDesc = ''
  for (const [key, value] of Object.entries(equip.attributes)) {
    // 整数型属性
    if (key in Manager.equipIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.equipIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // 百分比属性
    if (key in Manager.equipPercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.equipPercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // 装备描述
  const equipDesc = equip.attributes[Manager.equipDesc]
  if (equipDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += equipDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // 装备价格
  const price = equip.attributes[Manager.equipPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = InfoWindow.elPrice.format.replace('{price}', price)
  } else {
    InfoWindow.elPrice.content = ''
  }
}

// 更新技能信息
Info.updateSkillInfo = function (skill) {
  // 技能名称
  const name = skill.attributes[Manager.skillName]
  if (typeof name === 'string') {
    InfoWindow.elName.content = name
  } else {
    InfoWindow.elName.content = ''
  }
  if (skill.events.skillcast) {
    // 主动技能：技能冷却时间
    const cdTime = skill.attributes[Manager.skillCD]
    if (typeof cdTime === 'number') {
      InfoWindow.elType.content = Manager.cdTimeFormat.replace('{cd}', cdTime / 1000)
    } else {
      InfoWindow.elType.content = ''
    }
  } else {
    // 被动技能：固有名词
    InfoWindow.elType.content = Manager.passiveSkill
  }
  // 生成角色属性信息
  let totalDesc = ''
  for (const [key, value] of Object.entries(skill.attributes)) {
    // 整数型属性
    if (key in Manager.skillIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.skillIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // 百分比属性
    if (key in Manager.skillPercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.skillPercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // 技能描述
  const skillDesc = skill.attributes[Manager.skillDesc]
  if (skillDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += skillDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // 设置价格(隐藏)
  InfoWindow.elPrice.content = ''
}

// 更新状态信息
Info.updateStateInfo = function (state) {
  // 状态名称
  const name = state.attributes[Manager.stateName]
  if (typeof name === 'string') {
    InfoWindow.elName.content = name
  } else {
    InfoWindow.elName.content = ''
  }
  // 状态剩余时间
  let stateTime = Manager.stateTimeFormatLabel
  let seconds = state.currentTime / 1000
  if (seconds >= 3600) {
    // 小时
    const hours = Math.floor(seconds / 3600)
    stateTime += Manager.stateTimeFormatHour.replace('{h}', hours)
    seconds %= 3600
  }
  if (seconds >= 60) {
    // 分
    const minutes = Math.floor(seconds / 60)
    stateTime += Manager.stateTimeFormatMinute.replace('{m}', minutes)
    seconds %= 60
  }
  if (seconds > 0) {
    // 秒
    seconds = Math.ceil(seconds)
    stateTime += Manager.stateTimeFormatSecond.replace('{s}', seconds)
  }
  InfoWindow.elType.content = stateTime
  // 生成角色属性信息
  let totalDesc = ''
  for (const [key, value] of Object.entries(state.attributes)) {
    // 整数型属性
    if (key in Manager.stateIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.stateIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // 百分比属性
    if (key in Manager.statePercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.statePercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // 状态描述
  const stateDesc = state.attributes[Manager.stateDesc]
  if (stateDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += stateDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // 设置价格(隐藏)
  InfoWindow.elPrice.content = ''
}

// 拖拽管理器
const Drag = {
  mode: '',
  target: null,
  activeMode: '',
  mousedownX: 0,
  mousedownY: 0,
}

// 开始拖拽
Drag.start = function (mode, target) {
  if (target) {
    this.mode = mode
    this.target = target
    this.activeMove = ''
    this.updateIcon(target)
    this.mousedownX = Input.mouse.screenX
    this.mousedownY = Input.mouse.screenY
    DragItem.set({
      x: Input.mouse.screenX,
      y: Input.mouse.screenY,
    })
    Input.on('mousemove', Drag.onMouseMove, true)
    Input.on('mouseupLB', Drag.onMouseUp, true)
  }
}

// 结束拖拽
Drag.end = function () {
  if (this.mode) {
    this.mode = ''
    const actor = Manager.actor
    Callback.push(() => {
      switch (this.activeMode) {
        case 'slot':
          // 移除装备槽装备
          Manager.playEquipSE()
          this.target.remove()
          break
        case 'shortcut':
          // 移除快捷键项目
          Manager.playEquipSE()
          actor.shortcutManager.delete(this.target.key)
          break
      }
      this.target = null
      this.activeMode = ''
    })
    DragItem.remove()
    Input.off('mousemove', Drag.onMouseMove)
    Input.off('mouseupLB', Drag.onMouseUp)
  }
}

// 更新拖拽图标
Drag.updateIcon = function (target) {
  if (target instanceof Item ||
    target instanceof Equipment ||
    target instanceof Skill ||
    target instanceof Shortcut) {
    DragItem.elIcon.setImageClip(target.icon, target.clip)
  }
}

// 拖拽 - 鼠标移动事件
Drag.onMouseMove = function () {
  if (!Drag.activeMode) {
    const x = Drag.mousedownX - Input.mouse.screenX
    const y = Drag.mousedownY - Input.mouse.screenY
    const dist = Math.abs(x) + Math.abs(y)
    if (dist <= 8) return
    Drag.activeMode = Drag.mode
    UI.root.appendChild(DragItem)
  }
  DragItem.set({
    x: Input.mouse.screenX,
    y: Input.mouse.screenY,
  })
}

// 拖拽 - 鼠标弹起事件
Drag.onMouseUp = function () {
  Drag.end()
}

// 主要脚本
class MainScript {
  constructor() {
    Manager = this
    Manager.info = Info
  }

  // 设置目标角色
  setTargetActor(actor) {
    this.actor = actor
  }

  onStart(element) {
    // 暂停游戏
    Scene.pause()

    // 隐藏主界面
    this.hideMainUI()

    // 设置目标角色
    this.setTargetActor(Party.player)

    // 获取窗口元素，添加脚本
    MainWindow = element
    ActorListElement = UI.get('91304e1d5e3f7d8c')
    ActorListElement.script.add(new ActorListScript())
    StatusWindow = UI.get('4d696b1f2fe71a24')
    StatusWindow.script.add(new StatusWindowScript())
    InventoryWindow = UI.get('a04ad299899217ee')
    InventoryWindow.script.add(new InventoryWindowScript())
    InventorySortButton = UI.get('ae5bd5efbf75bf57')
    InventorySortButton.script.add(new InventorySortButtonScript())
    GridWindow = UI.get('dff4d59ee4ebc20b')

    // 获取导航栏按钮，添加脚本
    SortAll = UI.get('dc59a0e8f165dd55')
    SortAll.script.add(new SortButtonScript())
    SortItem = UI.get('de4ed5e6b844a92e')
    SortItem.script.add(new SortButtonScript())
    SortEquip = UI.get('c856d92b6da260bd')
    SortEquip.script.add(new SortButtonScript())
    SortSkill = UI.get('f0c0f9cb7449d82f')
    SortSkill.script.add(new SortButtonScript())
    SortButton = SortAll

    // 获取保存按钮，添加脚本
    SaveButton = UI.get('fcca5230a8a409ce')
    SaveButton.script.add(new SaveOrLoadButtonScript())

    // 获取读取按钮，添加脚本
    LoadButton = UI.get('7214e44cfa8d3040')
    LoadButton.script.add(new SaveOrLoadButtonScript())

    // 获取退出按钮，添加脚本
    ExitButton = UI.get('fb860ce669eb96d1')
    ExitButton.script.add(new ExitButtonScript())

    // 获取信息窗口
    InfoWindow = UI.get('2f4017f49bfbeeca').hide()
    InfoWindow.pointerEvents = 'disabled'
    InfoWindow.elName = UI.get('ec899d622afbbc92')
    InfoWindow.elType = UI.get('ac1bcdc5334dea96')
    InfoWindow.elDesc = UI.get('08ecb52f6d0fb2ad')
    InfoWindow.elPrice = UI.get('ab87c20f697555c8')
    InfoWindow.elPrice.format = InfoWindow.elPrice.content

    // 创建选择框元素
    SelectBox = UI.createElement('1af9aa7372fa7185')
    SelectBox.pointerEvents = 'disabled'

    // 创建拖拽项目元素
    DragItem = UI.createElement('c4aa45f1f9a37b18')
    DragItem.elIcon = UI.get('1027cc5c5e20816d')
    DragItem.pointerEvents = 'disabled'

    // 获取快捷栏，添加脚本
    this.shortcutBar = UI.get('7fd5792b9fb97257')
    this.shortcutBar.script.add(new ShortcutBarScript())

    // 获取状态栏，添加脚本
    this.stateBar = UI.get('fafa8f78f15d33df')
    this.stateBar.script.add(new StateBarScript())

    // 获取装备角色属性(整数)群组
    this.equipIntAttrGroup = Attribute.getGroup(this.equipIntAttrGroupId) ?? {}

    // 获取装备角色属性(百分比)群组
    this.equipPercentAttrGroup = Attribute.getGroup(this.equipPercentAttrGroupId) ?? {}

    // 获取状态角色属性(整数)群组
    this.stateIntAttrGroup = Attribute.getGroup(this.stateIntAttrGroupId) ?? {}

    // 获取状态角色属性(百分比)群组
    this.statePercentAttrGroup = Attribute.getGroup(this.statePercentAttrGroupId) ?? {}

    // 获取技能角色属性(整数)群组
    this.skillIntAttrGroup = Attribute.getGroup(this.skillIntAttrGroupId) ?? {}

    // 获取技能角色属性(百分比)群组
    this.skillPercentAttrGroup = Attribute.getGroup(this.skillPercentAttrGroupId) ?? {}

    // 获取隐藏的技能快捷键列表
    this.hiddenShortcutKeys = Object.keys(Enum.getGroup(Manager.hiddenShortcutGroupId) ?? {})

    // 获取快捷键词条
    const shortcutGroup = Enum.getGroup(Manager.shortcutGroupId) ?? {}
    this.shortcutEntries = Object.entries(shortcutGroup)

    // 设置物品名称格式映射表
    for (const entry of this.qualityFormats) {
      const i = entry.indexOf('=')
      if (i !== -1) {
        const key = entry.slice(0, i).trim()
        const format = entry.slice(i + 1).trim()
        QualityFormats[key] = format
        // 设置第一个格式为默认值
        if (!DefQualityFormatKey) {
          DefQualityFormatKey = key
          DefQualityFormat = format
        }
      }
    }

    // 设置物品背景颜色映射表
    for (const entry of this.qualityBackgrounds) {
      const i = entry.indexOf('=')
      if (i !== -1) {
        const key = entry.slice(0, i).trim()
        const elId = entry.slice(i + 1).trim()
        QualityBackgrounds[key] = elId
      }
    }

    // 添加关闭按钮脚本
    this.closeButton = UI.get('e00b29645f84cb07')
    this.closeButton.script.add(new CloseButtonScript())

    // 侦听键盘按下事件
    Input.on('keydown', this.onKeyDown, true)
  }

  // 销毁元素事件
  onDestroy() {
    Manager = null
    Drag.end()
    Info.setTarget(null)
    Scene.continue()
    SelectBox.destroy()
    DragItem.destroy()
    this.restoreMainUI()
    this.playCancelSE()
    Input.off('keydown', this.onKeyDown)
  }

  // 键盘按下事件
  onKeyDown() {
    switch (Input.event.code) {
      case 'Escape':
        MainWindow.destroy()
        break
    }
    Input.bubbles.stop()
  }

  // 隐藏主界面
  hideMainUI() {
    const mainUI = UI.get('ad479a00db708bd4')
    if (mainUI?.visible) {
      mainUI.hide()
      this.hiddenMainUI = mainUI
    }
  }

  // 恢复主界面
  restoreMainUI() {
    if (this.hiddenMainUI) {
      this.hiddenMainUI.show()
      this.hiddenMainUI = null
    }
  }

  // 匹配装备类型
  matchEquipType(equip) {
    const type = equip.attributes[this.equipType]
    if (typeof type !== 'string') return true
    const equipTypes = this.actor.attributes[this.actorEquipTypes]
    if (typeof equipTypes !== 'string') return true
    return equipTypes.indexOf(this.equipTypeFormat.replace('type', type)) !== -1
  }

  // 播放光标音效
  playCursorSE() {
    AudioManager.se.play(this.seCursor)
  }

  // 播放确定音效
  playConfirmSE() {
    AudioManager.se.play(this.seConfirm)
  }

  // 播放取消音效
  playCancelSE() {
    AudioManager.se.play(this.seCancel)
  }

  // 播放错误音效
  playErrorSE() {
    AudioManager.se.play(this.seError)
  }

  // 播放装备音效
  playEquipSE() {
    AudioManager.se.play(this.seEquip)
  }
}

// 角色列表元素脚本
class ActorListScript {
  onAdd(element) {
    for (const actor of Party.members) {
      const opacity = actor === Manager.actor ? 1 : 0.5
      const actorCard = UI.createElement('127483ba662c6654')
      actorCard.actor = actor
      actorCard.script.add(new ActorCardScript())
      actorCard.elImage = UI.get('7b4c0c1eed0a71e0')
      actorCard.elImage.setImageClip(actor.portrait, actor.clip)
      actorCard.elImage.set({opacity})
      element.appendChild(actorCard)
    }
  }
}

// 角色卡片元素脚本
class ActorCardScript {
  onAdd(element) {
    this.actor = element.actor
    this.element = element
  }

  update() {
    const opacity = this.actor === Manager.actor ? 1 : 0.5
    if (this.opacity !== opacity) {
      this.opacity = opacity
      this.element.elImage.set({opacity})
    }
  }

  onMouseEnter(element) {
    element.appendChild(SelectBox)
  }

  onMouseLeave() {
    SelectBox.remove()
  }

  onMouseDownLB(element) {
    if (Manager.actor !== element.actor) {
      Manager.playCursorSE()
      Manager.setTargetActor(element.actor)
    }
  }
}

// 状态窗口脚本
class StatusWindowScript {
  onAdd() {
    // 获取相关元素
    this.equipSlotWindow = UI.get('bbdbc2b029f6681b')
    this.actorPortrait = UI.get('c17c64b09b6a1224')
  }

  // 更新
  update() {
    // 如果玩家角色发生变化，刷新属性
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      this.updatePortrait()
      this.updateEquipSlots()
      return
    }
    if (this.equipVersion !== this.actor.equipmentManager.version) {
      this.updateEquipSlots()
    }
  }

  // 更新基本信息
  updatePortrait() {
    if (this.actor) {
      const {portrait, clip} = this.actor
      this.actorPortrait.setImageClip(portrait, clip)
      this.actorPortrait.show()
    } else {
      this.actorPortrait.hide()
    }
  }

  // 更新装备槽
  updateEquipSlots() {
    this.equipSlotWindow.clear()
    const {equipmentManager} = this.actor
    this.equipVersion = equipmentManager.version
    // 如果装备槽是枚举类型，获取所有的值
    const slotEnum = Manager.equipSlot?.enum
    if (slotEnum) {
      const group = Enum.getGroup(slotEnum)
      if (!group) return
      for (const slot of Object.keys(group)) {
        const elSlot = UI.createElement('d10f995a799690de')
        const target = equipmentManager.get(slot) ?? null
        elSlot.manager = equipmentManager
        elSlot.slot = slot
        elSlot.target = target
        elSlot.script.add(new EquipmentSlotScript())
        if (target instanceof Equipment) {
          // 创建装备品质背景元素
          const quality = target.attributes[Manager.equipQuality]
          const id = QualityBackgrounds[quality] ?? '8e647c38822f424b'
          elSlot.elBack = UI.createElement(id)
          elSlot.elIcon = UI.createElement('cac0178da1f1f9d2')
          elSlot.elIcon.setImageClip(target.icon, target.clip)
        } else {
          elSlot.elBack = UI.createElement('8e647c38822f424b')
        }
        elSlot.appendChild(elSlot.elBack)
        elSlot.appendChild(elSlot.elIcon)
        this.equipSlotWindow.appendChild(elSlot)
      }
    }
  }
}

// 装备槽脚本
class EquipmentSlotScript {
  onMouseEnter(element) {
    element.appendChild(SelectBox)
    const {target} = element
    if (target instanceof Equipment) {
      Info.setTarget(target)
    }
  }

  onMouseLeave() {
    SelectBox.remove()
    Info.setTarget(null)
  }

  onMouseDownLB(element) {
    const {target} = element
    if (target instanceof Equipment) {
      Drag.start('slot', target)
    }
  }

  onMouseUpLB(element) {
    if (Drag.activeMode === 'inventory') {
      Drag.activeMode = ''
      if (Drag.target instanceof Equipment) {
        const slotAttr = Manager.equipSlot?.key ?? ''
        const slot = Drag.target.attributes[slotAttr]
        if (slot !== element.slot) return
        Manager.playEquipSE()
        element.manager.set(slot, Drag.target)
        // 立即刷新信息目标对象(临时方案)
        Info.setTarget(null)
      }
    }
  }

  onClick(element) {
    if (Drag.activeMode === 'slot') {
      Drag.activeMode = ''
    } else if (element.target) {
      Manager.playEquipSE()
      element.target.remove()
      // 立即刷新信息目标对象(临时方案)
      Info.setTarget(null)
    }
  }
}

// 包裹窗口脚本
class InventoryWindowScript {
  onAdd(inventoryWindow) {
    // 获取相关元素
    this.inventoryWindow = inventoryWindow
    this.gridWindow = UI.get('dff4d59ee4ebc20b')
    this.moneyText = UI.get('d172ce5a7acac518')
  }

  // 更新
  update() {
    switch (SortButton) {
      case SortAll:
      case SortItem:
      case SortEquip:
        return this.updateInventory()
      case SortSkill:
        return this.updateSkillManager()
    }
  }

  // 更新包裹
  updateInventory() {
    // 如果玩家角色发生变化，刷新包裹物品
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      return this.updateGoods()
    }
    // 如果玩家包裹版本发生变化，刷新包裹物品
    if (this.actor && this.version !== this.actor.inventory.version) {
      return this.updateGoods()
    }
  }

  // 更新包裹物品
  updateGoods() {
    this.gridWindow.clear()
    if (!this.actor) return
    const {inventory, cooldownManager} = this.actor
    this.version = inventory.version
    let count = 0
    let index = 0
    for (const goods of inventory.list) {
      switch (SortButton) {
        case SortAll:
          // 创建空项目
          while (index < goods.order) {
            const elGoods = UI.createElement('0af4b998a8c305f2')
            const elBack = UI.createElement('6b1485f317b61476')
            elGoods.script.add(new GoodsElementScript())
            elGoods.order = index++
            elGoods.appendChild(elBack)
            this.gridWindow.appendChild(elGoods)
          }
          break
        case SortItem:
          if (goods instanceof Item) break
          continue
        case SortEquip:
          if (goods instanceof Equipment) break
          continue
      }
      // 创建项目(物品|装备)
      const elGoods = UI.createElement('0af4b998a8c305f2')
      elGoods.script.add(new GoodsElementScript())
      elGoods.elIcon = UI.createElement('25fd48b2b3273f02')
      elGoods.elIcon.setImageClip(goods.icon, goods.clip)
      // 额外添加物品相关元素
      if (goods instanceof Item) {
        elGoods.script.add(new ItemElementScript())
        // 创建物品品质背景元素
        const quality = goods.attributes[Manager.itemQuality]
        const id = QualityBackgrounds[quality] ?? '6b1485f317b61476'
        elGoods.elBack = UI.createElement(id)
        elGoods.elProgress = UI.createElement('dea2da030a40324e')
        const script = new ItemProgressBarScript(cooldownManager, goods.attributes)
        elGoods.elProgress.script.add(script)
        elGoods.elQuantity = UI.createElement('ece6baf438668acf')
        elGoods.elQuantity.content = goods.quantity
        elGoods.appendChild(elGoods.elBack)
        elGoods.appendChild(elGoods.elIcon)
        elGoods.appendChild(elGoods.elProgress)
        elGoods.appendChild(elGoods.elQuantity)
      } else {
        elGoods.script.add(new EquipmentElementScript())
        // 创建装备品质背景元素
        const quality = goods.attributes[Manager.equipQuality]
        const id = QualityBackgrounds[quality] ?? '6b1485f317b61476'
        elGoods.elBack = UI.createElement(id)
        elGoods.appendChild(elGoods.elBack)
        elGoods.appendChild(elGoods.elIcon)
      }
      elGoods.target = goods
      elGoods.order = index
      this.gridWindow.appendChild(elGoods)
      count++
      index++
    }
    // 创建尾部空项目
    const cols = this.gridWindow.innerColumns
    const rows = this.gridWindow.innerRows
    if (cols === Infinity || rows === Infinity) {
      throw new Error('Grid size cannot be 0')
    }
    const least = count + Manager.leastEmptyGrids
    const max1 = Math.ceil(least / cols) * cols
    const max2 = Math.ceil(index / cols) * cols
    const end = Math.max(max1, max2, cols * rows)
    while (index < end) {
      const elGoods = UI.createElement('0af4b998a8c305f2')
      const elBack = UI.createElement('6b1485f317b61476')
      elGoods.script.add(new GoodsElementScript())
      elGoods.order = index++
      elGoods.appendChild(elBack)
      this.gridWindow.appendChild(elGoods)
    }
    // 设置金币数量
    this.moneyText.content = `${inventory.money}<color:4>G`

    // 手动调用UI.mousemove事件(暂时)
    Callback.push(() => UI.mousemove())
  }

  // 更新技能管理器
  updateSkillManager() {
    // 如果玩家角色发生变化，刷新技能
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      return this.updateSkills()
    }
    // 如果玩家技能版本发生变化，刷新技能
    if (this.actor && this.version !== this.actor.skillManager.version) {
      return this.updateSkills()
    }
  }

  // 更新技能
  updateSkills() {
    this.gridWindow.clear()
    const {actor} = this
    const {skillManager} = actor
    const {shortcutManager} = actor
    if (!actor) return
    this.version = skillManager.version
    let index = 0
    // 获取被隐藏技能的列表
    const hiddenSkills = []
    for (const key of Manager.hiddenShortcutKeys) {
      const skill = shortcutManager.getSkill(key)
      if (skill) hiddenSkills.append(skill)
    }
    const skills = Object.values(skillManager.idMap)
    for (const skill of skills) {
      if (hiddenSkills.includes(skill)) continue
      const elSkill = UI.createElement('0af4b998a8c305f2')
      elSkill.script.add(new SkillElementScript())
      elSkill.elBack = UI.createElement('6b1485f317b61476')
      elSkill.elIcon = UI.createElement('25fd48b2b3273f02')
      elSkill.elIcon.setImageClip(skill.icon, skill.clip)
      elSkill.elProgress = UI.createElement('dea2da030a40324e')
      elSkill.elProgress.script.add(new SkillProgressBarScript(skill))
      elSkill.appendChild(elSkill.elBack)
      elSkill.appendChild(elSkill.elIcon)
      elSkill.appendChild(elSkill.elProgress)
      elSkill.target = skill
      this.gridWindow.appendChild(elSkill)
      index++
    }
    // 创建尾部空项目
    const cols = this.gridWindow.innerColumns
    const rows = this.gridWindow.innerRows
    if (cols === Infinity || rows === Infinity) {
      throw new Error('Grid size cannot be 0')
    }
    const least = index + Manager.leastEmptyGrids
    const max = Math.ceil(least / cols) * cols
    const end = Math.max(max, cols * rows)
    while (index++ < end) {
      const elSkill = UI.createElement('0af4b998a8c305f2')
      const elBack = UI.createElement('6b1485f317b61476')
      elSkill.appendChild(elBack)
      this.gridWindow.appendChild(elSkill)
    }
  }
}

// 包裹整理按钮脚本
class InventorySortButtonScript {
  onClick() {
    Manager.playEquipSE()
    Manager.actor?.inventory.sort(true)
  }
}

// 货物元素脚本
class GoodsElementScript {
  onMouseDownLB(element) {
    if (element.target) {
      Drag.start('inventory', element.target)
    }
  }

  onMouseUpLB(element) {
    if (SortButton !== SortAll) return
    if (Drag.activeMode === 'inventory') {
      const inventory = Drag.target.parent
      const sOrder = Drag.target.order
      const dOrder = element.order
      inventory.swap(sOrder, dOrder)
    }
    if (Drag.activeMode === 'slot') {
      Drag.activeMode = ''
      Drag.target.remove()
      Manager.playEquipSE()
      if (!element.target) {
        const inventory = Drag.target.parent
        const sOrder = Drag.target.order
        const dOrder = element.order
        inventory.swap(sOrder, dOrder)
      }
    }
  }
}

// 物品元素脚本
class ItemElementScript {
  onMouseEnter(element) {
    element.appendChild(SelectBox)
    Info.setTarget(element.target)
  }

  onMouseLeave() {
    SelectBox.remove()
    Info.setTarget(null)
  }

  onClick(element) {
    if (!Drag.activeMode) {
      const item = element.target
      const cdKey = item.attributes[Manager.itemCdKey]
      if (typeof cdKey === 'string') {
        // 如果物品处于正在冷却状态，播放错误音效
        const cdManager = Manager.actor.cooldownManager
        const cdProgress = cdManager.get(cdKey)?.progress
        if (cdProgress > 0) return Manager.playErrorSE()
      }
      Manager.playConfirmSE()
      element.target.use(Manager.actor)
    }
  }
}

// 装备元素脚本
class EquipmentElementScript {
  onMouseEnter(element) {
    element.appendChild(SelectBox)
    Info.setTarget(element.target)
  }

  onMouseLeave() {
    SelectBox.remove()
    Info.setTarget(null)
  }

  onClick(element) {
    if (!Drag.activeMode) {
      const equipment = element.target
      const slotAttr = Manager.equipSlot?.key ?? ''
      const slot = equipment.attributes[slotAttr]
      if (typeof slot === 'string' && Manager.matchEquipType(equipment)) {
        Manager.playEquipSE()
        equipment.equip(slot, Manager.actor)
      } else {
        Manager.playErrorSE()
      }
    }
  }
}

// 技能元素脚本
class SkillElementScript {
  onMouseEnter(element) {
    element.appendChild(SelectBox)
    Info.setTarget(element.target)
  }

  onMouseLeave() {
    SelectBox.remove()
    Info.setTarget(null)
  }

  onMouseDownLB(element) {
    // 开始拖拽主动技能
    if (element.target.events.skillcast) {
      Drag.start('skill', element.target)
    }
  }
}

// 物品进度条脚本
class ItemProgressBarScript {
  constructor(cdManager, attributes) {
    this.cdManager = cdManager
    this.attributes = attributes
  }

  onAdd(progressBar) {
    this.progressBar = progressBar
    this.update()
  }

  update() {
    // 更新物品冷却进度
    const cdKey = this.attributes[Manager.itemCdKey]
    if (typeof cdKey === 'string') {
      const cdProgress = this.cdManager.get(cdKey)?.progress ?? 0
      this.progressBar.progress = cdProgress
    }
  }
}

// 技能进度条脚本
class SkillProgressBarScript {
  constructor(skill) {
    this.skill = skill
  }

  onAdd(progressBar) {
    this.progressBar = progressBar
    this.update()
  }

  update() {
    // 更新技能冷却进度
    this.progressBar.progress = this.skill.progress
  }
}

// 分类按钮脚本
class SortButtonScript {
  onMouseEnter(element) {
    if (SortButton !== element) {
      element.color = 'c0c0c0ff'
    }
  }

  onMouseLeave(element) {
    if (SortButton !== element) {
      element.color = '808080ff'
    }
  }

  onMouseDownLB(element) {
    const lastButton = SortButton
    if (lastButton !== element) {
      Manager.playCursorSE()
      element.color = 'ffffffff'
      SortButton = element
      InventoryWindow.script.InventoryWindowScript.updateGoods()
      lastButton.script.call('onMouseLeave', lastButton)
    }
  }
}

// 保存或读取按钮脚本
class SaveOrLoadButtonScript {
  onMouseEnter(element) {
    element.color = 'c0c0c0ff'
  }

  onMouseLeave(element) {
    element.color = '808080ff'
  }

  onMouseDownLB(element) {
    Manager.playConfirmSE()
    MainWindow.hide()
    SaveWindow = UI.add('54c90b1029d916cf')
    SaveWindow.script.add(new SaveWindowScript())
    SaveWindow.script.call(element === SaveButton ? 'openInSaveMode' : 'openInLoadMode')
  }
}

// 保存窗口脚本
class SaveWindowScript {
  onDestroy() {
    MainWindow.show()
    SaveWindow = null
  }
}

// 退出按钮脚本
class ExitButtonScript {
  onMouseEnter(element) {
    element.color = 'c0c0c0ff'
  }

  onMouseLeave(element) {
    if (!ExitWindow) {
      element.color = '808080ff'
    }
  }

  onMouseDownLB(element) {
    Manager.playConfirmSE()
    element.color = 'ffffffff'
    ExitWindow = UI.add('0774a7ec58192c2f')
    ExitWindow.script.add(new ExitWindowScript())
  }
}

// 退出窗口脚本
class ExitWindowScript {
  onStart(element) {
    this.element = element
    this.maskElement = new ContainerElement()
    this.maskElement.set({width2: 1, height2: 1})
    // 插入遮罩元素到退出窗口的前面(用来阻止指针事件)
    element.parent.insertBefore(this.maskElement, element)
    Input.on('keydown', this.onKeyDown, true)
  }

  onDestroy() {
    ExitButton.color = '808080ff'
    ExitWindow = null
    this.maskElement.destroy()
    Input.off('keydown', this.onKeyDown)
  }

  onKeyDown = () => {
    switch (Input.event.code) {
      case 'Escape':
        Manager.playCancelSE()
        this.element.destroy()
        break
    }
    Input.bubbles.stop()
  }
}

// 快捷栏脚本
class ShortcutBarScript {
  elShortcutBar //:element
  actor         //:object

  onAdd(elShortcutBar) {
    this.elShortcutBar = elShortcutBar
  }

  update() {
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      this.createShortcutIcons()
    }
    // if (this.actor) {
    //   this.updateActorStatus()
    // }
  }

  // 创建快捷图标
  createShortcutIcons() {
    this.elShortcutBar.clear()
    if (!this.actor) return

    // 创建快捷栏项目
    for (const [key, value] of Manager.shortcutEntries) {
      const elItem = UI.createElement('234fae1d0b42a5a2')
      elItem.elIcon = UI.get('34023acd049fa5ec').hide()
      elItem.elKey = UI.get('90ea0ee550aba179')
      elItem.elKey.content = value
      elItem.key = key
      elItem.script.add(new ShortcutItemScript(this.actor, key))
      this.elShortcutBar.appendChild(elItem)
    }
  }
}

// 快捷栏项目脚本
class ShortcutItemScript {
  target  //:object
  key     //:string
  elItem  //:element

  constructor(actor, key) {
    this.target = null
    this.active = true
    this.instance = null
    this.actor = actor
    this.key = key
  }

  // 获取目标实例
  getTargetInstance() {
    return this.actor.shortcutManager.getTarget(this.key) ?? null
  }

  onStart(elItem) {
    this.elItem = elItem
  }

  update() {
    const target = this.actor.shortcutManager.get(this.key) ?? null
    if (this.target !== target) {
      // 更新信息目标对象
      if (Info.target !== null && Info.target === this.instance) {
        Info.setTarget(this.instance = this.getTargetInstance())
      }
      this.target = target
      if (target === null) {
        this.elItem.elIcon.hide()
        return
      }
      if (target.type === 'skill') {
        this.elItem.elIcon.show()
        this.elItem.elIcon.setImageClip(target.icon, target.clip)
        this.update = ShortcutItemScript.prototype.updateSkill
        this.update()
        return
      }
      if (target.type === 'item') {
        this.elItem.elIcon.show()
        this.elItem.elIcon.setImageClip(target.icon, target.clip)
        this.update = ShortcutItemScript.prototype.updateItem
        this.update()
        return
      }
    }
  }

  // 设置激活状态
  setActive(active) {
    if (this.active !== active) {
      this.active = active
      if (active) {
        this.elItem.elIcon.tint[3] = 0
        this.elItem.elIcon.set({opacity: 1})
      } else {
        this.elItem.elIcon.tint[3] = 255
        this.elItem.elIcon.set({opacity: 0.5})
      }
    }
  }

  // 更新技能信息
  updateSkill() {
    if (this.target === this.actor.shortcutManager.get(this.key)) {
      this.setActive(!!this.actor.skillManager.get(this.target.id))
    } else {
      this.update = ShortcutItemScript.prototype.update
      this.update()
    }
  }

  // 更新物品信息
  updateItem() {
    if (this.target === this.actor.shortcutManager.get(this.key)) {
      this.setActive(this.actor.inventory.count(this.target.id) !== 0)
    } else {
      this.update = ShortcutItemScript.prototype.update
      this.update()
    }
  }

  onMouseEnter(element) {
    if (this.target) {
      element.appendChild(SelectBox)
      Info.setTarget(this.instance = this.getTargetInstance())
    }
  }

  onMouseLeave() {
    SelectBox.remove()
    Info.setTarget(this.instance = null)
  }

  onMouseDownLB() {
    Drag.start('shortcut', this.target)
  }

  onMouseUpLB() {
    if (Drag.activeMode === 'inventory') {
      const target = Drag.target
      if (target instanceof Item) {
        Manager.playEquipSE()
        this.actor.shortcutManager.set(this.key, target)
      }
    }
    if (Drag.activeMode === 'skill') {
      const target = Drag.target
      if (target instanceof Skill) {
        Manager.playEquipSE()
        this.actor.shortcutManager.set(this.key, target)
      }
    }
    if (Drag.activeMode === 'shortcut') {
      Drag.activeMode = ''
      if (Drag.target.key !== this.key) {
        Manager.playEquipSE()
        this.actor.shortcutManager.swap(Drag.target.key, this.key)
      }
    }
  }
}

// 状态栏脚本
class StateBarScript {
  elStateBar  //:element
  actor       //:actor
  version     //:number

  onAdd(elStateBar) {
    this.elStateBar = elStateBar
  }

  update() {
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      this.elStateBar.clear()
    }
    if (this.actor) {
      this.updateActorStates()
    }
  }

  // 更新角色状态图标
  updateActorStates() {
    const {stateManager} = this.actor
    // 创建状态图标和状态时间元素
    if (this.version !== stateManager.version) {
      this.version = stateManager.version
      this.elStateBar.clear()
      const cols = this.elStateBar.innerColumns
      const rows = this.elStateBar.innerRows
      if (cols === Infinity || rows === Infinity) {
        throw new Error('Grid size cannot be 0')
      }
      const states = Object.values(stateManager.idMap)
      const number = Math.min(states.length, cols * rows)
      for (let i = 0; i < number; i++) {
        const state = states[i]
        const elState = UI.createElement('d18edb1b40aa3cf9')
        elState.script.add(new StateElementScript())
        elState.target = state
        elState.elIcon = UI.get('acccf94ed764a515')
        elState.elIcon.setImageClip(state.icon, state.clip)
        elState.elTime = UI.get('1d82dacc825f1091')
        this.elStateBar.appendChild(elState)
      }
    }
    // 更新状态剩余时间
    for (const elState of this.elStateBar.children) {
      const {target, elTime} = elState
      let seconds = target.currentTime / 1000
      if (seconds <= 60) {
        // 状态时间 <= 60秒
        seconds = Math.ceil(seconds)
        if (elTime.lastSeconds !== seconds) {
          elTime.lastSeconds = seconds
          elTime.content = seconds + 's'
        }
      } else if (seconds <= 3600) {
        // 状态时间 <= 60分
        const minutes = Math.floor(seconds / 60)
        if (elTime.lastMinutes !== minutes) {
          elTime.lastMinutes = minutes
          elTime.content = minutes + 'm'
        }
      } else {
        // 状态时间 > 1小时
        const hours = Math.floor(seconds / 3600)
        if (elTime.lastHours !== hours) {
          elTime.lastHours = hours
          elTime.content = hours + 'h'
        }
      }
    }
  }
}

// 状态元素脚本
class StateElementScript {
  onMouseEnter(element) {
    element.appendChild(SelectBox)
    Info.setTarget(element.target)
  }

  onMouseLeave(element) {
    SelectBox.remove()
    Info.setTarget(null)
  }
}

// 关闭按钮脚本
class CloseButtonScript {
  onClick() {
    MainWindow.destroy()
  }
}

export default MainScript