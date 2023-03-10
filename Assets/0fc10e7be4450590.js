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
#plugin ?????????
#itemName ????????????
#itemQuality ????????????
#itemCdKey ???????????????
#itemCd ??????????????????
#itemDesc ????????????
#itemPrice ????????????
#equipName ????????????
#equipQuality ????????????
#equipSlot ?????????
#equipType ????????????
#equipDesc ????????????
#equipPrice ????????????
#skillName ????????????
#skillCD ??????????????????
#skillDesc ????????????
#stateName ????????????
#stateDesc ????????????
#actorEquipTypes ??????????????????
#equipTypeFormat ??????????????????
#equipIntAttrGroupId ??????????????????(??????)
#equipPercentAttrGroupId ??????????????????(?????????)
#stateIntAttrGroupId ??????????????????(??????)
#statePercentAttrGroupId ??????????????????(?????????)
#skillIntAttrGroupId ??????????????????(??????)
#skillPercentAttrGroupId ??????????????????(?????????)
#qualityFormats ??????->?????????????????????
#qualityBackgrounds ??????->?????????????????????
#equipAttrFormat ????????????????????????
#attrIncreaseColor ??????????????????
#attrDecreaseColor ??????????????????
#passiveSkill ??????????????????
#hiddenShortcutGroupId ????????????????????????
#shortcutGroupId ?????????????????????
#cdTimeFormat ??????????????????
#stateTimeFormatLabel ??????????????????(??????)
#stateTimeFormatHour ??????????????????(??????)
#stateTimeFormatMinute ??????????????????(???)
#stateTimeFormatSecond ??????????????????(???)
#leastEmptyGrids ?????????????????????
#seCursor ????????????
#seConfirm ????????????
#seCancel ????????????
#seError ????????????
#seEquip ????????????

*/

// ??????????????????
class Manager {}

// ???????????????????????????
const QualityFormats = {}
let DefQualityFormatKey = ''
let DefQualityFormat = '{name}'

// ??????????????????ID?????????
const QualityBackgrounds = {}

// ????????????
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

// ???????????????
const Info = {
  target: null,
}

// ???????????????????????????
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

// ??????????????????
Info.parseIntAttr = function (name, value) {
  const sign = value > 0 ? '+' : ''
  const change = sign + value
  const color = `<color:${value > 0 ? Manager.attrIncreaseColor : Manager.attrDecreaseColor}>`
  return color + Manager.equipAttrFormat.replace('{attr-name}', name).replace('{attr-value}', change) + '</color>\n'
}

// ?????????????????????
Info.parsePercentAttr = function (name, value) {
  const sign = value > 0 ? '+' : ''
  const change = sign + Math.round(value * 100) + '%'
  const color = `<color:${value > 0 ? Manager.attrIncreaseColor : Manager.attrDecreaseColor}>`
  return color + Manager.equipAttrFormat.replace('{attr-name}', name).replace('{attr-value}', change) + '</color>\n'
}

// ??????????????????
Info.updateItemInfo = function (item) {
  // ????????????
  const name = item.attributes[Manager.itemName]
  if (typeof name === 'string') {
    const quality = item.attributes[Manager.itemQuality]
    const format = QualityFormats[quality] ?? DefQualityFormat
    const content = format.replace('{name}', name)
    InfoWindow.elName.content = content
  } else {
    InfoWindow.elName.content = ''
  }
  // ??????????????????
  const cdTime = item.attributes[Manager.itemCd]
  if (typeof cdTime === 'number') {
    InfoWindow.elType.content = Manager.cdTimeFormat.replace('{cd}', cdTime / 1000)
  } else {
    InfoWindow.elType.content = ''
  }
  // ????????????
  const desc = item.attributes[Manager.itemDesc]
  if (typeof desc === 'string') {
    InfoWindow.elDesc.content = desc
  } else {
    InfoWindow.elDesc.content = ''
  }
  // ????????????
  const price = item.attributes[Manager.itemPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = InfoWindow.elPrice.format.replace('{price}', price)
  } else {
    InfoWindow.elPrice.content = ''
  }
}

// ??????????????????
Info.updateEquipInfo = function (equip) {
  // ????????????
  const name = equip.attributes[Manager.equipName]
  if (typeof name === 'string') {
    const quality = equip.attributes[Manager.equipQuality]
    const format = QualityFormats[quality] ?? DefQualityFormat
    const content = format.replace('{name}', name)
    InfoWindow.elName.content = content
  } else {
    InfoWindow.elName.content = ''
  }
  // ????????????
  const slot = equip.attributes[Manager.equipSlot?.key]
  if (typeof slot === 'string') {
    const enumGroup = Enum.getGroup(Manager.equipSlot.enum)
    InfoWindow.elType.content = enumGroup[slot]
  } else {
    InfoWindow.elType.content = ''
  }
  // ????????????????????????
  let totalDesc = ''
  for (const [key, value] of Object.entries(equip.attributes)) {
    // ???????????????
    if (key in Manager.equipIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.equipIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // ???????????????
    if (key in Manager.equipPercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.equipPercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // ????????????
  const equipDesc = equip.attributes[Manager.equipDesc]
  if (equipDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += equipDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // ????????????
  const price = equip.attributes[Manager.equipPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = InfoWindow.elPrice.format.replace('{price}', price)
  } else {
    InfoWindow.elPrice.content = ''
  }
}

// ??????????????????
Info.updateSkillInfo = function (skill) {
  // ????????????
  const name = skill.attributes[Manager.skillName]
  if (typeof name === 'string') {
    InfoWindow.elName.content = name
  } else {
    InfoWindow.elName.content = ''
  }
  if (skill.events.skillcast) {
    // ?????????????????????????????????
    const cdTime = skill.attributes[Manager.skillCD]
    if (typeof cdTime === 'number') {
      InfoWindow.elType.content = Manager.cdTimeFormat.replace('{cd}', cdTime / 1000)
    } else {
      InfoWindow.elType.content = ''
    }
  } else {
    // ???????????????????????????
    InfoWindow.elType.content = Manager.passiveSkill
  }
  // ????????????????????????
  let totalDesc = ''
  for (const [key, value] of Object.entries(skill.attributes)) {
    // ???????????????
    if (key in Manager.skillIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.skillIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // ???????????????
    if (key in Manager.skillPercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.skillPercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // ????????????
  const skillDesc = skill.attributes[Manager.skillDesc]
  if (skillDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += skillDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // ????????????(??????)
  InfoWindow.elPrice.content = ''
}

// ??????????????????
Info.updateStateInfo = function (state) {
  // ????????????
  const name = state.attributes[Manager.stateName]
  if (typeof name === 'string') {
    InfoWindow.elName.content = name
  } else {
    InfoWindow.elName.content = ''
  }
  // ??????????????????
  let stateTime = Manager.stateTimeFormatLabel
  let seconds = state.currentTime / 1000
  if (seconds >= 3600) {
    // ??????
    const hours = Math.floor(seconds / 3600)
    stateTime += Manager.stateTimeFormatHour.replace('{h}', hours)
    seconds %= 3600
  }
  if (seconds >= 60) {
    // ???
    const minutes = Math.floor(seconds / 60)
    stateTime += Manager.stateTimeFormatMinute.replace('{m}', minutes)
    seconds %= 60
  }
  if (seconds > 0) {
    // ???
    seconds = Math.ceil(seconds)
    stateTime += Manager.stateTimeFormatSecond.replace('{s}', seconds)
  }
  InfoWindow.elType.content = stateTime
  // ????????????????????????
  let totalDesc = ''
  for (const [key, value] of Object.entries(state.attributes)) {
    // ???????????????
    if (key in Manager.stateIntAttrGroup) {
      if (value !== 0) {
        const name = Manager.stateIntAttrGroup[key]
        totalDesc += Info.parseIntAttr(name, value)
      }
      continue
    }
    // ???????????????
    if (key in Manager.statePercentAttrGroup) {
      if (value !== 0) {
        const name = Manager.statePercentAttrGroup[key]
        totalDesc += Info.parsePercentAttr(name, value)
      }
      continue
    }
  }
  // ????????????
  const stateDesc = state.attributes[Manager.stateDesc]
  if (stateDesc) {
    if (totalDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += stateDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // ????????????(??????)
  InfoWindow.elPrice.content = ''
}

// ???????????????
const Drag = {
  mode: '',
  target: null,
  activeMode: '',
  mousedownX: 0,
  mousedownY: 0,
}

// ????????????
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

// ????????????
Drag.end = function () {
  if (this.mode) {
    this.mode = ''
    const actor = Manager.actor
    Callback.push(() => {
      switch (this.activeMode) {
        case 'slot':
          // ?????????????????????
          Manager.playEquipSE()
          this.target.remove()
          break
        case 'shortcut':
          // ?????????????????????
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

// ??????????????????
Drag.updateIcon = function (target) {
  if (target instanceof Item ||
    target instanceof Equipment ||
    target instanceof Skill ||
    target instanceof Shortcut) {
    DragItem.elIcon.setImageClip(target.icon, target.clip)
  }
}

// ?????? - ??????????????????
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

// ?????? - ??????????????????
Drag.onMouseUp = function () {
  Drag.end()
}

// ????????????
class MainScript {
  constructor() {
    Manager = this
    Manager.info = Info
  }

  // ??????????????????
  setTargetActor(actor) {
    this.actor = actor
  }

  onStart(element) {
    // ????????????
    Scene.pause()

    // ???????????????
    this.hideMainUI()

    // ??????????????????
    this.setTargetActor(Party.player)

    // ?????????????????????????????????
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

    // ????????????????????????????????????
    SortAll = UI.get('dc59a0e8f165dd55')
    SortAll.script.add(new SortButtonScript())
    SortItem = UI.get('de4ed5e6b844a92e')
    SortItem.script.add(new SortButtonScript())
    SortEquip = UI.get('c856d92b6da260bd')
    SortEquip.script.add(new SortButtonScript())
    SortSkill = UI.get('f0c0f9cb7449d82f')
    SortSkill.script.add(new SortButtonScript())
    SortButton = SortAll

    // ?????????????????????????????????
    SaveButton = UI.get('fcca5230a8a409ce')
    SaveButton.script.add(new SaveOrLoadButtonScript())

    // ?????????????????????????????????
    LoadButton = UI.get('7214e44cfa8d3040')
    LoadButton.script.add(new SaveOrLoadButtonScript())

    // ?????????????????????????????????
    ExitButton = UI.get('fb860ce669eb96d1')
    ExitButton.script.add(new ExitButtonScript())

    // ??????????????????
    InfoWindow = UI.get('2f4017f49bfbeeca').hide()
    InfoWindow.pointerEvents = 'disabled'
    InfoWindow.elName = UI.get('ec899d622afbbc92')
    InfoWindow.elType = UI.get('ac1bcdc5334dea96')
    InfoWindow.elDesc = UI.get('08ecb52f6d0fb2ad')
    InfoWindow.elPrice = UI.get('ab87c20f697555c8')
    InfoWindow.elPrice.format = InfoWindow.elPrice.content

    // ?????????????????????
    SelectBox = UI.createElement('1af9aa7372fa7185')
    SelectBox.pointerEvents = 'disabled'

    // ????????????????????????
    DragItem = UI.createElement('c4aa45f1f9a37b18')
    DragItem.elIcon = UI.get('1027cc5c5e20816d')
    DragItem.pointerEvents = 'disabled'

    // ??????????????????????????????
    this.shortcutBar = UI.get('7fd5792b9fb97257')
    this.shortcutBar.script.add(new ShortcutBarScript())

    // ??????????????????????????????
    this.stateBar = UI.get('fafa8f78f15d33df')
    this.stateBar.script.add(new StateBarScript())

    // ????????????????????????(??????)??????
    this.equipIntAttrGroup = Attribute.getGroup(this.equipIntAttrGroupId) ?? {}

    // ????????????????????????(?????????)??????
    this.equipPercentAttrGroup = Attribute.getGroup(this.equipPercentAttrGroupId) ?? {}

    // ????????????????????????(??????)??????
    this.stateIntAttrGroup = Attribute.getGroup(this.stateIntAttrGroupId) ?? {}

    // ????????????????????????(?????????)??????
    this.statePercentAttrGroup = Attribute.getGroup(this.statePercentAttrGroupId) ?? {}

    // ????????????????????????(??????)??????
    this.skillIntAttrGroup = Attribute.getGroup(this.skillIntAttrGroupId) ?? {}

    // ????????????????????????(?????????)??????
    this.skillPercentAttrGroup = Attribute.getGroup(this.skillPercentAttrGroupId) ?? {}

    // ????????????????????????????????????
    this.hiddenShortcutKeys = Object.keys(Enum.getGroup(Manager.hiddenShortcutGroupId) ?? {})

    // ?????????????????????
    const shortcutGroup = Enum.getGroup(Manager.shortcutGroupId) ?? {}
    this.shortcutEntries = Object.entries(shortcutGroup)

    // ?????????????????????????????????
    for (const entry of this.qualityFormats) {
      const i = entry.indexOf('=')
      if (i !== -1) {
        const key = entry.slice(0, i).trim()
        const format = entry.slice(i + 1).trim()
        QualityFormats[key] = format
        // ?????????????????????????????????
        if (!DefQualityFormatKey) {
          DefQualityFormatKey = key
          DefQualityFormat = format
        }
      }
    }

    // ?????????????????????????????????
    for (const entry of this.qualityBackgrounds) {
      const i = entry.indexOf('=')
      if (i !== -1) {
        const key = entry.slice(0, i).trim()
        const elId = entry.slice(i + 1).trim()
        QualityBackgrounds[key] = elId
      }
    }

    // ????????????????????????
    this.closeButton = UI.get('e00b29645f84cb07')
    this.closeButton.script.add(new CloseButtonScript())

    // ????????????????????????
    Input.on('keydown', this.onKeyDown, true)
  }

  // ??????????????????
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

  // ??????????????????
  onKeyDown() {
    switch (Input.event.code) {
      case 'Escape':
        MainWindow.destroy()
        break
    }
    Input.bubbles.stop()
  }

  // ???????????????
  hideMainUI() {
    const mainUI = UI.get('ad479a00db708bd4')
    if (mainUI?.visible) {
      mainUI.hide()
      this.hiddenMainUI = mainUI
    }
  }

  // ???????????????
  restoreMainUI() {
    if (this.hiddenMainUI) {
      this.hiddenMainUI.show()
      this.hiddenMainUI = null
    }
  }

  // ??????????????????
  matchEquipType(equip) {
    const type = equip.attributes[this.equipType]
    if (typeof type !== 'string') return true
    const equipTypes = this.actor.attributes[this.actorEquipTypes]
    if (typeof equipTypes !== 'string') return true
    return equipTypes.indexOf(this.equipTypeFormat.replace('type', type)) !== -1
  }

  // ??????????????????
  playCursorSE() {
    AudioManager.se.play(this.seCursor)
  }

  // ??????????????????
  playConfirmSE() {
    AudioManager.se.play(this.seConfirm)
  }

  // ??????????????????
  playCancelSE() {
    AudioManager.se.play(this.seCancel)
  }

  // ??????????????????
  playErrorSE() {
    AudioManager.se.play(this.seError)
  }

  // ??????????????????
  playEquipSE() {
    AudioManager.se.play(this.seEquip)
  }
}

// ????????????????????????
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

// ????????????????????????
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

// ??????????????????
class StatusWindowScript {
  onAdd() {
    // ??????????????????
    this.equipSlotWindow = UI.get('bbdbc2b029f6681b')
    this.actorPortrait = UI.get('c17c64b09b6a1224')
  }

  // ??????
  update() {
    // ?????????????????????????????????????????????
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

  // ??????????????????
  updatePortrait() {
    if (this.actor) {
      const {portrait, clip} = this.actor
      this.actorPortrait.setImageClip(portrait, clip)
      this.actorPortrait.show()
    } else {
      this.actorPortrait.hide()
    }
  }

  // ???????????????
  updateEquipSlots() {
    this.equipSlotWindow.clear()
    const {equipmentManager} = this.actor
    this.equipVersion = equipmentManager.version
    // ???????????????????????????????????????????????????
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
          // ??????????????????????????????
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

// ???????????????
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
        // ??????????????????????????????(????????????)
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
      // ??????????????????????????????(????????????)
      Info.setTarget(null)
    }
  }
}

// ??????????????????
class InventoryWindowScript {
  onAdd(inventoryWindow) {
    // ??????????????????
    this.inventoryWindow = inventoryWindow
    this.gridWindow = UI.get('dff4d59ee4ebc20b')
    this.moneyText = UI.get('d172ce5a7acac518')
  }

  // ??????
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

  // ????????????
  updateInventory() {
    // ???????????????????????????????????????????????????
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      return this.updateGoods()
    }
    // ?????????????????????????????????????????????????????????
    if (this.actor && this.version !== this.actor.inventory.version) {
      return this.updateGoods()
    }
  }

  // ??????????????????
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
          // ???????????????
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
      // ????????????(??????|??????)
      const elGoods = UI.createElement('0af4b998a8c305f2')
      elGoods.script.add(new GoodsElementScript())
      elGoods.elIcon = UI.createElement('25fd48b2b3273f02')
      elGoods.elIcon.setImageClip(goods.icon, goods.clip)
      // ??????????????????????????????
      if (goods instanceof Item) {
        elGoods.script.add(new ItemElementScript())
        // ??????????????????????????????
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
        // ??????????????????????????????
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
    // ?????????????????????
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
    // ??????????????????
    this.moneyText.content = `${inventory.money}<color:4>G`

    // ????????????UI.mousemove??????(??????)
    Callback.push(() => UI.mousemove())
  }

  // ?????????????????????
  updateSkillManager() {
    // ?????????????????????????????????????????????
    if (this.actor !== Manager.actor) {
      this.actor = Manager.actor
      return this.updateSkills()
    }
    // ???????????????????????????????????????????????????
    if (this.actor && this.version !== this.actor.skillManager.version) {
      return this.updateSkills()
    }
  }

  // ????????????
  updateSkills() {
    this.gridWindow.clear()
    const {actor} = this
    const {skillManager} = actor
    const {shortcutManager} = actor
    if (!actor) return
    this.version = skillManager.version
    let index = 0
    // ??????????????????????????????
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
    // ?????????????????????
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

// ????????????????????????
class InventorySortButtonScript {
  onClick() {
    Manager.playEquipSE()
    Manager.actor?.inventory.sort(true)
  }
}

// ??????????????????
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

// ??????????????????
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
        // ?????????????????????????????????????????????????????????
        const cdManager = Manager.actor.cooldownManager
        const cdProgress = cdManager.get(cdKey)?.progress
        if (cdProgress > 0) return Manager.playErrorSE()
      }
      Manager.playConfirmSE()
      element.target.use(Manager.actor)
    }
  }
}

// ??????????????????
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

// ??????????????????
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
    // ????????????????????????
    if (element.target.events.skillcast) {
      Drag.start('skill', element.target)
    }
  }
}

// ?????????????????????
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
    // ????????????????????????
    const cdKey = this.attributes[Manager.itemCdKey]
    if (typeof cdKey === 'string') {
      const cdProgress = this.cdManager.get(cdKey)?.progress ?? 0
      this.progressBar.progress = cdProgress
    }
  }
}

// ?????????????????????
class SkillProgressBarScript {
  constructor(skill) {
    this.skill = skill
  }

  onAdd(progressBar) {
    this.progressBar = progressBar
    this.update()
  }

  update() {
    // ????????????????????????
    this.progressBar.progress = this.skill.progress
  }
}

// ??????????????????
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

// ???????????????????????????
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

// ??????????????????
class SaveWindowScript {
  onDestroy() {
    MainWindow.show()
    SaveWindow = null
  }
}

// ??????????????????
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

// ??????????????????
class ExitWindowScript {
  onStart(element) {
    this.element = element
    this.maskElement = new ContainerElement()
    this.maskElement.set({width2: 1, height2: 1})
    // ??????????????????????????????????????????(????????????????????????)
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

// ???????????????
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

  // ??????????????????
  createShortcutIcons() {
    this.elShortcutBar.clear()
    if (!this.actor) return

    // ?????????????????????
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

// ?????????????????????
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

  // ??????????????????
  getTargetInstance() {
    return this.actor.shortcutManager.getTarget(this.key) ?? null
  }

  onStart(elItem) {
    this.elItem = elItem
  }

  update() {
    const target = this.actor.shortcutManager.get(this.key) ?? null
    if (this.target !== target) {
      // ????????????????????????
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

  // ??????????????????
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

  // ??????????????????
  updateSkill() {
    if (this.target === this.actor.shortcutManager.get(this.key)) {
      this.setActive(!!this.actor.skillManager.get(this.target.id))
    } else {
      this.update = ShortcutItemScript.prototype.update
      this.update()
    }
  }

  // ??????????????????
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

// ???????????????
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

  // ????????????????????????
  updateActorStates() {
    const {stateManager} = this.actor
    // ???????????????????????????????????????
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
    // ????????????????????????
    for (const elState of this.elStateBar.children) {
      const {target, elTime} = elState
      let seconds = target.currentTime / 1000
      if (seconds <= 60) {
        // ???????????? <= 60???
        seconds = Math.ceil(seconds)
        if (elTime.lastSeconds !== seconds) {
          elTime.lastSeconds = seconds
          elTime.content = seconds + 's'
        }
      } else if (seconds <= 3600) {
        // ???????????? <= 60???
        const minutes = Math.floor(seconds / 60)
        if (elTime.lastMinutes !== minutes) {
          elTime.lastMinutes = minutes
          elTime.content = minutes + 'm'
        }
      } else {
        // ???????????? > 1??????
        const hours = Math.floor(seconds / 3600)
        if (elTime.lastHours !== hours) {
          elTime.lastHours = hours
          elTime.content = hours + 'h'
        }
      }
    }
  }
}

// ??????????????????
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

// ??????????????????
class CloseButtonScript {
  onClick() {
    MainWindow.destroy()
  }
}

export default MainScript