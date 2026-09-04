// Font Awesome (Free, Solid) is this design system's icon set.
// `Icon` normalizes Font Awesome's API to a numeric `size` (px) prop.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function Icon({ icon, size = 16, style, ...rest }) {
  return <FontAwesomeIcon icon={icon} style={{ fontSize: size, width: size, ...style }} {...rest} />
}
