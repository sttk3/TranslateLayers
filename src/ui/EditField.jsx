const { h } = require('preact') ;
const { useRef } = require('preact/hooks') ;

const { ActionType, storeData } = require('./reducer.jsx') ;
require('./EditField.css') ;

/**
  * 計算機能付きテキストフィールド
  * @param {Function} dispatch reducer
  * @param {String} keyName stateの中で自分を示す識別子。translateXなど
  * @param {String} dstKey globalDataStoreの中で自分を示す識別子。xなど
  * @param {Object} state 親のstate
  * @param {String} [label] テキストフィールドにつけるラベル
  * @param {Boolean} [quiet] 見た目をquietにするかどうか。trueでquiet
  * @param {Boolean} [readOnly] 値の変更を禁止するどうか。trueで禁止
  * @param {String} [title] テキストフィールドにつけるtitle。おもにtooltipとして使う
  * @return {Component} 
*/
const EditField = (props) => {
  const {
    dispatch, 
    keyName, 
    dstKey, 
    state, 
    label, 
    quiet = false, 
    readOnly = false, 
    title = label, 
  } = props ;

  // テキストフィールドの参照。ラベルをタップしたときフォーカスするのに使う
  const textFieldRef = useRef(null) ;

  return (
    <div className='text-field-container w100'>
      { label && (
        <sp-label
          className='label-small'
          slot='label'
          onClick={() => {textFieldRef.current.focus() ;}}
        >
          {label}
        </sp-label>
      ) }
      <sp-textfield
        className='text-field w100'
        ref={textFieldRef}
        title={title}
        quiet={quiet}
        value={state.displayValue}
        onChange={ (event) => { dispatch({ type: ActionType.updateView, payload: {keyName, value: event.target.value, readOnly} }) } }
        onInput={ (event) => { storeData(dstKey, event.target.value) ;} }
      >
      </sp-textfield>
    </div>
  ) ;
} ;

module.exports = {
  EditField
} ;