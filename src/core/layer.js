/**
  * @file レイヤーの操作
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

import photoshop from 'photoshop' ;
const { batchPlay } = photoshop.action ;
const { Layer } = photoshop.app ;

import { descDeselectLayer, descSelectLayer } from './select.js' ;

/**
  * 対象レイヤー全体でのboundsを取得する
  * @param {LayerCache[]} targetLayerCaches 対象のLayerCacheの配列
  * @return {Promise<{left: number, top: number, right: number, bottom: number, width: number, height: number}>}
*/
export const getBounds = async (targetLayerCaches) => {
  let { left, top, right, bottom } = targetLayerCaches[0].ref.boundsNoEffects ;
  targetLayerCaches.forEach((aLayer) => {
    const bounds = aLayer.ref.boundsNoEffects ;
    if(bounds.left < left) {left = bounds.left ;}
    if(bounds.top < top) {top = bounds.top ;}
    if(bounds.right > right) {right = bounds.right ;}
    if(bounds.bottom > bottom) {bottom = bounds.bottom ;}
  }) ;

  return { left, top, right, bottom, width: right - left, height: bottom - top } ;
} ;

/**
  * 対象レイヤーを選択する
  * @param {Array<Layer>} targetLayers 対象のlayerの配列
  * @return {Promise<void>}
*/
export const setSelection = async (targetLayers) => {
  if(targetLayers == null || targetLayers.length <= 0) {return ;}
  await batchPlay([descSelectLayer(targetLayers)], {}) ;
} ;

/**
  * 対象レイヤーをtranslateする。Layer.translateはactiveLayersすべてに実行してしまうし，
  * batchPlayで選択を外したら実行できず使いにくい
  * @param {Layer} targetLayer 対象のlayer
  * @param {Number | Object} x 横移動距離。数値の場合はpx単位，{_unit: "percentUnit", _value: 100}のようなオブジェクトなら%
  * @param {Number | Object} y 縦移動距離。数値の場合はpx単位，{_unit: "percentUnit", _value: 100}のようなオブジェクトなら%
  * @return {Promise<void>}
*/
export const translate = async (targetLayer, x = 0, y = 0) => {
  if(x === 0 && y === 0) {return ;}
  
  let dstX ;
  if(x.constructor.name === 'Number') {
    dstX = {_unit: 'pixelsUnit', _value: x} ;
  } else {
    dstX = x ;
  }

  let dstY ;
  if(x.constructor.name === 'Number') {
    dstY = {_unit: 'pixelsUnit', _value: y} ;
  } else {
    dstY = y ;
  }

  await batchPlay([
    descDeselectLayer(), 
    descSelectLayer(targetLayer), 

    {
      "_obj": "transform", 
      "_target": [
        {
          "_enum": "ordinal", 
          "_ref": "layer", 
        }, 
      ], 
      "freeTransformCenterState": {
        "_enum": "quadCenterState", 
        "_value": "QCSAverage", 
      }, 
      "interfaceIconFrameDimmed": {
        "_enum": "interpolationType", 
        "_value": "bicubic", 
      }, 
      "offset": {
        "_obj": "offset", 
        "horizontal": dstX, 
        "vertical": dstY, 
      }, 
    }, 
  ], 

    {}, 
  ) ;
} ;