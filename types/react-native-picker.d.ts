// types/react-native-picker.d.ts
declare module '@react-native-picker/picker' {
  import { ViewProps } from 'react-native';

  export type PickerItemProps = {
    label: string;
    value: any;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    testID?: string;
  };

  export type PickerProps = {
    children?: React.ReactNode;
    style?: any;
    itemStyle?: any;
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    prompt?: string;
    testID?: string;
    dropdownIconColor?: string;
    dropdownIconRippleColor?: string;
    numberOfLines?: number;
  } & ViewProps;

  const Picker: React.FC<PickerProps> & {
    Item: React.FC<PickerItemProps>;
  };

  export default Picker;
}