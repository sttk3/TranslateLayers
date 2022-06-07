/**
  * @file math.jsによる計算
  * @author sttk3.com
  * @copyright © 2022 sttk3.com
*/

const { create, all } = require('mathjs') ;
const math = create(all) ;

// 単位

// pt = 1/72 inch
const ptValue = math.bignumber(math.fraction('1/72')) ;
math.createUnit('pt', {definition: `${ptValue} in`, aliases: ['points', 'point']}, {override: true}) ;

// px = 1/72 inch
math.createUnit('px', {definition: `${ptValue} in`, aliases: ['pixels', 'pixel']}) ;

// pc = 1/6 inch
math.createUnit('pc', {definition: `${math.bignumber(math.fraction('1/6'))} in`, aliases: ['pica']}) ;

// Q = 1/4 mm。hはすでに高さの略語として定義済みなのでなくてもいいか
math.createUnit('Q', {definition: '0.25 mm', aliases: ['q']}) ;

// mark the function as "rawArgs", so it will be called with unevaluated arguments
/*
const rawArgsList = [cat, at] ;
rawArgsList.forEach((aItem) => {
  aItem.rawArgs = true ;
}) ;
*/

// import the new function in the math namespace
/*
math.import({
  aaa
}) ;
*/

module.exports = {
  math
} ;