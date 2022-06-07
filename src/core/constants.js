/**
  * @file constants
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

const uiLocale = require('uxp').host.uiLocale ;

const HistoryName = {
  TRANSLATE: 'Translate', 
  TRANSLATE_AGAIN: 'Translate Again', 
} ;

// 行揃え
const Justification = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
  JUSTIFY_LEFT: 'justifyLeft',
  JUSTIFY_CENTER: 'justifyCenter',
  JUSTIFY_RIGHT: 'justifyRight',
  JUSTIFY_ALL: 'justifyAll',
} ;

/*
  Photoshopのレイヤーの種類。ActionDescriptorのlayerKindと併せて使う。
  Layer.kindで直接扱うLayerKindは次のように読み込めば使用可能
  const { LayerKind } = photoshop.constants ;
*/
const LayerKind = {
  ANY: 0,
  PIXEL: 1,
  ADJUSTMENT: 2,
  TEXT: 3,
  VECTOR: 4, // シェイプレイヤー。photoshop.constants.LayerKindはこの4と11のSOLIDCOLORを区別しないので少々使いにくい
  SMARTOBJECT: 5,
  VIDEO: 6,
  GROUP: 7,
  THREED: 8,
  GRADIENT: 9,
  PATTERN: 10,
  SOLIDCOLOR: 11,
  BACKGROUND: 12,
  GROUPEND: 13,
} ;

// ユーザーへのメッセージ
let Messages ;
if(uiLocale === 'ja_JP') {
  Messages = {
    NOTHING_HAPPENED: `結果：\n\n何も起こりませんでした。`,
    SELECT_EDITABLE_LAYERS: `結果：\n\n何も起こりませんでした。編集可能なレイヤーを選択し、再度実行してください。`,
    OPEN_DOCUMENT: `対象なし：\n\n書類を開いた状態で実行してください。`,
  } ;
} else {
  Messages = {
    NOTHING_HAPPENED: `Result:\n\nNothing happened and it finished.`,
    SELECT_EDITABLE_LAYERS: `Result:\n\nNothing happened. Select editable layers and execute.`,
    OPEN_DOCUMENT: `No Target:\n\nOpen the document and execute.`,
  } ;
}

// 整列オプション
const PsAlignOptions = {
  LEFT_EDGES: 'ADSLefts',
  HORIZONTAL_CENTERS: 'ADSCentersH',
  RIGHT_EDGES: 'ADSRights',

  TOP_EDGES: 'ADSTops',
  VERTICAL_CENTERS: 'ADSCentersV',
  BOTTOM_EDGES: 'ADSBottoms',
} ;

// 分布オプション
const PsDistributeOptions = {
  HORIZONTAL_SPACE: 'ADSDistH',
  VERTICAL_SPACE: 'ADSDistV',
} ;

// Undoに表示されるメニュー名
const PsAlignLabels = {
  'ADSLefts': 'Align Left Edges',
  'ADSCentersH': 'Align Horizontal Centers',
  'ADSRights': 'Align Right Edges',

  'ADSTops': 'Align Top Edges',
  'ADSCentersV': 'Align Verticel Canters',
  'ADSBottoms': 'Align Bottom Edges',
  
  'ADSDistH': 'Distribute Horizontal Space',
  'ADSDistV': 'Distribute Vertical Space',
} ;

// Photoshopのテキストフレームの種類。textKey.textShape.char._value
const TextFrameType = {
  POINT: 'paint',
  AREA: 'box',
} ;

// Photoshopの横組み/縦組み。textKey.orientation._value
const TextOrientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} ;

module.exports = {
  HistoryName,
  Justification,
  LayerKind,
  Messages,
  PsAlignOptions,
  PsDistributeOptions,
  PsAlignLabels,
  TextFrameType,
  TextOrientation,
} ;