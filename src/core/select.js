/**
  * @file レイヤーを選択する動作のbatchPlay用オブジェクトを返す
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

/**
  * レイヤーの選択をなしにする動作のbatchPlay用オブジェクトを返す
  * @return {object} 
*/
const descDeselectLayer = () => {
  return {
    "_obj": "selectNoLayers",
    "_target": [
      {
        "_enum": "ordinal",
        "_ref": "layer"
      }
    ]
  }
} ;

/**
  * レイヤーを選択する動作のbatchPlay用オブジェクトを返す
  * @param {layer[] | layer} targetLayers 対象のレイヤーの配列，またはレイヤーそのもの
  * @return {object} 
*/
const descSelectLayer = (targetLayers) => {
  let layers ;
  switch(targetLayers.constructor.name) {
    case 'Layer':
    case 'Layer_Layer':
      layers = [targetLayers] ;
      break ;
    case 'Array':
      layers = targetLayers ;
      break ;
    default:
      throw new Error('Only layers or arrays are accepted as arguments') ;
  }
  
  const ids = layers.map((aLayer) => {return aLayer._id ;}) ;
  return {
    "_obj": "select",
    "_target": [
      {
        "_ref": "layer",
        "_id": ids[0],
      },
    ],
    "layerID": ids,
    "makeVisible": false,
    "selectionModifier": {
      "_enum": "selectionModifierType",
      "_value": "addToSelectionContinuous"
    },
  } ;
} ;

module.exports = {
  descDeselectLayer, 
  descSelectLayer
} ;