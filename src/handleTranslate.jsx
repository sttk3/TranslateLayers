/**
  * @file ダイアログで指定した距離で選択レイヤーを移動する
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

// preact
import { h, render } from 'preact' ;

// adobe
import photoshop from 'photoshop' ;
const { app, core } = photoshop ;
const { ElementPlacement } = photoshop.constants ;
const { recordAction } = photoshop.action ;

// sttk3 core
import { createLayerCaches } from './core/layerCache.js' ;
import { getBounds, setSelection, translate } from './core/layer.js' ;
import { ActionRecordingEnabled, ActionHandlerName, HistoryName, LayerKind, Messages } from './core/constants.js' ;

// sttk3 ui
import { App } from './ui/App.jsx' ;
import './ui/App.css' ;

import pluginInfo from '../plugin/manifest.json' ;

// 前回のTranslate
let globalLastTranslate ;

/**
  * プラグイン機能本体
  * @param {string} historyName 実行する機能名。HistoryName.TRANSLATEなど
  * @param {boolean} [showingDialogs] ダイアログを表示するかどうか
  * @param { undefined|{withCopying: boolean, value: {x: number, y: number}} } [translateOptions] オプション
  * @return {Promise<void>} 
*/
export const handleTranslate = async (historyName, showingDialogs = false, translateOptions) => {
  try {
    await core.executeAsModal(
      async (control) => {
        const doc = app.activeDocument ;
        if(doc == null) {
          await app.showAlert(Messages.OPEN_DOCUMENT) ;
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
          await app.showAlert(Messages.SELECT_EDITABLE_LAYERS) ;
          return ;
        }

        if(historyName === HistoryName.TRANSLATE) {
          // TRANSLATEの場合

          if( showingDialogs || (translateOptions == null) ) {
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
          }
          globalLastTranslate = translateOptions ;
        } else if(historyName === HistoryName.TRANSLATE_AGAIN) {
          // TRANSLATE_AGAINの場合
          if(globalLastTranslate == null) {
            await app.showAlert(Messages.NOTHING_HAPPENED) ;
            return ;
          }
          translateOptions = globalLastTranslate ;
        }

        // アクションの記録
        if(ActionRecordingEnabled) {
          // translateOptions: {withCopying: boolean, value: {x: number, y: number}}
          try {
            switch(historyName) {
              case HistoryName.TRANSLATE:
                recordAction(
                  {
                    name: `translate({x: ${translateOptions.value.x}, y: ${translateOptions.value.y}, withCopying: ${translateOptions.withCopying}})`, 
                    methodName: ActionHandlerName, 
                  }, 
                  {
                    name: historyName, 
                    arguments: [translateOptions], 
                  }, 
                ) ;
                break ;
              case HistoryName.TRANSLATE_AGAIN:
                recordAction(
                  {
                    name: `translateAgain()`, 
                    methodName: ActionHandlerName, 
                  }, 
                  {
                    name: historyName, 
                    arguments: [], 
                  }, 
                ) ;
                break ;
            }
          } catch(e) {
            console.log(e) ;
          }
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
          await app.showAlert(Messages.NOTHING_HAPPENED) ;
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

/**
  * 選択レイヤーを移動する
  * @return {Promise<void>} 
*/
export const translateDialogMenuItem = async () => {
  await handleTranslate(HistoryName.TRANSLATE, true, undefined) ;
} ;

/**
  * 前回の移動を再実行する
  * @return {Promise<void>} 
*/
export const translateAgainMenuItem = async () => {
  await handleTranslate(HistoryName.TRANSLATE_AGAIN, false, undefined) ;
} ;