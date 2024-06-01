import { useRef } from 'react'

import { modifyShape } from '@/lib/shapes'
import { RightSidebarProps } from '@/types/type'

import Color from './settings/Color'
import Dimensions from './settings/Dimensions'
import Export from './settings/Export'
import Text from './settings/Text'

export function RightSidebar({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: RightSidebarProps) {
  const colorInputRef = useRef(null)
  const strokeInputRef = useRef(null)

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) isEditingRef.current = true

    setElementAttributes((prev) => ({
      ...prev,
      [property]: value,
    }))

    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
      activeObjectRef,
      syncShapeInStorage,
    })
  }

  return (
    <section
      className="sticky right-0 flex h-full min-w-[227px] select-none flex-col border-t
        border-primary-grey-200 bg-primary-black text-primary-grey-300 max-sm:hidden"
    >
      <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-primery-grey-300 mt-3 border-b border-primary-grey-200 px-5 pb-4 text-xs">
        Make changes to canvas as you like
      </span>

      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
      />

      <Text
        fontFamily={elementAttributes.fontFamily}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        handleInputChange={handleInputChange}
      />

      <Color
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        attributeType="fill"
        placeholder="color"
        handleInputChange={handleInputChange}
      />

      <Color
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        attributeType="stroke"
        placeholder="stroke"
        handleInputChange={handleInputChange}
      />

      <Export />
    </section>
  )
}
