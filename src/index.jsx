/**
  * @file ダイアログで指定した距離で選択レイヤーを移動する
  * @version 1.0.0
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

const { h, render } = require('preact') ;
const { App } = require('./ui/App.jsx') ;
require('./ui/App.css') ;

const photoshop = require('photoshop') ;
const { app, core } = photoshop ;
const { ElementPlacement } = photoshop.constants ;
const { entrypoints } = require('uxp') ;

const { createLayerCaches } = require('./core/layerCache.js') ;
const { getBounds, setSelection, translate } = require('./core/layer.js') ;
const { HistoryName, LayerKind, Messages } = require('./core/constants.js') ;

const pluginInfo = require('../plugin/manifest.json') ;

// 前回のTranslate
let globalLastTranslate ;

const translateDialogMenuItem = async () => {
  await handleTranslate(HistoryName.TRANSLATE) ;
} ;

const translateAgainMenuItem = async () => {
  await handleTranslate(HistoryName.TRANSLATE_AGAIN) ;
} ;

const handleTranslate = async (historyName) => {
  try {
    await core.executeAsModal(
      async (control) => {
        const doc = app.activeDocument ;
        if(doc == null) {
          app.showAlert(Messages.OPEN_DOCUMENT) ;
          return ;
        }

        // ヒストリーを生成する
        const hostControl = control.hostControl ;
        const sID = await hostControl.suspendHistory({
          documentID: doc.id, 
          name: historyName, 
        }) ;

        // batchPlayでレイヤー情報を取得し，レイヤーの参照とその情報のセットのオブジェクトを生成する
        const layerCaches = await createLayerCaches(doc.activeLayers) ;

        // 対象になるレイヤーだけ集める
        const targetTypes = [LayerKind.PIXEL, LayerKind.SMARTOBJECT, LayerKind.TEXT, LayerKind.VECTOR, LayerKind.GROUP] ;
        const targetLayers = layerCaches.filter((aLayer) => {
          return (
            aLayer.ref.visible // 表示している
            && !aLayer.ref.allLocked // すべてをロックしていない
            && !aLayer.ref.positionLocked // 配置をロックしていない
            && targetTypes.includes(aLayer.info.layerKind) // 移動できる型のレイヤー
          ) ;
        }) ;

        // 対象がなければ終了する
        if(targetLayers.length <= 0) {
          app.showAlert(Messages.SELECT_EDITABLE_LAYERS) ;
          return ;
        }

        let translateOptions ;
        if(historyName === HistoryName.TRANSLATE) {
          // TRANSLATEの場合

          // {left, top, right, bottom, width, height}を取得する
          const bounds = await getBounds(targetLayers) ;

          // ダイアログの構造を生成する
          let dialogElement = null ;
          if(!dialogElement){
            dialogElement = document.createElement('dialog') ;
            render(<App dialog={dialogElement} bounds={bounds} />, dialogElement) ;
          }
          document.body.appendChild(dialogElement) ;

          // ダイアログを出し移動距離を指定する
          const result = await dialogElement.showModal({
            title: pluginInfo.name,
            resize: 'none',
          }) ;
          dialogElement.remove() ;
          if(result === 'reasonCanceled') {return ;}

          translateOptions = result ;
          globalLastTranslate = translateOptions ;
        } else if(historyName === HistoryName.TRANSLATE_AGAIN) {
          // TRANSLATE_AGAINの場合
          if(globalLastTranslate == null) {
            app.showAlert(Messages.NOTHING_HAPPENED) ;
            return ;
          }
          translateOptions = globalLastTranslate ;
        }

        // 移動または複製移動を実行する
        const topLayer = targetLayers[targetLayers.length - 1].ref ;
        const newSelection = [] ;
        for(const aLayer of targetLayers) {
          let dstLayer ;
          if(translateOptions.withCopying) {
            dstLayer = await aLayer.ref.duplicate() ;
            dstLayer.move(topLayer, ElementPlacement.PLACEBEFORE) ;
          } else {
            dstLayer = aLayer.ref ;
          }
          newSelection.push(dstLayer) ;
          await translate(dstLayer, translateOptions.value.x, translateOptions.value.y) ;
        }

        // 移動・複製したレイヤーを選択する
        if(newSelection.length > 0) {
          await setSelection(newSelection) ;
        } else {
          app.showAlert(Messages.NOTHING_HAPPENED) ;
          return ;
        }

        // ヒストリーを終了する
        return hostControl.resumeHistory(sID) ;
      }, 

      {'commandName': historyName}
    ) ;
  } catch(e) {
    console.log(e) ;
  }
} ;

entrypoints.setup({
  commands: {
    translateDialog: translateDialogMenuItem, 
    translateAgain: translateAgainMenuItem
  }
}) ;