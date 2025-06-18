// useThemeColor.js

import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
/**
 * Devuelve el color adecuado según el tema (light u oscuro).
 *
 * props: objeto opcional con campos `light` y/o `dark` que anulan el valor.
 * colorName: clave para buscar en Colors.light o Colors.dark.
 */
export function useThemeColor(props, colorName) {
  const theme = useColorScheme() || "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
