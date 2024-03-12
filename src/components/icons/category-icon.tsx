import {
  Icon,
  IconAnchor,
  IconArrowFork,
  IconArrowsDownUp,
  IconBadgeWc,
  IconBaguette,
  IconBallTennis,
  IconBasket,
  IconBeach,
  IconBed,
  IconBike,
  IconBow,
  IconBuildingBridge2,
  IconBuildingCastle,
  IconBuildingStore,
  IconBuildingTunnel,
  IconBus,
  IconBusStop,
  IconCake,
  IconCamera,
  IconCar,
  IconCarrot,
  IconChargingPile,
  IconChartBubble,
  IconChevronsRight,
  IconCircles,
  IconClover,
  IconCoffee,
  IconCornerRightDown,
  IconDiamond,
  IconEyeglass,
  IconFall,
  IconFish,
  IconFishHook,
  IconFlag,
  IconFlipFlops,
  IconFountain,
  IconGasStation,
  IconGift,
  IconGlassCocktail,
  IconGolf,
  IconHelmet,
  IconHistory,
  IconHome,
  IconHomeDollar,
  IconHomeOff,
  IconHorse,
  IconIceCream2,
  IconInfoCircle,
  IconKayak,
  IconLadder,
  IconLeaf,
  IconMapPin,
  IconMapPinQuestion,
  IconMassage,
  IconMeat,
  IconMoodKid,
  IconMotorbike,
  IconMountain,
  IconMusic,
  IconOvalVertical,
  IconPalette,
  IconPaperBag,
  IconPaperclip,
  IconParking,
  IconPennant,
  IconPerfume,
  IconPill,
  IconPizza,
  IconPlaneDeparture,
  IconPlant,
  IconPlant2,
  IconPool,
  IconRipple,
  IconRoute,
  IconSailboat,
  IconSailboat2,
  IconScissors,
  IconScubaDiving,
  IconScubaMask,
  IconShoe,
  IconShoppingBag,
  IconShoppingCart,
  IconSnowboarding,
  IconSquare,
  IconStars,
  IconStretching2,
  IconSunglasses,
  IconSwimming,
  IconTent,
  IconToolsKitchen,
  IconToolsKitchen2,
  IconTower,
  IconTrees,
  IconTrekking,
  IconViewfinder,
  IconWalk,
  IconWall,
  IconWash,
  TablerIconsProps,
} from '@tabler/icons-react'
import { FC } from 'react'
import { IconName } from '~/server/db/constants/shared'

const iconsByIconName = {
  beach: IconBeach,
  flag: IconFlag,
  'scuba-mask': IconScubaMask,
  trees: IconTrees,
  'building-castle': IconBuildingCastle,
  'fish-hook': IconFishHook,
  fountain: IconFountain,
  mountain: IconMountain,
  ripple: IconRipple,
  parking: IconParking,
  history: IconHistory,
  trekking: IconTrekking,
  walk: IconWalk,
  'oval-vertical': IconOvalVertical,
  sailboat: IconSailboat,
  pennant: IconPennant,
  tower: IconTower,
  'home-off': IconHomeOff,
  home: IconHome,
  'building-tunnel': IconBuildingTunnel,
  'building-store': IconBuildingStore,
  'map-pin-question': IconMapPinQuestion,
  'charging-pile': IconChargingPile,
  motorbike: IconMotorbike,
  ladder: IconLadder,
  'building-bridge-2': IconBuildingBridge2,
  'scuba-diving': IconScubaDiving,
  fall: IconFall,
  'corner-right-down': IconCornerRightDown,
  wash: IconWash,
  wall: IconWall,
  anchor: IconAnchor,
  pool: IconPool,
  palette: IconPalette,
  camera: IconCamera,
  'paper-bag': IconPaperBag,
  'stretching-2': IconStretching2,
  square: IconSquare,
  'bus-stop': IconBusStop,
  'info-circle': IconInfoCircle,
  route: IconRoute,
  bus: IconBus,
  shoe: IconShoe,
  kayak: IconKayak,
  'arrows-down-up': IconArrowsDownUp,
  swimming: IconSwimming,
  diamond: IconDiamond,
  'chart-bubble': IconChartBubble,
  'arrow-fork': IconArrowFork,
  'map-pin': IconMapPin,
  'badge-wc': IconBadgeWc,
  leaf: IconLeaf,
  'tools-kitchen-2': IconToolsKitchen2,
  coffee: IconCoffee,
  'home-dollar': IconHomeDollar,
  bed: IconBed,
  'ice-cream-2': IconIceCream2,
  viewfinder: IconViewfinder,
  stars: IconStars,
  'shopping-bag': IconShoppingBag,
  'shopping-cart': IconShoppingCart,
  basket: IconBasket,
  bike: IconBike,
  car: IconCar,
  'sailboat-2': IconSailboat2,
  bow: IconBow,
  'ball-tennis': IconBallTennis,
  horse: IconHorse,
  helmet: IconHelmet,
  'mood-kid': IconMoodKid,
  snowboarding: IconSnowboarding,
  pill: IconPill,
  scissors: IconScissors,
  eyeglass: IconEyeglass,
  'gas-station': IconGasStation,
  paperclip: IconPaperclip,
  carrot: IconCarrot,
  meat: IconMeat,
  'plant-2': IconPlant2,
  'glass-cocktail': IconGlassCocktail,
  'tools-kitchen': IconToolsKitchen,
  'chevrons-right': IconChevronsRight,
  'flip-flops': IconFlipFlops,
  music: IconMusic,
  massage: IconMassage,
  gift: IconGift,
  sunglasses: IconSunglasses,
  pizza: IconPizza,
  baguette: IconBaguette,
  cake: IconCake,
  perfume: IconPerfume,
  fish: IconFish,
  clover: IconClover,
  plant: IconPlant,
  tent: IconTent,
  golf: IconGolf,
  'plane-departure': IconPlaneDeparture,
  circles: IconCircles,
} as const satisfies Record<IconName, Icon>

export const CategoryIcon: FC<
  TablerIconsProps & {
    icon?: IconName | null
  }
> = ({ icon, ...tablerIconsProps }) => {
  const iconWithoutFallback =
    icon && icon in iconsByIconName ? iconsByIconName[icon] : null
  const Icon = iconWithoutFallback ?? IconMapPin

  return <Icon {...tablerIconsProps} />
}
