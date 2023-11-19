/**
  * @file 記録されたアクションの実行を可能にする
  * @author sttk3.com
  * @copyright © 2023 sttk3.com
*/

import photoshop from 'photoshop' ;
const { app } = photoshop ;

import { handleTranslate } from '../handleTranslate.jsx' ;
import { HistoryName } from './constants.js' ;

/**
  * アクション再生時に実行されるfunction
  * @param {ExecutionContext} executionContext This object is passed to the callback of `core.executeAsModal` for modality related APIs
  * @param {any} methodInfo recordActionから渡された引数
  * @return {Promise<any>} 
*/
const actionHandler = async (executionContext, methodInfo) => {
  const showingDialogs = /always/i.test(executionContext.uiMode) ;
  switch(methodInfo.name) {
    case HistoryName.TRANSLATE: 
      await handleTranslate(methodInfo.name, showingDialogs, methodInfo.arguments[0]) ;
      break ;
    case HistoryName.TRANSLATE_AGAIN: 
      await handleTranslate(methodInfo.name, false, undefined) ;
      break ;
  }

  return methodInfo ;
} ;

window.actionHandler = actionHandler ;