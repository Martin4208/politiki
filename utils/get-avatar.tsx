function getFirstTwoLettersOfName(name: string) {
  return name.trim().slice(0, 2).toUpperCase()
}

function getColorFromString(str: string) {
  let hash = 0

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const color = `hsl(${hash % 360}, 60%, 60%)`

  return color
}

type AvatarProps = {
  name: string
}

export function Avatar({ name }: AvatarProps) {
  const initials = getFirstTwoLettersOfName(name)
  const bg = getColorFromString(name)

  return (
    <div
      style={{ backgroundColor: bg }}
      className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold"
    >
      {initials}
    </div>
  )
}