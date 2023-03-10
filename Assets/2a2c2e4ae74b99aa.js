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
#plugin ??????
#desc ??????????????????????????????????????????
*/

class CustomCommand {
  // ????????????
  call() {}
}

class SceneScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(scene) {}

  // ??????????????????
  onRemove(scene) {}

  // ??????????????????
  onStart(scene) {
    console.log(
      this.Bool,
      this.Number,
      this.String,
    )
  }

  // ??????????????????
  onDestroy(scene) {}
}

class ActorScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(actor) {}

  // ??????????????????
  onRemove(actor) {}

  // ??????????????????
  onCreate(actor) {}

  // ??????????????????
  onStart(actor) {}

  // ??????????????????
  onCollision(actor) {}

  // ??????????????????????????????
  onHitTrigger(trigger) {}

  // ??????????????????
  onDestroy(actor) {}
}

class RegionScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(region) {}

  // ??????????????????
  onRemove(region) {}

  // ??????????????????
  onStart(region) {}

  // ????????????????????????
  onPlayerEnter(actor) {}

  // ????????????????????????
  onPlayerLeave(actor) {}

  // ????????????????????????
  onActorEnter(actor) {}

  // ????????????????????????
  onActorLeave(actor) {}

  // ??????????????????
  onDestroy(region) {}
}

class LightScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(light) {}

  // ??????????????????
  onRemove(light) {}

  // ??????????????????
  onStart(light) {}

  // ??????????????????
  onDestroy(light) {}
}

class AnimationScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(animation) {}

  // ??????????????????
  onRemove(animation) {}

  // ??????????????????
  onStart(animation) {}

  // ??????????????????
  onDestroy(animation) {}
}

class EmitterScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(emitter) {}

  // ??????????????????
  onRemove(emitter) {}

  // ??????????????????
  onStart(emitter) {}

  // ???????????????????????????
  onDestroy(emitter) {}
}

class ParallaxScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(parallax) {}

  // ??????????????????
  onRemove(parallax) {}

  // ??????????????????
  onStart(parallax) {}

  // ?????????????????????
  onDestroy(parallax) {}
}

class TilemapScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onAdd(tilemap) {}

  // ??????????????????
  onRemove(tilemap) {}

  // ??????????????????
  onStart(tilemap) {}

  // ????????????????????????
  onDestroy(tilemap) {}
}

class SkillScript {
  // ??????????????????
  onSkillCast(skill) {}

  // ??????????????????
  onSkillAdd(skill) {}

  // ??????????????????
  onSkillRemove(skill) {}
}

class TriggerScript {
  // ??????????????????
  onStart(trigger) {}

  // ???????????????????????????
  onHitActor(actor) {}

  // ?????????????????????
  onDestroy(trigger) {}
}

class StateScript {
  // ??????????????????
  onStateAdd(state) {}

  // ??????????????????
  onStateRemove(state) {}
}

class EquipmentScript {
  // ??????????????????
  onCreate(equipment) {}

  // ??????????????????
  onEquipmentAdd(equipment) {}

  // ??????????????????
  onEquipmentRemove(equipment) {}
}

class ItemScript {
  // ??????????????????
  onItemUse(item) {}
}

class UIElementScript {
  // ????????????
  update(deltaTime) {}

  // ??????????????????
  onStart(element) {}

  // ??????????????????
  onMouseDown(element) {}

  // ??????????????????
  onMouseDownLB(element) {}

  // ??????????????????
  onMouseDownRB(element) {}

  // ??????????????????
  onMouseUp(element) {}

  // ??????????????????
  onMouseUpLB(element) {}

  // ??????????????????
  onMouseUpRB(element) {}

  // ??????????????????
  onMouseMove(element) {}

  // ??????????????????
  onMouseEnter(element) {}

  // ??????????????????
  onMouseLeave(element) {}

  // ??????????????????
  onClick(element) {}

  // ??????????????????
  onDoubleClick(element) {}

  // ??????????????????
  onWheel(element) {}

  // ??????????????????
  onDestroy(element) {}
}

class TextBoxElementScript extends UIElementScript {
  // ????????????
  onInput(element) {}

  // ??????????????????
  onFocus(element) {}

  // ??????????????????
  onBlur(element) {}
}

export default SceneScript