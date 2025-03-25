import { View } from "react-native";

interface ListSeparatorProps {
  width?: number;
}

const ListSeparator = ({ width = 16 }: ListSeparatorProps) => {
  return <View className={`w-[${width}]`} />;
};

export default ListSeparator;
