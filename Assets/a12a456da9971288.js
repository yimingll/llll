/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@attribute-key name
@alias #name
@filter actor

@attribute-key level
@alias #level
@filter actor

@attribute-key health
@alias #health
@filter actor

@attribute-key maxHealth
@alias #maxHealth
@filter actor

@attribute-key mana
@alias #mana
@filter actor

@attribute-key maxMana
@alias #maxMana
@filter actor

@attribute-key exp
@alias #exp
@filter actor

@attribute-key maxExp
@alias #maxExp
@filter actor

@string nameLevelFormat
@alias #nameLevelFormat
@default '{name} Lv {level}'

@attribute-key itemCdAttr
@alias #itemCdAttr
@filter item

@enum-group shortcutGroupId
@alias #shortcutGroupId

@lang en
#plugin Main Interface
#name Actor Name
#level Actor Level
#health Actor HP
#maxHealth Actor MaxHP
#mana Actor MP
#maxMana Actor MaxMP
#exp Actor EXP
#maxExp Actor MaxEXP
#nameLevelFormat Name & Level Format
#itemCdAttr Item CD Attribute
#shortcutGroupId Keys for Shortcut Bar

@lang zh
#plugin 主界面
#name 角色名称
#level 角色等级
#health 角色生命值
#maxHealth 角色最大生命值
#mana 角色魔法值
#maxMana 角色最大魔法值
#exp 角色经验值
#maxExp 角色最大经验值
#nameLevelFormat 角色名称等级格式
#itemCdAttr 物品冷却键
#shortcutGroupId 快捷栏的键列表
*/

// 主界面脚本实例
class Manager {}

// 主界面脚本
class MainScript {
  onStart(element) {
    Manager = this
    element.pointerEvents = 'skipped'
    this.partyMemberList = UI.get('b8ca117f14daae5f')
    this.partyMemberList.script.add(new PartyMemberListScript())
    this.playerShortcutBar = UI.get('d2c5ffafce9bf12f')
    this.playerShortcutBar.script.add(new PlayerShortcutBarScript())

    // 获取快捷键词条
    const shortcutGroup = Enum.getGroup(Manager.shortcutGroupId) ?? {}
    this.shortcutEntries = Object.entries(shortcutGroup)
  }

  onDestroy() {
    Manager = null
  }
}

// 队伍成员列表脚本
class PartyMemberListScript {
  onAdd(element) {
    element.pointerEvents = 'disabled'
    this.partyMemberWindow = element
    this.members = []
  }

  update() {
    // 检查队伍成员是否发生变化
    const sMembers = this.members
    const dMembers = Party.members
    const length = Math.max(sMembers.length, dMembers.length)
    for (let i = 0; i < length; i++) {
      if (sMembers[i] !== dMembers[i]) {
        this.members = dMembers.slice()
        return this.createMemberPanels()
      }
    }
  }

  // 创建队伍成员面板
  createMemberPanels() {
    this.partyMemberWindow.clear()
    for (const member of Party.members) {
      const elPanel = UI.createElement('1cd5032165b642e5')
      // 因为窗口元素添加添加角色面板时会延迟调用resize方法
      // 必须在角色面板的update方法之前调用窗口的resize方法
      // 先计算出状态栏窗口元素的宽高，才能获得内部行列数
      this.partyMemberWindow.appendChild(elPanel)
      elPanel.script.add(new PartyMemberPanelScript(member))
    }
  }
}

// 队伍成员面板脚本
class PartyMemberPanelScript {
  constructor(actor) {
    this.actor = actor
    this.clip = Array.empty
    this.elName = UI.get('989fbfd153794db7')
    this.elPortrait = UI.get('24f8ce5125da27fb')
    this.elHealthBack = UI.get('ae81ebfebe39e4fa')
    this.elHealthBar = UI.get('e4d5994b7c1eafe0')
    this.elManaBack = UI.get('cd58ebbb19e78ed5')
    this.elManaBar = UI.get('776935df2163b654')
    this.elExpBar = UI.get('dde85917f0990e18')
    this.playerStateBar = UI.get('ddc02ef16e89694e')
    this.playerStateBar.script.add(new PartyMemberStateBarScript(actor))
    if (this.actor !== Party.player) {
      this.elHealthBack.set({width: this.elHealthBack.transform.width * 2 / 3})
      this.elHealthBar.set({width: this.elHealthBar.transform.width * 2 / 3})
      this.elManaBack.set({width: this.elManaBack.transform.width * 2 / 3})
      this.elManaBar.set({width: this.elManaBar.transform.width * 2 / 3})
    }
    this.update()
  }

  update() {
    if (this.actor) {
      // 更新是无序的，不一定父元素就会更早更新
      this.updateActorPortrait()
      this.updateActorNameAndLevel()
      this.updateActorStatus()
    }
  }

  // 更新角色头像
  updateActorPortrait() {
    const {portrait, clip} = this.actor
    if (this.portrait !== portrait || !Array.isEqual(this.clip, clip)) {
      this.portrait = portrait
      this.clip = clip.slice()
      this.elPortrait.setImageClip(portrait, clip)
    }
  }

  // 更新角色名称和等级
  updateActorNameAndLevel() {
    const attributes = this.actor.attributes
    const name = attributes[Manager.name]
    const level = attributes[Manager.level]
    if ((this.name !== name || this.level !== level) && typeof name === 'string' && typeof level === 'number') {
      this.name = name
      this.level = level
      this.elName.content = Manager.nameLevelFormat.replace('{name}', name).replace('{level}', level)
    }
  }

  // 更新角色状态
  updateActorStatus() {
    const attributes = this.actor.attributes
    const hpProgress = attributes[Manager.health] / attributes[Manager.maxHealth]
    const mpProgress = attributes[Manager.mana] / attributes[Manager.maxMana]
    const expProgress = attributes[Manager.exp] / attributes[Manager.maxExp]
    if (Number.isFinite(hpProgress)) this.elHealthBar.progress = hpProgress
    if (Number.isFinite(mpProgress)) this.elManaBar.progress = mpProgress
    if (Number.isFinite(expProgress)) this.elExpBar.progress = expProgress
  }
}

// 队伍成员状态栏脚本
class PartyMemberStateBarScript {
  elStateBar  //:element
  actor       //:actor
  version     //:number

  constructor(actor) {
    this.actor = actor
  }

  onAdd(elStateBar) {
    this.elStateBar = elStateBar
    Callback.push(() => {
      this.update()
    })
  }

  update() {
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
        const elStateIcon = UI.createElement('c4a2383f2ccb3577')
        const elStateTime = UI.get('76cb353daec15de9')
        elStateIcon.setImageClip(state.icon, state.clip)
        elStateIcon.actorState = state
        elStateIcon.elStateTime = elStateTime
        this.elStateBar.appendChild(elStateIcon)
      }
    }
    // 更新状态剩余时间
    for (const elStateIcon of this.elStateBar.children) {
      const {actorState, elStateTime} = elStateIcon
      let seconds = actorState.currentTime / 1000
      if (seconds <= 60) {
        // 状态时间 <= 60秒
        seconds = Math.ceil(seconds)
        if (elStateTime.lastSeconds !== seconds) {
          elStateTime.lastSeconds = seconds
          elStateTime.content = seconds + 's'
        }
      } else if (seconds <= 3600) {
        // 状态时间 <= 60分
        const minutes = Math.floor(seconds / 60)
        if (elStateTime.lastMinutes !== minutes) {
          elStateTime.lastMinutes = minutes
          elStateTime.content = minutes + 'm'
        }
      } else {
        // 状态时间 > 1小时
        const hours = Math.floor(seconds / 3600)
        if (elStateTime.lastHours !== hours) {
          elStateTime.lastHours = hours
          elStateTime.content = hours + 'h'
        }
      }
    }
  }
}

// 玩家快捷栏脚本
class PlayerShortcutBarScript {
  elShortcutBar //:element
  actor         //:object

  onAdd(elShortcutBar) {
    this.elShortcutBar = elShortcutBar
  }

  update() {
    if (this.actor !== Party.player) {
      this.actor = Party.player
      this.createShortcutIcons()
    }
    // if (this.actor) {
    //   this.updateActorStatus()
    // }
  }

  // 创建快捷图标
  createShortcutIcons() {
    this.elShortcutBar.clear()
    if (!this.actor) {
      this.elShortcutBar.hide()
      return
    }

    // 创建快捷栏项目
    for (const [key, value] of Manager.shortcutEntries) {
      const elItem = UI.createElement('cee2baa6f39a7b12')
      elItem.elIcon = UI.get('0cca9168e82af5c8').hide()
      elItem.elProgress = UI.get('898d9eda5bb5b474').hide()
      elItem.elQuantity = UI.get('d146b20202acb838').hide()
      elItem.elKey = UI.get('12fd7b812e3706ce')
      elItem.elKey.content = value
      elItem.key = key
      elItem.script.add(new ShortcutItemScript(this.actor, key))
      this.elShortcutBar.appendChild(elItem)
    }
    this.elShortcutBar.show()
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
    this.actor = actor
    this.key = key
  }

  onStart(elItem) {
    this.elItem = elItem
  }

  update() {
    const target = this.actor.shortcutManager.get(this.key) ?? null
    if (this.target !== target) {
      this.target = target
      if (target === null) {
        this.elItem.elIcon.hide()
        this.elItem.elProgress.hide()
        this.elItem.elQuantity.hide()
        return
      }
      if (target.type === 'skill') {
        this.elItem.elIcon.show()
        this.elItem.elProgress.show()
        this.elItem.elQuantity.hide()
        this.elItem.elIcon.setImageClip(target.icon, target.clip)
        this.update = ShortcutItemScript.prototype.updateSkill
        this.update()
        return
      }
      if (target.type === 'item') {
        this.elItem.elIcon.show()
        this.elItem.elProgress.show()
        this.elItem.elQuantity.show()
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
        this.elItem.elProgress.show()
        this.elItem.elIcon.tint[3] = 0
        this.elItem.elIcon.set({opacity: 1})
      } else {
        this.elItem.elProgress.hide()
        this.elItem.elIcon.tint[3] = 255
        this.elItem.elIcon.set({opacity: 0.5})
      }
    }
  }

  // 更新技能信息
  updateSkill() {
    if (this.target === this.actor.shortcutManager.get(this.key)) {
      const skill = this.actor.skillManager.get(this.target.id)
      if (skill) {
        this.setActive(true)
        this.elItem.elProgress.progress = skill.progress
      } else {
        this.setActive(false)
      }
    } else {
      this.update = ShortcutItemScript.prototype.update
      this.update()
    }
  }

  // 更新物品信息
  updateItem() {
    if (this.target === this.actor.shortcutManager.get(this.key)) {
      const quantity = this.actor.inventory.count(this.target.id)
      if (this.quantity !== quantity) {
        this.quantity = quantity
        this.elItem.elQuantity.content = quantity > 0 ? this.quantity : ''
      }
      if (quantity > 0) {
        this.setActive(true)
        const cdKey = this.target.data.attributes[Manager.itemCdAttr] ?? ''
        const cdProgress = this.actor.cooldownManager.get(cdKey)?.progress ?? 0
        this.elItem.elProgress.progress = cdProgress
      } else {
        this.setActive(false)
      }
    } else {
      this.update = ShortcutItemScript.prototype.update
      this.update()
    }
  }

  onMouseDownLB() {
    const target = this.actor.shortcutManager.getTarget(this.key)
    if (target instanceof Skill) return target.cast()
    if (target instanceof Item) return target.use(this.actor)
  }
}

export default MainScript