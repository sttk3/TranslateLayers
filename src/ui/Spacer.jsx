const { h } = require('preact') ;

/*
  [Bringing Spacer GIFs Back, to handle spacing elements in React and CSS](https://www.joshwcomeau.com/react/modern-spacer-gif/)
*/
const Spacer = ({
  size,
  axis,
  style = {},
  ...delegated
}) => {
  const width = axis === 'vertical' ? 1 : size ;
  const height = axis === 'horizontal' ? 1 : size ;
  return (
    <span
      style={{
        display: 'block',
        width,
        minWidth: width,
        height,
        minHeight: height,
        ...style
      }}
      {...delegated}
    />
  ) ;
} ;

module.exports = {
  Spacer
} ;