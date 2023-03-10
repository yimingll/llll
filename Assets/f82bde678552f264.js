/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@attribute-key actorName
@alias #actorName
@filter actor

@attribute-key itemName
@alias #itemName
@filter item

@attribute-key itemQuality
@alias #itemQuality
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

@attribute-key equipDesc
@alias #equipDesc
@filter equipment

@attribute-key equipPrice
@alias #equipPrice
@filter equipment

@attribute-group equipIntAttrGroupId
@alias #equipIntAttrGroupId

@attribute-group equipPercentAttrGroupId
@alias #equipPercentAttrGroupId

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

@string playerMoneyFormat
@alias #playerMoneyFormat
@default '{money}<color:4>G'

@string cdTimeFormat
@alias #cdTimeFormat
@default 'CD <color:ffffff>{cd}</color> S'

@string possessionFormat
@alias #possessionFormat
@default 'Possession {number}'

@number buyingPriceFactor
@alias #buyingPriceFactor
@default 2

@number sellingPriceFactor
@alias #sellingPriceFactor
@default 1

@string buyingPriceFormat
@alias #buyingPriceFormat
@default 'Buying Price <color:ffffff>{price}<color:4>G'

@string sellingPriceFormat
@alias #sellingPriceFormat
@default 'Selling Price <color:ffffff>{price}<color:4>G'

@string buyingButtonText
@alias #buyingButtonText
@default 'Buy'

@string sellingButtonText
@alias #sellingButtonText
@default 'Sell'

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

@file seTrade
@alias #seTrade
@filter audio

@lang en
#plugin Trading Interface
#actorName Actor Name
#itemName Item Name
#itemQuality Item Quality
#itemCd Item CD
#itemDesc Item Desc
#itemPrice Item Price
#equipName Equip Name
#equipQuality Equip Quality
#equipSlot Equip Slot
#equipDesc Equip Desc
#equipPrice Equip Price
#equipIntAttrGroupId Equip Attrs (Int)
#equipPercentAttrGroupId Equip Attrs (Percentage)
#qualityFormats Quality->Name Map
#qualityBackgrounds Quality->Back Map
#playerMoneyFormat Player Money Format
#cdTimeFormat CD Time Format
#possessionFormat Possession Format
#buyingPriceFactor Buying Price Factor
#sellingPriceFactor Selling Price Factor
#buyingPriceFormat Buying Price Format
#sellingPriceFormat Selling Price Format
#buyingButtonText Buying Button Text
#sellingButtonText Selling Button Text
#leastEmptyGrids Least Empty Grids
#seCursor SE Cursor
#seConfirm SE Confirm
#seCancel SE Cancel
#seError SE Error
#seEquip SE Equip
#seTrade SE Trade

@lang zh
#plugin ????????????
#actorName ????????????
#itemName ????????????
#itemQuality ????????????
#itemCd ??????????????????
#itemDesc ????????????
#itemPrice ????????????
#equipName ????????????
#equipQuality ????????????
#equipSlot ?????????
#equipDesc ????????????
#equipPrice ????????????
#equipIntAttrGroupId ??????????????????(??????)
#equipPercentAttrGroupId ??????????????????(?????????)
#qualityFormats ??????->?????????????????????
#qualityBackgrounds ??????->?????????????????????
#playerMoneyFormat ??????????????????
#cdTimeFormat ??????????????????
#possessionFormat ????????????????????????
#buyingPriceFactor ??????????????????
#sellingPriceFactor ??????????????????
#buyingPriceFormat ??????????????????
#sellingPriceFormat ??????????????????
#buyingButtonText ??????????????????
#sellingButtonText ??????????????????
#leastEmptyGrids ?????????????????????
#seCursor ????????????
#seConfirm ????????????
#seCancel ????????????
#seError ????????????
#seEquip ????????????
#seTrade ????????????
*/

class Manager {}

// ???????????????????????????
const QualityFormats = {}
let DefQualityFormatKey = ''
let DefQualityFormat = '{name}'

// ??????????????????ID?????????
const QualityBackgrounds = {}

let MainWindow
let InventorySortButton
let BuyButton
let SellButton
let ModeButton
let PriceFactor
let PriceFormat
let MoneyText
let CloseButton
let GridWindow
let SelectBox
let DragItem
let InfoWindow
let TradeWindow
let Shopkeeper
let Player

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
  // ??????????????????
  InfoWindow.elPossession.content = ''
  if (item.parent.actor === Shopkeeper) {
    const quantity = Player.inventory.count(item.id)
    if (quantity !== 0) {
      InfoWindow.elPossession.content = Manager.possessionFormat.replace('{number}', quantity)
    }
  }
  // ????????????
  const price = item.attributes[Manager.itemPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = PriceFormat.replace('{price}', price * PriceFactor)
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
  let attrDesc = ''
  for (const [key, value] of Object.entries(equip.attributes)) {
    // ???????????????
    if (key in Manager.equipIntAttrGroup) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : ''
        const name = Manager.equipIntAttrGroup[key]
        attrDesc += `${sign}${value} ${name}\n`
      }
      continue
    }
    // ???????????????
    if (key in Manager.equipPercentAttrGroup) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : ''
        const name = Manager.equipPercentAttrGroup[key]
        attrDesc += `${sign}${Math.round(value * 100)}% ${name}\n`
      }
      continue
    }
  }
  let totalDesc = ''
  if (attrDesc) {
    totalDesc = `<color:00ff00>${attrDesc}</color>`
  }
  // ????????????
  const equipDesc = equip.attributes[Manager.equipDesc]
  if (equipDesc) {
    if (attrDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += equipDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // ??????????????????
  InfoWindow.elPossession.content = ''
  if (equip.parent.actor === Shopkeeper) {
    const quantity = Player.inventory.count(equip.id)
    if (quantity !== 0) {
      InfoWindow.elPossession.content = Manager.possessionFormat.replace('{number}', quantity)
    }
  }
  // ????????????
  const price = equip.attributes[Manager.equipPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = PriceFormat.replace('{price}', price * PriceFactor)
  } else {
    InfoWindow.elPrice.content = ''
  }
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
    Callback.push(() => {
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
    target instanceof Equipment) {
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
  DragItem.resize()
}

// ?????? - ??????????????????
Drag.onMouseUp = function () {
  Drag.end()
}

// ????????????
export default class MainScript {
  setActors(shopkeeper, player) {
    Shopkeeper = shopkeeper
    Player = player
  }

  onStart(element) {
    Manager = this

    // ????????????
    Scene.pause()

    // ???????????????
    this.hideMainUI()

    // ???????????????
    MainWindow = element

    // ??????????????????????????????????????????
    InventorySortButton = UI.get('2db8b973e918cfdc')
    InventorySortButton.script.add(new InventorySortButtonScript())
    BuyButton = UI.get('d548d49c060bcbb4')
    BuyButton.script.add(new BuyOrSellButtonScript())
    SellButton = UI.get('444b22da30343b49')
    SellButton.script.add(new BuyOrSellButtonScript())
    ModeButton = BuyButton

    // ?????????????????????????????????(??????)
    PriceFactor = Manager.buyingPriceFactor
    PriceFormat = Manager.buyingPriceFormat

    // ???????????????????????????????????????
    MoneyText = UI.get('31774b0edf1d5257')
    MoneyText.script.add(new MoneyTextScript())

    // ?????????????????????????????????
    GridWindow = UI.get('d2d5652139edd021')
    GridWindow.script.add(new GridWindowScript())

    // ??????????????????
    InfoWindow = UI.get('b4eeffb026608c6f').hide()
    InfoWindow.pointerEvents = 'disabled'
    InfoWindow.elName = UI.get('db9c9e9271797b19')
    InfoWindow.elType = UI.get('4b5c15c3ccb2f5ed')
    InfoWindow.elDesc = UI.get('e0fc64cef9c945ab')
    InfoWindow.elPossession = UI.get('cbf69247ba42b808')
    InfoWindow.elPrice = UI.get('430b70b4a718023b')

    // ?????????????????????
    SelectBox = UI.createElement('73b0a937c5d716d9')
    SelectBox.pointerEvents = 'disabled'

    // ????????????????????????
    DragItem = UI.createElement('c4aa45f1f9a37b18')
    DragItem.elIcon = UI.get('1027cc5c5e20816d')
    DragItem.pointerEvents = 'disabled'

    // ????????????????????????
    CloseButton = UI.get('1ea5fcd56681b490')
    CloseButton.script.add(new CloseButtonScript())

    // ????????????????????????(??????)??????
    this.equipIntAttrGroup = Attribute.getGroup(this.equipIntAttrGroupId) ?? {}

    // ????????????????????????(?????????)??????
    this.equipPercentAttrGroup = Attribute.getGroup(this.equipPercentAttrGroupId) ?? {}

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

    // ??????????????????
    this.updateShopkeeperInfo()

    // ????????????????????????
    Input.on('keydown', this.onKeyDown, true)
  }

  // ??????????????????
  updateShopkeeperInfo() {
    const elPortrait = UI.get('2f7395520572af85')
    elPortrait.setImageClip(Shopkeeper.portrait, Shopkeeper.clip)
    const elName = UI.get('c583363445142603')
    const name = Shopkeeper.attributes[Manager.actorName]
    elName.content = typeof name === 'string' ? name : ''
  }

  // ??????????????????
  onDestroy() {
    Manager = null
    Scene.continue()
    SelectBox.destroy()
    this.restoreMainUI()
    this.playCancelSE()
    Input.off('keydown', this.onKeyDown)
  }

  // ??????????????????(????????????????????????this)
  onKeyDown = () => {
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

  // ??????????????????
  playTradeSE() {
    AudioManager.se.play(this.seTrade)
  }
}

// ??????????????????
class MoneyTextScript {
  update() {
    // ??????????????????
    if (this.money !== Player.inventory.money) {
      this.money = Player.inventory.money
      MoneyText.content = Manager.playerMoneyFormat.replace('{money}', Player.inventory.money)
    }
  }
}

// ????????????????????????
class InventorySortButtonScript {
  onClick() {
    Manager.playEquipSE()
    Player.inventory.sort(true)
  }
}

// ??????????????????
class GridWindowScript {
  // ??????
  update() {
    let actor
    switch (ModeButton) {
      case BuyButton:
        actor = Shopkeeper
        break
      case SellButton:
        actor = Player
        break
    }
    // ???????????????????????????????????????
    if (this.actor !== actor) {
      this.actor = actor
      return this.updateGoods()
    }
    // ???????????????????????????????????????????????????
    if (this.version !== actor.inventory.version) {
      return this.updateGoods()
    }
  }

  // ????????????
  updateGoods() {
    GridWindow.clear()
    const {inventory} = this.actor
    this.version = inventory.version
    let count = 0
    let index = 0
    for (const goods of inventory.list) {
      // ???????????????
      while (index < goods.order) {
        const elGoods = UI.createElement('4f4b2d2eb48578aa')
        const elBack = UI.createElement('349d059e46fd458d')
        elGoods.script.add(new GoodsElementScript())
        elGoods.order = index++
        elGoods.appendChild(elBack)
        GridWindow.appendChild(elGoods)
      }
      // ????????????(??????|??????)
      const elGoods = UI.createElement('4f4b2d2eb48578aa')
      elGoods.script.add(new GoodsElementScript())
      elGoods.elIcon = UI.createElement('5a0508505b02c68f')
      elGoods.elIcon.setImageClip(goods.icon, goods.clip)
      // ??????????????????
      elGoods.elPrice = UI.get('343531c95760b722')
      let price = goods.attributes[Manager.itemPrice]
      if (typeof price === 'number') {
        price *= PriceFactor
        elGoods.price = price
        elGoods.elPrice.content = elGoods.elPrice.content.replace('{price}', price)
      } else {
        elGoods.elPrice.hide()
      }
      // ??????????????????????????????
      if (goods instanceof Item) {
        const quality = goods.attributes[Manager.itemQuality]
        const id = QualityBackgrounds[quality] ?? '349d059e46fd458d'
        elGoods.elBack = UI.createElement(id)
        elGoods.elQuantity = UI.createElement('2471388ed160ef44')
        elGoods.elQuantity.content = goods.quantity
        elGoods.appendChild(elGoods.elBack)
        elGoods.appendChild(elGoods.elIcon)
        elGoods.appendChild(elGoods.elQuantity)
      } else {
        const quality = goods.attributes[Manager.equipQuality]
        const id = QualityBackgrounds[quality] ?? '349d059e46fd458d'
        elGoods.elBack = UI.createElement(id)
        elGoods.appendChild(elGoods.elBack)
        elGoods.appendChild(elGoods.elIcon)
      }
      elGoods.target = goods
      elGoods.order = index
      GridWindow.appendChild(elGoods)
      count++
      index++
    }
    // ?????????????????????
    const cols = GridWindow.innerColumns
    const rows = GridWindow.innerRows
    if (cols === Infinity || rows === Infinity) {
      throw new Error('Grid size cannot be 0')
    }
    const least = count + Manager.leastEmptyGrids
    const max1 = Math.ceil(least / cols) * cols
    const max2 = Math.ceil(index / cols) * cols
    const end = Math.max(max1, max2, cols * rows)
    while (index < end) {
      const elGoods = UI.createElement('4f4b2d2eb48578aa')
      const elBack = UI.createElement('349d059e46fd458d')
      elGoods.script.add(new GoodsElementScript())
      elGoods.order = index++
      elGoods.appendChild(elBack)
      GridWindow.appendChild(elGoods)
    }

    // ????????????UI.mousemove??????(??????)
    Callback.push(() => UI.mousemove())
  }
}

// ??????????????????
class GoodsElementScript {
  onMouseEnter(element) {
    if (element.target) {
      element.appendChild(SelectBox)
      Info.setTarget(element.target)
    }
  }

  onMouseLeave() {
    if (!TradeWindow) {
      SelectBox.remove()
      Info.setTarget(null)
    }
  }

  onMouseDownLB(element) {
    if (element.target?.parent.actor === Player) {
      Drag.start('inventory', element.target)
    }
  }

  onMouseUpLB(element) {
    if (ModeButton !== SellButton) return
    if (Drag.activeMode === 'inventory') {
      const inventory = Drag.target.parent
      const sOrder = Drag.target.order
      const dOrder = element.order
      inventory.swap(sOrder, dOrder)
    }
  }

  onClick(element) {
    if (Drag.activeMode) return
    if (element.target && typeof element.price === 'number') {
      // ????????????????????????????????????????????????
      Input.event.preventDefault()
      Manager.playConfirmSE()
      TradeWindow = UI.add('0633d09b445f4f79')
      TradeWindow.script.add(new TradeWindowScript(element))
    }
  }
}

// ??????????????????
class TradeWindowScript {
  constructor(element) {
    this.target = element.target
    this.price = element.price
  }

  onStart(element) {
    this.maskElement = new ContainerElement()
    this.maskElement.set({width2: 1, height2: 1})
    // ??????????????????????????????????????????(????????????????????????)
    element.parent.insertBefore(this.maskElement, element)
    // ???????????????????????????
    const target = this.target
    this.elIcon = UI.get('0269a036c124cf46')
    this.elIcon.setImageClip(target.icon, target.clip)
    this.elName = UI.get('e16968443a707834')
    this.elName.content = ''
    this.elPrice = UI.get('267227fad4b4f19f')
    this.elInput = UI.get('66851a1d941089b8')
    this.elInput.script.add(new QuantityInputScript())
    this.decreaseButton = UI.get('7a9d2a21de1ab01a')
    this.decreaseButton.script.add(new DecreaseButtonScript())
    this.increaseButton = UI.get('99f4002eddf41002')
    this.increaseButton.script.add(new IncreaseButtonScript())
    this.confirmButton = UI.get('86caf0f32bbe57f9')
    this.confirmButton.script.add(new ConfirmButtonScript())
    this.confirmText = UI.get('1c8daa7461c21eb9')
    if (ModeButton === BuyButton) {
      this.confirmText.content = Manager.buyingButtonText
    }
    if (ModeButton === SellButton) {
      this.confirmText.content = Manager.sellingButtonText
    }
    this.cancelButton = UI.get('da08c07b545e77e2')
    this.cancelButton.script.add(new CancelButtonScript())
    if (target instanceof Item) {
      const name = target.attributes[Manager.itemName]
      if (typeof name === 'string') {
        const quality = target.attributes[Manager.itemQuality]
        const format = QualityFormats[quality] ?? DefQualityFormat
        const content = format.replace('{name}', name)
        this.elName.content = content
      }
      this.elInput.max = target.quantity
    }
    if (target instanceof Equipment) {
      const name = target.attributes[Manager.equipName]
      if (typeof name === 'string') {
        const quality = target.attributes[Manager.equipQuality]
        const format = QualityFormats[quality] ?? DefQualityFormat
        const content = format.replace('{name}', name)
        this.elName.content = content
      }
    }
    // ????????????????????????
    this.updateTotalPrice()
    // ????????????
    Input.on('keydown', this.onKeyDown, true)
  }

  // ????????????????????????
  calculateTotalPrice() {
    return this.price * this.elInput.number
  }

  // ????????????????????????
  updateTotalPrice() {
    const price = this.calculateTotalPrice()
    this.elPrice.content = PriceFormat.replace('{price}', price)
  }

  onDestroy() {
    TradeWindow = null
    this.maskElement.destroy()
    Input.off('keydown', this.onKeyDown)
    // ????????????hover??????
    UI.mousemove()
    // ???????????????????????????????????????
    if (!SelectBox.parent?.contains(UI.hover)) {
      SelectBox.remove()
      Info.setTarget(null)
    }
  }

  onKeyDown() {
    switch (Input.event.code) {
      case 'Escape':
        Manager.playCancelSE()
        TradeWindow.destroy()
        break
    }
    Input.bubbles.stop()
  }
}

// ??????????????????
class ConfirmButtonScript {
  onClick() {
    // ????????????
    if (ModeButton === BuyButton) {
      const script = TradeWindow.script.TradeWindowScript
      const target = script.target
      const quantity = script.elInput.number
      const totalPrice = script.calculateTotalPrice()
      // ???????????????????????????????????????
      if (Player.inventory.money >= totalPrice) {
        Manager.playTradeSE()
        Player.inventory.decreaseMoney(totalPrice)
        Shopkeeper.inventory.increaseMoney(totalPrice)
        if (target instanceof Item) {
          const id = target.id
          target.decrease(quantity)
          Player.inventory.increaseItems(id, quantity)
        }
        if (target instanceof Equipment) {
          Player.inventory.gainEquipment(target)
        }
        Shopkeeper.inventory.sort()
        TradeWindow.destroy()
      } else {
        Manager.playErrorSE()
      }
    }
    // ????????????
    if (ModeButton === SellButton) {
      const script = TradeWindow.script.TradeWindowScript
      const target = script.target
      const quantity = script.elInput.number
      const totalPrice = script.calculateTotalPrice()
      // ?????????????????????????????????
      Manager.playTradeSE()
      Shopkeeper.inventory.decreaseMoney(totalPrice)
      Player.inventory.increaseMoney(totalPrice)
      if (target instanceof Item) {
        const id = target.id
        target.decrease(quantity)
        Shopkeeper.inventory.increaseItems(id, quantity)
      }
      if (target instanceof Equipment) {
        Shopkeeper.inventory.gainEquipment(target)
      }
      TradeWindow.destroy()
    }
  }
}

// ??????????????????
class CancelButtonScript {
  onClick() {
    Manager.playConfirmSE()
    TradeWindow.destroy()
  }
}

// ?????????????????????
class QuantityInputScript {
  onStart(element) {
    if (Stats.deviceType === 'pc') {
      element.input.select()
    }
  }

  onInput() {
    TradeWindow.script.TradeWindowScript.updateTotalPrice()
  }
}

// ????????????????????????
class DecreaseButtonScript {
  onMouseDownLB() {
    Manager.playCursorSE()
    TradeWindow.script.TradeWindowScript.elInput.fineTuneNumber(-1)
  }
}

// ????????????????????????
class IncreaseButtonScript {
  onMouseDownLB() {
    Manager.playCursorSE()
    TradeWindow.script.TradeWindowScript.elInput.fineTuneNumber(1)
  }
}

// ???????????????????????????
class BuyOrSellButtonScript {
  onMouseEnter(element) {
    if (ModeButton !== element) {
      element.color = 'c0c0c0ff'
    }
  }

  onMouseLeave(element) {
    if (ModeButton !== element) {
      element.color = '808080ff'
    }
  }

  onMouseDownLB(element) {
    const lastButton = ModeButton
    if (lastButton !== element) {
      element.color = 'ffffffff'
      ModeButton = element
      if (ModeButton === BuyButton) {
        PriceFactor = Manager.buyingPriceFactor
        PriceFormat = Manager.buyingPriceFormat
      }
      if (ModeButton === SellButton) {
        PriceFactor = Manager.sellingPriceFactor
        PriceFormat = Manager.sellingPriceFormat
      }
      Manager.playCursorSE()
      GridWindow.script.GridWindowScript.updateGoods()
      lastButton.script.call('onMouseLeave', lastButton)
    }
  }
}

// ??????????????????
class CloseButtonScript {
  onClick() {
    MainWindow.destroy()
  }
}