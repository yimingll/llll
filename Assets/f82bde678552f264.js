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
#plugin 交易界面
#actorName 角色名称
#itemName 物品名称
#itemQuality 物品品质
#itemCd 物品冷却时间
#itemDesc 物品描述
#itemPrice 物品价格
#equipName 装备名称
#equipQuality 装备品质
#equipSlot 装备槽
#equipDesc 装备描述
#equipPrice 装备价格
#equipIntAttrGroupId 装备角色属性(整数)
#equipPercentAttrGroupId 装备角色属性(百分比)
#qualityFormats 品质->名称格式映射表
#qualityBackgrounds 品质->背景元素映射表
#playerMoneyFormat 玩家金币格式
#cdTimeFormat 冷却时间格式
#possessionFormat 货物持有数量格式
#buyingPriceFactor 购买价格系数
#sellingPriceFactor 出售价格系数
#buyingPriceFormat 购买价格格式
#sellingPriceFormat 出售价格格式
#buyingButtonText 购买按钮文本
#sellingButtonText 出售按钮文本
#leastEmptyGrids 最少空栏位数量
#seCursor 光标音效
#seConfirm 确定音效
#seCancel 取消音效
#seError 错误音效
#seEquip 装备音效
#seTrade 交易音效
*/

class Manager {}

// 品质名称格式映射表
const QualityFormats = {}
let DefQualityFormatKey = ''
let DefQualityFormat = '{name}'

// 品质背景元素ID映射表
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
  // 物品持有数量
  InfoWindow.elPossession.content = ''
  if (item.parent.actor === Shopkeeper) {
    const quantity = Player.inventory.count(item.id)
    if (quantity !== 0) {
      InfoWindow.elPossession.content = Manager.possessionFormat.replace('{number}', quantity)
    }
  }
  // 物品价格
  const price = item.attributes[Manager.itemPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = PriceFormat.replace('{price}', price * PriceFactor)
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
  let attrDesc = ''
  for (const [key, value] of Object.entries(equip.attributes)) {
    // 整数型属性
    if (key in Manager.equipIntAttrGroup) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : ''
        const name = Manager.equipIntAttrGroup[key]
        attrDesc += `${sign}${value} ${name}\n`
      }
      continue
    }
    // 百分比属性
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
  // 装备描述
  const equipDesc = equip.attributes[Manager.equipDesc]
  if (equipDesc) {
    if (attrDesc) {
      totalDesc += '<y:add,24>'
    }
    totalDesc += equipDesc
  }
  InfoWindow.elDesc.content = totalDesc
  // 装备持有数量
  InfoWindow.elPossession.content = ''
  if (equip.parent.actor === Shopkeeper) {
    const quantity = Player.inventory.count(equip.id)
    if (quantity !== 0) {
      InfoWindow.elPossession.content = Manager.possessionFormat.replace('{number}', quantity)
    }
  }
  // 装备价格
  const price = equip.attributes[Manager.equipPrice]
  if (typeof price === 'number') {
    InfoWindow.elPrice.content = PriceFormat.replace('{price}', price * PriceFactor)
  } else {
    InfoWindow.elPrice.content = ''
  }
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
    Callback.push(() => {
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
    target instanceof Equipment) {
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
  DragItem.resize()
}

// 拖拽 - 鼠标弹起事件
Drag.onMouseUp = function () {
  Drag.end()
}

// 主要脚本
export default class MainScript {
  setActors(shopkeeper, player) {
    Shopkeeper = shopkeeper
    Player = player
  }

  onStart(element) {
    Manager = this

    // 暂停场景
    Scene.pause()

    // 隐藏主界面
    this.hideMainUI()

    // 获取主窗口
    MainWindow = element

    // 获取购买和出售按钮，添加脚本
    InventorySortButton = UI.get('2db8b973e918cfdc')
    InventorySortButton.script.add(new InventorySortButtonScript())
    BuyButton = UI.get('d548d49c060bcbb4')
    BuyButton.script.add(new BuyOrSellButtonScript())
    SellButton = UI.get('444b22da30343b49')
    SellButton.script.add(new BuyOrSellButtonScript())
    ModeButton = BuyButton

    // 设置初始价格系数和格式(购买)
    PriceFactor = Manager.buyingPriceFactor
    PriceFormat = Manager.buyingPriceFormat

    // 获取金钱文本元素，添加脚本
    MoneyText = UI.get('31774b0edf1d5257')
    MoneyText.script.add(new MoneyTextScript())

    // 获取网格窗口，添加脚本
    GridWindow = UI.get('d2d5652139edd021')
    GridWindow.script.add(new GridWindowScript())

    // 获取信息窗口
    InfoWindow = UI.get('b4eeffb026608c6f').hide()
    InfoWindow.pointerEvents = 'disabled'
    InfoWindow.elName = UI.get('db9c9e9271797b19')
    InfoWindow.elType = UI.get('4b5c15c3ccb2f5ed')
    InfoWindow.elDesc = UI.get('e0fc64cef9c945ab')
    InfoWindow.elPossession = UI.get('cbf69247ba42b808')
    InfoWindow.elPrice = UI.get('430b70b4a718023b')

    // 创建选择框元素
    SelectBox = UI.createElement('73b0a937c5d716d9')
    SelectBox.pointerEvents = 'disabled'

    // 创建拖拽项目元素
    DragItem = UI.createElement('c4aa45f1f9a37b18')
    DragItem.elIcon = UI.get('1027cc5c5e20816d')
    DragItem.pointerEvents = 'disabled'

    // 添加关闭按钮脚本
    CloseButton = UI.get('1ea5fcd56681b490')
    CloseButton.script.add(new CloseButtonScript())

    // 获取装备角色属性(整数)群组
    this.equipIntAttrGroup = Attribute.getGroup(this.equipIntAttrGroupId) ?? {}

    // 获取装备角色属性(百分比)群组
    this.equipPercentAttrGroup = Attribute.getGroup(this.equipPercentAttrGroupId) ?? {}

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

    // 更新店主信息
    this.updateShopkeeperInfo()

    // 侦听键盘按下事件
    Input.on('keydown', this.onKeyDown, true)
  }

  // 更新店主信息
  updateShopkeeperInfo() {
    const elPortrait = UI.get('2f7395520572af85')
    elPortrait.setImageClip(Shopkeeper.portrait, Shopkeeper.clip)
    const elName = UI.get('c583363445142603')
    const name = Shopkeeper.attributes[Manager.actorName]
    elName.content = typeof name === 'string' ? name : ''
  }

  // 销毁元素事件
  onDestroy() {
    Manager = null
    Scene.continue()
    SelectBox.destroy()
    this.restoreMainUI()
    this.playCancelSE()
    Input.off('keydown', this.onKeyDown)
  }

  // 键盘按下事件(使用箭头函数绑定this)
  onKeyDown = () => {
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

  // 播放交易音效
  playTradeSE() {
    AudioManager.se.play(this.seTrade)
  }
}

// 金钱文本脚本
class MoneyTextScript {
  update() {
    // 设置金币数量
    if (this.money !== Player.inventory.money) {
      this.money = Player.inventory.money
      MoneyText.content = Manager.playerMoneyFormat.replace('{money}', Player.inventory.money)
    }
  }
}

// 包裹整理按钮脚本
class InventorySortButtonScript {
  onClick() {
    Manager.playEquipSE()
    Player.inventory.sort(true)
  }
}

// 网格窗口脚本
class GridWindowScript {
  // 更新
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
    // 如果角色发生变化，刷新货物
    if (this.actor !== actor) {
      this.actor = actor
      return this.updateGoods()
    }
    // 如果角色包裹版本发生变化，刷新货物
    if (this.version !== actor.inventory.version) {
      return this.updateGoods()
    }
  }

  // 更新货物
  updateGoods() {
    GridWindow.clear()
    const {inventory} = this.actor
    this.version = inventory.version
    let count = 0
    let index = 0
    for (const goods of inventory.list) {
      // 创建空项目
      while (index < goods.order) {
        const elGoods = UI.createElement('4f4b2d2eb48578aa')
        const elBack = UI.createElement('349d059e46fd458d')
        elGoods.script.add(new GoodsElementScript())
        elGoods.order = index++
        elGoods.appendChild(elBack)
        GridWindow.appendChild(elGoods)
      }
      // 创建项目(物品|装备)
      const elGoods = UI.createElement('4f4b2d2eb48578aa')
      elGoods.script.add(new GoodsElementScript())
      elGoods.elIcon = UI.createElement('5a0508505b02c68f')
      elGoods.elIcon.setImageClip(goods.icon, goods.clip)
      // 设置货物价格
      elGoods.elPrice = UI.get('343531c95760b722')
      let price = goods.attributes[Manager.itemPrice]
      if (typeof price === 'number') {
        price *= PriceFactor
        elGoods.price = price
        elGoods.elPrice.content = elGoods.elPrice.content.replace('{price}', price)
      } else {
        elGoods.elPrice.hide()
      }
      // 额外添加物品相关元素
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
    // 创建尾部空项目
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

    // 手动调用UI.mousemove事件(暂时)
    Callback.push(() => UI.mousemove())
  }
}

// 货物元素脚本
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
      // 阻止输入框全选后被鼠标拖拽而取消
      Input.event.preventDefault()
      Manager.playConfirmSE()
      TradeWindow = UI.add('0633d09b445f4f79')
      TradeWindow.script.add(new TradeWindowScript(element))
    }
  }
}

// 交易窗口脚本
class TradeWindowScript {
  constructor(element) {
    this.target = element.target
    this.price = element.price
  }

  onStart(element) {
    this.maskElement = new ContainerElement()
    this.maskElement.set({width2: 1, height2: 1})
    // 插入遮罩元素到交易窗口的前面(用来阻止指针事件)
    element.parent.insertBefore(this.maskElement, element)
    // 设置相关元素的参数
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
    // 更新货物的总价格
    this.updateTotalPrice()
    // 侦听事件
    Input.on('keydown', this.onKeyDown, true)
  }

  // 计算货物的总价格
  calculateTotalPrice() {
    return this.price * this.elInput.number
  }

  // 更新货物的总价格
  updateTotalPrice() {
    const price = this.calculateTotalPrice()
    this.elPrice.content = PriceFormat.replace('{price}', price)
  }

  onDestroy() {
    TradeWindow = null
    this.maskElement.destroy()
    Input.off('keydown', this.onKeyDown)
    // 手动刷新hover元素
    UI.mousemove()
    // 如果鼠标未停留在选择框位置
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

// 确认按钮脚本
class ConfirmButtonScript {
  onClick() {
    // 购买模式
    if (ModeButton === BuyButton) {
      const script = TradeWindow.script.TradeWindowScript
      const target = script.target
      const quantity = script.elInput.number
      const totalPrice = script.calculateTotalPrice()
      // 判断玩家持有的金钱是否足够
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
    // 出售模式
    if (ModeButton === SellButton) {
      const script = TradeWindow.script.TradeWindowScript
      const target = script.target
      const quantity = script.elInput.number
      const totalPrice = script.calculateTotalPrice()
      // 无视店主的金钱是否足够
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

// 取消按钮脚本
class CancelButtonScript {
  onClick() {
    Manager.playConfirmSE()
    TradeWindow.destroy()
  }
}

// 数量输入框脚本
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

// 减少数量按钮脚本
class DecreaseButtonScript {
  onMouseDownLB() {
    Manager.playCursorSE()
    TradeWindow.script.TradeWindowScript.elInput.fineTuneNumber(-1)
  }
}

// 增加数量按钮脚本
class IncreaseButtonScript {
  onMouseDownLB() {
    Manager.playCursorSE()
    TradeWindow.script.TradeWindowScript.elInput.fineTuneNumber(1)
  }
}

// 购买或出售按钮脚本
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

// 关闭按钮脚本
class CloseButtonScript {
  onClick() {
    MainWindow.destroy()
  }
}