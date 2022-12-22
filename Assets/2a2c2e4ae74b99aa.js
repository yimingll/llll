/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@boolean Bool
@alias #alias
@default true
@desc Hello World

@number Number
@decimals 2
@clamp 0 10
@default 5

@string String
@default 'hello world'

@number[] NumberList
@default [0, 1, 2, 3]

@string[] StringList
@default ['foo', 'bar']

@keycode KeyCode
@default 'Enter'

@option Option {true, 0, 'foo'}
@alias OPTION {SHOW, ZERO, TEXT}

@color Color
@default 00ff00ff
@cond Option {true}

@easing Easing

@team Team

@variable Variable

@attribute Attribute

@attribute ActorAttribute
@filter actor

@attribute SkillAttribute
@filter skill

@attribute StateAttribute
@filter state

@attribute ItemAttribute
@filter item

@attribute EquipmentAttribute
@filter equipment

@attribute ElementAttribute
@filter element

@attribute-key AttributeKey

@attribute-group AttributeGroup

@enum Enum

@enum ShortcutKey
@filter shortcut-key

@enum CooldownKey
@filter cooldown-key

@enum EquipmentSlot
@filter equipment-slot

@enum GlobalEvent
@filter global-event

@enum SceneEvent
@filter scene-event

@enum ActorEvent
@filter actor-event

@enum SkillEvent
@filter skill-event

@enum StateEvent
@filter state-event

@enum EquipmentEvent
@filter equipment-event

@enum ItemEvent
@filter item-event

@enum RegionEvent
@filter region-event

@enum LightEvent
@filter light-event

@enum AnimationEvent
@filter animation-event

@enum ParticleEvent
@filter particle-event

@enum ParallaxEvent
@filter parallax-event

@enum TilemapEvent
@filter tilemap-event

@enum ElementEvent
@filter element-event

@enum-value EnumValue

@enum-group EnumGroup

@actor Actor

@region Region

@light Light

@animation Animation

@particle Particle

@parallax Parallax

@tilemap Tilemap

@element Element

@element-id ElementId

@file File

@file ActorFile
@filter actor

@file SkillFile
@filter skill

@file TriggerFile
@filter trigger

@file ItemFile
@filter item

@file EquipmentFile
@filter equipment

@file StateFile
@filter state

@file EventFile
@filter event

@file SceneFile
@filter scene

@file TilesetFile
@filter tileset

@file UIFile
@filter ui

@file AnimationFile
@filter animation

@file ParticleFile
@filter particle

@file ImageFile
@filter image

@file AudioFile
@filter audio

@file VideoFile
@filter video

@file ScriptFile
@filter script

@file FontFile
@filter font

@file OtherFile
@filter other

@lang en
#plugin Example
#desc A demo of script parameters and methods
#alias BOOL

@lang zh extends en
#plugin 例子
#desc 一个关于脚本参数和方法的演示
*/

class CustomCommand {
  // 调用事件
  call() {}
}

class SceneScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(scene) {}

  // 脚本移除事件
  onRemove(scene) {}

  // 自动执行事件
  onStart(scene) {
    console.log(
      this.Bool,
      this.Number,
      this.String,
    )
  }

  // 场景销毁事件
  onDestroy(scene) {}
}

class ActorScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(actor) {}

  // 脚本移除事件
  onRemove(actor) {}

  // 角色创建事件
  onCreate(actor) {}

  // 自动执行事件
  onStart(actor) {}

  // 角色碰撞事件
  onCollision(actor) {}

  // 角色和触发器碰撞事件
  onHitTrigger(trigger) {}

  // 角色销毁事件
  onDestroy(actor) {}
}

class RegionScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(region) {}

  // 脚本移除事件
  onRemove(region) {}

  // 自动执行事件
  onStart(region) {}

  // 玩家进入区域事件
  onPlayerEnter(actor) {}

  // 玩家离开区域事件
  onPlayerLeave(actor) {}

  // 角色进入区域事件
  onActorEnter(actor) {}

  // 角色离开区域事件
  onActorLeave(actor) {}

  // 区域销毁事件
  onDestroy(region) {}
}

class LightScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(light) {}

  // 脚本移除事件
  onRemove(light) {}

  // 自动执行事件
  onStart(light) {}

  // 光源销毁事件
  onDestroy(light) {}
}

class AnimationScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(animation) {}

  // 脚本移除事件
  onRemove(animation) {}

  // 自动执行事件
  onStart(animation) {}

  // 动画销毁事件
  onDestroy(animation) {}
}

class EmitterScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(emitter) {}

  // 脚本移除事件
  onRemove(emitter) {}

  // 自动执行事件
  onStart(emitter) {}

  // 粒子发射器销毁事件
  onDestroy(emitter) {}
}

class ParallaxScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(parallax) {}

  // 脚本移除事件
  onRemove(parallax) {}

  // 自动执行事件
  onStart(parallax) {}

  // 视差图销毁事件
  onDestroy(parallax) {}
}

class TilemapScript {
  // 更新事件
  update(deltaTime) {}

  // 脚本添加事件
  onAdd(tilemap) {}

  // 脚本移除事件
  onRemove(tilemap) {}

  // 自动执行事件
  onStart(tilemap) {}

  // 瓦片地图销毁事件
  onDestroy(tilemap) {}
}

class SkillScript {
  // 技能施放事件
  onSkillCast(skill) {}

  // 技能添加事件
  onSkillAdd(skill) {}

  // 技能移除事件
  onSkillRemove(skill) {}
}

class TriggerScript {
  // 自动执行事件
  onStart(trigger) {}

  // 触发器击中角色事件
  onHitActor(actor) {}

  // 触发器销毁事件
  onDestroy(trigger) {}
}

class StateScript {
  // 状态添加事件
  onStateAdd(state) {}

  // 状态移除事件
  onStateRemove(state) {}
}

class EquipmentScript {
  // 装备创建事件
  onCreate(equipment) {}

  // 装备添加事件
  onEquipmentAdd(equipment) {}

  // 装备移除事件
  onEquipmentRemove(equipment) {}
}

class ItemScript {
  // 物品使用事件
  onItemUse(item) {}
}

class UIElementScript {
  // 更新事件
  update(deltaTime) {}

  // 自动执行事件
  onStart(element) {}

  // 鼠标按下事件
  onMouseDown(element) {}

  // 左键按下事件
  onMouseDownLB(element) {}

  // 右键按下事件
  onMouseDownRB(element) {}

  // 鼠标弹起事件
  onMouseUp(element) {}

  // 左键弹起事件
  onMouseUpLB(element) {}

  // 右键弹起事件
  onMouseUpRB(element) {}

  // 鼠标移动事件
  onMouseMove(element) {}

  // 鼠标进入事件
  onMouseEnter(element) {}

  // 鼠标离开事件
  onMouseLeave(element) {}

  // 鼠标点击事件
  onClick(element) {}

  // 鼠标双击事件
  onDoubleClick(element) {}

  // 滚轮滑动事件
  onWheel(element) {}

  // 元素销毁事件
  onDestroy(element) {}
}

class TextBoxElementScript extends UIElementScript {
  // 输入事件
  onInput(element) {}

  // 获得焦点事件
  onFocus(element) {}

  // 失去焦点事件
  onBlur(element) {}
}

export default SceneScript