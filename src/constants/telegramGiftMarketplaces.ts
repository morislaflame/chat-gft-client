export type TelegramGiftsMarketplace = {
    /** Полная ссылка https://t.me/... для Mini App / бота */
    href: string;
    /** Отображаемая подпись */
    label: string;
    /** Иконка в public, напр. /portals.jpg */
    iconSrc: string;
};

export const TELEGRAM_GIFT_MARKETPLACES: TelegramGiftsMarketplace[] = [
    { href: "https://t.me/mrkt/app?startapp=8036659989", label: "mrkt", iconSrc: "/mrkt.jpg" },
    {
        href: "https://t.me/tonnel_network_bot/gifts?startapp=ref_8036659989",
        label: "TonnelMarket",
        iconSrc: "/tonnel.jpg",
    },
    { href: "https://t.me/portals/market?startapp=iiz7xy", label: "Portals", iconSrc: "/portals.jpg" },
];
