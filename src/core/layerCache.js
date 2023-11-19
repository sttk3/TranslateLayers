/**
  * @file batchPlayで得られるレイヤー情報に関わる動作
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

import photoshop from 'photoshop' ;
const { batchPlay } = photoshop.action ;
const { LayerKind } = photoshop.constants ;
const { Layer } = photoshop.app ;

/**
  * 対象のレイヤーの配列からグループを取り除き，グループの配下のレイヤーを追加する
  * @param {Array<Layer>} targetLayers 対象のレイヤーの配列
  * @return {Array<Layer>} 
*/
const layersOf = (targetLayers) => {
  const res = [] ;
  const idSet = new Set() ; // 重複禁止用レイヤーidリスト

  for(const aLayer of targetLayers) {
    // 配下を含めグループでないレイヤーを取得する
    let children ;
    switch(aLayer.kind) {
      case LayerKind.GROUP:
        children = layersOf(aLayer.layers) ;
        break ;
      default:
        children = [aLayer] ;
        break ;
    }

    // 重複しなければ結果に追加する
    for(const child of children) {
      const layerID = child.id ;
      if(!idSet.has(layerID)) {
        idSet.add(layerID) ;
        res.push(child) ;
      }
    }
  }
  
  return res ;
} ;

/**
  * リンクされたレイヤーがあったら代表1つに絞り，新しい配列を作る
  * @param {Array<Layer>} targetLayers 対象のレイヤーの配列
  * @return {Array<Layer>} 
*/
const unifyLinkedLayers = (targetLayers) => {
  const res = [] ;
  const idSet = new Set() ; // 重複禁止用レイヤーidリスト

  for(const aLayer of targetLayers) {
    // まずリンクされたレイヤーを禁止リストに入れる
    const linkedLayers = aLayer.linkedLayers ;
    linkedLayers.forEach((aItem) => {idSet.add(aItem.id)}) ;

    // 禁止リストにないレイヤーのみ結果に追加する
    [aLayer, ...linkedLayers].forEach((aItem) => {
      const layerID = aItem.id ;
      if(!idSet.has(layerID)) {
        idSet.add(layerID) ;
        res.push(aLayer) ;
      }
    }) ;
  }

  return res ;
} ;

/**
  * レイヤーの情報を取得する
  * @param {Layer} targetLayer 対象のレイヤー
  * @return {Promise<any>} 
*/
const getLayerInfo = async (targetLayer) => {
  const layerID = targetLayer.id ;

  const info = await batchPlay([
    {
      "_obj": "get",
      "_target": [
        {
          "_ref": "layer",
          "_id": layerID,
        },
      ],
      "layerID": [layerID],
      "_options": {"dialogOptions": "dontDisplay"},
    },
  ], 

    {},
  ) ;

  return info[0] ;
} ;

/**
  * レイヤーとbatchPlayで得られるレイヤー情報をセットにして配列にする
  * @param {Array} layers 対象のレイヤーの配列
  * @return {Promise<Array<{id: number, ref: Layer, info: any}>>} 
*/
export const createLayerCaches = async (layers) => {
  const targetLayers = unifyLinkedLayers(layersOf(layers)) ;

  const res = await Promise.all(targetLayers.map(async (aLayer) => {
    return {
      id: aLayer.id, 
      ref: aLayer, 
      info: await getLayerInfo(aLayer), 
    } ;
  })) ;

  return res ;
} ;