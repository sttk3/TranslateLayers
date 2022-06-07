const { h } = require('preact') ;
const { math } = require('../core/calc.js') ;

let globalDataStore = {
  x: 0, 
  y: 0, 
  sharedVariables: {}, 
} ;

const UnitText = (displayValue, pixelValue) => {
  return {
    displayValue, 
    pixelValue, 
  } ;
} ;

// dispatchで使うアクションの識別子
const ActionType = {
  updateView: 'MoveDialog.updateView', 
} ;

/**
  * 全角数値などいくつかの文字を半角に変換する
  * @param {String} srcText 対象の文字列
  * @return {String} 
*/
const toHankaku = (srcText) => {
  // 全角数字を半角に
  let res = srcText.toString().replace(/[０-９Ａ-Ｚａ-ｚ]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)}) ;

  // テキストを洗浄する
  const replaceList = [
    [/ー/g, '-'], 
    [/[＋；]/g, '+'], 
    [/[＊：]/g, '*'], 
    [/[／・]/g, '/'], 
    [/[＾]/g, '^'], 
    [/[％]/g, '%'], 
    [/[。．]/g, '.'], 
    [/[　]+/g, ' '], 
  ] ;
  replaceList.forEach((aItem) => {
    if(aItem[0].test(res)) {
      res = res.replace(aItem[0], aItem[1]) ;
    }
  }) ;

  return res ;
} ;

/**
  * 文字列をmath.jsで計算する
  * @param {String} srcText 対象の文字列
  * @param {String} [baseUnit] 初期設定単位。省略時px
  * @return {UnitText} 
*/
const calc = (srcText, baseUnit = 'px') => {
  let calculatedValue = math.evaluate(srcText, globalDataStore.sharedVariables) ;
  
  switch(calculatedValue.constructor.name) {
    case 'Number':
      calculatedValue = math.unit(calculatedValue, baseUnit) ;
      break ;
    case 'Unit':
      // skip
      break ;
    default:
      return ;
  }
  const srcNumber = calculatedValue.toNumber(baseUnit) ;
  const newText = math.format(srcNumber, {notation: 'fixed', precision: 4}).toString().replace(/\.?0+$/, '') ;

  return UnitText(`${newText} ${baseUnit}`, srcNumber) ;
} ;

const storeData = (dstKey, dstValue) => {
  try {
    globalDataStore[dstKey] = dstValue ;
  } catch(e) {
    // skip
  }
} ;

const returnData = () => {
  let x = 0 ;
  let y = 0 ;

  try { x = calc(toHankaku(globalDataStore.x)).pixelValue ; } catch(e) {}
  try { y = calc(toHankaku(globalDataStore.y)).pixelValue ; } catch(e) {}

  return {x, y} ;
} ;

const handleOnChange = (value, oldState, readOnly) => {
  const baseUnit = 'px' ;

  if(readOnly) {
    let newText ;
    if(oldState.displayValue.toString().endsWith(baseUnit)) {
      newText = `${oldState.displayValue}` ;
    } else {
      newText = `${oldState.displayValue} ${baseUnit}` ;
    }
    return UnitText(newText, oldState.pixelValue) ;
  }

  let srcText ;
  if(value) {
    srcText = toHankaku(value) ;
  } else {
    srcText = oldState.displayValue ;
  }
  
  let dstObject ;
  try {
    dstObject = calc(srcText, baseUnit) ;
  } catch(e) {
    // console.log(e) ;
    dstObject = UnitText(`${oldState.displayValue}`, oldState.pixelValue) ;
  }

  return dstObject ;
} ;

/**
  * stateはすべてこれを通じて操作する
*/
const reducer = (state, action) => {
  // 現状のstateを複製する。直接編集してはいけない
  let tempState = JSON.parse(JSON.stringify(state)) ;

  let newState ;
  switch(action.type) {
    case ActionType.updateView:
      tempState[action.payload.keyName] = handleOnChange(action.payload.value, tempState[action.payload.keyName], action.payload.readOnly) ;
      newState = tempState ;
      break ;
    default: 
      // skip
      break ;
  }

  return newState ;
} ;

module.exports = {
  ActionType, 
  calc, 
  reducer, 
  storeData, 
  returnData, 
  UnitText
} ;