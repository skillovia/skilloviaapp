import * as React from "react";
import Svg, { Rect, Path, Circle } from "react-native-svg";
const Search = (props) => (
  <Svg
    width={66}
    height={57}
    viewBox="0 0 66 57"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect x={9} y={4.5} width={48} height={48} rx={24} fill="#8FF15F" />
    <Path
      opacity={0.4}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M37.9697 33.4697C38.2626 33.1768 38.7374 33.1768 39.0303 33.4697L43.5303 37.9697C43.8232 38.2626 43.8232 38.7374 43.5303 39.0303C43.2374 39.3232 42.7626 39.3232 42.4697 39.0303L37.9697 34.5303C37.6768 34.2374 37.6768 33.7626 37.9697 33.4697Z"
      fill="#1C5200"
    />
    <Circle
      cx={9.5}
      cy={9.5}
      r={9.5}
      transform="matrix(1 0 0 -1 23 37.5)"
      fill="#1C5200"
    />
  </Svg>
);
export default Search;
