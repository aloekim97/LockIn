import { Dimensions } from 'react-native';

interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DropdownDimensions {
  width: number;
  itemHeight: number;
  itemCount: number;
  padding?: number;
}

interface DropdownPosition {
  top: number;
  left: number;
}

export function calculateDropdownPosition(
  anchorPosition: AnchorPosition,
  dropdownDimensions: DropdownDimensions
): DropdownPosition {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const {
    width: dropdownWidth,
    itemHeight,
    itemCount,
    padding = 16,
  } = dropdownDimensions;
  const dropdownHeight = itemCount * itemHeight + padding;

  let left = anchorPosition.x;
  let top = anchorPosition.y + anchorPosition.height + 8;

  // Adjust if dropdown goes off screen on right
  if (left + dropdownWidth > screenWidth - 16) {
    left = screenWidth - dropdownWidth - 16;
  }

  // Adjust if dropdown goes off screen at bottom
  if (top + dropdownHeight > screenHeight - 16) {
    top = anchorPosition.y - dropdownHeight - 8;
  }

  return { top, left };
}
