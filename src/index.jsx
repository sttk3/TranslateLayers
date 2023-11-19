/**
  * @file ダイアログで指定した距離で選択レイヤーを移動する
  * @version 1.2.0
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

import { h } from 'preact' ;
import { entrypoints } from 'uxp' ;

import { translateDialogMenuItem, translateAgainMenuItem } from './handleTranslate.jsx' ;

// アクション記録・実行を可能にする
import './core/actionHandler.js' ;

entrypoints.setup({
  commands: {
    translateDialog: translateDialogMenuItem, 
    translateAgain: translateAgainMenuItem, 
  }
}) ;