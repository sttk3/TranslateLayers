/**
  * @file ダイアログの構造
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

import { h } from 'preact' ;
import { useEffect, useReducer, useRef } from 'preact/hooks' ;
import { Spacer } from './Spacer.jsx' ;
import { EditField } from './EditField.jsx' ;
import { ActionType, calc, storeData, returnData, reducer, UnitText } from './reducer.jsx' ;

import os from 'os' ;
const isMac = /darwin/.test(os.platform()) ;

export const App = (props) => {
  const { bounds, dialog } = props ;

  // 入力画面で使える定数
  const sharedVariables = {
    ...bounds, 
    x: bounds.left, 
    X: bounds.left, 
    y: bounds.top, 
    Y: bounds.top, 
    w: bounds.width, 
    W: bounds.width, 
    h: bounds.height, 
    H: bounds.height, 
  } ;
  storeData('sharedVariables', sharedVariables) ;

  const defaultXY = returnData() ;
  const settings = {
    translateX: {
      keyName: 'translateX', 
      dstKey: 'x', 
      label: 'X', 
      title: 'Translate X', 
      defaultValue: calc(defaultXY.x), 
      readOnly: false, 
      quiet: false, 
    }, 
    translateY: {
      keyName: 'translateY', 
      dstKey: 'y', 
      label: 'Y', 
      title: 'Translate Y', 
      defaultValue: calc(defaultXY.y), 
      readOnly: false, 
      quiet: false, 
    }, 
    currentW: {
      keyName: 'currentW', 
      label: 'W', 
      title: 'Painted Area Width', 
      defaultValue: UnitText(`${bounds.width}`, bounds.width), 
      readOnly: true, 
      quiet: true, 
    }, 
    currentH: {
      keyName: 'currentH', 
      label: 'H', 
      title: 'Painted Area Height', 
      defaultValue: UnitText(`${bounds.height}`, bounds.height), 
      readOnly: true, 
      quiet: true, 
    }, 
    currentX: {
      keyName: 'currentX', 
      label: 'X', 
      title: 'Current X', 
      defaultValue: UnitText(`${bounds.left}`, bounds.left), 
      readOnly: true, 
      quiet: true, 
    }, 
    currentY: {
      keyName: 'currentY', 
      label: 'Y', 
      title: 'Current Y', 
      defaultValue: UnitText(`${bounds.top}`, bounds.top), 
      readOnly: true, 
      quiet: true, 
    }, 
    buttonCopy: {
      id: 'button-copy', 
      variant: 'secondary', 
      label: 'Copy', 
      title: 'Copy', 
    }, 
    buttonCancel: {
      id: 'button-cancel', 
      variant: 'secondary', 
      label: 'Cancel', 
      title: 'Cancel', 
    }, 
    buttonOK: {
      id: 'button-ok', 
      variant:  'primary', 
      label: 'OK', 
      title: 'OK', 
    }, 
  } ;

  const defaultState = {
    translateX: settings.translateX.defaultValue, 
    translateY: settings.translateY.defaultValue, 
    currentW: settings.currentW.defaultValue, 
    currentH: settings.currentH.defaultValue, 
    currentX: settings.currentX.defaultValue, 
    currentY: settings.currentY.defaultValue, 
  } ;

  const focusRef = useRef(null) ;
  const [state, dispatch] = useReducer(reducer, defaultState) ;

  // W H X Yの表示形式。見た目はCSSで変更できるが，tabでの移動順は構造通りなので現状photoshopだけしか使えない
  const panelLayoutStyle = 'photoshop' ;
  let dstLayout ;
  switch(panelLayoutStyle) {
    case 'photoshop':
    case 'xd':
      dstLayout = {'area-src': 'flex horizontal', 'area-src-size': 'flex vertical', 'area-src-position': 'flex vertical', 'spacer-0': 8, 'spacer-1': 24} ;
      break ;
    case 'illustrator':
    case 'indesign':
      dstLayout = {'area-src': 'flex horizontal-reverse', 'area-src-size': 'flex vertical', 'area-src-position': 'flex vertical', 'spacer-0': 8, 'spacer-1': 24} ;
      break ;
    case 'figma':
      dstLayout = {'area-src': 'flex vertical-reverse', 'area-src-size': 'flex horizontal', 'area-src-position': 'flex horizontal', 'spacer-0': 24, 'spacer-1': 8} ;
      break ;
  }

  useEffect(() => {
    Object.keys(defaultState).forEach((aKey) => {
      const currentObj = settings[aKey] ;
      dispatch({ type: ActionType.updateView, payload: {keyName: aKey, value: currentObj.defaultValue, readOnly: currentObj.readOnly} }) ;
    }) ;

    /*
      自動でテキストフィールドにフォーカスしないので自力でフォーカスを実行する。
      タイミングが早すぎると実行されないので少し遅らせる。
      当初はWindowsのみに必要だったが、いつの間にかmacOSでも自動的にフォーカスされなくなり、両方で実行が必要
    */
    setTimeout(() => {focusRef.current.focus() ;}, 300) ;
  }, []) ;

  const elementButtonCancel = (
    <sp-button
      id={settings.buttonCancel.id}
      title={settings.buttonCancel.title}
      variant={settings.buttonCancel.variant}
      onClick={ () => {dialog.close('reasonCanceled') ;} }
    >
      {settings.buttonCancel.label}
    </sp-button>
  ) ;

  const elementButtonOK = (
    <sp-button
      id={settings.buttonOK.id}
      title={settings.buttonOK.title}
      variant={settings.buttonOK.variant}
      onClick={ (event) => {
        dialog.close({withCopying: event.altKey, value: returnData()}) ;
      } }
    >
      {settings.buttonOK.label}
    </sp-button>
  ) ;

  let okButtons ;
  if(isMac) {
    // macOSの場合，Cancel→OK
    okButtons = [elementButtonCancel, elementButtonOK] ;
  } else {
    // Windowsの場合，OK→Cancel
    okButtons = [elementButtonOK, elementButtonCancel] ;
  }

  return (
    <form
      method='dialog'
      className='main w100'
      onKeyDown={ (event) => {
        event.preventDefault() ;
        if(event.key === 'Enter') {dialog.close({withCopying: event.altKey, value: returnData()}) ;}
      } }
    >

      <div id='area-body'>
        {/* 新しく指定する値のエリア */}
        <sp-heading size='XXS' className='h2' >Translate</sp-heading>
        <Spacer size={8} />
        <div id='area-dst' className={'flex horizontal'}>
          <EditField keyName={settings.translateX.keyName} dstKey={settings.translateX.dstKey} label={settings.translateX.label} title={settings.translateX.title} quiet={settings.translateX.quiet} readOnly={settings.translateX.readOnly} dispatch={dispatch} state={state.translateX} focusRef={focusRef} />
          <Spacer size={24} />
          <EditField keyName={settings.translateY.keyName} dstKey={settings.translateY.dstKey} label={settings.translateY.label} title={settings.translateY.title} quiet={settings.translateY.quiet} readOnly={settings.translateY.readOnly} dispatch={dispatch} state={state.translateY} />
        </div>

        <Spacer size={16} />
        <sp-divider size='medium' />
        <Spacer size={16} />

        {/* 現在の値のエリア */}
        <sp-heading size='XXS' className='h2' >Current value</sp-heading>
        <Spacer size={8} />
        <div id='area-src' className={dstLayout['area-src']}>
          <div id='area-src-size' className={dstLayout['area-src-size']}>
            <EditField keyName={settings.currentW.keyName} label={settings.currentW.label} title={settings.currentW.title} quiet={settings.currentW.quiet} readOnly={settings.currentW.readOnly} dispatch={dispatch} state={state.currentW} />
            <Spacer size={dstLayout['spacer-0']} />
            <EditField keyName={settings.currentH.keyName} label={settings.currentH.label} title={settings.currentH.title} quiet={settings.currentH.quiet} readOnly={settings.currentH.readOnly} dispatch={dispatch} state={state.currentH} />
          </div>

          <Spacer size={dstLayout['spacer-1']} />

          <div id='area-src-position' className={dstLayout['area-src-position']}>
            <EditField keyName={settings.currentX.keyName} label={settings.currentX.label} title={settings.currentX.title} quiet={settings.currentX.quiet} readOnly={settings.currentX.readOnly} dispatch={dispatch} state={state.currentX} />
            <Spacer size={dstLayout['spacer-0']} />
            <EditField keyName={settings.currentY.keyName} label={settings.currentY.label} title={settings.currentY.title} quiet={settings.currentY.quiet} readOnly={settings.currentY.readOnly} dispatch={dispatch} state={state.currentY} />
          </div>
        </div>
      </div>

      <Spacer size={16} />

      <footer>
        <sp-button-group>
          <sp-button
            id={settings.buttonCopy.id}
            title={settings.buttonCopy.title}
            variant={settings.buttonCopy.variant}
            onClick={ () => {dialog.close({withCopying: true, value: returnData()}) ;} }
          >
            {settings.buttonCopy.label}
          </sp-button>

          { okButtons[0] }

          { okButtons[1] }
        </sp-button-group>
      </footer>
    </form>
  ) ;
} ;