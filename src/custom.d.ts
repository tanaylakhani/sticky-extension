declare module '*.wav' {
  const content: string;
  export default content;
}

// declare module '*.mp3' {
//   const content: string;
//   export default content;
// }

interface ReactIconProps {
  size?: number | string;
  color?: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

declare module 'react-icons/*' {
  import { ComponentType } from 'react';
  const content: ComponentType<ReactIconProps>;
  export default content;
}

declare module 'react-icons/bs' {
  import { ComponentType } from 'react';
  export const BsSticky: ComponentType<ReactIconProps>;
}

declare module 'react-icons/fa' {
  import { ComponentType } from 'react';
  export const FaEllipsisV: ComponentType<ReactIconProps>;
  export const FaExpandAlt: ComponentType<ReactIconProps>;
  export const FaCompressAlt: ComponentType<ReactIconProps>;
  export const FaTrash: ComponentType<ReactIconProps>;
  export const FaBold: ComponentType<ReactIconProps>;
  export const FaItalic: ComponentType<ReactIconProps>;
  export const FaUnderline: ComponentType<ReactIconProps>;
  export const FaListUl: ComponentType<ReactIconProps>;
  export const FaImage: ComponentType<ReactIconProps>;
  export const FaSpinner: ComponentType<ReactIconProps>;
  export const FaTimesCircle: ComponentType<ReactIconProps>;
}
