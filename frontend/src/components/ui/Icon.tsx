import React from 'react'
import * as Lucide from 'lucide-react'

export function Icon({ name, ...rest }: { name: string } & any) {
  const Comp = (Lucide as any)[name] || Lucide.Circle
  return <Comp {...rest} />
}
